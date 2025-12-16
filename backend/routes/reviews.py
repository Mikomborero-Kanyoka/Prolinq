from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Review, Job, User, Application
from auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    job_id: int
    reviewed_user_id: int
    rating: int
    comment: str

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    id: int
    job_id: int
    reviewer_id: int
    reviewed_user_id: int
    rating: int
    comment: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.post("/", response_model=ReviewResponse)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a review for a completed job"""
    
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Validate comment
    if not review_data.comment or len(review_data.comment.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment is required"
        )
    
    # Check if job exists and is completed
    job = db.query(Job).filter(Job.id == review_data.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review completed jobs"
        )
    
    # Check if user is authorized to review (must be part of the job)
    # Check if current user is the employer or the worker
    application = db.query(Application).filter(
        (Application.job_id == review_data.job_id) & 
        (Application.status == "accepted")
    ).first()
    
    is_employer = job.creator_id == current_user.id
    is_worker = application and application.applicant_id == current_user.id
    
    if not (is_employer or is_worker):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to review this job"
        )
    
    # Check if reviewed user exists
    reviewed_user = db.query(User).filter(User.id == review_data.reviewed_user_id).first()
    if not reviewed_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reviewed user not found"
        )
    
    # Check if already reviewed by this user
    existing_review = db.query(Review).filter(
        (Review.job_id == review_data.job_id) &
        (Review.reviewer_id == current_user.id) &
        (Review.reviewed_user_id == review_data.reviewed_user_id)
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this user for this job"
        )
    
    # Create review
    db_review = Review(
        job_id=review_data.job_id,
        reviewer_id=current_user.id,
        reviewed_user_id=review_data.reviewed_user_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    if is_employer:
        job.talent_rating = review_data.rating
        db.commit()
    
    # Create notification for the reviewed user
    try:
        from routes.notification_helpers import create_review_received_notification
        
        notification = create_review_received_notification(
            db=db,
            reviewed_user_id=review_data.reviewed_user_id,
            reviewer_name=current_user.full_name or current_user.username,
            reviewer_id=current_user.id,
            rating=review_data.rating,
            job_id=review_data.job_id,
            job_title=job.title,
            review_id=db_review.id
        )
        print(f"📢 Notification created for review: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating review notification: {e}")
        import traceback
        traceback.print_exc()
    
    return {
        "id": db_review.id,
        "job_id": db_review.job_id,
        "reviewer_id": db_review.reviewer_id,
        "reviewed_user_id": db_review.reviewed_user_id,
        "rating": db_review.rating,
        "comment": db_review.comment,
        "created_at": db_review.created_at.isoformat(),
        "updated_at": db_review.updated_at.isoformat()
    }


@router.post("/user/{user_id}", response_model=ReviewResponse)
def create_review_for_user(
    user_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a review for a specific user (alternative endpoint)"""
    
    # Validate that the reviewed_user_id matches the URL parameter
    if review_data.reviewed_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reviewed_user_id in request body must match user_id in URL"
        )
    
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Validate comment
    if not review_data.comment or len(review_data.comment.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment is required"
        )
    
    # Check if job exists and is completed
    job = db.query(Job).filter(Job.id == review_data.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review completed jobs"
        )
    
    # Check if user is authorized to review (must be part of the job)
    # Check if current user is the employer or the worker
    application = db.query(Application).filter(
        (Application.job_id == review_data.job_id) & 
        (Application.status == "accepted")
    ).first()
    
    is_employer = job.creator_id == current_user.id
    is_worker = application and application.applicant_id == current_user.id
    
    if not (is_employer or is_worker):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to review this job"
        )
    
    # Check if reviewed user exists
    reviewed_user = db.query(User).filter(User.id == review_data.reviewed_user_id).first()
    if not reviewed_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reviewed user not found"
        )
    
    # Check if already reviewed by this user
    existing_review = db.query(Review).filter(
        (Review.job_id == review_data.job_id) &
        (Review.reviewer_id == current_user.id) &
        (Review.reviewed_user_id == review_data.reviewed_user_id)
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this user for this job"
        )
    
    # Create review
    db_review = Review(
        job_id=review_data.job_id,
        reviewer_id=current_user.id,
        reviewed_user_id=review_data.reviewed_user_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    if is_employer:
        job.talent_rating = review_data.rating
        db.commit()
    
    # Create notification for the reviewed user
    try:
        from routes.notification_helpers import create_review_received_notification
        
        notification = create_review_received_notification(
            db=db,
            reviewed_user_id=review_data.reviewed_user_id,
            reviewer_name=current_user.full_name or current_user.username,
            reviewer_id=current_user.id,
            rating=review_data.rating,
            job_id=review_data.job_id,
            job_title=job.title,
            review_id=db_review.id
        )
        print(f"📢 Notification created for review: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating review notification: {e}")
        import traceback
        traceback.print_exc()
    
    return {
        "id": db_review.id,
        "job_id": db_review.job_id,
        "reviewer_id": db_review.reviewer_id,
        "reviewed_user_id": db_review.reviewed_user_id,
        "rating": db_review.rating,
        "comment": db_review.comment,
        "created_at": db_review.created_at.isoformat(),
        "updated_at": db_review.updated_at.isoformat()
    }


@router.get("/user/{user_id}")
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    reviews = db.query(Review).filter(Review.reviewed_user_id == user_id).all()
    
    if not reviews:
        return {
            "user_id": user_id,
            "average_rating": 0,
            "total_reviews": 0,
            "reviews": []
        }
    
    average_rating = sum(r.rating for r in reviews) / len(reviews)
    
    return {
        "user_id": user_id,
        "average_rating": round(average_rating, 2),
        "total_reviews": len(reviews),
        "reviews": [
            {
                "id": r.id,
                "job_id": r.job_id,
                "reviewer_id": r.reviewer_id,
                "reviewer_name": r.reviewer.full_name or r.reviewer.username,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat()
            }
            for r in reviews
        ]
    }


@router.get("/job/{job_id}")
def get_job_reviews(job_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a specific job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    reviews = db.query(Review).filter(Review.job_id == job_id).all()
    
    # Calculate average rating
    average_rating = 0
    if reviews:
        average_rating = sum(r.rating for r in reviews) / len(reviews)
    
    return {
        "job_id": job_id,
        "average_rating": round(average_rating, 2),
        "total_reviews": len(reviews),
        "reviews": [
            {
                "id": r.id,
                "reviewer_id": r.reviewer_id,
                "reviewer_name": r.reviewer.full_name or r.reviewer.username,
                "reviewed_user_id": r.reviewed_user_id,
                "reviewed_user_name": r.reviewed_user.full_name or r.reviewed_user.username,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat()
            }
            for r in reviews
        ]
    }


@router.get("/check/{job_id}/{reviewed_user_id}")
def check_review_exists(
    job_id: int,
    reviewed_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has already reviewed a specific user for a job"""
    review = db.query(Review).filter(
        (Review.job_id == job_id) &
        (Review.reviewer_id == current_user.id) &
        (Review.reviewed_user_id == reviewed_user_id)
    ).first()
    
    return {
        "has_reviewed": bool(review),
        "review": {
            "id": review.id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at.isoformat()
        } if review else None
    }
