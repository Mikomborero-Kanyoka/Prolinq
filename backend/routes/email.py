"""
Email Management Routes
Admin endpoints for email system management, ads, and queue monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, EmailAd, EmailQueue, EmailMetrics
from auth import get_current_user
from services.email_service import EmailService
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/email", tags=["email"])
email_service = EmailService()

# Schemas
class EmailAdCreate(BaseModel):
    title: str
    ad_text: str
    ad_link: str = None

class EmailAdUpdate(BaseModel):
    title: str = None
    ad_text: str = None
    ad_link: str = None
    is_active: bool = None

class TestEmailRequest(BaseModel):
    recipient_email: str

# Admin Email Ad Management
@router.post("/ads", response_model=dict)
def create_email_ad(
    ad_data: EmailAdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new email ad (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create email ads"
        )
    
    email_ad = EmailAd(
        created_by_id=current_user.id,
        title=ad_data.title,
        ad_text=ad_data.ad_text,
        ad_link=ad_data.ad_link,
        is_active=True
    )
    
    db.add(email_ad)
    db.commit()
    db.refresh(email_ad)
    
    logger.info(f"📢 Email ad created by {current_user.email}: {email_ad.title}")
    
    return {
        "id": email_ad.id,
        "title": email_ad.title,
        "is_active": email_ad.is_active,
        "impressions": email_ad.impressions,
        "created_at": email_ad.created_at.isoformat()
    }

@router.get("/ads", response_model=list)
def get_email_ads(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all email ads (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view email ads"
        )
    
    query = db.query(EmailAd)
    
    if active_only:
        query = query.filter(EmailAd.is_active == True)
    
    ads = query.order_by(EmailAd.created_at.desc()).all()
    
    return [
        {
            "id": ad.id,
            "title": ad.title,
            "ad_text": ad.ad_text,
            "ad_link": ad.ad_link,
            "is_active": ad.is_active,
            "impressions": ad.impressions,
            "created_at": ad.created_at.isoformat()
        }
        for ad in ads
    ]

@router.put("/ads/{ad_id}", response_model=dict)
def update_email_ad(
    ad_id: int,
    ad_data: EmailAdUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update email ad (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update email ads"
        )
    
    email_ad = db.query(EmailAd).filter(EmailAd.id == ad_id).first()
    
    if not email_ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email ad not found"
        )
    
    if ad_data.title is not None:
        email_ad.title = ad_data.title
    if ad_data.ad_text is not None:
        email_ad.ad_text = ad_data.ad_text
    if ad_data.ad_link is not None:
        email_ad.ad_link = ad_data.ad_link
    if ad_data.is_active is not None:
        email_ad.is_active = ad_data.is_active
    
    email_ad.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(email_ad)
    
    logger.info(f"📝 Email ad updated by {current_user.email}: {email_ad.title}")
    
    return {
        "id": email_ad.id,
        "title": email_ad.title,
        "is_active": email_ad.is_active,
        "impressions": email_ad.impressions,
        "updated_at": email_ad.updated_at.isoformat()
    }

@router.delete("/ads/{ad_id}", response_model=dict)
def delete_email_ad(
    ad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete email ad (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete email ads"
        )
    
    email_ad = db.query(EmailAd).filter(EmailAd.id == ad_id).first()
    
    if not email_ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email ad not found"
        )
    
    db.delete(email_ad)
    db.commit()
    
    logger.info(f"🗑️  Email ad deleted by {current_user.email}: {email_ad.title}")
    
    return {"message": "Email ad deleted"}

# Queue Management
@router.get("/queue/status", response_model=dict)
def get_queue_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current email queue status (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view queue status"
        )
    
    return email_service.get_queue_status(db)

@router.get("/queue/pending", response_model=list)
def get_pending_emails(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pending emails in queue (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view queue"
        )
    
    pending = db.query(EmailQueue).filter(
        EmailQueue.status.in_(["pending", "retry"])
    ).order_by(EmailQueue.created_at.asc()).limit(limit).all()
    
    return [
        {
            "id": email.id,
            "to": email.to,
            "subject": email.subject,
            "email_type": email.email_type,
            "status": email.status,
            "retry_count": email.retry_count,
            "created_at": email.created_at.isoformat(),
            "error": email.error_message
        }
        for email in pending
    ]

@router.get("/queue/recent", response_model=list)
def get_recent_emails(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recently sent/failed emails (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view queue history"
        )
    
    recent = db.query(EmailQueue).order_by(
        EmailQueue.sent_at.desc().nullslast(),
        EmailQueue.created_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": email.id,
            "to": email.to,
            "subject": email.subject,
            "email_type": email.email_type,
            "status": email.status,
            "sent_at": email.sent_at.isoformat() if email.sent_at else None,
            "error": email.error_message
        }
        for email in recent
    ]

@router.delete("/queue/{email_id}", response_model=dict)
def cancel_pending_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a pending email in the queue (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can cancel emails"
        )
    
    email = db.query(EmailQueue).filter(EmailQueue.id == email_id).first()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in queue"
        )
    
    if email.status not in ["pending", "retry"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel email with status '{email.status}'. Only pending or retry emails can be cancelled."
        )
    
    # Update status to cancelled
    email.status = "cancelled"
    db.commit()
    
    logger.info(f"📧 Email cancelled by {current_user.email}: ID {email_id}, recipient {email.to}")
    
    return {
        "message": f"Email to {email.to} has been cancelled",
        "email_id": email_id,
        "status": "cancelled"
    }

@router.get("/queue/remaining", response_model=dict)
def get_remaining_emails(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all remaining emails for today (not yet sent) - admin only"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view remaining emails"
        )
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get all unsent emails (pending, retry, and failed from today that might be retried)
    remaining = db.query(EmailQueue).filter(
        EmailQueue.status.in_(["pending", "retry", "failed"]),
        EmailQueue.created_at >= today_start
    ).order_by(EmailQueue.created_at.asc()).all()
    
    return {
        "total_remaining": len(remaining),
        "emails": [
            {
                "id": email.id,
                "to": email.to,
                "subject": email.subject,
                "email_type": email.email_type,
                "status": email.status,
                "retry_count": email.retry_count,
                "created_at": email.created_at.isoformat(),
                "error": email.error_message
            }
            for email in remaining
        ]
    }

@router.delete("/queue/clear-all", response_model=dict)
def clear_all_remaining_emails(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel all remaining emails for today (admin only) - use with caution!"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can clear the queue"
        )
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Cancel all unsent emails from today
    cancelled_count = db.query(EmailQueue).filter(
        EmailQueue.status.in_(["pending", "retry", "failed"]),
        EmailQueue.created_at >= today_start
    ).update({"status": "cancelled"})
    
    db.commit()
    
    logger.warning(f"⚠️  BULK CANCEL: {current_user.email} cancelled {cancelled_count} remaining emails for today")
    
    return {
        "message": f"Cancelled {cancelled_count} remaining emails",
        "cancelled_count": cancelled_count
    }

# Test Endpoints
@router.post("/test/connection", response_model=dict)
def test_smtp_connection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test SMTP connection (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can test SMTP"
        )
    
    result = email_service.test_smtp_connection()
    logger.info(f"🔌 SMTP connection test by {current_user.email}: {result}")
    
    return result

@router.post("/test/send", response_model=dict)
def send_test_email(
    test_data: TestEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send test email directly to verify configuration (admin only) - NOT queued"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can send test emails"
        )
    
    result = email_service.send_test_email(
        db=db,
        recipient_email=test_data.recipient_email,
        admin_user=current_user
    )
    
    if not result["success"]:
        logger.error(f"❌ Test email failed by {current_user.email}: {result.get('error')}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to send test email")
        )
    
    logger.info(f"✅ Test email sent directly by {current_user.email} to {test_data.recipient_email}")
    
    return {
        "recipient": test_data.recipient_email,
        "status": "sent",
        "message": "Test email sent successfully",
        "details": result.get("message", "Email delivered")
    }

@router.post("/test/send-recommendations", response_model=dict)
def send_test_recommendations_email(
    test_data: TestEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send test recommendations email with HTML and actual ads (admin only) - NOT queued"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can send test emails"
        )
    
    result = email_service.send_test_recommendations_email(
        db=db,
        recipient_email=test_data.recipient_email,
        admin_user=current_user
    )
    
    if not result["success"]:
        logger.error(f"❌ Test recommendations email failed by {current_user.email}: {result.get('error')}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to send test recommendations email")
        )
    
    logger.info(f"✅ Test recommendations email sent directly by {current_user.email} to {test_data.recipient_email}")
    
    return {
        "recipient": test_data.recipient_email,
        "status": "sent",
        "message": "Test recommendations email sent successfully with HTML and ads",
        "details": result.get("message", "Email delivered"),
        "format": "HTML with plain text fallback",
        "includes_ads": True,
        "includes_jobs": True
    }

# Metrics Endpoints
@router.get("/metrics/today", response_model=dict)
def get_today_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get today's email metrics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view metrics"
        )
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    metrics = db.query(EmailMetrics).filter(
        EmailMetrics.date == today
    ).first()
    
    if not metrics:
        metrics = EmailMetrics(date=today)
    
    return {
        "date": metrics.date.isoformat(),
        "total_sent": metrics.total_sent,
        "total_welcome": metrics.total_welcome,
        "total_job_recommendations": metrics.total_job_recommendations,
        "total_ads_shown": metrics.total_ads_shown,
        "total_failed": metrics.total_failed
    }

@router.get("/metrics/history", response_model=list)
def get_metrics_history(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get email metrics history (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view metrics"
        )
    
    start_date = datetime.utcnow().replace(
        hour=0, minute=0, second=0, microsecond=0
    ) - timedelta(days=days)
    
    metrics = db.query(EmailMetrics).filter(
        EmailMetrics.date >= start_date
    ).order_by(EmailMetrics.date.desc()).all()
    
    return [
        {
            "date": m.date.isoformat(),
            "total_sent": m.total_sent,
            "total_welcome": m.total_welcome,
            "total_job_recommendations": m.total_job_recommendations,
            "total_ads_shown": m.total_ads_shown,
            "total_failed": m.total_failed
        }
        for m in metrics
    ]

@router.get("/metrics/summary", response_model=dict)
def get_metrics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get email system summary (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view metrics"
        )
    
    queue_status = email_service.get_queue_status(db)
    today_metrics = get_today_metrics(db, current_user)
    
    active_ads = db.query(EmailAd).filter(EmailAd.is_active == True).count()
    total_ads = db.query(EmailAd).count()
    
    return {
        "queue": queue_status,
        "today": today_metrics,
        "ads": {
            "active": active_ads,
            "total": total_ads
        },
        "smtp_enabled": queue_status.get("smtp_enabled", False)
    }

# Preview Endpoints
@router.get("/preview/welcome", response_model=dict)
def preview_welcome_email(
    current_user: User = Depends(get_current_user)
):
    """Preview welcome email template (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can preview emails"
        )
    
    subject, text_content = email_service.templates.welcome_email("John Doe")
    
    return {
        "type": "welcome",
        "subject": subject,
        "text_content": text_content,
        "preview_name": "New User Welcome Email"
    }

@router.post("/preview/daily-recommendations", response_model=dict)
def preview_daily_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview daily job recommendations email with sample jobs"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can preview emails"
        )
    
    from models import Job
    
    # Get 3 random jobs for preview
    jobs_query = db.query(Job).filter(Job.status == "open").limit(3).all()
    
    if not jobs_query:
        # Create mock jobs for preview
        jobs_query = [
            {
                "title": "Senior Python Developer",
                "company": "Tech Corp",
                "location": "Remote",
                "job_id": 1,
                "link": "https://prolinq.app/jobs/1"
            },
            {
                "title": "Frontend React Developer",
                "company": "StartupXYZ",
                "location": "San Francisco, CA",
                "job_id": 2,
                "link": "https://prolinq.app/jobs/2"
            },
            {
                "title": "Full Stack Engineer",
                "company": "Cloud Systems Inc",
                "location": "New York, NY",
                "job_id": 3,
                "link": "https://prolinq.app/jobs/3"
            }
        ]
    else:
        # Convert Job objects to dicts
        jobs_data = []
        for j in jobs_query:
            jobs_data.append({
                "title": j.title,
                "company": j.creator.company_name if j.creator else "Company",
                "location": j.location or "Remote",
                "job_id": j.id,
                "link": f"https://prolinq.app/jobs/{j.id}"
            })
        jobs_query = jobs_data
    
    # Get a random active ad
    active_ad = db.query(EmailAd).filter(EmailAd.is_active == True).first()
    ad_dict = None
    if active_ad:
        ad_dict = {
            "title": active_ad.title,
            "text": active_ad.ad_text,
            "link": active_ad.ad_link
        }
    
    subject, html_content = email_service.templates.daily_job_recommendations(
        user_name=current_user.full_name or current_user.username,
        jobs=jobs_query,
        ad=ad_dict
    )
    
    return {
        "type": "daily_recommendations",
        "subject": subject,
        "html_content": html_content,
        "text_content": html_content,  # Add text_content field for frontend compatibility
        "format": "HTML with inline CSS",
        "preview_name": "Daily Job Recommendations",
        "jobs_count": len(jobs_query),
        "includes_ad": ad_dict is not None,
        "preview_url": "/api/email/preview/daily-recommendations-html"
    }

@router.get("/preview/ad-distribution", response_model=dict)
def preview_ad_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview how ads will be distributed across users"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can preview ad distribution"
        )
    
    from models import User as UserModel
    import random
    
    # Get all active ads
    active_ads = db.query(EmailAd).filter(EmailAd.is_active == True).all()
    
    if not active_ads:
        return {
            "type": "ad_distribution",
            "total_ads": 0,
            "message": "No active ads to distribute",
            "distribution": []
        }
    
    # Get non-admin users count (all users who could receive job recommendations)
    talent_users_count = db.query(UserModel).filter(
        UserModel.is_admin == False,
        UserModel.is_active == True
    ).count()
    
    if talent_users_count == 0:
        return {
            "type": "ad_distribution",
            "total_ads": len(active_ads),
            "total_users": 0,
            "message": "No talent users to distribute ads to",
            "distribution": []
        }
    
    # Simulate distribution: shuffle ads and distribute them
    ads_list = [
        {
            "id": ad.id,
            "title": ad.title,
            "impressions": ad.impressions
        }
        for ad in active_ads
    ]
    
    # Create distribution simulation for 100 users
    sample_users = min(100, talent_users_count)
    distribution = []
    
    for user_idx in range(sample_users):
        # Randomly select an ad (weighted by being selected)
        selected_ad = random.choice(ads_list)
        distribution.append({
            "user_index": user_idx + 1,
            "selected_ad_id": selected_ad["id"],
            "selected_ad_title": selected_ad["title"]
        })
    
    # Calculate ad impressions distribution
    ad_impression_counts = {}
    for item in distribution:
        ad_id = item["selected_ad_id"]
        ad_impression_counts[ad_id] = ad_impression_counts.get(ad_id, 0) + 1
    
    impression_summary = [
        {
            "ad_id": ad_id,
            "impressions_in_sample": count,
            "percentage": round((count / sample_users) * 100, 1)
        }
        for ad_id, count in ad_impression_counts.items()
    ]
    
    return {
        "type": "ad_distribution",
        "total_active_ads": len(active_ads),
        "total_talent_users": talent_users_count,
        "sample_size": sample_users,
        "distribution_sample": distribution[:10],  # Show first 10
        "impression_summary": impression_summary,
        "distribution_note": f"Sample shows how {sample_users} users would receive ads from {len(active_ads)} active ads using random selection"
    }

@router.post("/test/send-bulk", response_model=dict)
def send_bulk_test_emails(
    num_users: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send test emails to multiple users to verify ad distribution and fairness.
    Admin only endpoint for testing purposes.
    
    Args:
        num_users: Number of test emails to send (default 10)
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can send bulk test emails"
        )
    
    from models import User as UserModel
    import random
    
    # Get non-admin users (all users who could receive job recommendations)
    talent_users = db.query(UserModel).filter(
        UserModel.is_admin == False,
        UserModel.is_active == True
    ).limit(num_users).all()
    
    if not talent_users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No talent users found to send test emails to"
        )
    
    # Get active ads for distribution
    active_ads = db.query(EmailAd).filter(EmailAd.is_active == True).all()
    
    queued_count = 0
    ad_distribution = {}
    
    for user in talent_users:
        # Select random ad for this user (fair distribution)
        selected_ad = random.choice(active_ads) if active_ads else None
        
        if selected_ad:
            ad_distribution[selected_ad.id] = ad_distribution.get(selected_ad.id, 0) + 1
        
        # Queue a test email with job recommendations
        try:
            queue_id = email_service.send_test_email(
                db=db,
                recipient_email=user.email,
                admin_user=current_user
            )
            queued_count += 1
            logger.info(f"📧 Test email queued for {user.email} (ad: {selected_ad.id if selected_ad else 'None'})")
        except Exception as e:
            logger.error(f"❌ Error queuing test email for {user.email}: {e}")
    
    logger.info(f"✅ Bulk test emails queued: {queued_count}/{len(talent_users)}")
    
    # Calculate distribution fairness
    if ad_distribution:
        fairness_score = 100 - (max(ad_distribution.values()) - min(ad_distribution.values())) * 10
        fairness_score = max(0, min(100, fairness_score))  # Clamp between 0-100
    else:
        fairness_score = 100
    
    return {
        "success": True,
        "queued_count": queued_count,
        "total_users": len(talent_users),
        "ad_distribution": ad_distribution,
        "fairness_score": fairness_score,
        "message": f"{queued_count} test emails queued for sending"
    }

# Test Endpoints
@router.get("/test-email/users", response_model=dict)
def get_users_for_test_email(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of registered users for test email selection (excluding admins)"""
    try:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can access this"
            )
        
        # Get all non-admin users who are active - they could all potentially receive job recommendations
        users_query = db.query(User).filter(
            User.is_admin == False,
            User.is_active == True
        ).order_by(User.full_name).all()
        
        users_list = []
        for u in users_query:
            users_list.append({
                "id": u.id,
                "full_name": u.full_name or u.username,
                "email": u.email,
                "username": u.username,
                "role": u.primary_role or "user"
            })
        
        logger.info(f"📧 Admin {current_user.email} loaded {len(users_list)} users for email testing")
        
        return {
            "success": True,
            "users": users_list,
            "total_users": len(users_list)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error loading users for test email: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load users: {str(e)}"
        )

@router.post("/test-email/send-recommendations/{user_id}", response_model=dict)
def send_test_recommendations_to_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send personalized job recommendations + ad to a specific registered user
    
    Args:
        user_id: The user ID to send recommendations to
    
    Returns:
        dict: Email preview and send status
    """
    try:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can send test emails"
            )
        
        # Get the target user
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # All non-admin users can receive job recommendations
        if target_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send recommendations to admin users"
            )
        
        from models import Job
        import random
        
        # Get 5 random open jobs (or less if not available)
        recommended_jobs = db.query(Job).filter(
            Job.status == "open"
        ).order_by(Job.created_at.desc()).limit(5).all()
        
        if not recommended_jobs:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No open jobs available for recommendations"
            )
        
        # Get random ad
        active_ads = db.query(EmailAd).filter(EmailAd.is_active == True).all()
        selected_ad = None
        ad_dict = None
        
        if active_ads:
            selected_ad = random.choice(active_ads)
            ad_dict = {
                "title": selected_ad.title,
                "text": selected_ad.ad_text,
                "link": selected_ad.ad_link or "https://prolinq.app",
                "id": selected_ad.id
            }
            # Track impression
            selected_ad.impressions += 1
            db.commit()  # Commit the impression update
        
        # Format jobs for email
        formatted_jobs = []
        for job in recommended_jobs:
            formatted_jobs.append({
                "title": job.title,
                "company": job.creator.company_name if job.creator else "Company",
                "location": job.location or "Remote",
                "job_id": job.id,
                "link": f"https://prolinq.app/jobs/{job.id}"
            })
        
        # Generate email
        subject, html_content = email_service.templates.daily_job_recommendations(
            user_name=target_user.full_name or target_user.username,
            jobs=formatted_jobs,
            ad=ad_dict
        )
        
        # Queue: email with HTML content (HTML-only to avoid raw HTML display)
        queue_id = email_service.queue.add_to_queue(
            db=db,
            to=target_user.email,
            subject=subject,
            text_content="",  # Empty text content since we're sending HTML-only
            html_content=html_content,  # Pass HTML content properly
            email_type="test_recommendations",
            user_id=target_user.id
        )
        
        db.commit()
        
        logger.info(f"✅ Test recommendation email queued for {target_user.email} (Queue ID: {queue_id})")
        
        return {
            "success": True,
            "message": f"Personalized recommendation email queued for {target_user.full_name or target_user.username}",
            "queue_id": queue_id,
            "recipient": target_user.email,
            "jobs_included": len(formatted_jobs),
            "ad_included": ad_dict is not None,
            "ad_title": ad_dict.get("title") if ad_dict else None,
            "preview": {
                "subject": subject,
                "snippet": html_content[:500]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error sending recommendation email to user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue email: {str(e)}"
        )
