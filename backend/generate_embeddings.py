"""
Helper script to generate embeddings for users and jobs
Run this after adding users/jobs to populate their embeddings for matching
"""

import sys
from database import SessionLocal, get_db
from models import User, Job
from embedding_model import get_model, embedding_to_string
from datetime import datetime

def generate_user_embeddings(user_id=None):
    """
    Generate embeddings for users.
    
    Args:
        user_id: If provided, only generate for that user. Otherwise generate for all users.
    """
    db = SessionLocal()
    model = get_model()
    
    try:
        if user_id:
            users = [db.query(User).filter(User.id == user_id).first()]
            if not users[0]:
                print(f"❌ User {user_id} not found")
                return
        else:
            users = db.query(User).all()
        
        for user in users:
            if not user:
                continue
                
            # Prepare user data for embedding
            user_dict = {
                'bio': user.bio,
                'skills': user.skills,
                'location': user.location,
                'experience': None,
                'education': None,
                'professional_title': user.professional_title,
                'primary_role': user.primary_role,
                'company_name': user.company_name
            }
            
            try:
                # Generate embedding
                embedding = model.embed_user(user_dict)
                
                # Store in database
                user.profile_embedding = embedding_to_string(embedding)
                user.embedding_updated_at = datetime.utcnow()
                db.commit()
                
                print(f"✅ Generated embedding for User {user.id} ({user.username}) - Skills: {user.skills}")
            except Exception as e:
                print(f"❌ Error generating embedding for User {user.id}: {e}")
                db.rollback()
                
    finally:
        db.close()

def generate_job_embeddings(job_id=None):
    """
    Generate embeddings for jobs.
    
    Args:
        job_id: If provided, only generate for that job. Otherwise generate for all open jobs.
    """
    db = SessionLocal()
    model = get_model()
    
    try:
        if job_id:
            jobs = [db.query(Job).filter(Job.id == job_id).first()]
            if not jobs[0]:
                print(f"❌ Job {job_id} not found")
                return
        else:
            jobs = db.query(Job).filter(Job.status == "open").all()
        
        for job in jobs:
            if not job:
                continue
            
            # Prepare job data for embedding
            job_dict = {
                'title': job.title,
                'location': job.location,
                'job_type': job.job_type,
                'category': job.category,
                'description': job.description,
                'skills_required': job.skills_required,
                'experience_required': job.experience_required,
                'qualifications': job.qualifications,
                'responsibilities': job.responsibilities,
                'benefits': job.benefits,
                'budget': job.budget
            }
            
            try:
                # Generate embedding
                embedding = model.embed_job(job_dict)
                
                # Store in database
                job.job_embedding = embedding_to_string(embedding)
                job.embedding_updated_at = datetime.utcnow()
                db.commit()
                
                print(f"✅ Generated embedding for Job {job.id} - {job.title} (Skills: {job.skills_required})")
            except Exception as e:
                print(f"❌ Error generating embedding for Job {job.id}: {e}")
                db.rollback()
                
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Starting embedding generation...\n")
    
    print("📝 Generating job embeddings...")
    generate_job_embeddings()
    
    print("\n👤 Generating user embeddings...")
    generate_user_embeddings()
    
    print("\n✨ Done! Embeddings generated successfully.")
    print("Now try calling GET /api/skills-matching/matches-for-user/5?limit=5")