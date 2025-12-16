from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Job, User
from auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/jobs", tags=["job-completion"])

class JobCompletionData(BaseModel):
    job_id: int
    completion_notes: str
    rating: int = None

class JobCompleteRequest(BaseModel):
    final_amount: float = None
    payment_currency: str = "USD"
    completion_notes: str = None
    talent_rating: int = None

class PaymentConfirmRequest(BaseModel):
    payment_reference: str = None
    payment_method: str = None
    notes: str = None

class RateEmployerRequest(BaseModel):
    employer_rating: int
    review_notes: str = None

class CompletedJob(BaseModel):
    job_id: int
    completed_date: datetime
    completion_notes: str
    rating: int = None

# Mock storage for completed jobs
completed_jobs_store = {}

@router.post("/")
def complete_job(data: JobCompletionData, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == data.job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to complete this job"
        )
    
    # Mark job as completed
    job.status = "completed"
    db.commit()
    
    # Store completion data
    completed_jobs_store[data.job_id] = {
        "job_id": data.job_id,
        "completed_date": datetime.utcnow(),
        "completion_notes": data.completion_notes,
        "rating": data.rating
    }
    
    return {"message": "Job marked as completed", "job_id": data.job_id}

@router.post("/{job_id}/complete")
def complete_job_endpoint(job_id: int, data: JobCompleteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to complete this job"
        )
    
    # If job is not already completed, mark it as completed
    was_completed = job.status == "completed"
    if not was_completed:
        if not data.final_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Final amount is required to complete a job"
            )
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        job.final_amount = data.final_amount
        job.payment_status = "pending"
    
    # Update notes if provided
    if data.completion_notes:
        job.completion_notes = data.completion_notes
    
    # Only allow rating if not already rated
    if data.talent_rating:
        if job.talent_rating is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already rated this talent for this job"
            )
        job.talent_rating = data.talent_rating
        
        # Create a proper review record in the reviews table
        try:
            from models import Application, Review
            
            # Find the accepted application to get the talent
            accepted_app = db.query(Application).filter(
                (Application.job_id == job_id) & (Application.status == "accepted")
            ).first()
            
            if accepted_app:
                # Check if review already exists
                existing_review = db.query(Review).filter(
                    (Review.job_id == job_id) & 
                    (Review.reviewer_id == current_user.id) &
                    (Review.reviewed_user_id == accepted_app.applicant_id)
                ).first()
                
                if not existing_review:
                    # Create the review
                    review = Review(
                        reviewer_id=current_user.id,  # Job owner rating the talent
                        reviewed_user_id=accepted_app.applicant_id,  # Talent being rated
                        job_id=job_id,
                        rating=data.talent_rating,
                        comment=data.completion_notes or f"Rated {data.talent_rating} stars for job completion"
                    )
                    db.add(review)
                    print(f"✅ Created review for job {job_id}: rating={data.talent_rating}, talent={accepted_app.applicant_id}")
                else:
                    print(f"⚠️ Review already exists for job {job_id}")
            else:
                print(f"⚠️ No accepted application found for job {job_id}, cannot create review")
                
        except Exception as e:
            print(f"❌ Error creating review: {e}")
            import traceback
            traceback.print_exc()
    
    db.commit()
    
    # Send notification to accepted talent when job is marked as complete
    if not was_completed:
        try:
            from models import Application
            from routes.notification_helpers import create_job_completion_notification
            
            # Find accepted application
            accepted_app = db.query(Application).filter(
                (Application.job_id == job_id) & (Application.status == "accepted")
            ).first()
            
            if accepted_app:
                notification = create_job_completion_notification(
                    db=db,
                    recipient_id=accepted_app.applicant_id,
                    recipient_type='worker',
                    other_user_name=current_user.full_name or current_user.username,
                    job_title=job.title,
                    job_id=job.id
                )
                print(f"📢 Job completion notification created: {notification.id}")
        
        except Exception as e:
            print(f"❌ Error creating job completion notification: {e}")
            import traceback
            traceback.print_exc()
    
    # Also store in completion store for backward compatibility
    completed_jobs_store[job_id] = {
        "job_id": job_id,
        "completed_date": datetime.utcnow(),
        "final_amount": data.final_amount or job.final_amount,
        "payment_currency": data.payment_currency,
        "completion_notes": data.completion_notes or job.completion_notes,
        "talent_rating": data.talent_rating or job.talent_rating
    }
    
    return {"message": "Job marked as completed successfully", "job_id": job_id}

@router.get("/{job_id}/completion")
def get_job_completion(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models import Application, Job, Review
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Return job with accepted application details and reviews
    accepted_app = db.query(Application).filter(
        (Application.job_id == job_id) & (Application.status == "accepted")
    ).first()
    
    # Get reviews for this job
    reviews = db.query(Review).filter(Review.job_id == job_id).all()
    
    job_data = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "status": job.status,
        "budget": job.budget,
        "category": job.category,
        "creator_id": job.creator_id,
        "employer_id": job.creator_id,
        "final_amount": job.final_amount or job.budget,
        "completion_notes": job.completion_notes,
        "payment_currency": job.budget_currency or "USD",
        "payment_status": job.payment_status or "pending",
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "talent_rating": job.talent_rating,
        "employer_rating": job.employer_rating,
        "accepted_application": None,
        "creator": {
            "id": job.creator.id,
            "full_name": job.creator.full_name,
            "username": job.creator.username
        },
        "reviews": [
            {
                "id": review.id,
                "reviewer_id": review.reviewer_id,
                "reviewer_name": review.reviewer.full_name,
                "reviewed_user_id": review.reviewed_user_id,
                "reviewed_user_name": review.reviewed_user.full_name,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at.isoformat()
            } for review in reviews
        ]
    }
    
    if accepted_app:
        job_data["accepted_application"] = {
            "id": accepted_app.id,
            "talent_id": accepted_app.applicant_id,
            "applicant": {
                "id": accepted_app.applicant.id,
                "full_name": accepted_app.applicant.full_name,
                "username": accepted_app.applicant.username
            }
        }
    
    return job_data

@router.post("/{job_id}/confirm-payment")
def confirm_payment(job_id: int, data: PaymentConfirmRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm payment for this job"
        )
    
    # Mark payment as paid
    job.payment_status = "paid"
    db.commit()
    
    return {"message": "Payment confirmed successfully", "job_id": job_id}

@router.post("/{job_id}/rate-employer")
def rate_employer(job_id: int, data: RateEmployerRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from models import Application
    
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Verify the current user is the accepted talent
    accepted_app = db.query(Application).filter(
        (Application.job_id == job_id) & (Application.status == "accepted")
    ).first()
    
    if not accepted_app or accepted_app.applicant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to rate for this job"
        )
    
    if data.employer_rating < 1 or data.employer_rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Update employer rating
    job.employer_rating = data.employer_rating
    db.commit()
    
    return {"message": "Employer rated successfully", "job_id": job_id}

@router.get("/me/completed")
def get_my_completed_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    completed = db.query(Job).filter(
        (Job.creator_id == current_user.id) & (Job.status == "completed")
    ).all()
    
    return {
        "completed_jobs": [
            {
                "id": job.id,
                "title": job.title,
                "status": job.status,
                "completion_data": completed_jobs_store.get(job.id)
            }
            for job in completed
        ]
    }

@router.put("/{job_id}/rate")
def rate_job_completion(job_id: int, rating: int, current_user: User = Depends(get_current_user)):
    if job_id not in completed_jobs_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found in completed jobs"
        )
    
    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    completed_jobs_store[job_id]["rating"] = rating
    
    return {"message": "Job rated successfully"}
