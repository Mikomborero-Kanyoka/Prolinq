from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import Job, User, Application
from schemas import JobCreate, JobResponse, JobUpdate, ApplicationCreate, ApplicationResponse
from auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
import uuid
import io
from PIL import Image

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

# Dashboard schemas
class ApplicationWithJob(BaseModel):
    id: int
    job_id: int
    applicant_id: int
    cover_letter: str
    proposed_price: float
    status: str
    created_at: str
    job: JobResponse
    
    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    pending: List[dict]
    completed: List[dict]

# ENHANCEMENT: Semantic Search Schema for Job Search
class SemanticSearchRequest(BaseModel):
    """Request body for semantic job search"""
    query: str
    limit: int = 10
    min_score: float = 0.1

class SemanticSearchResult(BaseModel):
    """Result of semantic search with match score"""
    job: JobResponse
    similarity_score: float
    
    class Config:
        from_attributes = True

# Picture Job Endpoint
def get_upload_dir():
    """Get or create upload directory"""
    upload_dir = "backend/uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir, exist_ok=True)
    return upload_dir

@router.post("/picture", response_model=JobResponse)
async def create_picture_job(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a picture-only job. 
    Requires:
    - title: Job title
    - category: Job category
    - file: Image file (jpg, png, gif, webp)
    """
    # Only employers/clients can post jobs
    if current_user.primary_role == "talent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers and clients can post jobs"
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, GIF, and WebP images are allowed"
        )
    
    try:
        # Read and validate image
        contents = await file.read()
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024
        if len(contents) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )
        
        # Validate it's actually an image
        img = Image.open(io.BytesIO(contents))
        img.verify()
        
        # Generate unique filename
        upload_dir = get_upload_dir()
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"job_picture_{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Create job record with picture-only flag
        db_job = Job(
            title=title,
            description="",  # Picture-only jobs have no description
            category=category,
            skills_required="",  # Picture-only jobs have no skills
            is_picture_only=True,
            picture_filename=unique_filename,
            creator_id=current_user.id
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        
        return db_job
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process image: {str(e)}"
        )

@router.get("/", response_model=list[JobResponse])
def list_jobs(
    skip: int = 0, 
    limit: int = 1000, 
    status_filter: str = None,
    search: str = None,
    category: str = None,
    job_type: str = None,
    location: str = None,
    min_budget: float = None,
    max_budget: float = None,
    is_picture_only: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    
    if status_filter:
        query = query.filter(Job.status == status_filter)
    else:
        query = query.filter(Job.status == "open")
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Job.title.ilike(search_term)) | 
            (Job.description.ilike(search_term)) |
            (Job.skills_required.ilike(search_term))
        )
    
    if category:
        query = query.filter(Job.category == category)
    
    if job_type:
        query = query.filter(Job.job_type == job_type)
    
    if location:
        query = query.filter(Job.location == location)
    
    if min_budget is not None:
        query = query.filter(Job.budget_min >= min_budget)
    
    if max_budget is not None:
        query = query.filter(Job.budget_max <= max_budget)
    
    if is_picture_only is not None:
        query = query.filter(Job.is_picture_only == is_picture_only)
    
    jobs = query.offset(skip).limit(limit).all()
    return jobs

# ENHANCEMENT: Semantic Search Endpoint using Embeddings
# This endpoint uses the existing embedding model to find semantically similar jobs
@router.post("/search/semantic", response_model=list[Dict[str, Any]])
def semantic_search_jobs(
    search_request: SemanticSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Perform semantic search on jobs using embeddings.
    
    The endpoint:
    - Takes a query string and converts it to embeddings
    - Compares against existing job embeddings
    - Returns jobs ranked by semantic similarity
    - Filters by minimum similarity score to avoid poor matches
    
    This EXTENDS the existing keyword search with semantic capabilities.
    All job filtering and pagination logic remains unchanged.
    
    Args:
        search_request: Contains query string and optional parameters
        
    Returns:
        List of jobs with similarity scores, sorted by relevance
    """
    try:
        from embedding_model import string_to_embedding, get_model, embedding_to_string
        import numpy as np
        
        query = search_request.query.strip()
        if not query:
            # If no query, return empty results
            return []
        
        # Get the embedding model
        model = get_model()
        
        # Convert query to embedding (directly encode, normalize for similarity)
        from sklearn.preprocessing import normalize
        query_vec = model.model.encode(query, convert_to_numpy=True, normalize_embeddings=True)
        query_embedding = query_vec
        
        if query_embedding.size == 0:
            return []
        
        # Get all open jobs with embeddings
        jobs = db.query(Job).filter(
            (Job.job_embedding.isnot(None)) &
            (Job.status == "open")
        ).all()
        
        results = []
        
        for job in jobs:
            try:
                # Handle both string and numpy array embeddings
                if isinstance(job.job_embedding, str):
                    # If it's a string, convert it back to numpy array
                    job_embedding = string_to_embedding(job.job_embedding)
                else:
                    # If it's already a numpy array, use it directly
                    job_embedding = job.job_embedding
                
                if job_embedding.size == 0:
                    continue
                
                # Calculate cosine similarity
                similarity = model.calculate_similarity(job_embedding, query_embedding)
                
                # Only include if similarity is above threshold
                if similarity >= search_request.min_score:
                    # Serialize job to dictionary
                    job_dict = {
                        "id": job.id,
                        "title": job.title,
                        "description": job.description,
                        "budget": job.budget,
                        "budget_min": job.budget_min,
                        "budget_max": job.budget_max,
                        "budget_currency": job.budget_currency,
                        "category": job.category,
                        "skills_required": job.skills_required,
                        "experience_required": job.experience_required,
                        "qualifications": job.qualifications,
                        "responsibilities": job.responsibilities,
                        "benefits": job.benefits,
                        "job_type": job.job_type,
                        "location": job.location,
                        "is_remote": job.is_remote,
                        "deadline": job.deadline.isoformat() if job.deadline else None,
                        "status": job.status,
                        "creator_id": job.creator_id,
                        "created_at": job.created_at.isoformat(),
                        "updated_at": job.updated_at.isoformat(),
                    }
                    
                    results.append({
                        "job": job_dict,
                        "similarity_score": float(similarity)
                    })
            except Exception as e:
                print(f"Error processing job {job.id}: {e}")
                continue
        
        # Sort by similarity score (descending)
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        # Limit results
        results = results[:search_request.limit]
        
        print(f"🔍 Semantic search for '{query}' found {len(results)} matching jobs")
        
        return results
        
    except Exception as e:
        print(f"❌ Semantic search error: {e}")
        import traceback
        traceback.print_exc()
        # Return empty results on error instead of failing
        return []

@router.post("/", response_model=JobResponse)
def create_job(job_data: JobCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Only employers/clients can post jobs
    if current_user.primary_role == "talent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers and clients can post jobs"
        )
    
    db_job = Job(
        title=job_data.title,
        description=job_data.description,
        budget=job_data.budget,
        budget_min=job_data.budget_min,
        budget_max=job_data.budget_max,
        budget_currency=job_data.budget_currency,
        category=job_data.category,
        skills_required=job_data.skills_required,
        experience_required=job_data.experience_required,
        qualifications=job_data.qualifications,
        responsibilities=job_data.responsibilities,
        benefits=job_data.benefits,
        job_type=job_data.job_type,
        location=job_data.location,
        is_remote=job_data.is_remote,
        deadline=job_data.deadline,
        creator_id=current_user.id
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/me/jobs", response_model=list[JobResponse])
def get_my_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.creator_id == current_user.id).all()
    return jobs

@router.get("/me/completed-jobs", response_model=list[dict])
def get_my_completed_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all completed jobs for the current user (as employer or talent)"""
    from models import Application
    
    # Get jobs where user is the employer and job is completed
    employer_jobs = db.query(Job).filter(
        (Job.creator_id == current_user.id) & (Job.status == "completed")
    ).all()
    
    # Get jobs where user is the accepted talent and job is completed
    talent_jobs = db.query(Job).join(Application).filter(
        (Application.applicant_id == current_user.id) & 
        (Application.status == "accepted") &
        (Job.status == "completed")
    ).all()
    
    # Combine and deduplicate
    all_completed_jobs = []
    seen_job_ids = set()
    
    for job in employer_jobs + talent_jobs:
        if job.id not in seen_job_ids:
            seen_job_ids.add(job.id)
            
            # Get accepted application for this job
            accepted_app = db.query(Application).filter(
                (Application.job_id == job.id) & (Application.status == "accepted")
            ).first()
            
            job_data = {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "budget": job.budget,
                "budget_min": job.budget_min,
                "budget_max": job.budget_max,
                "budget_currency": job.budget_currency or "USD",
                "category": job.category,
                "skills_required": job.skills_required,
                "experience_required": job.experience_required,
                "qualifications": job.qualifications,
                "responsibilities": job.responsibilities,
                "benefits": job.benefits,
                "job_type": job.job_type,
                "location": job.location,
                "is_remote": job.is_remote,
                "deadline": job.deadline.isoformat() if job.deadline else None,
                "status": job.status,
                "payment_status": job.payment_status or "pending",
                "final_amount": job.final_amount,
                "completion_notes": job.completion_notes,
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "talent_rating": job.talent_rating,
                "employer_rating": job.employer_rating,
                "employer_id": job.creator_id,
                "creator_id": job.creator_id,
                "payment_currency": job.budget_currency or "USD",
                "created_at": job.created_at.isoformat(),
                "updated_at": job.updated_at.isoformat(),
                "accepted_application": None,
                "creator": {
                    "id": job.creator.id,
                    "full_name": job.creator.full_name,
                    "username": job.creator.username
                }
            }
            
            if accepted_app:
                job_data["accepted_application"] = {
                    "id": accepted_app.id,
                    "talent_id": accepted_app.applicant_id,
                    "applicant": {
                        "id": accepted_app.applicant.id,
                        "full_name": accepted_app.applicant.full_name,
                        "username": accepted_app.applicant.username
                    },
                    "talent": {
                        "id": accepted_app.applicant.id,
                        "full_name": accepted_app.applicant.full_name,
                        "username": accepted_app.applicant.username,
                        "profile_image": accepted_app.applicant.profile_photo
                    }
                }
            
            all_completed_jobs.append(job_data)
    
    return all_completed_jobs

@router.get("/dashboard/applicant", response_model=DashboardData)
def get_applicant_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get dashboard for job seekers/freelancers - shows their applications grouped by status"""
    applications = db.query(Application).filter(
        Application.applicant_id == current_user.id
    ).order_by(Application.created_at.desc()).all()
    
    pending = []
    completed = []
    
    for app in applications:
        # Get complete job data for completed jobs
        job_data = {
            "id": app.job.id,
            "title": app.job.title,
            "description": app.job.description,
            "budget": app.job.budget,
            "budget_min": app.job.budget_min,
            "budget_max": app.job.budget_max,
            "budget_currency": app.job.budget_currency,
            "category": app.job.category,
            "skills_required": app.job.skills_required,
            "experience_required": app.job.experience_required,
            "qualifications": app.job.qualifications,
            "responsibilities": app.job.responsibilities,
            "benefits": app.job.benefits,
            "job_type": app.job.job_type,
            "location": app.job.location,
            "is_remote": app.job.is_remote,
            "deadline": app.job.deadline.isoformat() if app.job.deadline else None,
            "creator_id": app.job.creator_id,
            "employer_id": app.job.creator_id,
            "status": app.job.status,
            "payment_status": app.job.payment_status or "pending",
            "final_amount": app.job.final_amount,
            "completion_notes": app.job.completion_notes,
            "completed_at": app.job.completed_at.isoformat() if app.job.completed_at else None,
            "talent_rating": app.job.talent_rating,
            "employer_rating": app.job.employer_rating,
            "payment_currency": app.job.budget_currency or "USD",
            "created_at": app.job.created_at.isoformat(),
            "updated_at": app.job.updated_at.isoformat(),
            "creator": {
                "id": app.job.creator.id,
                "username": app.job.creator.username,
                "full_name": app.job.creator.full_name,
                "email": app.job.creator.email
            },
            "accepted_application": {
                "id": app.id,
                "applicant_id": app.applicant_id,
                "cover_letter": app.cover_letter,
                "proposed_price": app.proposed_price,
                "status": app.status,
                "created_at": app.created_at.isoformat()
            }
        }
        
        if app.job.status == "completed":
            # For completed jobs, maintain the same structure as pending jobs
            completed.append({
                "id": app.id,
                "job_id": app.job_id,
                "applicant_id": app.applicant_id,
                "cover_letter": app.cover_letter,
                "proposed_price": app.proposed_price,
                "status": app.status,
                "created_at": app.created_at.isoformat(),
                "job": job_data
            })
        else:
            pending.append({
                "id": app.id,
                "job_id": app.job_id,
                "applicant_id": app.applicant_id,
                "cover_letter": app.cover_letter,
                "proposed_price": app.proposed_price,
                "status": app.status,
                "created_at": app.created_at.isoformat(),
                "job": {
                    "id": app.job.id,
                    "title": app.job.title,
                    "description": app.job.description,
                    "budget": app.job.budget,
                    "budget_min": app.job.budget_min,
                    "budget_max": app.job.budget_max,
                    "budget_currency": app.job.budget_currency,
                    "category": app.job.category,
                    "skills_required": app.job.skills_required,
                    "job_type": app.job.job_type,
                    "location": app.job.location,
                    "is_remote": app.job.is_remote,
                    "deadline": app.job.deadline.isoformat() if app.job.deadline else None,
                    "creator_id": app.job.creator_id,
                    "status": app.job.status,
                    "created_at": app.job.created_at.isoformat(),
                    "updated_at": app.job.updated_at.isoformat(),
                    "creator": {
                        "id": app.job.creator.id,
                        "username": app.job.creator.username,
                        "full_name": app.job.creator.full_name,
                        "email": app.job.creator.email
                    }
                }
            })
    
    return DashboardData(pending=pending, completed=completed)

@router.get("/dashboard/owner", response_model=DashboardData)
def get_owner_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get dashboard for job owners/clients - shows their posted jobs grouped by status"""
    jobs = db.query(Job).filter(
        Job.creator_id == current_user.id
    ).order_by(Job.created_at.desc()).all()
    
    pending = []
    completed = []
    
    for job in jobs:
        # Count applications for this job
        app_count = db.query(Application).filter(Application.job_id == job.id).count()
        accepted_count = db.query(Application).filter(
            (Application.job_id == job.id) & (Application.status == "accepted")
        ).count()
        
        job_data = {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "budget": job.budget,
            "budget_min": job.budget_min,
            "budget_max": job.budget_max,
            "budget_currency": job.budget_currency,
            "category": job.category,
            "skills_required": job.skills_required,
            "experience_required": job.experience_required,
            "qualifications": job.qualifications,
            "responsibilities": job.responsibilities,
            "benefits": job.benefits,
            "job_type": job.job_type,
            "location": job.location,
            "is_remote": job.is_remote,
            "deadline": job.deadline.isoformat() if job.deadline else None,
            "status": job.status,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
            "applications_count": app_count,
            "accepted_count": accepted_count
        }
        
        if job.status == "completed":
            completed.append(job_data)
        else:
            pending.append(job_data)
    
    return DashboardData(pending=pending, completed=completed)

@router.post("/applications/{application_id}/accept", response_model=ApplicationResponse)
def accept_application(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Accept an application"""
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    application.status = "accepted"
    db.commit()
    db.refresh(application)
    
    # Create notification for the applicant
    try:
        from routes.notifications import create_user_notification
        
        notification = create_user_notification(
            db=db,
            user_id=application.applicant_id,
            title='Application Accepted! 🎉',
            message=f'Congratulations! Your application for "{job.title}" has been accepted. You can now start working on this project.',
            notification_type='application_accepted',
            data={
                'application_id': application.id,
                'job_id': job.id,
                'job_title': job.title,
                'employer_id': current_user.id,
                'employer_name': current_user.full_name or current_user.username
            }
        )
        print(f"📢 Application acceptance notification created: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating application acceptance notification: {e}")
    
    return application

@router.post("/applications/{application_id}/decline", response_model=ApplicationResponse)
def decline_application(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Decline an application"""
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    application.status = "declined"
    db.commit()
    db.refresh(application)
    
    # Create notification for the applicant
    try:
        from routes.notifications import create_user_notification
        
        notification = create_user_notification(
            db=db,
            user_id=application.applicant_id,
            title='Application Update',
            message=f'Your application for "{job.title}" has been reviewed. Keep applying for other opportunities!',
            notification_type='application_declined',
            data={
                'application_id': application.id,
                'job_id': job.id,
                'job_title': job.title,
                'employer_id': current_user.id,
                'employer_name': current_user.full_name or current_user.username
            }
        )
        print(f"📢 Application decline notification created: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating application decline notification: {e}")
    
    return application

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_data: JobUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job"
        )
    
    # Track if status is changing
    old_status = job.status
    new_status = job_data.dict(exclude_unset=True).get('status', old_status)
    
    for field, value in job_data.dict(exclude_unset=True).items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
    # If status changed from 'open' to something else, remove job recommendations
    if old_status == 'open' and new_status != 'open':
        try:
            from models import Notification
            from sqlalchemy import and_
            import json
            
            print(f"🔄 Job {job_id} status changed from '{old_status}' to '{new_status}', removing recommendations")
            
            # Find and delete all job_recommendation notifications for this job
            recommendations = db.query(Notification).filter(
                Notification.type == 'job_recommendation'
            ).all()
            
            deleted_count = 0
            for notif in recommendations:
                try:
                    data = json.loads(notif.data) if notif.data else {}
                    if data.get('job_id') == job_id:
                        db.delete(notif)
                        deleted_count += 1
                except:
                    pass
            
            if deleted_count > 0:
                db.commit()
                print(f"🗑️  Removed {deleted_count} recommendations for job {job_id}")
        except Exception as e:
            print(f"❌ Error removing recommendations: {e}")
    
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job"
        )
    
    # Remove job recommendations before deleting job
    try:
        from models import Notification
        from sqlalchemy import and_
        import json
        
        print(f"🗑️  Deleting job {job_id}, removing all recommendations")
        
        # Find and delete all job_recommendation notifications for this job
        recommendations = db.query(Notification).filter(
            Notification.type == 'job_recommendation'
        ).all()
        
        deleted_count = 0
        for notif in recommendations:
            try:
                data = json.loads(notif.data) if notif.data else {}
                if data.get('job_id') == job_id:
                    db.delete(notif)
                    deleted_count += 1
            except:
                pass
        
        if deleted_count > 0:
            print(f"✅ Removed {deleted_count} recommendations for job {job_id}")
    except Exception as e:
        print(f"❌ Error removing recommendations: {e}")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
