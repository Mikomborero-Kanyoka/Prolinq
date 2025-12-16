"""
Main Email Service
Coordinates email sending with templates and queue management
"""
import logging
from sqlalchemy.orm import Session
from models import User, EmailQueue, EmailAd, Advertisement
from services.email_templates import EmailTemplates
from services.advanced_throttling_queue import AdvancedThrottlingQueue
from services.smtp_service import SMTPService
import random

logger = logging.getLogger(__name__)

class EmailService:
    """High-level email service for application"""
    
    def __init__(self):
        self.queue = AdvancedThrottlingQueue()
        self.templates = EmailTemplates()
        self.smtp = SMTPService()
    
    def send_welcome_email(self, db: Session, user: User) -> int:
        """
        Send welcome email to new user
        
        Args:
            db: Database session
            user: User object
            
        Returns:
            int: Queue entry ID
        """
        subject, text_content = self.templates.welcome_email(str(user.full_name or user.username or "User"))
        
        queue_id = self.queue.add_to_queue(
            db=db,
            to=str(user.email),
            subject=subject,
            text_content=text_content,
            email_type="welcome",
            user_id=user.id
        )
        
        logger.info(f"✉️  Welcome email queued for {user.email}")
        return queue_id
    
    def send_daily_job_recommendations(
        self,
        db: Session,
        user: User,
        jobs: list,
        include_ad: bool = True
    ) -> int:
        """
        Send daily job recommendations email
        
        Args:
            db: Database session
            user: User object
            jobs: List of Job objects to recommend
            include_ad: Whether to include a random ad
            
        Returns:
            int: Queue entry ID
        """
        if not jobs:
            logger.info(f"⏭️  No jobs to recommend for {user.email}, skipping")
            return None
        
        # Format jobs for email
        formatted_jobs = [self.templates.format_job_for_email(job) for job in jobs]
        
        # Get random ad if requested
        ad = None
        if include_ad:
            # Query active ads from advertisements table
            active_ads = db.query(Advertisement).filter(
                Advertisement.status == "active"
            ).all()
            
            if active_ads:
                ad = random.choice(active_ads)
                ad_dict = {
                    'title': ad.name,
                    'text': ad.benefit,
                    'link': ad.cta_url or 'https://prolinq.app',
                    'id': ad.id
                }
            else:
                ad_dict = None
        else:
            ad_dict = None
        
        # Generate email
        subject, html_content = self.templates.daily_job_recommendations(
            user_name=str(user.full_name or user.username or "User"),
            jobs=formatted_jobs,
            ad=ad_dict
        )
        
        # Add to queue with HTML-only content (no plain text fallback to avoid raw HTML display)
        queue_id = self.queue.add_to_queue(
            db=db,
            to=str(user.email),
            subject=subject,
            text_content="",  # Empty text content since we're sending HTML-only
            html_content=html_content,
            email_type="daily_jobs",
            user_id=user.id
        )
        
        # Track ad impression (use views field for email impressions)
        if ad:
            setattr(ad, 'views', (ad.views if ad.views is not None else 0) + 1)
            db.commit()
        
        logger.info(f"✉️  Daily recommendations email queued for {user.email} ({len(jobs)} jobs)")
        return queue_id
    
    def send_test_email(self, db: Session, recipient_email: str, admin_user: User) -> dict:
        """
        Send test email directly to verify SMTP configuration
        (NOT queued - sends immediately)
        
        Args:
            db: Database session
            recipient_email: Recipient email address
            admin_user: Admin user sending the test
            
        Returns:
            dict: Send result with success status and message
        """
        subject, text_content = self.templates.test_email(recipient_email)
        
        # Send directly via SMTP (not queued)
        result = self.smtp.send_email(
            to=recipient_email,
            subject=subject,
            text_content=text_content
        )
        
        if result["success"]:
            logger.info(f"✅ Test email sent directly to {recipient_email} by {admin_user.email}")
        else:
            logger.error(f"❌ Test email failed for {recipient_email}: {result.get('error', 'Unknown error')}")
        
        return result
    
    def process_queue(self, db: Session) -> dict:
        """
        Process one email from queue
        Called by background scheduler
        
        Args:
            db: Database session
            
        Returns:
            dict: Processing result
        """
        # Get next email to send
        pending_emails = self.queue.get_pending_emails(db, limit=1)
        
        if not pending_emails:
            status = self.queue.get_queue_status(db)
            return {
                "processed": 0,
                "status": "no_emails_to_send",
                "queue_info": status
            }
        
        queue_entry = pending_emails[0]
        success = self.queue.send_email_from_queue(db, queue_entry)
        
        return {
            "processed": 1,
            "status": "success" if success else "failed",
            "email_id": queue_entry.id,
            "to": queue_entry.to,
            "type": queue_entry.email_type,
            "queue_info": self.queue.get_queue_status(db)
        }
    
    def get_queue_status(self, db: Session) -> dict:
        """Get current queue and system status"""
        return self.queue.get_queue_status(db)
    
    def test_smtp_connection(self) -> dict:
        """Test SMTP connection"""
        return self.queue.smtp_service.test_connection()
    
    def send_test_recommendations_email(self, db: Session, recipient_email: str, admin_user: User) -> dict:
        """
        Send test recommendations email with HTML and actual ads
        (NOT queued - sends immediately)
        
        Args:
            db: Database session
            recipient_email: Recipient email address
            admin_user: Admin user sending the test
            
        Returns:
            dict: Send result with success status and message
        """
        from models import Job
        
        # Get sample jobs
        jobs_query = db.query(Job).filter(
            Job.status == "open"
        ).limit(5).all()
        
        # If no real jobs, use sample data
        if not jobs_query:
            formatted_jobs = [
                self.templates.format_job_for_email({
                    "title": "Senior Python Developer",
                    "company": "Tech Corp",
                    "location": "Remote",
                    "id": 1
                }),
                self.templates.format_job_for_email({
                    "title": "Frontend React Developer",
                    "company": "StartupXYZ",
                    "location": "San Francisco, CA",
                    "id": 2
                }),
                self.templates.format_job_for_email({
                    "title": "Full Stack Engineer",
                    "company": "Cloud Systems Inc",
                    "location": "New York, NY",
                    "id": 3
                }),
                self.templates.format_job_for_email({
                    "title": "DevOps Engineer",
                    "company": "Cloud Solutions Ltd",
                    "location": "Remote",
                    "id": 4
                }),
                self.templates.format_job_for_email({
                    "title": "Data Scientist",
                    "company": "AI Research Labs",
                    "location": "Boston, MA",
                    "id": 5
                })
            ]
        else:
            formatted_jobs = [self.templates.format_job_for_email(job) for job in jobs_query]
        
        # Get a random active ad
        active_ads = db.query(EmailAd).filter(EmailAd.is_active == True).all()
        ad_dict = None
        if active_ads:
            ad = random.choice(active_ads)
            ad_dict = {
                "title": ad.title,
                "text": ad.ad_text,
                "link": ad.ad_link or 'https://prolinq.app',
                "id": ad.id
            }
        else:
            # Use sample ad if none exist
            ad_dict = {
                "title": "Featured Opportunity - Prolinq Pro",
                "text": "Upgrade to Prolinq Pro to get priority access to the best job opportunities, advanced matching, and dedicated support. Limited time offer: 30% off your first month!",
                "link": "https://prolinq.app/upgrade",
                "id": 0
            }
        
        # Generate email
        subject, html_content = self.templates.daily_job_recommendations(
            user_name=str(admin_user.full_name or admin_user.username or "Admin"),
            jobs=formatted_jobs,
            ad=ad_dict
        )
        
        # Send directly via SMTP (not queued) - HTML-only to avoid raw HTML display
        result = self.smtp.send_email(
            to=recipient_email,
            subject=subject,
            text_content="",  # Empty text content since we're sending HTML-only
            html_content=html_content
        )
        
        if result["success"]:
            logger.info(f"✅ Test recommendations email sent directly to {recipient_email} by {admin_user.email}")
        else:
            logger.error(f"❌ Test recommendations email failed for {recipient_email}: {result.get('error', 'Unknown error')}")
        
        return result
