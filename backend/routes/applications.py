from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Application, Job, User
from schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate, ApplicationBase
from auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["applications"])

@router.post("/", response_model=ApplicationResponse)
def create_application(app_data: ApplicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == app_data.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if already applied
    existing = db.query(Application).filter(
        (Application.job_id == app_data.job_id) & (Application.applicant_id == current_user.id)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already applied to this job"
        )
    
    db_application = Application(
        job_id=app_data.job_id,
        applicant_id=current_user.id,
        cover_letter=app_data.cover_letter,
        proposed_price=app_data.proposed_price
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    # Create notification for the job creator
    try:
        from routes.notification_helpers import create_job_application_notification
        
        notification = create_job_application_notification(
            db=db,
            job_creator_id=job.creator_id,
            applicant_name=current_user.full_name or current_user.username,
            applicant_id=current_user.id,
            job_title=job.title,
            job_id=job.id,
            application_id=db_application.id
        )
        print(f"📢 Job application notification created: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating job application notification: {e}")
        import traceback
        traceback.print_exc()
    
    return db_application

@router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse)
def apply_to_job(job_id: int, app_data: ApplicationBase, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if already applied
    existing = db.query(Application).filter(
        (Application.job_id == job_id) & (Application.applicant_id == current_user.id)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already applied to this job"
        )
    
    db_application = Application(
        job_id=job_id,
        applicant_id=current_user.id,
        cover_letter=app_data.cover_letter,
        proposed_price=app_data.proposed_price
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    # Create notification for the job creator
    try:
        from routes.notification_helpers import create_job_application_notification
        
        notification = create_job_application_notification(
            db=db,
            job_creator_id=job.creator_id,
            applicant_name=current_user.full_name or current_user.username,
            applicant_id=current_user.id,
            job_title=job.title,
            job_id=job.id,
            application_id=db_application.id
        )
        print(f"📢 Job application notification created: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating job application notification: {e}")
        import traceback
        traceback.print_exc()
    
    return db_application

@router.get("/job/{job_id}", response_model=list[ApplicationResponse])
def get_job_applications(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    applications = db.query(Application).filter(Application.job_id == job_id).all()
    return applications

@router.get("/me/applications", response_model=list[ApplicationResponse])
def get_my_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    applications = db.query(Application).filter(Application.applicant_id == current_user.id).all()
    return applications

@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(application_id: int, app_data: ApplicationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
    
    old_status = application.status
    application.status = app_data.status
    
    # When an application is accepted, update job status to in_progress
    if app_data.status == "accepted":
        job.status = "in_progress"
    
    db.commit()
    db.refresh(application)
    
    # Create notification for applicant when status changes
    try:
        from routes.notification_helpers import create_application_status_notification
        
        if old_status != app_data.status:
            notification = create_application_status_notification(
                db=db,
                applicant_id=application.applicant_id,
                job_title=job.title,
                job_id=job.id,
                application_id=application.id,
                new_status=app_data.status,
                old_status=old_status
            )
            print(f"📢 Application status notification created: {notification.id}")
        
    except Exception as e:
        print(f"❌ Error creating application update notification: {e}")
        import traceback
        traceback.print_exc()
    
    return application

@router.get("/dashboard/applicant")
def get_applicant_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get dashboard data for job applicants including pending and completed applications"""
    
    # Get all applications for the current user
    applications = db.query(Application).filter(Application.applicant_id == current_user.id).all()
    
    # Separate pending and completed applications
    pending_applications = []
    completed_applications = []
    
    for app in applications:
        # Load the job relationship
        job = db.query(Job).filter(Job.id == app.job_id).first()
        if job:
            app.job = job
            
            # Load the creator relationship
            creator = db.query(User).filter(User.id == job.creator_id).first()
            if creator:
                job.creator = creator
            
            # Categorize based on application status and job status
            if job.status == 'completed':
                completed_applications.append(app)
            elif app.status in ['pending', 'accepted']:
                pending_applications.append(app)
            else:
                # Rejected applications go to completed
                completed_applications.append(app)
    
    return {
        "pending": pending_applications,
        "completed": completed_applications
    }

@router.delete("/{application_id}")
def delete_application(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.applicant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    db.delete(application)
    db.commit()
    return {"message": "Application deleted"}
