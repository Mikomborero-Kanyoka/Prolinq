from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from database import get_db
from models import User, Job, Application, Review
from schemas import UserResponse, UserUpdate
from auth import get_current_user
import os
import json
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/users", tags=["users"])

# Create uploads directory if it doesn't exist
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile"""
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/", response_model=list[UserResponse])
def list_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/browse/freelancers", response_model=list[UserResponse])
def browse_freelancers(
    skip: int = 0, 
    limit: int = 10, 
    role: str = None,
    db: Session = Depends(get_db)
):
    """Browse freelancers and job seekers with optional role filtering"""
    query = db.query(User).filter(
        User.is_active == True,
        User.primary_role.in_(['freelancer', 'job_seeker'])
    )
    
    # Filter by specific role if provided
    if role and role in ['freelancer', 'job_seeker']:
        query = query.filter(User.primary_role == role)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/me/profile", response_model=UserResponse)
def get_current_user_profile_old(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(updates: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update current user profile"""
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(current_user, key) and key not in ['id', 'created_at']:
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/upload-photo")
def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile photo"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"profile_{current_user.id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Update user
        current_user.profile_photo = unique_filename
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Photo uploaded successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/me/upload-portfolio-image")
def upload_portfolio_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload portfolio image"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"portfolio_{current_user.id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Update portfolio_images array
        portfolio_images = []
        if current_user.portfolio_images:
            try:
                portfolio_images = json.loads(current_user.portfolio_images)
            except:
                portfolio_images = []
        
        portfolio_images.append(unique_filename)
        current_user.portfolio_images = json.dumps(portfolio_images)
        
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Portfolio image uploaded successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/me/portfolio-image/{index}")
def delete_portfolio_image(
    index: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete portfolio image"""
    try:
        if not current_user.portfolio_images:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No portfolio images found"
            )
        
        portfolio_images = json.loads(current_user.portfolio_images)
        
        if index < 0 or index >= len(portfolio_images):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid index"
            )
        
        # Delete file
        filename = portfolio_images[index]
        file_path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Update array
        portfolio_images.pop(index)
        current_user.portfolio_images = json.dumps(portfolio_images) if portfolio_images else None
        
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Portfolio image deleted successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/me/upload-resume-image")
def upload_resume_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload resume image (for job seekers)"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"resume_{current_user.id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Update resume_images array
        resume_images = []
        if current_user.resume_images:
            try:
                resume_images = json.loads(current_user.resume_images)
            except:
                resume_images = []
        
        resume_images.append(unique_filename)
        current_user.resume_images = json.dumps(resume_images)
        
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Resume image uploaded successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/me/resume-image/{index}")
def delete_resume_image(
    index: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete resume image (for job seekers)"""
    try:
        if not current_user.resume_images:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No resume images found"
            )
        
        resume_images = json.loads(current_user.resume_images)
        
        if index < 0 or index >= len(resume_images):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid index"
            )
        
        # Delete file
        filename = resume_images[index]
        file_path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Update array
        resume_images.pop(index)
        current_user.resume_images = json.dumps(resume_images) if resume_images else None
        
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Resume image deleted successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/me/upload-cover-image")
def upload_cover_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload cover image"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"cover_{current_user.id}_{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Update user
        current_user.cover_image = unique_filename
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Cover image uploaded successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/me/cover-image")
def delete_cover_image(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete cover image"""
    try:
        if not current_user.cover_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No cover image found"
            )
        
        # Delete file
        filename = current_user.cover_image
        file_path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Update user
        current_user.cover_image = None
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Cover image deleted successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/me/skills")
def add_skill(
    skill: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a skill to user profile"""
    try:
        # Parse existing skills
        skills = []
        if current_user.skills:
            try:
                skills = json.loads(current_user.skills)
            except:
                skills = []
        
        # Generate skill ID
        skill_id = max([s.get('id', 0) for s in skills], default=0) + 1 if skills else 1
        
        # Add new skill with ID
        new_skill = {
            'id': skill_id,
            'skill_name': skill.get('skill_name', ''),
            'proficiency_level': skill.get('proficiency_level', 'intermediate')
        }
        skills.append(new_skill)
        
        # Update user
        current_user.skills = json.dumps(skills)
        db.commit()
        db.refresh(current_user)
        
        return new_skill
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/me/skills/{skill_id}")
def remove_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a skill from user profile"""
    try:
        # Parse existing skills
        skills = []
        if current_user.skills:
            try:
                skills = json.loads(current_user.skills)
            except:
                skills = []
        
        # Remove skill
        skills = [s for s in skills if s.get('id') != skill_id]
        
        # Update user
        current_user.skills = json.dumps(skills) if skills else None
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Skill removed successfully", "user": current_user}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{user_id}/performance-metrics")
def get_user_performance_metrics(user_id: int, db: Session = Depends(get_db)):
    """Get performance metrics for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        # Calculate metrics based on user's role
        if user.primary_role in ['freelancer', 'job_seeker']:
            return calculate_talent_metrics(user_id, db)
        elif user.primary_role in ['employer', 'client']:
            return calculate_client_metrics(user_id, db)
        else:
            # Default metrics for general users
            return calculate_general_metrics(user_id, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating metrics: {str(e)}"
        )

def calculate_talent_metrics(user_id: int, db: Session):
    """Calculate performance metrics for talent (freelancers/job seekers)"""
    
    # Job applications statistics
    total_applications = db.query(Application).filter(Application.applicant_id == user_id).count()
    
    # Accepted applications (jobs they got)
    accepted_applications = db.query(Application).filter(
        and_(Application.applicant_id == user_id, Application.status == 'accepted')
    ).count()
    
    # Completion rate
    completion_rate = (accepted_applications / total_applications * 100) if total_applications > 0 else 0
    
    # Reviews and ratings
    reviews_received = db.query(Review).filter(Review.reviewed_user_id == user_id).all()
    total_reviews = len(reviews_received)
    
    if total_reviews > 0:
        avg_rating = sum(review.rating for review in reviews_received) / total_reviews
        satisfaction_rate = sum(1 for review in reviews_received if review.rating >= 4) / total_reviews * 100
    else:
        avg_rating = 0
        satisfaction_rate = 0
    
    # Response time (mock data - would need message timestamps)
    avg_response_time = 2  # hours
    
    # Success rate (based on completed jobs with good ratings)
    successful_jobs = db.query(Job).filter(
        and_(
            Job.talent_rating >= 4,
            Job.completion_notes.isnot(None)
        )
    ).count()
    
    success_rate = (successful_jobs / accepted_applications * 100) if accepted_applications > 0 else 92
    
    # Member since
    user = db.query(User).filter(User.id == user_id).first()
    member_since = user.created_at.year if user else 2025
    
    # Availability (mock - would need actual availability tracking)
    availability = "Available Now"
    
    # Jobs completed
    jobs_completed = db.query(Job).filter(
        and_(
            Job.completion_notes.isnot(None),
            Job.completed_at.isnot(None)
        )
    ).count()
    
    # Clients (unique employers they've worked with)
    clients_count = db.query(Job.creator_id).filter(
        and_(
            Job.completion_notes.isnot(None),
            Job.completed_at.isnot(None)
        )
    ).distinct().count()
    
    return {
        "rating": round(avg_rating, 1),
        "completed_jobs": jobs_completed,
        "completion_rate": round(completion_rate, 1),
        "response_time_hours": avg_response_time,
        "clients_count": clients_count,
        "satisfaction_rate": round(satisfaction_rate, 1),
        "member_since": member_since,
        "availability": availability,
        "success_rate": round(success_rate, 1),
        "total_applications": total_applications,
        "accepted_applications": accepted_applications,
        "total_reviews": total_reviews
    }

def calculate_client_metrics(user_id: int, db: Session):
    """Calculate performance metrics for clients/employers"""
    
    # Jobs posted
    total_jobs_posted = db.query(Job).filter(Job.creator_id == user_id).count()
    
    # Jobs completed
    jobs_completed = db.query(Job).filter(
        and_(
            Job.creator_id == user_id,
            Job.completion_notes.isnot(None),
            Job.completed_at.isnot(None)
        )
    ).count()
    
    # Completion rate
    completion_rate = (jobs_completed / total_jobs_posted * 100) if total_jobs_posted > 0 else 0
    
    # Reviews given to talent
    reviews_given = db.query(Review).filter(Review.reviewer_id == user_id).all()
    total_reviews = len(reviews_given)
    
    # Average rating given to talent
    if total_reviews > 0:
        avg_rating = sum(review.rating for review in reviews_given) / total_reviews
    else:
        avg_rating = 0
    
    # Response time to applications
    avg_response_time = 2  # hours (mock data)
    
    # Member since
    user = db.query(User).filter(User.id == user_id).first()
    member_since = user.created_at.year if user else 2025
    
    # Total applications received
    total_applications_received = db.query(Application).join(Job).filter(
        Job.creator_id == user_id
    ).count()
    
    return {
        "rating": round(avg_rating, 1),
        "jobs_posted": total_jobs_posted,
        "jobs_completed": jobs_completed,
        "completion_rate": round(completion_rate, 1),
        "response_time_hours": avg_response_time,
        "member_since": member_since,
        "total_applications_received": total_applications_received,
        "total_reviews_given": total_reviews
    }

def calculate_general_metrics(user_id: int, db: Session):
    """Calculate general metrics for users without specific roles"""
    
    user = db.query(User).filter(User.id == user_id).first()
    
    # Basic activity metrics
    applications_made = db.query(Application).filter(Application.applicant_id == user_id).count()
    reviews_received = db.query(Review).filter(Review.reviewed_user_id == user_id).count()
    reviews_given = db.query(Review).filter(Review.reviewer_id == user_id).count()
    
    # Average rating if any reviews received
    if reviews_received > 0:
        reviews = db.query(Review).filter(Review.reviewed_user_id == user_id).all()
        avg_rating = sum(review.rating for review in reviews) / len(reviews)
    else:
        avg_rating = 0
    
    return {
        "rating": round(avg_rating, 1),
        "applications_made": applications_made,
        "reviews_received": reviews_received,
        "reviews_given": reviews_given,
        "member_since": user.created_at.year if user else 2025,
        "profile_completion": calculate_profile_completion(user)
    }

def calculate_profile_completion(user: User) -> int:
    """Calculate profile completion percentage"""
    fields_to_check = [
        user.full_name,
        user.professional_title,
        user.bio,
        user.skills,
        user.location,
        user.profile_photo
    ]
    
    filled_fields = sum(1 for field in fields_to_check if field)
    completion_percentage = (filled_fields / len(fields_to_check)) * 100
    
    return round(completion_percentage)
