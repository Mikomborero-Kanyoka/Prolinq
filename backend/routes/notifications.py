from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Notification
from auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: Optional[str] = "general"
    data: Optional[str] = None  # JSON string

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    data: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all notifications for the current user"""
    try:
        print(f"📢 Fetching notifications for user {current_user.id}")
        notifications = db.query(Notification).filter(
            Notification.user_id == current_user.id
        ).order_by(Notification.created_at.desc()).all()
        
        print(f"✅ Found {len(notifications)} notifications for user {current_user.id}")
        
        # Convert to response format
        result = []
        for notification in notifications:
            result.append({
                "id": notification.id,
                "user_id": notification.user_id,
                "title": notification.title,
                "message": notification.message,
                "type": notification.type or "general",
                "is_read": bool(notification.is_read),
                "data": notification.data,
                "created_at": notification.created_at.isoformat() if notification.created_at is not None else "",
                "updated_at": notification.updated_at.isoformat() if notification.updated_at is not None else ""
            })
        
        return result
        
    except Exception as e:
        print(f"❌ Error fetching notifications: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )

@router.post("/", response_model=NotificationResponse)
async def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    """Create a new notification (internal use)"""
    db_notification = Notification(
        user_id=notification.user_id,
        title=notification.title,
        message=notification.message,
        type=notification.type,
        data=notification.data
    )
    
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Emit Socket.IO event for real-time updates
    try:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from main import app
        
        if hasattr(app.state, 'sio'):
            sio = app.state.sio
            notification_dict = {
                'id': db_notification.id,
                'user_id': db_notification.user_id,
                'title': db_notification.title,
                'message': db_notification.message,
                'type': db_notification.type,
                'is_read': db_notification.is_read,
                'created_at': db_notification.created_at.isoformat()
            }
            print(f"📢 Broadcasting notification via Socket.IO: {notification_dict}")
            print(f"   Target room: user_{notification.user_id}")
            # Broadcast to specific user (use create_task for async emission)
            import asyncio
            asyncio.create_task(sio.emit('notification', notification_dict, room=f"user_{notification.user_id}"))
            print(f"✅ Notification broadcast scheduled!")
        else:
            print("❌ Socket.IO server not found in app.state")
    except Exception as e:
        print(f"❌ Error broadcasting notification: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    return db_notification

def create_user_notification(db: Session, user_id: int, title: str, message: str, notification_type: str = "general", data: Optional[Dict[str, Any]] = None):
    """Helper function to create a notification for a user"""
    db_notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        data=json.dumps(data) if data else None
    )
    
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    return db_notification

@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True  # type: ignore
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted"}

@router.get("/unread/count")
async def get_unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get count of unread notifications for the current user"""
    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"count": unread_count}

@router.put("/mark-all-read")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark all notifications as read for the current user"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})  # type: ignore
    
    db.commit()
    
    return {"message": "All notifications marked as read"}
