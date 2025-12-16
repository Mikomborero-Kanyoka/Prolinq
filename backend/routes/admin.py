from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from database import get_db
from models import User, Job, Application, Message, Review, AdminMessage
from auth import get_admin_user
from sqlalchemy import or_, union_all

router = APIRouter(prefix="/admin", tags=["admin"])

# Pydantic models for admin responses
class UserAdminResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    primary_role: Optional[str]
    is_verified: bool
    is_active: bool
    is_admin: bool
    created_at: datetime
    jobs_count: int
    applications_count: int

class JobAdminResponse(BaseModel):
    id: int
    title: str
    category: Optional[str]
    budget: Optional[float]
    budget_min: Optional[float]
    budget_max: Optional[float]
    status: str
    payment_status: str
    creator_id: int
    creator_name: str
    applications_count: int
    created_at: datetime

class ApplicationAdminResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    applicant_id: int
    applicant_name: str
    proposed_price: Optional[float]
    status: str
    created_at: datetime

class ReviewAdminResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    reviewer_id: int
    reviewer_name: str
    reviewed_user_id: int
    reviewed_user_name: str
    rating: int
    comment: str
    created_at: datetime

class DashboardStats(BaseModel):
    total_users: int
    total_jobs: int
    total_applications: int
    total_reviews: int
    active_jobs: int
    completed_jobs: int
    verified_users: int
    admin_users: int
    recent_registrations: int
    messages_today: int

class MessageAdminResponse(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    receiver_id: int
    receiver_name: str
    content: str
    created_at: datetime
    is_read: bool

class ConversationAdminResponse(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    last_message: Optional[str]
    last_message_time: Optional[datetime]
    unread_count: int
    total_messages: int

# Dashboard Statistics
@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics"""
    
    # Basic counts
    total_users = db.query(User).count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(Application).count()
    total_reviews = db.query(Review).count()
    
    # Status-based counts
    active_jobs = db.query(Job).filter(Job.status == "open").count()
    completed_jobs = db.query(Job).filter(Job.status == "completed").count()
    verified_users = db.query(User).filter(User.is_verified == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    
    # Recent activity (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_registrations = db.query(User).filter(User.created_at >= seven_days_ago).count()
    
    # Messages today
    today = datetime.utcnow().date()
    messages_today = db.query(Message).filter(
        func.date(Message.created_at) == today
    ).count()
    
    return DashboardStats(
        total_users=total_users,
        total_jobs=total_jobs,
        total_applications=total_applications,
        total_reviews=total_reviews,
        active_jobs=active_jobs,
        completed_jobs=completed_jobs,
        verified_users=verified_users,
        admin_users=admin_users,
        recent_registrations=recent_registrations,
        messages_today=messages_today
    )

# User Management
@router.get("/users", response_model=List[UserAdminResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users with optional filters"""
    
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )
    
    if role:
        query = query.filter(User.primary_role == role)
    
    if is_verified is not None:
        query = query.filter(User.is_verified == is_verified)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    # Add counts
    users = query.offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        jobs_count = db.query(Job).filter(Job.creator_id == user.id).count()
        applications_count = db.query(Application).filter(Application.applicant_id == user.id).count()
        
        result.append(UserAdminResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            primary_role=user.primary_role,
            is_verified=user.is_verified,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
            jobs_count=jobs_count,
            applications_count=applications_count
        ))
    
    return result

@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle user active status"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own status"
        )
    
    user.is_active = not user.is_active
    db.commit()
    
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully"}

@router.put("/users/{user_id}/toggle-verification")
async def toggle_user_verification(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle user verification status"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_verified = not user.is_verified
    db.commit()
    
    return {"message": f"User verification {'granted' if user.is_verified else 'revoked'} successfully"}

@router.put("/users/{user_id}/toggle-admin")
async def toggle_user_admin(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle user admin status"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own admin status"
        )
    
    user.is_admin = not user.is_admin
    db.commit()
    
    return {"message": f"User admin privileges {'granted' if user.is_admin else 'revoked'} successfully"}

# Job Management
@router.get("/jobs", response_model=List[JobAdminResponse])
async def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all jobs with optional filters"""
    
    query = db.query(Job).join(User, Job.creator_id == User.id)
    
    if status:
        query = query.filter(Job.status == status)
    
    if search:
        query = query.filter(Job.title.ilike(f"%{search}%"))
    
    jobs = query.offset(skip).limit(limit).all()
    
    result = []
    for job in jobs:
        applications_count = db.query(Application).filter(Application.job_id == job.id).count()
        
        result.append(JobAdminResponse(
            id=job.id,
            title=job.title,
            category=job.category,
            budget=job.budget,
            budget_min=job.budget_min,
            budget_max=job.budget_max,
            status=job.status,
            payment_status=job.payment_status,
            creator_id=job.creator_id,
            creator_name=job.creator.full_name or job.creator.username,
            applications_count=applications_count,
            created_at=job.created_at
        ))
    
    return result

@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a job (admin only)"""
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Delete related applications first
    db.query(Application).filter(Application.job_id == job_id).delete()
    
    # Delete the job
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}

# Application Management
@router.get("/applications", response_model=List[ApplicationAdminResponse])
async def get_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all applications with optional filters"""
    
    query = db.query(Application).join(Job).join(User, Application.applicant_id == User.id)
    
    if status:
        query = query.filter(Application.status == status)
    
    applications = query.offset(skip).limit(limit).all()
    
    result = []
    for app in applications:
        result.append(ApplicationAdminResponse(
            id=app.id,
            job_id=app.job_id,
            job_title=app.job.title,
            applicant_id=app.applicant_id,
            applicant_name=app.applicant.full_name or app.applicant.username,
            proposed_price=app.proposed_price,
            status=app.status,
            created_at=app.created_at
        ))
    
    return result

# Review Management
@router.get("/reviews", response_model=List[ReviewAdminResponse])
async def get_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    rating: Optional[int] = Query(None, ge=1, le=5),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all reviews with optional filters"""
    
    from sqlalchemy.orm import aliased
    reviewed_user = aliased(User)
    query = db.query(Review).join(Job).join(User, Review.reviewer_id == User.id).join(
        reviewed_user, Review.reviewed_user_id == reviewed_user.id
    )
    
    if rating:
        query = query.filter(Review.rating == rating)
    
    reviews = query.offset(skip).limit(limit).all()
    
    result = []
    for review in reviews:
        # Get reviewed user name
        reviewed_user_data = db.query(User).filter(User.id == review.reviewed_user_id).first()
        
        result.append(ReviewAdminResponse(
            id=review.id,
            job_id=review.job_id,
            job_title=review.job.title,
            reviewer_id=review.reviewer_id,
            reviewer_name=review.reviewer.full_name or review.reviewer.username,
            reviewed_user_id=review.reviewed_user_id,
            reviewed_user_name=reviewed_user_data.full_name or reviewed_user_data.username if reviewed_user_data else "Unknown",
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at
        ))
    
    return result

@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a review (admin only)"""
    
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}

# Chat Management
@router.get("/chats/conversations", response_model=List[ConversationAdminResponse])
async def get_all_conversations(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for admin monitoring"""
    
    # Get all users who have sent or received messages (both regular and admin messages)
    regular_users = db.query(Message.sender_id).distinct().union(
        db.query(Message.receiver_id).distinct()
    ).subquery()
    
    admin_users = db.query(AdminMessage.admin_id).distinct().union(
        db.query(AdminMessage.receiver_id).distinct()
    ).subquery()
    
    users_with_messages = db.query(User).filter(
        (User.id.in_(regular_users)) | (User.id.in_(admin_users))
    ).all()
    
    conversations = []
    for user in users_with_messages:
        # Get last regular message involving this user
        last_regular_message = db.query(Message).filter(
            (Message.sender_id == user.id) | (Message.receiver_id == user.id)
        ).order_by(Message.created_at.desc()).first()
        
        # Get last admin message involving this user (as sender or receiver)
        last_admin_message_sent = db.query(AdminMessage).filter(
            AdminMessage.admin_id == user.id
        ).order_by(AdminMessage.created_at.desc()).first()
        
        last_admin_message_received = db.query(AdminMessage).filter(
            AdminMessage.receiver_id == user.id
        ).order_by(AdminMessage.created_at.desc()).first()
        
        # Determine the last message overall
        last_message = None
        if last_regular_message and last_admin_message_sent and last_admin_message_received:
            # Compare timestamps to find the most recent
            latest_time = max(
                last_regular_message.created_at,
                last_admin_message_sent.created_at,
                last_admin_message_received.created_at
            )
            if latest_time == last_regular_message.created_at:
                last_message = last_regular_message
            elif latest_time == last_admin_message_sent.created_at:
                last_message = last_admin_message_sent
            else:
                last_message = last_admin_message_received
        elif last_regular_message and last_admin_message_sent:
            latest_time = max(last_regular_message.created_at, last_admin_message_sent.created_at)
            last_message = last_regular_message if latest_time == last_regular_message.created_at else last_admin_message_sent
        elif last_regular_message and last_admin_message_received:
            latest_time = max(last_regular_message.created_at, last_admin_message_received.created_at)
            last_message = last_regular_message if latest_time == last_regular_message.created_at else last_admin_message_received
        elif last_admin_message_sent and last_admin_message_received:
            latest_time = max(last_admin_message_sent.created_at, last_admin_message_received.created_at)
            last_message = last_admin_message_sent if latest_time == last_admin_message_sent.created_at else last_admin_message_received
        elif last_regular_message:
            last_message = last_regular_message
        elif last_admin_message_sent:
            last_message = last_admin_message_sent
        elif last_admin_message_received:
            last_message = last_admin_message_received
        
        # Count unread regular messages sent TO this user
        unread_regular = db.query(Message).filter(
            Message.receiver_id == user.id,
            Message.is_read == False
        ).count()
        
        # Count unread admin messages sent TO this user
        unread_admin = db.query(AdminMessage).filter(
            AdminMessage.receiver_id == user.id,
            AdminMessage.is_read == False
        ).count()
        
        unread_count = unread_regular + unread_admin
        
        # Count total messages involving this user (both regular and admin)
        total_regular = db.query(Message).filter(
            (Message.sender_id == user.id) | (Message.receiver_id == user.id)
        ).count()
        
        total_admin = db.query(AdminMessage).filter(
            (AdminMessage.admin_id == user.id) | (AdminMessage.receiver_id == user.id)
        ).count()
        
        total_messages = total_regular + total_admin
        
        conversations.append(ConversationAdminResponse(
            user_id=user.id,
            user_name=user.full_name or user.username,
            user_email=user.email,
            last_message=last_message.content if last_message else None,
            last_message_time=last_message.created_at if last_message else None,
            unread_count=unread_count,
            total_messages=total_messages
        ))
    
    # Sort by last message time (most recent first)
    conversations.sort(key=lambda x: x.last_message_time or datetime.min, reverse=True)
    
    return conversations

@router.get("/chats/conversation/{user_id}", response_model=List[MessageAdminResponse])
async def get_conversation_messages(
    user_id: int,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all messages for a specific conversation (both regular and admin messages)"""
    
    # Get regular messages involving this user
    regular_messages = db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).all()
    
    # Get admin messages where this user is either admin or receiver
    admin_messages_sent = db.query(AdminMessage).filter(
        AdminMessage.admin_id == user_id
    ).all()
    
    admin_messages_received = db.query(AdminMessage).filter(
        AdminMessage.receiver_id == user_id
    ).all()
    
    # Convert all messages to a common format
    all_messages = []
    
    # Add regular messages
    for msg in regular_messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        receiver = db.query(User).filter(User.id == msg.receiver_id).first()
        
        all_messages.append({
            'id': msg.id,
            'sender_id': msg.sender_id,
            'sender_name': sender.full_name or sender.username if sender else "Unknown",
            'receiver_id': msg.receiver_id,
            'receiver_name': receiver.full_name or receiver.username if receiver else "Unknown",
            'content': msg.content,
            'created_at': msg.created_at,
            'is_read': msg.is_read,
            'message_type': 'regular'
        })
    
    # Add admin messages sent by this user
    for msg in admin_messages_sent:
        receiver = db.query(User).filter(User.id == msg.receiver_id).first()
        
        all_messages.append({
            'id': f"admin_{msg.id}",  # Prefix to avoid ID conflicts
            'sender_id': msg.admin_id,
            'sender_name': current_user.full_name or current_user.username,
            'receiver_id': msg.receiver_id,
            'receiver_name': receiver.full_name or receiver.username if receiver else "Unknown",
            'content': msg.content,
            'created_at': msg.created_at,
            'is_read': msg.is_read,
            'message_type': 'admin'
        })
    
    # Add admin messages received by this user
    for msg in admin_messages_received:
        admin = db.query(User).filter(User.id == msg.admin_id).first()
        
        all_messages.append({
            'id': f"admin_received_{msg.id}",  # Prefix to avoid ID conflicts
            'sender_id': msg.admin_id,
            'sender_name': admin.full_name or admin.username if admin else "Admin",
            'receiver_id': msg.receiver_id,
            'receiver_name': current_user.full_name or current_user.username,
            'content': msg.content,
            'created_at': msg.created_at,
            'is_read': msg.is_read,
            'message_type': 'admin'
        })
    
    # Sort by created_at and limit
    all_messages.sort(key=lambda x: x['created_at'], reverse=True)
    if limit:
        all_messages = all_messages[:limit]
    
    # Reverse to get chronological order
    all_messages.reverse()
    
    result = []
    for msg in all_messages:
        result.append(MessageAdminResponse(
            id=msg['id'],
            sender_id=msg['sender_id'],
            sender_name=msg['sender_name'],
            receiver_id=msg['receiver_id'],
            receiver_name=msg['receiver_name'],
            content=msg['content'],
            created_at=msg['created_at'],
            is_read=msg['is_read']
        ))
    
    return result

@router.get("/chats/search", response_model=List[MessageAdminResponse])
async def search_messages(
    query: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Search messages by content (both regular and admin messages)"""
    
    # Search regular messages
    regular_messages = db.query(Message).filter(
        Message.content.ilike(f"%{query}%")
    ).all()
    
    # Search admin messages
    admin_messages = db.query(AdminMessage).filter(
        AdminMessage.content.ilike(f"%{query}%")
    ).all()
    
    # Convert to common format
    all_messages = []
    
    # Add regular messages
    for msg in regular_messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        receiver = db.query(User).filter(User.id == msg.receiver_id).first()
        
        all_messages.append({
            'id': msg.id,
            'sender_id': msg.sender_id,
            'sender_name': sender.full_name or sender.username if sender else "Unknown",
            'receiver_id': msg.receiver_id,
            'receiver_name': receiver.full_name or receiver.username if receiver else "Unknown",
            'content': msg.content,
            'created_at': msg.created_at,
            'is_read': msg.is_read,
            'message_type': 'regular'
        })
    
    # Add admin messages
    for msg in admin_messages:
        admin = db.query(User).filter(User.id == msg.admin_id).first()
        receiver = db.query(User).filter(User.id == msg.receiver_id).first()
        
        all_messages.append({
            'id': f"admin_{msg.id}",
            'sender_id': msg.admin_id,
            'sender_name': admin.full_name or admin.username if admin else "Admin",
            'receiver_id': msg.receiver_id,
            'receiver_name': receiver.full_name or receiver.username if receiver else "Unknown",
            'content': msg.content,
            'created_at': msg.created_at,
            'is_read': msg.is_read,
            'message_type': 'admin'
        })
    
    # Sort by created_at and limit
    all_messages.sort(key=lambda x: x['created_at'], reverse=True)
    if limit:
        all_messages = all_messages[:limit]
    
    result = []
    for msg in all_messages:
        result.append(MessageAdminResponse(
            id=msg['id'],
            sender_id=msg['sender_id'],
            sender_name=msg['sender_name'],
            receiver_id=msg['receiver_id'],
            receiver_name=msg['receiver_name'],
            content=msg['content'],
            created_at=msg['created_at'],
            is_read=msg['is_read']
        ))
    
    return result

@router.delete("/chats/messages/{message_id}")
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a message (admin only)"""
    
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}

# Analytics Endpoints
class ChartDataPoint(BaseModel):
    date: str
    count: int

class JobStatusBreakdown(BaseModel):
    status: str
    count: int

class RatingDistribution(BaseModel):
    rating: int
    count: int

@router.get("/analytics/user-growth")
async def get_user_growth(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get user growth over the specified number of days"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get daily user counts
    user_growth = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(
        func.date(User.created_at)
    ).order_by('date').all()
    
    # Convert to chart format
    data = [{"date": str(row.date), "count": row.count} for row in user_growth]
    
    return {"data": data, "total_users": db.query(User).count()}

@router.get("/analytics/job-posting-trend")
async def get_job_posting_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get job posting trend over the specified number of days"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get daily job counts
    job_trend = db.query(
        func.date(Job.created_at).label('date'),
        func.count(Job.id).label('count')
    ).filter(
        Job.created_at >= start_date
    ).group_by(
        func.date(Job.created_at)
    ).order_by('date').all()
    
    return {"data": [{"date": str(row.date), "count": row.count} for row in job_trend]}

@router.get("/analytics/applications-trend")
async def get_applications_trend(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get application submissions trend"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get daily application counts
    app_trend = db.query(
        func.date(Application.created_at).label('date'),
        func.count(Application.id).label('count')
    ).filter(
        Application.created_at >= start_date
    ).group_by(
        func.date(Application.created_at)
    ).order_by('date').all()
    
    return {"data": [{"date": str(row.date), "count": row.count} for row in app_trend]}

@router.get("/analytics/job-status-breakdown")
async def get_job_status_breakdown(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get breakdown of jobs by status"""
    
    status_breakdown = db.query(
        Job.status,
        func.count(Job.id).label('count')
    ).group_by(Job.status).all()
    
    data = [{"status": row.status, "count": row.count} for row in status_breakdown]
    
    return {"data": data}

@router.get("/analytics/application-status-breakdown")
async def get_application_status_breakdown(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get breakdown of applications by status"""
    
    status_breakdown = db.query(
        Application.status,
        func.count(Application.id).label('count')
    ).group_by(Application.status).all()
    
    data = [{"status": row.status, "count": row.count} for row in status_breakdown]
    
    return {"data": data}

@router.get("/analytics/rating-distribution")
async def get_rating_distribution(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get distribution of review ratings"""
    
    rating_dist = db.query(
        Review.rating,
        func.count(Review.id).label('count')
    ).group_by(Review.rating).order_by(Review.rating).all()
    
    data = [{"rating": row.rating, "count": row.count} for row in rating_dist]
    
    return {"data": data}

@router.get("/analytics/top-categories")
async def get_top_categories(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get top job categories by count"""
    
    top_categories = db.query(
        Job.category,
        func.count(Job.id).label('count')
    ).filter(Job.category.isnot(None)).group_by(Job.category).order_by(desc(func.count(Job.id))).limit(limit).all()
    
    data = [{"category": row.category, "count": row.count} for row in top_categories]
    
    return {"data": data}

# System Health
@router.get("/system/health")
async def get_system_health(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get system health information"""
    
    # Database connection test
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # Recent activity
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_activity = db.query(Message).filter(Message.created_at >= one_hour_ago).count()
    
    # Storage info (basic)
    total_users = db.query(User).count()
    
    return {
        "database_status": db_status,
        "recent_activity": recent_activity,
        "total_users": total_users,
        "timestamp": datetime.utcnow()
    }
