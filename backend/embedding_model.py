"""
Skills Matching AI Model - Lightweight Embedding Pipeline
Uses all-MiniLM-L6-v2 for low RAM/CPU usage on free-tier hosting
"""

import os
import json
from typing import List, Dict, Any, Optional, Union
import logging

# Type alias for embeddings
EmbeddingVector = Union[List[float], Any]  # Any covers numpy.ndarray when available

# Try to import ML dependencies, handle gracefully if not available
try:
    import numpy as np
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    ML_AVAILABLE = True
except ImportError as e:
    ML_AVAILABLE = False
    logging.warning(f"ML dependencies not available: {e}. Using fallback matching.")
    # Create fallback numpy-like functionality
    class MockLinalg:
        @staticmethod
        def norm(a: List[float]) -> float:
            return sum(x * x for x in a) ** 0.5
    
    class MockNumpy:
        def __init__(self):
            self.linalg = MockLinalg()
        
        @staticmethod
        def zeros(shape: Union[int, tuple]) -> List[float]:
            if isinstance(shape, int):
                return [0.0] * shape
            elif isinstance(shape, tuple):
                return [0.0] * (shape[0] if shape else 0)
            return [0.0] * shape
        
        @staticmethod
        def array(data: Any) -> List[float]:
            if isinstance(data, list):
                return data
            return list(data) if data else []
        
        @staticmethod
        def random(shape: Union[int, tuple]) -> List[float]:
            import random
            if isinstance(shape, int):
                return [random.random() for _ in range(shape)]
            elif isinstance(shape, tuple):
                return [random.random() for _ in range(shape[0] if shape else 0)]
            return [random.random() for _ in range(shape)]
        
        @staticmethod
        def dot(a: List[float], b: List[float]) -> float:
            return sum(x * y for x, y in zip(a, b))
        
        @staticmethod
        def norm(a: List[float]) -> float:
            return sum(x * x for x in a) ** 0.5
        
        @staticmethod
        def reshape(array: List[float], shape: tuple) -> List[List[float]]:
            # Simple reshape for 2D arrays
            if len(shape) == 2 and shape[0] == 1:
                return [array]
            return [array]
    
    np = MockNumpy()
    
    # Mock classes for type hints
    class SentenceTransformer:
        def __init__(self, model_name: str, device: str = 'cpu'):
            self.model_name = model_name
            self.device = device
        
        def encode(self, text: str, convert_to_numpy: bool = True, 
                  normalize_embeddings: bool = False, show_progress_bar: bool = False, 
                  batch_size: int = 1) -> List[float]:
            import random
            return [random.random() for _ in range(384)]  # Mock embedding
        
        def get_sentence_embedding_dimension(self) -> int:
            return 384
        
        def eval(self):
            pass
    
    def cosine_similarity_func(a: List[List[float]], b: List[List[float]]) -> List[List[float]]:
        # Simple mock cosine similarity
        return [[0.5]]

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
        if not ML_AVAILABLE:
            logger.warning("ML dependencies not available. Using fallback matching.")
            return
            
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
            self.model = None
    
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
    
    def embed_job(self, job_data: Dict[str, Any]) -> EmbeddingVector:
        """
        Generate embedding for job data.
        
        Args:
            job_data: Dictionary containing job information
            
        Returns:
            Embedding vector containing the job embedding
        """
        if not ML_AVAILABLE or self.model is None:
            # Fallback: create simple keyword-based embedding
            job_text = self._prepare_job_text(job_data)
            return self._create_fallback_embedding(job_text)
            
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
            
            logger.info(f"Generated job embedding with shape: {getattr(embedding, 'shape', len(embedding))}")
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating job embedding: {e}")
            # Fallback to simple embedding
            job_text = self._prepare_job_text(job_data)
            return self._create_fallback_embedding(job_text)
    
    def embed_user(self, user_data: Dict[str, Any]) -> EmbeddingVector:
        """
        Generate embedding for user profile data.
        
        Args:
            user_data: Dictionary containing user profile information
            
        Returns:
            Embedding vector containing the user embedding
        """
        if not ML_AVAILABLE or self.model is None:
            # Fallback: create simple keyword-based embedding
            user_text = self._prepare_user_text(user_data)
            return self._create_fallback_embedding(user_text)
            
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
            
            logger.info(f"Generated user embedding with shape: {getattr(embedding, 'shape', len(embedding))}")
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating user embedding: {e}")
            # Fallback to simple embedding
            user_text = self._prepare_user_text(user_data)
            return self._create_fallback_embedding(user_text)
    
    def calculate_similarity(self, job_embedding: EmbeddingVector, user_embedding: EmbeddingVector) -> float:
        """
        Calculate cosine similarity between job and user embeddings.
        
        Args:
            job_embedding: Job embedding vector
            user_embedding: User embedding vector
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            if not ML_AVAILABLE:
                # Fallback: simple dot product similarity
                return self._calculate_fallback_similarity(job_embedding, user_embedding)
                
            # Check if embeddings have reshape method (numpy arrays)
            if hasattr(job_embedding, 'reshape') and hasattr(user_embedding, 'reshape'):
                # Reshape for sklearn's cosine_similarity
                job_reshaped = job_embedding.reshape(1, -1)
                user_reshaped = user_embedding.reshape(1, -1)
                
                # Calculate cosine similarity
                similarity = cosine_similarity_func(job_reshaped, user_reshaped)[0][0]
                
                # Ensure result is between 0 and 1
                similarity_score = max(0.0, min(1.0, float(similarity)))
                
                return similarity_score
            else:
                # Use fallback for list embeddings
                return self._calculate_fallback_similarity(job_embedding, user_embedding)
            
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
        if ML_AVAILABLE and self.model:
            return self.model.get_sentence_embedding_dimension()
        return 100  # Fallback dimension
    
    def _create_fallback_embedding(self, text: str) -> EmbeddingVector:
        """
        Create a simple fallback embedding using keyword matching.
        This is used when ML dependencies are not available.
        """
        # Simple keyword-based embedding (100 dimensions)
        keywords = [
            'python', 'javascript', 'react', 'node', 'sql', 'aws', 'docker', 'git',
            'machine learning', 'data science', 'web development', 'frontend', 'backend',
            'full stack', 'devops', 'mobile', 'ios', 'android', 'ui', 'ux', 'design',
            'product manager', 'project manager', 'business analyst', 'qa', 'testing',
            'agile', 'scrum', 'leadership', 'communication', 'teamwork', 'problem solving',
            'critical thinking', 'creativity', 'innovation', 'strategy', 'planning',
            'marketing', 'sales', 'customer service', 'support', 'accounting', 'finance',
            'hr', 'recruiting', 'training', 'coaching', 'mentoring', 'research',
            'analysis', 'statistics', 'mathematics', 'engineering', 'architecture',
            'security', 'networking', 'cloud', 'database', 'api', 'microservices',
            'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
            'typescript', 'html', 'css', 'sass', 'webpack', 'babel', 'eslint',
            'jest', 'cypress', 'selenium', 'jenkins', 'travis', 'github', 'gitlab',
            'linux', 'windows', 'macos', 'ubuntu', 'centos', 'debian', 'redhat'
        ]
        
        # Create embedding based on keyword presence
        embedding = np.zeros(100)
        text_lower = text.lower()
        
        for i, keyword in enumerate(keywords[:100]):
            if keyword in text_lower:
                embedding[i] = 1.0
        
        # Add some randomness for variety
        import random
        embedding = [x + (random.random() * 0.1) for x in embedding]
        
        return embedding
    
    def _calculate_fallback_similarity(self, job_emb: EmbeddingVector, user_emb: EmbeddingVector) -> float:
        """
        Calculate simple similarity for fallback embeddings.
        """
        try:
            # Convert to lists if they aren't already
            job_list = list(job_emb) if not isinstance(job_emb, list) else job_emb
            user_list = list(user_emb) if not isinstance(user_emb, list) else user_emb
            
            # Simple dot product similarity
            dot_product = MockNumpy.dot(job_list, user_list)
            norm_job = MockLinalg.norm(job_list)
            norm_user = MockLinalg.norm(user_list)
            
            if norm_job == 0 or norm_user == 0:
                return 0.0
            
            similarity = dot_product / (norm_job * norm_user)
            return max(0.0, min(1.0, float(similarity)))
            
        except Exception as e:
            logger.error(f"Error in fallback similarity: {e}")
            return 0.0

# Global model instance (singleton pattern for memory efficiency)
_model_instance = None

def get_model() -> SkillsMatchingModel:
    """Get or create the singleton model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = SkillsMatchingModel()
    return _model_instance

def embedding_to_string(embedding: EmbeddingVector) -> str:
    """Convert embedding to string for database storage."""
    try:
        if hasattr(embedding, 'tolist'):
            return json.dumps(embedding.tolist())
        elif isinstance(embedding, list):
            return json.dumps(embedding)
        else:
            # Convert to list if it's not already
            return json.dumps(list(embedding) if hasattr(embedding, '__iter__') else [])
    except Exception as e:
        logger.error(f"Error converting embedding to string: {e}")
        return json.dumps([])

def string_to_embedding(embedding_str: str) -> EmbeddingVector:
    """Convert database string back to embedding."""
    try:
        data = json.loads(embedding_str)
        if ML_AVAILABLE:
            return np.array(data)
        else:
            return data
    except Exception as e:
        logger.error(f"Error converting string to embedding: {e}")
        return [] if not ML_AVAILABLE else np.array([])
