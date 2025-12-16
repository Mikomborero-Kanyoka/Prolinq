"""
Skills Matching AI Model - Lightweight Embedding Pipeline
Uses all-MiniLM-L6-v2 for low RAM/CPU usage on free-tier hosting
"""

import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SkillsMatchingModel:
    """
    Lightweight skills matching model using sentence transformers.
    Optimized for low RAM usage and CPU-only inference.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize the embedding model.
        
        Args:
            model_name: Name of the sentence transformer model
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the sentence transformer model on CPU."""
        try:
            logger.info(f"Loading model: {self.model_name}")
            # Force CPU usage to avoid GPU memory issues
            os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
            
            # Load model with optimized settings for low RAM
            self.model = SentenceTransformer(
                self.model_name,
                device='cpu'
            )
            
            # Optimize model for inference
            self.model.eval()
            logger.info(f"Model loaded successfully. Embedding dimension: {self.model.get_sentence_embedding_dimension()}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def _prepare_job_text(self, job_data: Dict[str, Any]) -> str:
        """
        Convert job data into a single text string for embedding.
        
        Args:
            job_data: Dictionary containing job information
            
        Returns:
            Formatted text string combining all job details
        """
        # Extract and combine relevant job fields
        text_parts = []
        
        # Job title (most important)
        if job_data.get('title'):
            text_parts.append(f"Job Title: {job_data['title']}")
        
        # Skills required (very important for matching)
        if job_data.get('skills_required'):
            text_parts.append(f"Skills Required: {job_data['skills_required']}")
        
        # Job description
        if job_data.get('description'):
            text_parts.append(f"Description: {job_data['description']}")
        
        # Experience requirements
        if job_data.get('experience_required'):
            text_parts.append(f"Experience Required: {job_data['experience_required']}")
        
        # Qualifications
        if job_data.get('qualifications'):
            text_parts.append(f"Qualifications: {job_data['qualifications']}")
        
        # Responsibilities
        if job_data.get('responsibilities'):
            text_parts.append(f"Responsibilities: {job_data['responsibilities']}")
        
        # Category
        if job_data.get('category'):
            text_parts.append(f"Category: {job_data['category']}")
        
        # Job type
        if job_data.get('job_type'):
            text_parts.append(f"Job Type: {job_data['job_type']}")
        
        # Location
        if job_data.get('location'):
            text_parts.append(f"Location: {job_data['location']}")
        
        # Benefits
        if job_data.get('benefits'):
            text_parts.append(f"Benefits: {job_data['benefits']}")
        
        # Salary/budget information
        if job_data.get('budget'):
            text_parts.append(f"Budget: {job_data['budget']}")
        elif job_data.get('budget_min') and job_data.get('budget_max'):
            text_parts.append(f"Budget Range: {job_data['budget_min']} - {job_data['budget_max']}")
        
        return " | ".join(text_parts)
    
    def _prepare_user_text(self, user_data: Dict[str, Any]) -> str:
        """
        Convert user profile data into a single text string for embedding.
        
        Args:
            user_data: Dictionary containing user profile information
            
        Returns:
            Formatted text string combining all user profile details
        """
        text_parts = []
        
        # Professional title/bio (most important)
        if user_data.get('professional_title'):
            text_parts.append(f"Professional Title: {user_data['professional_title']}")
        
        if user_data.get('bio'):
            text_parts.append(f"Bio: {user_data['bio']}")
        
        # Skills (very important for matching)
        if user_data.get('skills'):
            text_parts.append(f"Skills: {user_data['skills']}")
        
        # Experience
        if user_data.get('experience'):
            text_parts.append(f"Experience: {user_data['experience']}")
        
        # Education
        if user_data.get('education'):
            text_parts.append(f"Education: {user_data['education']}")
        
        # Location
        if user_data.get('location'):
            text_parts.append(f"Location: {user_data['location']}")
        
        # Primary role
        if user_data.get('primary_role'):
            text_parts.append(f"Role: {user_data['primary_role']}")
        
        # Company information (for employers)
        if user_data.get('company_name'):
            text_parts.append(f"Company: {user_data['company_name']}")
        
        return " | ".join(text_parts)
    
    def embed_job(self, job_data: Dict[str, Any]) -> np.ndarray:
        """
        Generate embedding for job data.
        
        Args:
            job_data: Dictionary containing job information
            
        Returns:
            Numpy array containing the job embedding
        """
        try:
            job_text = self._prepare_job_text(job_data)
            
            # Generate embedding
            embedding = self.model.encode(
                job_text,
                convert_to_numpy=True,
                normalize_embeddings=True,  # Normalize for better cosine similarity
                show_progress_bar=False,
                batch_size=1
            )
            
            logger.info(f"Generated job embedding with shape: {embedding.shape}")
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating job embedding: {e}")
            raise
    
    def embed_user(self, user_data: Dict[str, Any]) -> np.ndarray:
        """
        Generate embedding for user profile data.
        
        Args:
            user_data: Dictionary containing user profile information
            
        Returns:
            Numpy array containing the user embedding
        """
        try:
            user_text = self._prepare_user_text(user_data)
            
            # Generate embedding
            embedding = self.model.encode(
                user_text,
                convert_to_numpy=True,
                normalize_embeddings=True,  # Normalize for better cosine similarity
                show_progress_bar=False,
                batch_size=1
            )
            
            logger.info(f"Generated user embedding with shape: {embedding.shape}")
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating user embedding: {e}")
            raise
    
    def calculate_similarity(self, job_embedding: np.ndarray, user_embedding: np.ndarray) -> float:
        """
        Calculate cosine similarity between job and user embeddings.
        
        Args:
            job_embedding: Job embedding vector
            user_embedding: User embedding vector
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            # Reshape for sklearn's cosine_similarity
            job_reshaped = job_embedding.reshape(1, -1)
            user_reshaped = user_embedding.reshape(1, -1)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(job_reshaped, user_reshaped)[0][0]
            
            # Ensure result is between 0 and 1
            similarity_score = max(0.0, min(1.0, float(similarity)))
            
            return similarity_score
            
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0
    
    def find_best_matches(self, user_data: Dict[str, Any], jobs_list: List[Dict[str, Any]], 
                         top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Find best matching jobs for a user profile.
        
        Args:
            user_data: User profile dictionary
            jobs_list: List of job dictionaries
            top_k: Number of top matches to return
            
        Returns:
            List of jobs with similarity scores, sorted by score (descending)
        """
        try:
            # Generate user embedding once
            user_embedding = self.embed_user(user_data)
            
            matches = []
            
            for job in jobs_list:
                # Generate job embedding
                job_embedding = self.embed_job(job)
                
                # Calculate similarity
                similarity = self.calculate_similarity(job_embedding, user_embedding)
                
                matches.append({
                    'job': job,
                    'similarity_score': similarity
                })
            
            # Sort by similarity score (descending)
            matches.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Return top_k matches
            return matches[:top_k]
            
        except Exception as e:
            logger.error(f"Error finding best matches: {e}")
            return []
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of the embedding vectors."""
        if self.model:
            return self.model.get_sentence_embedding_dimension()
        return 0

# Global model instance (singleton pattern for memory efficiency)
_model_instance = None

def get_model() -> SkillsMatchingModel:
    """Get or create the singleton model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = SkillsMatchingModel()
    return _model_instance

def embedding_to_string(embedding: np.ndarray) -> str:
    """Convert numpy embedding to string for database storage."""
    return json.dumps(embedding.tolist())

def string_to_embedding(embedding_str: str) -> np.ndarray:
    """Convert database string back to numpy embedding."""
    try:
        return np.array(json.loads(embedding_str))
    except:
        return np.array([])
