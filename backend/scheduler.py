"""
Background Scheduler for Daily Jobs
Handles recurring tasks like daily job recommendation notifications
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from database import get_db
from models import User, Notification, Job
from routes.notification_helpers import create_job_recommendation_notification
from embedding_model import string_to_embedding, get_model
from services.email_service import EmailService
from routes.job_recommendations import get_user_job_recommendations
from datetime import datetime, timedelta
import json
from sqlalchemy import and_
import asyncio
import logging
import random

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()
email_service = EmailService()


async def process_email_queue():
    """
    Process one email from the queue every minute
    Respects Gmail rate limits (1 email every 8-10 minutes)
    """
    try:
        db = next(get_db())
        result = email_service.process_queue(db)
        
        if result.get("processed", 0) > 0:
            logger.info(f"✉️  Processed email: {result.get('type')} to {result.get('to')}")
        else:
            status = result.get("status", "unknown")
            if status != "no_emails_to_send":
                logger.debug(f"📧 Queue processing: {status}")
        
        db.close()
    except Exception as e:
        logger.error(f"❌ Error processing email queue: {str(e)}")


async def send_daily_emails():
    """
    Send daily job recommendations emails to all talent users
    Stagger throughout the day (every hour starting at 8 AM)
    """
    logger.info("📧 Starting daily email recommendations sending...")
    
    try:
        db = next(get_db())
        
        # Get all active talent users
        talent_users = db.query(User).filter(
            and_(
                User.is_active == True,
                User.primary_role.in_(["talent", "freelancer"])
            )
        ).all()
        
        logger.info(f"📋 Found {len(talent_users)} talent users for email recommendations")
        
        if not talent_users:
            logger.warning("⚠️  No active talent users found for email recommendations")
            db.close()
            return
        
        # Stagger users throughout the day for even distribution
        # Divide users into 12 hourly batches (8 AM - 8 PM)
        batch_size = max(1, len(talent_users) // 12)
        
        # Get current hour (0-23)
        now = datetime.utcnow()
        current_hour = now.hour
        
        # Determine which batch to send to (only between 8 AM and 8 PM UTC)
        if 8 <= current_hour < 20:
            batch_index = current_hour - 8
            start_idx = batch_index * batch_size
            end_idx = start_idx + batch_size if batch_index < 11 else len(talent_users)
            
            users_to_email = talent_users[start_idx:end_idx]
        else:
            logger.info(f"⏳ Outside email sending hours (8 AM - 8 PM UTC). Current hour: {current_hour}")
            users_to_email = []
        
        logger.info(f"📧 Sending emails to {len(users_to_email)} users in this batch (Hour {current_hour})")
        
        for user in users_to_email:
            try:
                # Get recommendations for this user
                jobs = get_user_job_recommendations(db, user.id, limit=3)
                
                if jobs:
                    # Send email with job recommendations
                    email_service.send_daily_job_recommendations(
                        db=db,
                        user=user,
                        jobs=jobs,
                        include_ad=True
                    )
                    logger.info(f"✉️  Daily email queued for {user.email} ({len(jobs)} jobs)")
                else:
                    logger.info(f"⏭️  No jobs to recommend for {user.email}")
                    
            except Exception as e:
                logger.error(f"❌ Error sending email to {user.email}: {str(e)}")
                continue
        
        db.close()
        logger.info(f"📧 Finished processing batch for hour {current_hour}")
        
    except Exception as e:
        logger.error(f"❌ Fatal error in daily email sending: {e}")
        import traceback
        traceback.print_exc()


async def generate_daily_recommendations():
    """
    Generate and send daily job recommendations to all active users
    This runs once per day at a configured time
    """
    logger.info("🌅 Starting daily job recommendations generation...")
    
    try:
        db = next(get_db())
        
        # Get all active users with embeddings
        users = db.query(User).filter(
            and_(
                User.is_active == True,
                User.profile_embedding.isnot(None),
                User.primary_role.in_(["talent", "freelancer"])  # Only for job seekers
            )
        ).all()
        
        logger.info(f"📋 Found {len(users)} active users to generate recommendations for")
        
        if not users:
            logger.warning("⚠️  No active users found for recommendations")
            db.close()
            return
        
        # Get today's date range
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        model = get_model()
        total_recommendations = 0
        
        for user in users:
            try:
                logger.info(f"🎯 Processing recommendations for user {user.id} ({user.username})")
                
                # Check if this user already has recommendations for today
                existing_today = db.query(Notification).filter(
                    and_(
                        Notification.user_id == user.id,
                        Notification.type == 'job_recommendation',
                        Notification.created_at >= today_start,
                        Notification.created_at < today_end,
                        Notification.is_read == False
                    )
                ).count()
                
                if existing_today > 0:
                    logger.info(f"✅ User {user.id} already has {existing_today} unread recommendations from today, skipping")
                    continue
                
                # Get user embedding
                user_embedding = string_to_embedding(user.profile_embedding)
                if user_embedding.size == 0:
                    logger.warning(f"⚠️  User {user.id} has invalid embedding")
                    continue
                
                # Get all open jobs with embeddings
                jobs = db.query(Job).filter(
                    and_(
                        Job.job_embedding.isnot(None),
                        Job.status == "open",
                        Job.deadline.is_(None) | (Job.deadline > now)
                    )
                ).all()
                
                logger.info(f"📌 Found {len(jobs)} open jobs to match against for user {user.id}")
                
                # Calculate matches
                matches = []
                for job in jobs:
                    try:
                        job_embedding = string_to_embedding(job.job_embedding)
                        if job_embedding.size == 0:
                            continue
                        
                        similarity = model.calculate_similarity(job_embedding, user_embedding)
                        
                        # Only include matches above 40% threshold
                        if similarity >= 0.4:
                            matches.append({
                                "job_id": job.id,
                                "title": job.title,
                                "similarity_score": round(similarity, 3),
                                "match_percentage": int(similarity * 100)
                            })
                    except Exception as e:
                        logger.warning(f"⚠️  Error processing job {job.id}: {e}")
                        continue
                
                # Sort by similarity score (descending) and take top 5
                matches.sort(key=lambda x: x['similarity_score'], reverse=True)
                matches = matches[:5]
                
                if matches:
                    logger.info(f"✨ Creating {len(matches)} recommendation notifications for user {user.id}")
                    
                    for match in matches:
                        try:
                            create_job_recommendation_notification(
                                db=db,
                                user_id=user.id,
                                job_title=match['title'],
                                job_id=match['job_id'],
                                match_score=match['similarity_score']
                            )
                            total_recommendations += 1
                        except Exception as e:
                            logger.error(f"❌ Error creating notification for user {user.id}, job {match['job_id']}: {e}")
                else:
                    logger.info(f"📭 No matching recommendations found for user {user.id}")
                
                db.commit()
                
            except Exception as e:
                logger.error(f"❌ Error processing user {user.id}: {e}")
                db.rollback()
                continue
        
        db.close()
        logger.info(f"🎉 Daily recommendations generation complete! Created {total_recommendations} total recommendations")
        
    except Exception as e:
        logger.error(f"❌ Fatal error in daily recommendations generation: {e}")
        import traceback
        traceback.print_exc()


def start_scheduler(app):
    """
    Start the background scheduler
    Call this from main.py on app startup
    """
    if not scheduler.running:
        logger.info("🚀 Starting background scheduler...")
        
        # Add job to run daily recommendations at 9 AM UTC
        scheduler.add_job(
            generate_daily_recommendations,
            CronTrigger(hour=9, minute=0, second=0),
            id='daily_recommendations',
            name='Generate daily job recommendations',
            replace_existing=True
        )
        
        # Add job to process email queue every minute
        scheduler.add_job(
            process_email_queue,
            IntervalTrigger(minutes=1),
            id='email_queue_processor',
            name='Process email queue',
            replace_existing=True
        )
        
        # Add job to send daily emails every hour (8 AM - 8 PM UTC)
        scheduler.add_job(
            send_daily_emails,
            CronTrigger(hour='8-19', minute=0, second=0),
            id='send_daily_emails',
            name='Send daily job recommendation emails',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("✅ Background scheduler started successfully")
        logger.info("📅 Scheduled:")
        logger.info("   - Daily job recommendations at 09:00 UTC")
        logger.info("   - Email queue processing every minute")
        logger.info("   - Daily emails: Every hour 8 AM - 8 PM UTC")
        
        # Store scheduler reference in app
        app.state.scheduler = scheduler


def stop_scheduler(app):
    """
    Stop the background scheduler
    Call this from main.py on app shutdown
    """
    if hasattr(app.state, 'scheduler') and app.state.scheduler.running:
        logger.info("🛑 Stopping background scheduler...")
        app.state.scheduler.shutdown()
        logger.info("✅ Background scheduler stopped")