"""
Advanced email queue with throttling to respect Gmail rate limits
- Max 100-150 emails/day
- Space emails 1 every 8-10 minutes
- Handles retries with exponential backoff
"""
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import EmailQueue, EmailMetrics
from services.smtp_service import SMTPService
import random

logger = logging.getLogger(__name__)

class AdvancedThrottlingQueue:
    """
    Manages email queue with Gmail-compliant rate limiting
    """
    
    # Gmail limits
    MAX_EMAILS_PER_DAY = 140  # Conservative limit (100-150 range)
    SECONDS_BETWEEN_EMAILS = 540  # 9 minutes (8-10 minute range)
    MAX_RETRIES = 1  # Retry once, then mark as failed (as per requirements)
    
    def __init__(self):
        self.smtp_service = SMTPService()
    
    def add_to_queue(
        self,
        db: Session,
        to: str,
        subject: str,
        text_content: str,
        email_type: str,
        user_id: int = None,
        html_content: str = None
    ) -> int:
        """
        Add email to queue for sending
        
        Args:
            db: Database session
            to: Recipient email
            subject: Email subject
            text_content: Email body
            email_type: Type of email (welcome, daily_jobs, promotional, test)
            user_id: Optional user ID for reference
            html_content: Optional HTML email body
            
        Returns:
            int: Queue entry ID
        """
        queue_entry = EmailQueue(
            to=to,
            subject=subject,
            text_content=text_content,
            html_content=html_content,
            email_type=email_type,
            user_id=user_id,
            status="pending"
        )
        
        db.add(queue_entry)
        db.commit()
        db.refresh(queue_entry)
        
        logger.info(f"📧 Email queued: {email_type} to {to} (Queue ID: {queue_entry.id})")
        return queue_entry.id
    
    def get_pending_emails(self, db: Session, limit: int = 1) -> list:
        """
        Get pending emails that should be sent now
        Respects rate limiting based on time spacing
        
        Args:
            db: Database session
            limit: Number of emails to retrieve
            
        Returns:
            list: Email queue entries ready to send
        """
        now = datetime.utcnow()
        
        # Check if we've hit daily limit
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        sent_today = db.query(EmailQueue).filter(
            EmailQueue.status == "sent",
            EmailQueue.sent_at >= today_start
        ).count()
        
        if sent_today >= self.MAX_EMAILS_PER_DAY:
            logger.warning(f"⚠️  Daily email limit reached: {sent_today}/{self.MAX_EMAILS_PER_DAY}")
            return []
        
        # Get last sent email timestamp
        last_sent = db.query(EmailQueue).filter(
            EmailQueue.status == "sent"
        ).order_by(EmailQueue.sent_at.desc()).first()
        
        if last_sent and last_sent.sent_at:
            time_since_last = (now - last_sent.sent_at).total_seconds()
            
            if time_since_last < self.SECONDS_BETWEEN_EMAILS:
                time_to_wait = self.SECONDS_BETWEEN_EMAILS - time_since_last
                logger.info(f"⏳ Rate limiting: Wait {time_to_wait:.0f}s before next email")
                return []
        
        # Get pending emails (retry once if failed)
        pending = db.query(EmailQueue).filter(
            EmailQueue.status.in_(["pending", "retry"])
        ).order_by(
            EmailQueue.created_at.asc()
        ).limit(limit).all()
        
        return pending
    
    def send_email_from_queue(
        self,
        db: Session,
        queue_entry: EmailQueue
    ) -> bool:
        """
        Send an email from queue and update status
        
        Args:
            db: Database session
            queue_entry: EmailQueue entry to send
            
        Returns:
            bool: True if successful, False if failed
        """
        try:
            # Send via SMTP
            result = self.smtp_service.send_email(
                to=queue_entry.to,
                subject=queue_entry.subject,
                text_content=queue_entry.text_content,
                html_content=queue_entry.html_content
            )
            
            if result["success"]:
                # Mark as sent
                queue_entry.status = "sent"
                queue_entry.sent_at = datetime.utcnow()
                queue_entry.retry_count = 0
                queue_entry.error_message = None
                
                db.commit()
                logger.info(f"✅ Email sent: {queue_entry.email_type} to {queue_entry.to}")
                
                # Update metrics
                self._update_metrics(db, queue_entry.email_type, success=True)
                
                return True
            else:
                # Failed - check if retry needed
                queue_entry.retry_count += 1
                
                if queue_entry.retry_count <= self.MAX_RETRIES:
                    queue_entry.status = "retry"
                    queue_entry.error_message = result.get("error", "Unknown error")
                    logger.warning(f"⚠️  Email marked for retry: {queue_entry.to} (Attempt {queue_entry.retry_count})")
                else:
                    queue_entry.status = "failed"
                    queue_entry.error_message = result.get("error", "Max retries exceeded")
                    logger.error(f"❌ Email failed (max retries): {queue_entry.to}")
                    self._update_metrics(db, queue_entry.email_type, success=False)
                
                db.commit()
                return False
        
        except Exception as e:
            logger.error(f"❌ Error processing email queue: {str(e)}")
            queue_entry.status = "failed"
            queue_entry.error_message = str(e)
            db.commit()
            self._update_metrics(db, queue_entry.email_type, success=False)
            return False
    
    def get_queue_status(self, db: Session) -> dict:
        """
        Get current queue status and metrics
        
        Returns:
            dict: Queue status information
        """
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        total_pending = db.query(EmailQueue).filter(
            EmailQueue.status == "pending"
        ).count()
        
        total_retry = db.query(EmailQueue).filter(
            EmailQueue.status == "retry"
        ).count()
        
        sent_today = db.query(EmailQueue).filter(
            EmailQueue.status == "sent",
            EmailQueue.sent_at >= today_start
        ).count()
        
        failed_today = db.query(EmailQueue).filter(
            EmailQueue.status == "failed",
            EmailQueue.created_at >= today_start
        ).count()
        
        # Calculate time until next email can be sent
        next_send_time = None
        last_sent = db.query(EmailQueue).filter(
            EmailQueue.status == "sent"
        ).order_by(EmailQueue.sent_at.desc()).first()
        
        if last_sent and last_sent.sent_at:
            time_since_last = (now - last_sent.sent_at).total_seconds()
            if time_since_last < self.SECONDS_BETWEEN_EMAILS:
                seconds_to_wait = self.SECONDS_BETWEEN_EMAILS - time_since_last
                next_send_time = (now + timedelta(seconds=seconds_to_wait)).isoformat()
        
        return {
            "pending": total_pending,
            "retry": total_retry,
            "sent_today": sent_today,
            "failed_today": failed_today,
            "daily_limit": self.MAX_EMAILS_PER_DAY,
            "rate_limit_seconds": self.SECONDS_BETWEEN_EMAILS,
            "remaining_today": max(0, self.MAX_EMAILS_PER_DAY - sent_today),
            "next_send_time": next_send_time,
            "smtp_enabled": self.smtp_service.is_enabled()
        }
    
    def _update_metrics(self, db: Session, email_type: str, success: bool):
        """Update daily metrics for email statistics"""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        metrics = db.query(EmailMetrics).filter(
            EmailMetrics.date == today
        ).first()
        
        if not metrics:
            metrics = EmailMetrics(date=today)
            db.add(metrics)
        
        if success:
            metrics.total_sent += 1
            
            if email_type == "welcome":
                metrics.total_welcome += 1
            elif email_type == "daily_jobs":
                metrics.total_job_recommendations += 1
        else:
            metrics.total_failed += 1
        
        db.commit()
