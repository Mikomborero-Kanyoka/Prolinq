from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from database import get_db
from models import Job, User, Application, Review
from auth import get_current_user
from datetime import datetime, timedelta
from typing import List, Dict, Any

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/user-dashboard")
def get_user_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics for user dashboard
    Returns earnings, completion rate, ratings, and activity metrics
    """
    
    user_id = current_user.id
    
    # 1. EARNINGS OVER TIME - For freelancers/talent (accepted applications with completed jobs)
    earnings_data = []
    # Get last 12 months of data
    for i in range(11, -1, -1):
        month_date = datetime.utcnow() - timedelta(days=30*i)
        month_str = month_date.strftime("%b %Y")
        
        # Find completed jobs where this user was the worker
        completed_jobs = db.query(func.sum(Job.final_amount)).filter(
            and_(
                Job.status == "completed",
                Job.completed_at.isnot(None),
                extract('month', Job.completed_at) == month_date.month,
                extract('year', Job.completed_at) == month_date.year,
                Job.applications.any(
                    and_(
                        Application.applicant_id == user_id,
                        Application.status == "accepted"
                    )
                )
            )
        ).scalar() or 0
        
        earnings_data.append({
            "month": month_str,
            "earnings": float(completed_jobs) if completed_jobs else 0
        })
    
    # 2. TASKS COMPLETION RATE
    # As a worker - completed jobs / total applications accepted
    accepted_applications = db.query(Application).filter(
        and_(
            Application.applicant_id == user_id,
            Application.status == "accepted"
        )
    ).all()
    
    completed_count = 0
    if accepted_applications:
        for app in accepted_applications:
            job = app.job
            if job.status == "completed":
                completed_count += 1
    
    completion_rate = 0
    if accepted_applications:
        completion_rate = (completed_count / len(accepted_applications)) * 100
    
    # 3. RATINGS TREND - Average rating over time for reviews received by this user
    ratings_data = []
    for i in range(11, -1, -1):
        month_date = datetime.utcnow() - timedelta(days=30*i)
        month_str = month_date.strftime("%b %Y")
        
        avg_rating = db.query(func.avg(Review.rating)).filter(
            and_(
                Review.reviewed_user_id == user_id,
                extract('month', Review.created_at) == month_date.month,
                extract('year', Review.created_at) == month_date.year
            )
        ).scalar()
        
        ratings_data.append({
            "month": month_str,
            "rating": round(float(avg_rating), 2) if avg_rating else 0
        })
    
    # 4. MONTHLY ACTIVITY - Jobs posted or accepted by month (for employers: jobs posted, for talent: applications)
    activity_data = []
    if current_user.primary_role == "employer":
        # For employers: jobs posted per month
        for i in range(11, -1, -1):
            month_date = datetime.utcnow() - timedelta(days=30*i)
            month_str = month_date.strftime("%b %Y")
            
            jobs_posted = db.query(func.count(Job.id)).filter(
                and_(
                    Job.creator_id == user_id,
                    extract('month', Job.created_at) == month_date.month,
                    extract('year', Job.created_at) == month_date.year
                )
            ).scalar() or 0
            
            activity_data.append({
                "month": month_str,
                "posted": jobs_posted,
                "accepted": 0  # Not applicable for employers
            })
    else:
        # For talent: applications submitted per month
        for i in range(11, -1, -1):
            month_date = datetime.utcnow() - timedelta(days=30*i)
            month_str = month_date.strftime("%b %Y")
            
            apps_submitted = db.query(func.count(Application.id)).filter(
                and_(
                    Application.applicant_id == user_id,
                    extract('month', Application.created_at) == month_date.month,
                    extract('year', Application.created_at) == month_date.year
                )
            ).scalar() or 0
            
            apps_accepted = db.query(func.count(Application.id)).filter(
                and_(
                    Application.applicant_id == user_id,
                    Application.status == "accepted",
                    extract('month', Application.created_at) == month_date.month,
                    extract('year', Application.created_at) == month_date.year
                )
            ).scalar() or 0
            
            activity_data.append({
                "month": month_str,
                "submitted": apps_submitted,
                "accepted": apps_accepted
            })
    
    # Get overall statistics
    total_reviews = db.query(Review).filter(
        Review.reviewed_user_id == user_id
    ).count()
    
    avg_rating = db.query(func.avg(Review.rating)).filter(
        Review.reviewed_user_id == user_id
    ).scalar() or 0
    
    total_earnings = sum(item["earnings"] for item in earnings_data)
    
    return {
        "earnings_trend": earnings_data,
        "completion_rate": round(completion_rate, 2),
        "total_completed_jobs": completed_count,
        "total_accepted_jobs": len(accepted_applications),
        "ratings_trend": ratings_data,
        "total_reviews": total_reviews,
        "average_rating": round(float(avg_rating), 2) if avg_rating else 0,
        "monthly_activity": activity_data,
        "total_earnings": round(total_earnings, 2),
        "user_role": current_user.primary_role
    }