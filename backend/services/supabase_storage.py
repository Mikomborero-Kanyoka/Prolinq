import os
import uuid
from typing import Optional, BinaryIO
from supabase import create_client, Client
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

class SupabaseStorageService:
    def __init__(self):
        self.supabase_url: str = os.getenv("SUPABASE_URL")
        self.supabase_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.bucket_name: str = "prolinq_pictures"
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not found in environment variables")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
    async def upload_file(
        self, 
        file_data: BinaryIO, 
        file_path: str, 
        content_type: str,
        user_id: Optional[str] = None
    ) -> str:
        """
        Upload a file to Supabase storage and return the public URL
        
        Args:
            file_data: Binary file data
            file_path: Path within the bucket (e.g., "photos/user_id/filename.jpg")
            content_type: MIME type of the file
            user_id: User ID for access control (optional)
            
        Returns:
            str: Public URL of the uploaded file
        """
        try:
            # Reset file pointer to beginning
            file_data.seek(0)
            
            # Upload file to Supabase
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_data,
                file_options={
                    "content-type": content_type,
                    "cache-control": "max-age=3600",  # Cache for 1 hour
                    "upsert": "false"  # Don't overwrite existing files
                }
            )
            
            if response.data is None:
                logger.error(f"Supabase upload failed: {response}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload file: {response}"
                )
            
            # Generate signed URL for private access (valid for 1 hour)
            signed_response = self.client.storage.from_(self.bucket_name).create_signed_url(
                path=file_path,
                expires_in=3600  # 1 hour
            )
            
            if signed_response.data is None:
                logger.error(f"Failed to create signed URL: {signed_response}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate access URL for uploaded file"
                )
            
            logger.info(f"Successfully uploaded file to {file_path}")
            return signed_response.data["signedURL"]
            
        except Exception as e:
            logger.error(f"Error uploading file to Supabase: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )
    
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from Supabase storage
        
        Args:
            file_path: Path within the bucket
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            response = self.client.storage.from_(self.bucket_name).remove([file_path])
            
            if response.data is None:
                logger.error(f"Failed to delete file {file_path}: {response}")
                return False
            
            logger.info(f"Successfully deleted file: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file from Supabase: {str(e)}")
            return False
    
    async def get_signed_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Generate a signed URL for accessing a private file
        
        Args:
            file_path: Path within the bucket
            expires_in: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            str: Signed URL for the file
        """
        try:
            response = self.client.storage.from_(self.bucket_name).create_signed_url(
                path=file_path,
                expires_in=expires_in
            )
            
            if response.data is None:
                logger.error(f"Failed to create signed URL for {file_path}: {response}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found or access denied"
                )
            
            return response.data["signedURL"]
            
        except Exception as e:
            logger.error(f"Error creating signed URL: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate access URL: {str(e)}"
            )
    
    def generate_file_path(self, folder: str, user_id: str, filename: str) -> str:
        """
        Generate a unique file path for storage
        
        Args:
            folder: Folder type (photos, covers, portfolio, etc.)
            user_id: User ID
            filename: Original filename
            
        Returns:
            str: Unique file path
        """
        # Extract file extension
        file_extension = os.path.splitext(filename)[1]
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Construct full path
        return f"{folder}/{user_id}/{unique_filename}"
    
    def get_content_type(self, filename: str) -> str:
        """
        Determine content type based on file extension
        
        Args:
            filename: File name
            
        Returns:
            str: MIME content type
        """
        extension = os.path.splitext(filename)[1].lower()
        
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        
        return content_types.get(extension, 'application/octet-stream')

# Global instance
supabase_storage = SupabaseStorageService()
