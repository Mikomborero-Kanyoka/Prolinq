from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from database import get_db
from models import Message, User, AdminMessage
from schemas import MessageCreate, MessageResponse, AdminMessageCreate, BulkMessageRequest, AdminMessageResponse, BulkMessageResponse
from auth import get_current_user, get_admin_user
from typing import List
import uuid
import re
from datetime import datetime

router = APIRouter(prefix="/api/messages", tags=["messages"])

@router.post("/", response_model=MessageResponse)
async def send_message(msg_data: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    receiver = db.query(User).filter(User.id == msg_data.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    # Validate reply_to_id if provided
    if msg_data.reply_to_id:
        replied_message = db.query(Message).filter(Message.id == msg_data.reply_to_id).first()
        if not replied_message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message to reply to not found"
            )
    
    db_message = Message(
        sender_id=current_user.id,
        receiver_id=msg_data.receiver_id,
        content=msg_data.content,
        reply_to_id=msg_data.reply_to_id,
        message_type=msg_data.message_type or "text"
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Debug logging
    print(f"🔧 Created message: ID={db_message.id}, reply_to_id={db_message.reply_to_id}")
    print(f"🔧 Returning message response: {db_message.__dict__}")
    
    # Create notification for the message receiver
    try:
        from routes.notification_helpers import create_new_message_notification
        
        notification = create_new_message_notification(
            db=db,
            receiver_id=msg_data.receiver_id,
            sender_name=current_user.full_name or current_user.username,
            sender_id=current_user.id,
            message_preview=msg_data.content,
            message_id=db_message.id
        )
        print(f"📢 Message notification created: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating message notification: {e}")
        import traceback
        traceback.print_exc()
    
    # Emit Socket.IO event for real-time updates
    try:
        # Get socket.io server from app state
        from fastapi import FastAPI
        # Import here to avoid circular imports
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from main import app
        
        if hasattr(app.state, 'sio'):
            sio = app.state.sio
            # Convert message to dict for broadcasting
            message_dict = {
                'id': db_message.id,
                'sender_id': db_message.sender_id,
                'receiver_id': db_message.receiver_id,
                'content': db_message.content,
                'is_read': db_message.is_read,
                'reply_to_id': db_message.reply_to_id,
                'message_type': db_message.message_type,
                'created_at': db_message.created_at.isoformat()
            }
            print(f"📡 Broadcasting message via Socket.IO to receiver: {message_dict}")
            print(f"   Target room: user_{msg_data.receiver_id}")
            # Broadcast to receiver specifically
            await sio.emit('new_message', message_dict, room=f"user_{msg_data.receiver_id}")
            print(f"✅ Message broadcast successful!")
        else:
            print("❌ Socket.IO server not found in app.state")
    except Exception as e:
        print(f"❌ Error broadcasting message: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    return db_message

@router.get("/conversations", response_model=list[dict])
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all conversations grouped by user"""
    # Get all unique users the current user has messaged with
    other_users = db.query(User).distinct().join(
        Message,
        or_(
            (Message.sender_id == current_user.id) & (Message.receiver_id == User.id),
            (Message.sender_id == User.id) & (Message.receiver_id == current_user.id)
        )
    ).all()
    
    conversations = []
    for other_user in other_users:
        # Get last message in this conversation
        last_message = db.query(Message).filter(
            or_(
                (Message.sender_id == current_user.id) & (Message.receiver_id == other_user.id),
                (Message.sender_id == other_user.id) & (Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.desc()).first()
        
        # Get unread count for this conversation
        unread_count = db.query(Message).filter(
            (Message.sender_id == other_user.id) &
            (Message.receiver_id == current_user.id) &
            (Message.is_read == False)  # type: ignore
        ).count()
        
        conversations.append({
            "id": f"{current_user.id}_{other_user.id}",  # Unique conversation ID
            "user1_id": current_user.id,
            "user2_id": other_user.id,
            "user1": {
                "id": current_user.id,
                "full_name": current_user.full_name,
                "profile_photo": current_user.profile_photo
            },
            "user2": {
                "id": other_user.id,
                "full_name": other_user.full_name,
                "profile_photo": other_user.profile_photo
            },
            "last_message": last_message.content if last_message else None,
            "last_message_at": last_message.created_at.isoformat() if last_message else None,
            "unread_count": unread_count
        })
    
    # Sort by last_message_at descending
    conversations.sort(key=lambda x: x["last_message_at"] or "", reverse=True)
    return conversations

@router.get("/unread/count")
def get_unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    unread_count = db.query(Message).filter(
        (Message.receiver_id == current_user.id) & (Message.is_read == False)  # type: ignore
    ).count()
    
    return {"count": unread_count}

@router.post("/conversations/{user_id}/mark-read")
def mark_conversation_as_read(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark all messages in a conversation as read"""
    messages = db.query(Message).filter(
        (Message.sender_id == user_id) &
        (Message.receiver_id == current_user.id) &
        (Message.is_read == False)  # type: ignore
    ).all()
    
    for message in messages:
        message.is_read = True  # type: ignore
    
    db.commit()
    return {"message": f"Marked {len(messages)} messages as read"}

@router.get("/conversations/{user_id}", response_model=list[MessageResponse])
def get_conversation(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all messages in a conversation with a specific user"""
    messages = db.query(Message).filter(
        or_(
            (Message.sender_id == current_user.id) & (Message.receiver_id == user_id),
            (Message.sender_id == user_id) & (Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at).all()
    
    return messages

@router.delete("/conversations/{user_id}")
def delete_conversation(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete all messages in a conversation"""
    messages = db.query(Message).filter(
        or_(
            (Message.sender_id == current_user.id) & (Message.receiver_id == user_id),
            (Message.sender_id == user_id) & (Message.receiver_id == current_user.id)
        )
    ).all()
    
    count = len(messages)
    for message in messages:
        db.delete(message)
    
    db.commit()
    return {"message": f"Deleted {count} messages"}

@router.put("/{message_id}/read")
def mark_as_read(message_id: int, db: Session = Depends(get_db)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.is_read = True  # type: ignore
    db.commit()
    return {"message": "Marked as read"}

@router.delete("/{message_id}")
def delete_message(message_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a specific message"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only allow deletion by sender
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages"
        )
    
    db.delete(message)
    db.commit()
    return {"message": "Message deleted"}

@router.get("/me/conversations", response_model=list[MessageResponse])
def get_all_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        or_(
            Message.sender_id == current_user.id,
            Message.receiver_id == current_user.id
        )
    ).order_by(Message.created_at.desc()).all()
    
    return messages

@router.get("/{user_id}", response_model=list[MessageResponse])
def get_user_messages(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Legacy endpoint - get messages with a user"""
    messages = db.query(Message).filter(
        or_(
            (Message.sender_id == current_user.id) & (Message.receiver_id == user_id),
            (Message.sender_id == user_id) & (Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at).all()
    
    return messages


# ============ ADMIN MESSAGING ENDPOINTS ============

@router.post("/admin/send-individual", response_model=AdminMessageResponse)
async def send_admin_message(
    msg_data: AdminMessageCreate, 
    admin_user: User = Depends(get_admin_user), 
    db: Session = Depends(get_db)
):
    """Send a message from admin to a specific user"""
    receiver = db.query(User).filter(User.id == msg_data.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    # Replace template placeholders with actual user data
    message_content = msg_data.content
    message_content = message_content.replace("{{full_name}}", str(receiver.full_name) if receiver.full_name else "User")
    message_content = message_content.replace("{{username}}", str(receiver.username) if receiver.username else "")
    message_content = message_content.replace("{{email}}", str(receiver.email) if receiver.email else "")
    
    admin_message = AdminMessage(
        admin_id=admin_user.id,
        receiver_id=msg_data.receiver_id,
        content=message_content,  # Store processed content with placeholders replaced
        is_bulk=False
    )
    
    db.add(admin_message)
    db.commit()
    db.refresh(admin_message)
    
    # Create notification for the user
    try:
        from fastapi import FastAPI
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from main import app
        from routes.notifications import create_user_notification
        
        # Create database notification
        notification = create_user_notification(
            db=db,
            user_id=msg_data.receiver_id,
            title='New Admin Message',
            message=f'You have a new message from admin: {message_content[:100]}...',
            notification_type='admin_message',
            data={
                'admin_message_id': admin_message.id,
                'admin_id': admin_user.id
            }
        )
        print(f"📢 Database notification created: {notification.id}")
        
        if hasattr(app.state, 'sio'):
            sio = app.state.sio
            
            # Create notification data for Socket.IO
            notification_data = {
                'user_id': msg_data.receiver_id,
                'title': 'New Admin Message',
                'message': f'You have a new message from admin: {message_content[:100]}...',
                'type': 'admin_message',
                'data': {
                    'notification_id': notification.id,
                    'admin_message_id': admin_message.id,
                    'admin_id': admin_user.id
                }
            }
            
            # Broadcast notification to the specific user
            await sio.emit('notification', notification_data, room=f"user_{msg_data.receiver_id}")
            print(f"📢 Socket notification sent to user {msg_data.receiver_id}")
            
    except Exception as e:
        print(f"❌ Error sending notification: {e}")
    
    print(f"📨 Admin {admin_user.id} sent message to user {msg_data.receiver_id}")
    return admin_message


@router.post("/admin/send-bulk", response_model=BulkMessageResponse)
async def send_bulk_admin_message(
    bulk_request: BulkMessageRequest, 
    admin_user: User = Depends(get_admin_user), 
    db: Session = Depends(get_db)
):
    """Send bulk messages to multiple users with template support"""
    
    # Build query to get recipient users
    query = db.query(User)
    
    if bulk_request.include_all:
        # Send to all users except the admin
        query = query.filter(User.id != admin_user.id)
    elif bulk_request.recipient_ids:
        # Send to specific user IDs
        query = query.filter(User.id.in_(bulk_request.recipient_ids))
    else:
        # Apply filters
        if bulk_request.filter_role:
            query = query.filter(User.primary_role == bulk_request.filter_role)
        if bulk_request.filter_verified is not None:
            query = query.filter(User.is_verified == bulk_request.filter_verified)
    
    recipients = query.all()
    
    if not recipients:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users found matching the criteria"
        )
    
    campaign_id = str(uuid.uuid4())
    success_count = 0
    failed_count = 0
    
    # Process each recipient
    for recipient in recipients:
        try:
            # Replace template placeholders with actual user data
            message_content = bulk_request.content
            message_content = message_content.replace("{{full_name}}", str(recipient.full_name) if recipient.full_name else "User")
            message_content = message_content.replace("{{username}}", str(recipient.username) if recipient.username else "")
            message_content = message_content.replace("{{email}}", str(recipient.email) if recipient.email else "")
            
            admin_message = AdminMessage(
                admin_id=admin_user.id,
                receiver_id=recipient.id,
                content=message_content,
                is_bulk=True,
                bulk_campaign_id=campaign_id,
                bulk_campaign_name=bulk_request.campaign_name
            )
            
            db.add(admin_message)
            success_count += 1
            
        except Exception as e:
            print(f"❌ Error sending message to user {recipient.id}: {str(e)}")
            failed_count += 1
    
    db.commit()
    
    print(f"📢 Bulk campaign {campaign_id} ({bulk_request.campaign_name}) sent to {success_count} users (failed: {failed_count})")
    
    return BulkMessageResponse(
        campaign_id=campaign_id,
        campaign_name=bulk_request.campaign_name,
        total_sent=len(recipients),
        success_count=success_count,
        failed_count=failed_count,
        timestamp=datetime.utcnow()
    )


@router.get("/admin/received", response_model=list[AdminMessageResponse])
def get_admin_messages_received(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get all admin messages received by the current user (excluding deleted ones)"""
    messages = db.query(AdminMessage).filter(
        (AdminMessage.receiver_id == current_user.id) &
        (AdminMessage.is_deleted_by_user == False)  # type: ignore
    ).order_by(AdminMessage.created_at.desc()).all()
    
    return messages


@router.get("/admin/sent", response_model=list[AdminMessageResponse])
def get_admin_messages_sent(
    admin_user: User = Depends(get_admin_user), 
    db: Session = Depends(get_db)
):
    """Get all admin messages sent by the admin (paginated)"""
    messages = db.query(AdminMessage).filter(
        AdminMessage.admin_id == admin_user.id
    ).order_by(AdminMessage.created_at.desc()).all()
    
    return messages


@router.put("/admin/{message_id}/read")
def mark_admin_message_as_read(
    message_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Mark an admin message as read"""
    message = db.query(AdminMessage).filter(AdminMessage.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only the receiver can mark as read
    if message.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only mark your own messages as read"
        )
    
    message.is_read = True  # type: ignore
    db.commit()
    
    return {"message": "Message marked as read"}


@router.get("/admin/campaign/{campaign_id}/stats")
def get_bulk_campaign_stats(
    campaign_id: str, 
    admin_user: User = Depends(get_admin_user), 
    db: Session = Depends(get_db)
):
    """Get statistics for a bulk message campaign"""
    messages = db.query(AdminMessage).filter(
        (AdminMessage.bulk_campaign_id == campaign_id) &
        (AdminMessage.admin_id == admin_user.id)
    ).all()
    
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    read_count = len([m for m in messages if m.is_read])
    
    return {
        "campaign_id": campaign_id,
        "total_sent": len(messages),
        "read_count": read_count,
        "unread_count": len(messages) - read_count,
        "read_percentage": (read_count / len(messages) * 100) if messages else 0
    }



@router.get("/admin/unread/count")
def get_admin_unread_count(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get count of unread admin messages for current user (excluding deleted ones)"""
    unread_count = db.query(AdminMessage).filter(
        (AdminMessage.receiver_id == current_user.id) & 
        (AdminMessage.is_read == False) &  # type: ignore
        (AdminMessage.is_deleted_by_user == False)  # type: ignore
    ).count()
    
    return {"count": unread_count}


@router.delete("/admin/{message_id}/delete-received")
def delete_received_admin_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """User deletes an admin message they received (soft delete)"""
    message = db.query(AdminMessage).filter(AdminMessage.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only the receiver can delete
    if message.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own received messages"
        )
    
    message.is_deleted_by_user = True  # type: ignore
    db.commit()
    
    return {"message": "Message deleted"}


@router.delete("/admin/{message_id}/delete-sent")
def delete_sent_admin_message(
    message_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Admin deletes an admin message they sent"""
    message = db.query(AdminMessage).filter(AdminMessage.id == message_id).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only the admin who sent it can delete
    if message.admin_id != admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete messages you sent"
        )
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted"}


@router.get("/admin/campaign/{campaign_id}/details", response_model=dict)
def get_bulk_campaign_details(
    campaign_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a bulk campaign"""
    messages = db.query(AdminMessage).filter(
        (AdminMessage.bulk_campaign_id == campaign_id) &
        (AdminMessage.admin_id == admin_user.id)
    ).all()
    
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    read_count = len([m for m in messages if m.is_read])
    deleted_by_user_count = len([m for m in messages if m.is_deleted_by_user])
    
    return {
        "campaign_id": campaign_id,
        "campaign_name": messages[0].bulk_campaign_name,
        "total_sent": len(messages),
        "read_count": read_count,
        "unread_count": len(messages) - read_count,
        "deleted_by_user_count": deleted_by_user_count,
        "active_count": len(messages) - deleted_by_user_count,
        "read_percentage": (read_count / len(messages) * 100) if messages else 0,
        "created_at": messages[0].created_at
    }
