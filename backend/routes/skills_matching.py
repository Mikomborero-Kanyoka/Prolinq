"""
Skills Matching API Routes
Provides endpoints for job/user embedding generation and similarity matching
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import numpy as np
from datetime import datetime

from database import get_db
from models import User, Job
from embedding_model import get_model, embedding_to_string, string_to_embedding
from auth import get_current_user

router = APIRouter(prefix="/api/skills-matching", tags=["skills-matching"])

# Pydantic models for request/response
class JobEmbeddingRequest(BaseModel):
    """Request model for job embedding generation"""
    title: str = Field(..., description="Job title")
    location: Optional[str] = Field(None, description="Job location")
    job_type: Optional[str] = Field(None, description="Job type (full_time, part_time, contract, etc.)")
    salary_range: Optional[str] = Field(None, description="Salary range")
    category: Optional[str] = Field(None, description="Job category")
    job_description: Optional[str] = Field(None, description="Job description")
    required_skills: Optional[str] = Field(None, description="Required skills")
    experience_required: Optional[str] = Field(None, description="Experience requirements")
    qualifications: Optional[str] = Field(None, description="Required qualifications")
    responsibilities: Optional[str] = Field(None, description="Job responsibilities")
    benefits: Optional[str] = Field(None, description="Job benefits")

class UserEmbeddingRequest(BaseModel):
    """Request model for user embedding generation"""
    bio: Optional[str] = Field(None, description="User bio/about section")
    skills: Optional[str] = Field(None, description="User skills")
    location: Optional[str] = Field(None, description="User location")
    experience: Optional[str] = Field(None, description="User experience")
    education: Optional[str] = Field(None, description="User education")
    professional_title: Optional[str] = Field(None, description="Professional title")
    primary_role: Optional[str] = Field(None, description="Primary role (talent, employer, client)")
    company_name: Optional[str] = Field(None, description="Company name (for employers)")

class EmbeddingResponse(BaseModel):
    """Response model for embedding generation"""
    embedding: List[float] = Field(..., description="Generated embedding vector")
    embedding_dimension: int = Field(..., description="Dimension of the embedding")
    success: bool = Field(True, description="Whether embedding generation was successful")

class SimilarityRequest(BaseModel):
    """Request model for similarity calculation"""
    job_embedding: List[float] = Field(..., description="Job embedding vector")
    user_embedding: List[float] = Field(..., description="User embedding vector")

class SimilarityResponse(BaseModel):
    """Response model for similarity calculation"""
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Cosine similarity score (0-1)")
    success: bool = Field(True, description="Whether similarity calculation was successful")

class BestMatchesRequest(BaseModel):
    """Request model for finding best matches"""
    user_profile: UserEmbeddingRequest = Field(..., description="User profile data")
    jobs: List[JobEmbeddingRequest] = Field(..., description="List of jobs to match against")
    top_k: Optional[int] = Field(10, ge=1, le=50, description="Number of top matches to return")

class JobMatchResult(BaseModel):
    """Model for individual job match result"""
    job: JobEmbeddingRequest = Field(..., description="Job data")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score")

class BestMatchesResponse(BaseModel):
    """Response model for best matches"""
    matches: List[JobMatchResult] = Field(..., description="List of job matches sorted by similarity")
    total_jobs: int = Field(..., description="Total number of jobs processed")
    success: bool = Field(True, description="Whether matching was successful")

@router.post("/embed-job", response_model=EmbeddingResponse)
async def embed_job(job_data: JobEmbeddingRequest):
    """
    Generate embedding for job data.
    
    Args:
        job_data: Job information to embed
        
    Returns:
        Embedding vector and metadata
    """
    try:
        model = get_model()
        
        # Convert to dictionary format expected by the model
        job_dict = {
            'title': job_data.title,
            'location': job_data.location,
            'job_type': job_data.job_type,
            'category': job_data.category,
            'description': job_data.job_description,
            'skills_required': job_data.required_skills,
            'experience_required': job_data.experience_required,
            'qualifications': job_data.qualifications,
            'responsibilities': job_data.responsibilities,
            'benefits': job_data.benefits,
            'budget': job_data.salary_range  # Map salary_range to budget for model
        }
        
        # Generate embedding
        embedding = model.embed_job(job_dict)
        
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            embedding_dimension=model.get_embedding_dimension(),
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating job embedding: {str(e)}")

@router.post("/embed-user", response_model=EmbeddingResponse)
async def embed_user(user_data: UserEmbeddingRequest):
    """
    Generate embedding for user profile data.
    
    Args:
        user_data: User profile information to embed
        
    Returns:
        Embedding vector and metadata
    """
    try:
        model = get_model()
        
        # Convert to dictionary format expected by the model
        user_dict = {
            'bio': user_data.bio,
            'skills': user_data.skills,
            'location': user_data.location,
            'experience': user_data.experience,
            'education': user_data.education,
            'professional_title': user_data.professional_title,
            'primary_role': user_data.primary_role,
            'company_name': user_data.company_name
        }
        
        # Generate embedding
        embedding = model.embed_user(user_dict)
        
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            embedding_dimension=model.get_embedding_dimension(),
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating user embedding: {str(e)}")

@router.post("/match", response_model=SimilarityResponse)
async def calculate_similarity(request: SimilarityRequest):
    """
    Calculate cosine similarity between job and user embeddings.
    
    Args:
        request: Contains job and user embeddings
        
    Returns:
        Similarity score between 0 and 1
    """
    try:
        model = get_model()
        
        # Convert lists to numpy arrays
        job_embedding = np.array(request.job_embedding)
        user_embedding = np.array(request.user_embedding)
        
        # Calculate similarity
        similarity = model.calculate_similarity(job_embedding, user_embedding)
        
        return SimilarityResponse(
            similarity_score=similarity,
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating similarity: {str(e)}")

@router.post("/best-matches", response_model=BestMatchesResponse)
async def find_best_matches(request: BestMatchesRequest):
    """
    Find best matching jobs for a user profile.
    
    Args:
        request: Contains user profile and list of jobs to match
        
    Returns:
        List of jobs sorted by similarity score
    """
    try:
        model = get_model()
        
        # Convert user profile to dictionary
        user_dict = {
            'bio': request.user_profile.bio,
            'skills': request.user_profile.skills,
            'location': request.user_profile.location,
            'experience': request.user_profile.experience,
            'education': request.user_profile.education,
            'professional_title': request.user_profile.professional_title,
            'primary_role': request.user_profile.primary_role,
            'company_name': request.user_profile.company_name
        }
        
        # Convert jobs to dictionary format
        jobs_list = []
        for job in request.jobs:
            job_dict = {
                'title': job.title,
                'location': job.location,
                'job_type': job.job_type,
                'category': job.category,
                'description': job.job_description,
                'skills_required': job.required_skills,
                'experience_required': job.experience_required,
                'qualifications': job.qualifications,
                'responsibilities': job.responsibilities,
                'benefits': job.benefits,
                'budget': job.salary_range
            }
            jobs_list.append(job_dict)
        
        # Find best matches
        top_k = request.top_k if request.top_k is not None else 10
        matches = model.find_best_matches(user_dict, jobs_list, top_k)
        
        # Convert to response format
        match_results = []
        for match in matches:
            job_data = match['job']
            job_request = JobEmbeddingRequest(
                title=job_data.get('title', ''),
                location=job_data.get('location'),
                job_type=job_data.get('job_type'),
                salary_range=job_data.get('budget'),
                category=job_data.get('category'),
                job_description=job_data.get('description'),
                required_skills=job_data.get('skills_required'),
                experience_required=job_data.get('experience_required'),
                qualifications=job_data.get('qualifications'),
                responsibilities=job_data.get('responsibilities'),
                benefits=job_data.get('benefits')
            )
            
            match_results.append(JobMatchResult(
                job=job_request,
                similarity_score=match['similarity_score']
            ))
        
        return BestMatchesResponse(
            matches=match_results,
            total_jobs=len(jobs_list),
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding best matches: {str(e)}")

# Database integration endpoints
@router.post("/embed-job-db/{job_id}")
async def embed_job_in_db(job_id: int, db: Session = Depends(get_db)):
    """
    Generate and store embedding for a job in the database.
    
    Args:
        job_id: ID of the job to embed
        db: Database session
        
    Returns:
        Success status and embedding info
    """
    try:
        # Get job from database
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        model = get_model()
        
        # Prepare job data
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
        
        # Generate embedding
        embedding = model.embed_job(job_dict)
        
        # Store embedding in database
        job.job_embedding = embedding_to_string(embedding)
        job.embedding_updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": "Job embedding generated and stored successfully",
            "job_id": job_id,
            "embedding_dimension": model.get_embedding_dimension()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating job embedding: {str(e)}")

@router.post("/embed-user-db/{user_id}")
async def embed_user_in_db(user_id: int, db: Session = Depends(get_db)):
    """
    Generate and store embedding for a user in the database.
    
    Args:
        user_id: ID of the user to embed
        db: Database session
        
    Returns:
        Success status and embedding info
    """
    try:
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        model = get_model()
        
        # Prepare user data
        user_dict = {
            'bio': user.bio,
            'skills': user.skills,
            'location': user.location,
            'experience': None,  # Experience field not in current model
            'education': None,    # Education field not in current model
            'professional_title': user.professional_title,
            'primary_role': user.primary_role,
            'company_name': user.company_name
        }
        
        # Generate embedding
        embedding = model.embed_user(user_dict)
        
        # Store embedding in database
        user.profile_embedding = embedding_to_string(embedding)
        user.embedding_updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": "User embedding generated and stored successfully",
            "user_id": user_id,
            "embedding_dimension": model.get_embedding_dimension()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating user embedding: {str(e)}")

@router.get("/matches-for-user/{user_id}")
async def get_matches_for_user(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """
    Get job matches for a user based on their stored embedding.
    
    Args:
        user_id: ID of the user
        limit: Maximum number of matches to return
        db: Database session
        
    Returns:
        List of matching jobs with similarity scores
    """
    try:
        # Get user with embedding
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.profile_embedding:
            raise HTTPException(status_code=400, detail="User embedding not found. Generate embedding first.")
        
        model = get_model()
        user_embedding = string_to_embedding(user.profile_embedding)
        
        if user_embedding.size == 0:
            raise HTTPException(status_code=400, detail="Invalid user embedding")
        
        # Get all jobs with embeddings
        jobs = db.query(Job).filter(
            Job.job_embedding.isnot(None),
            Job.status == "open"
        ).all()
        
        matches = []
        for job in jobs:
            job_embedding = string_to_embedding(job.job_embedding)
            if job_embedding.size == 0:
                continue
                
            similarity = model.calculate_similarity(job_embedding, user_embedding)
            
            matches.append({
                "job_id": job.id,
                "title": job.title,
                "company": job.creator.company_name if job.creator else "Unknown",
                "location": job.location,
                "job_type": job.job_type,
                "category": job.category,
                "similarity_score": similarity
            })
        
        # Sort by similarity score (descending) and limit results
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        matches = matches[:limit]
        
        return {
            "success": True,
            "user_id": user_id,
            "matches": matches,
            "total_matches": len(matches)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting matches: {str(e)}")
