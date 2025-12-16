"""
Notification Helper Functions
Centralized notification creation for all events in the system
"""

import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from models import Notification
from datetime import datetime


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "general",
    data: Optional[Dict[str, Any]] = None
) -> Notification:
    """
    Create a notification for a user.
    
    Args:
        db: Database session
        user_id: ID of user receiving notification
        title: Notification title
        message: Notification message
        notification_type: Type of notification (general, job_application, application_update, new_message, review_received, job_recommendation)
        data: Additional JSON data to store with notification
    
    Returns:
        Created Notification object
    """
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
    
    print(f"✅ Notification created (ID: {db_notification.id}, User: {user_id}, Type: {notification_type})")
    
    return db_notification


def create_job_application_notification(
    db: Session,
    job_creator_id: int,
    applicant_name: str,
    applicant_id: int,
    job_title: str,
    job_id: int,
    application_id: int
) -> Notification:
    """
    Create notification for new job application.
    """
    return create_notification(
        db=db,
        user_id=job_creator_id,
        title='📋 New Job Application',
        message=f'{applicant_name} applied to your job: "{job_title}"',
        notification_type='job_application',
        data={
            'application_id': application_id,
            'job_id': job_id,
            'applicant_id': applicant_id,
            'applicant_name': applicant_name
        }
    )


def create_application_status_notification(
    db: Session,
    applicant_id: int,
    job_title: str,
    job_id: int,
    application_id: int,
    new_status: str,
    old_status: str
) -> Notification:
    """
    Create notification for application status change.
    """
    status_messages = {
        "accepted": f"🎉 Your application has been accepted for \"{job_title}\"!",
        "rejected": f"❌ Your application for \"{job_title}\" has been rejected.",
        "reviewed": f"👀 Your application for \"{job_title}\" is being reviewed.",
        "shortlisted": f"⭐ Your application for \"{job_title}\" has been shortlisted!",
    }
    
    message = status_messages.get(
        new_status,
        f"Your application status for \"{job_title}\" has been updated to: {new_status}"
    )
    
    return create_notification(
        db=db,
        user_id=applicant_id,
        title='Application Status Update',
        message=message,
        notification_type='application_update',
        data={
            'application_id': application_id,
            'job_id': job_id,
            'old_status': old_status,
            'new_status': new_status
        }
    )


def create_new_message_notification(
    db: Session,
    receiver_id: int,
    sender_name: str,
    sender_id: int,
    message_preview: str,
    message_id: int
) -> Notification:
    """
    Create notification for new message.
    """
    # Truncate preview to 80 chars
    preview = message_preview[:80] + "..." if len(message_preview) > 80 else message_preview
    
    return create_notification(
        db=db,
        user_id=receiver_id,
        title='💬 New Message',
        message=f'You have a new message from {sender_name}: "{preview}"',
        notification_type='new_message',
        data={
            'message_id': message_id,
            'sender_id': sender_id,
            'sender_name': sender_name
        }
    )


def create_review_received_notification(
    db: Session,
    reviewed_user_id: int,
    reviewer_name: str,
    reviewer_id: int,
    rating: int,
    job_id: int,
    job_title: str,
    review_id: int
) -> Notification:
    """
    Create notification for received review/rating.
    """
    stars = "⭐" * rating
    
    return create_notification(
        db=db,
        user_id=reviewed_user_id,
        title=f'⭐ New Review: {rating} Stars',
        message=f'{reviewer_name} left you a {rating}-star review for "{job_title}". {stars}',
        notification_type='review_received',
        data={
            'review_id': review_id,
            'reviewer_id': reviewer_id,
            'reviewer_name': reviewer_name,
            'job_id': job_id,
            'job_title': job_title,
            'rating': rating
        }
    )


def create_job_recommendation_notification(
    db: Session,
    user_id: int,
    job_title: str,
    job_id: int,
    match_score: float
) -> Notification:
    """
    Create notification for job recommendation based on skills match.
    """
    percentage = int(match_score * 100)
    
    return create_notification(
        db=db,
        user_id=user_id,
        title='🎯 Recommended Job Match',
        message=f'We found a job that matches your skills: "{job_title}" ({percentage}% match)',
        notification_type='job_recommendation',
        data={
            'job_id': job_id,
            'job_title': job_title,
            'match_score': match_score,
            'match_percentage': percentage
        }
    )


def create_job_completion_notification(
    db: Session,
    recipient_id: int,
    recipient_type: str,  # 'employer' or 'worker'
    other_user_name: str,
    job_title: str,
    job_id: int
) -> Notification:
    """
    Create notification when a job is marked as complete.
    """
    if recipient_type == 'employer':
        title = '✅ Job Completed'
        message = f'{other_user_name} has marked the job "{job_title}" as complete.'
    else:
        title = '✅ Job Completed'
        message = f'The job "{job_title}" has been marked as complete.'
    
    return create_notification(
        db=db,
        user_id=recipient_id,
        title=title,
        message=message,
        notification_type='job_completed',
        data={
            'job_id': job_id,
            'job_title': job_title,
            'recipient_type': recipient_type
        }
    )


def create_admin_message_notification(
    db: Session,
    user_id: int,
    admin_name: str,
    admin_id: int,
    message_preview: str
) -> Notification:
    """
    Create notification for admin message.
    """
    preview = message_preview[:80] + "..." if len(message_preview) > 80 else message_preview
    
    return create_notification(
        db=db,
        user_id=user_id,
        title='📢 Message from Admin',
        message=f'Admin ({admin_name}) sent you a message: "{preview}"',
        notification_type='admin_message',
        data={
            'admin_id': admin_id,
            'admin_name': admin_name
        }
    )