"""
Job Recommendations API Routes
Provides endpoints for generating and managing daily job recommendations
with notification integration
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_db
from models import User, Job, Notification
from auth import get_current_user
from routes.notification_helpers import create_job_recommendation_notification
from embedding_model import string_to_embedding, get_model
from datetime import datetime, timedelta
import json
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/daily")
async def get_daily_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get daily job recommendations for current user.
    Automatically refreshes recommendations if not done today.
    
    Returns:
        List of recommended jobs with match scores
    """
    try:
        print(f"🎯 Getting daily recommendations for user {current_user.id}")
        
        # Check if user has embedding
        if not current_user.profile_embedding:
            print(f"❌ User {current_user.id} has no embedding")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile embedding not found. Please complete your profile first."
            )
        
        # Get today's date range
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        # Get existing recommendation notifications from today
        existing_today = db.query(Notification).filter(
            and_(
                Notification.user_id == current_user.id,
                Notification.type == 'job_recommendation',
                Notification.created_at >= today_start,
                Notification.created_at < today_end
            )
        ).all()
        
        existing_job_ids = set()
        for notif in existing_today:
            try:
                data = json.loads(notif.data) if notif.data else {}
                if 'job_id' in data:
                    existing_job_ids.add(data['job_id'])
            except:
                pass
        
        print(f"📌 Found {len(existing_today)} existing recommendations from today")
        print(f"📌 Jobs already recommended today: {existing_job_ids}")
        
        # Get new recommendations
        model = get_model()
        user_embedding = string_to_embedding(current_user.profile_embedding)
        
        if user_embedding.size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user embedding"
            )
        
        # Get all open jobs with embeddings
        jobs = db.query(Job).filter(
            and_(
                Job.job_embedding.isnot(None),
                Job.status == "open",
                Job.deadline.is_(None) | (Job.deadline > now)  # Not expired
            )
        ).all()
        
        print(f"📌 Found {len(jobs)} open jobs to match against")
        
        matches = []
        for job in jobs:
            job_embedding = string_to_embedding(job.job_embedding)
            if job_embedding.size == 0:
                continue
            
            similarity = model.calculate_similarity(job_embedding, user_embedding)
            
            # Only include matches above 40% threshold
            if similarity >= 0.4:
                matches.append({
                    "job_id": job.id,
                    "title": job.title,
                    "description": job.description[:200] + "..." if len(job.description) > 200 else job.description,
                    "company": job.creator.company_name if job.creator else "Unknown",
                    "location": job.location,
                    "job_type": job.job_type,
                    "category": job.category,
                    "budget": job.budget,
                    "budget_min": job.budget_min,
                    "budget_max": job.budget_max,
                    "budget_currency": job.budget_currency,
                    "similarity_score": round(similarity, 3),
                    "match_percentage": int(similarity * 100)
                })
        
        # Sort by similarity score (descending)
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        matches = matches[:limit]
        
        print(f"✅ Generated {len(matches)} new recommendations")
        
        # Get new job IDs from today's matches
        new_job_ids = {match['job_id'] for match in matches}
        
        # If recommendations changed, update notifications
        if new_job_ids != existing_job_ids:
            print(f"🔄 Recommendations changed. Old: {existing_job_ids}, New: {new_job_ids}")
            
            # Mark old recommendations as read (archive them)
            jobs_to_archive = existing_job_ids - new_job_ids
            if jobs_to_archive:
                print(f"📪 Archiving recommendations for jobs: {jobs_to_archive}")
                for notif in existing_today:
                    try:
                        data = json.loads(notif.data) if notif.data else {}
                        if data.get('job_id') in jobs_to_archive:
                            notif.is_read = True
                    except:
                        pass
            
            # Create new recommendations
            jobs_to_create = new_job_ids - existing_job_ids
            if jobs_to_create:
                print(f"✨ Creating new notifications for jobs: {jobs_to_create}")
                for match in matches:
                    if match['job_id'] in jobs_to_create:
                        try:
                            create_job_recommendation_notification(
                                db=db,
                                user_id=current_user.id,
                                job_title=match['title'],
                                job_id=match['job_id'],
                                match_score=match['similarity_score']
                            )
                        except Exception as e:
                            print(f"❌ Error creating recommendation notification: {e}")
            
            db.commit()
        else:
            print(f"✅ Recommendations unchanged, no updates needed")
        
        return {
            "success": True,
            "user_id": current_user.id,
            "recommendations": matches,
            "total_recommendations": len(matches),
            "from_cache": len(existing_today) > 0,
            "generated_today": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting recommendations: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting recommendations: {str(e)}"
        )


@router.post("/refresh")
async def force_refresh_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Force refresh recommendations for current user regardless of date.
    Useful for manual refresh or admin tasks.
    
    Returns:
        Updated list of recommendations
    """
    try:
        print(f"🔄 Force refreshing recommendations for user {current_user.id}")
        
        if not current_user.profile_embedding:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile embedding not found"
            )
        
        # Get all unread job recommendations
        existing = db.query(Notification).filter(
            and_(
                Notification.user_id == current_user.id,
                Notification.type == 'job_recommendation',
                Notification.is_read == False
            )
        ).all()
        
        existing_job_ids = set()
        for notif in existing:
            try:
                data = json.loads(notif.data) if notif.data else {}
                if 'job_id' in data:
                    existing_job_ids.add(data['job_id'])
            except:
                pass
        
        # Get new recommendations
        model = get_model()
        user_embedding = string_to_embedding(current_user.profile_embedding)
        
        now = datetime.utcnow()
        jobs = db.query(Job).filter(
            and_(
                Job.job_embedding.isnot(None),
                Job.status == "open",
                Job.deadline.is_(None) | (Job.deadline > now)
            )
        ).all()
        
        matches = []
        for job in jobs:
            job_embedding = string_to_embedding(job.job_embedding)
            if job_embedding.size == 0:
                continue
            
            similarity = model.calculate_similarity(job_embedding, user_embedding)
            
            if similarity >= 0.4:
                matches.append({
                    "job_id": job.id,
                    "title": job.title,
                    "similarity_score": round(similarity, 3),
                    "match_percentage": int(similarity * 100)
                })
        
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        new_job_ids = {match['job_id'] for match in matches[:10]}
        
        # Archive old recommendations not in new set
        for notif in existing:
            try:
                data = json.loads(notif.data) if notif.data else {}
                if data.get('job_id') not in new_job_ids:
                    notif.is_read = True
                    print(f"📪 Archived recommendation for job {data.get('job_id')}")
            except:
                pass
        
        # Create new recommendations
        for match in matches[:10]:
            if match['job_id'] not in existing_job_ids:
                try:
                    create_job_recommendation_notification(
                        db=db,
                        user_id=current_user.id,
                        job_title=match['title'],
                        job_id=match['job_id'],
                        match_score=match['similarity_score']
                    )
                except Exception as e:
                    print(f"❌ Error: {e}")
        
        db.commit()
        
        return {
            "success": True,
            "message": "Recommendations refreshed",
            "previous_count": len(existing_job_ids),
            "new_count": len(new_job_ids),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error refreshing recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error refreshing recommendations: {str(e)}"
        )


@router.post("/cleanup-expired")
async def cleanup_expired_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clean up recommendation notifications for expired or deleted jobs.
    """
    try:
        print(f"🧹 Cleaning expired recommendations for user {current_user.id}")
        
        # Get all unread job recommendation notifications
        recommendations = db.query(Notification).filter(
            and_(
                Notification.user_id == current_user.id,
                Notification.type == 'job_recommendation',
                Notification.is_read == False
            )
        ).all()
        
        deleted_count = 0
        now = datetime.utcnow()
        
        for notif in recommendations:
            try:
                data = json.loads(notif.data) if notif.data else {}
                job_id = data.get('job_id')
                
                if not job_id:
                    db.delete(notif)
                    deleted_count += 1
                    continue
                
                # Check if job still exists and is open
                job = db.query(Job).filter(Job.id == job_id).first()
                
                if not job:
                    print(f"🗑️  Job {job_id} deleted, removing notification")
                    db.delete(notif)
                    deleted_count += 1
                elif job.status != "open":
                    print(f"🗑️  Job {job_id} no longer open, removing notification")
                    db.delete(notif)
                    deleted_count += 1
                elif job.deadline and job.deadline <= now:
                    print(f"🗑️  Job {job_id} expired, removing notification")
                    db.delete(notif)
                    deleted_count += 1
            except Exception as e:
                print(f"❌ Error processing notification {notif.id}: {e}")
        
        db.commit()
        
        print(f"✅ Cleaned up {deleted_count} expired recommendations")
        
        return {
            "success": True,
            "cleaned_count": deleted_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        print(f"❌ Error cleaning expired recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cleaning recommendations: {str(e)}"
        )


@router.post("/trigger-daily")
async def trigger_daily_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually trigger daily recommendations for the current user.
    Useful for testing or forcing a refresh.
    
    NOTE: This is meant for testing. The scheduler automatically generates
    daily recommendations for all users at 9:00 AM UTC.
    """
    try:
        print(f"🎯 Manual trigger: Generating daily recommendations for user {current_user.id}")
        
        if not current_user.profile_embedding:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile embedding not found. Please complete your profile first."
            )
        
        # Get today's date range
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        # Get existing recommendation notifications from today
        existing_today = db.query(Notification).filter(
            and_(
                Notification.user_id == current_user.id,
                Notification.type == 'job_recommendation',
                Notification.created_at >= today_start,
                Notification.created_at < today_end
            )
        ).all()
        
        existing_job_ids = set()
        for notif in existing_today:
            try:
                data = json.loads(notif.data) if notif.data else {}
                if 'job_id' in data:
                    existing_job_ids.add(data['job_id'])
            except:
                pass
        
        print(f"📌 Found {len(existing_today)} existing recommendations from today")
        
        # Get new recommendations
        model = get_model()
        user_embedding = string_to_embedding(current_user.profile_embedding)
        
        if user_embedding.size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user embedding"
            )
        
        # Get all open jobs with embeddings
        jobs = db.query(Job).filter(
            and_(
                Job.job_embedding.isnot(None),
                Job.status == "open",
                Job.deadline.is_(None) | (Job.deadline > now)
            )
        ).all()
        
        print(f"📌 Found {len(jobs)} open jobs to match against")
        
        matches = []
        for job in jobs:
            job_embedding = string_to_embedding(job.job_embedding)
            if job_embedding.size == 0:
                continue
            
            similarity = model.calculate_similarity(job_embedding, user_embedding)
            
            if similarity >= 0.4:
                matches.append({
                    "job_id": job.id,
                    "title": job.title,
                    "description": job.description[:200] + "..." if len(job.description) > 200 else job.description,
                    "company": job.creator.company_name if job.creator else "Unknown",
                    "location": job.location,
                    "job_type": job.job_type,
                    "category": job.category,
                    "budget": job.budget,
                    "budget_min": job.budget_min,
                    "budget_max": job.budget_max,
                    "budget_currency": job.budget_currency,
                    "similarity_score": round(similarity, 3),
                    "match_percentage": int(similarity * 100)
                })
        
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        matches = matches[:5]
        
        print(f"✅ Generated {len(matches)} new recommendations")
        
        new_job_ids = {match['job_id'] for match in matches}
        jobs_to_create = new_job_ids - existing_job_ids
        created_count = 0
        
        if jobs_to_create:
            print(f"✨ Creating new notifications for jobs: {jobs_to_create}")
            for match in matches:
                if match['job_id'] in jobs_to_create:
                    try:
                        create_job_recommendation_notification(
                            db=db,
                            user_id=current_user.id,
                            job_title=match['title'],
                            job_id=match['job_id'],
                            match_score=match['similarity_score']
                        )
                        created_count += 1
                    except Exception as e:
                        print(f"❌ Error creating recommendation notification: {e}")
            
            db.commit()
        
        return {
            "success": True,
            "user_id": current_user.id,
            "recommendations_generated": len(matches),
            "new_notifications_created": created_count,
            "existing_notifications_today": len(existing_today),
            "recommendations": matches,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in manual trigger: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering recommendations: {str(e)}"
        )


@router.get("/active")
async def get_active_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all active (unread) job recommendations for the user.
    Also triggers cleanup of expired recommendations.
    """
    try:
        print(f"📋 Getting active recommendations for user {current_user.id}")
        
        # First cleanup expired jobs
        now = datetime.utcnow()
        unread_recommendations = db.query(Notification).filter(
            and_(
                Notification.user_id == current_user.id,
                Notification.type == 'job_recommendation',
                Notification.is_read == False
            )
        ).all()
        
        active_recommendations = []
        deleted_count = 0
        
        for notif in unread_recommendations:
            try:
                data = json.loads(notif.data) if notif.data else {}
                job_id = data.get('job_id')
                
                # Check if job still exists and is valid
                job = db.query(Job).filter(Job.id == job_id).first()
                
                if not job or job.status != "open" or (job.deadline and job.deadline <= now):
                    db.delete(notif)
                    deleted_count += 1
                    continue
                
                active_recommendations.append({
                    "notification_id": notif.id,
                    "job_id": job.id,
                    "job_title": job.title,
                    "match_percentage": data.get('match_percentage', 0),
                    "match_score": data.get('match_score', 0),
                    "created_at": notif.created_at.isoformat(),
                    "job_deadline": job.deadline.isoformat() if job.deadline else None
                })
            except Exception as e:
                print(f"❌ Error processing notification: {e}")
        
        db.commit()
        
        print(f"✅ Found {len(active_recommendations)} active recommendations")
        if deleted_count > 0:
            print(f"🧹 Cleaned up {deleted_count} expired recommendations")
        
        return {
            "success": True,
            "recommendations": active_recommendations,
            "total_active": len(active_recommendations),
            "cleaned_up": deleted_count
        }
        
    except Exception as e:
        print(f"❌ Error getting active recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting recommendations: {str(e)}"
        )


# Helper function for scheduler and other non-endpoint code
def get_user_job_recommendations(db: Session, user_id: int, limit: int = 5) -> List[Job]:
    """
    Get job recommendations for a specific user (non-endpoint helper function).
    Used by scheduler and other background tasks.
    
    Args:
        db: Database session
        user_id: User ID to get recommendations for
        limit: Maximum number of recommendations to return
        
    Returns:
        List of Job objects that match the user's profile
    """
    try:
        # Get user with their embedding
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user or not user.profile_embedding:
            print(f"⚠️  User {user_id} not found or has no embedding")
            return []
        
        # Get user embedding
        user_embedding = string_to_embedding(user.profile_embedding)
        if user_embedding.size == 0:
            print(f"⚠️  User {user_id} has invalid embedding")
            return []
        
        # Get all open jobs with embeddings
        now = datetime.utcnow()
        jobs = db.query(Job).filter(
            and_(
                Job.job_embedding.isnot(None),
                Job.status == "open",
                Job.deadline.is_(None) | (Job.deadline > now)
            )
        ).all()
        
        if not jobs:
            print(f"⚠️  No open jobs found for user {user_id}")
            return []
        
        # Calculate matches
        model = get_model()
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
                        "job": job,
                        "similarity_score": round(similarity, 3),
                        "match_percentage": int(similarity * 100)
                    })
            except Exception as e:
                print(f"⚠️  Error processing job {job.id} for user {user_id}: {e}")
                continue
        
        # Sort by similarity score (descending) and take top N
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        matches = matches[:limit]
        
        # Return just the job objects
        recommended_jobs = [match['job'] for match in matches]
        print(f"✅ Found {len(recommended_jobs)} recommendations for user {user_id}")
        
        return recommended_jobs
        
    except Exception as e:
        print(f"❌ Error getting recommendations for user {user_id}: {e}")
        import traceback
        traceback.print_exc()
        return []