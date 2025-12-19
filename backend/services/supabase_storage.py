import os
import uuid
from typing import Optional, BinaryIO
from supabase import create_client, Client
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

class SupabaseStorageService:
    def __init__(self):
        self.supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
        self.supabase_key: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.bucket_name: str = "prolinq_pictures"
        self.client: Optional[Client] = None
        self.enabled: bool = False
        
        if self.supabase_url and self.supabase_key:
            try:
                self.client = create_client(self.supabase_url, self.supabase_key)
                self.enabled = True
                logger.info("Supabase storage service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.enabled = False
        else:
            logger.warning("Supabase credentials not found. File uploads will be disabled.")
            self.enabled = False
        
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
        if not self.enabled or not self.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase storage is not available. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            )
        
        try:
            # Reset file pointer to beginning
            file_data.seek(0)
            
            # Read file data for older Supabase version
            file_content = file_data.read()
            
            # Upload file to Supabase (compatible with older versions)
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content
            )
            
            # Check for successful upload (handle different response formats)
            if isinstance(response, dict):
                if response.get('error'):
                    logger.error(f"Supabase upload error: {response.get('error')}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to upload file: {response.get('error')}"
                    )
                # Upload successful for dict response
            elif hasattr(response, 'data') and response.data is None:
                logger.error(f"Supabase upload failed: {response}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload file: {response}"
                )
            elif hasattr(response, 'error') and response.error:
                logger.error(f"Supabase upload error: {response.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload file: {response.error}"
                )
            
            # Generate signed URL for private access (valid for 1 hour)
            signed_response = self.client.storage.from_(self.bucket_name).create_signed_url(
                path=file_path,
                expires_in=3600  # 1 hour
            )
            
            # Handle different response formats for signed URL
            if isinstance(signed_response, dict):
                if signed_response.get('error'):
                    logger.error(f"Failed to create signed URL: {signed_response.get('error')}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to generate access URL for uploaded file"
                    )
                signed_url = signed_response.get('signedURL')
            elif hasattr(signed_response, 'data') and signed_response.data is None:
                logger.error(f"Failed to create signed URL: {signed_response}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate access URL for uploaded file"
                )
            else:
                signed_url = signed_response.data["signedURL"]
            
            if not signed_url:
                logger.error(f"No signed URL returned: {signed_response}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate access URL for uploaded file"
                )
            
            logger.info(f"Successfully uploaded file to {file_path}")
            return signed_url
            
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
        if not self.enabled or not self.client:
            logger.warning("Supabase storage is not available for file deletion")
            return False
        
        try:
            response = self.client.storage.from_(self.bucket_name).remove([file_path])
            
            # Handle different response formats for deletion
            if isinstance(response, dict):
                if response.get('error'):
                    logger.error(f"Failed to delete file {file_path}: {response.get('error')}")
                    return False
                # Deletion successful for dict response
            elif hasattr(response, 'data') and response.data is None:
                logger.error(f"Failed to delete file {file_path}: {response}")
                return False
            elif hasattr(response, 'error') and response.error:
                logger.error(f"Failed to delete file {file_path}: {response.error}")
                return False
            else:
                # Handle list response (some versions return list)
                if isinstance(response, list) and len(response) > 0:
                    if hasattr(response[0], 'error') and response[0].error:
                        logger.error(f"Failed to delete file {file_path}: {response[0].error}")
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
        if not self.enabled or not self.client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase storage is not available. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            )
        
        try:
            response = self.client.storage.from_(self.bucket_name).create_signed_url(
                path=file_path,
                expires_in=expires_in
            )
            
            # Handle different response formats for signed URL
            if isinstance(response, dict):
                if response.get('error'):
                    logger.error(f"Failed to create signed URL for {file_path}: {response.get('error')}")
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="File not found or access denied"
                    )
                signed_url = response.get('signedURL')
            elif hasattr(response, 'data') and response.data is None:
                logger.error(f"Failed to create signed URL for {file_path}: {response}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found or access denied"
                )
            else:
                signed_url = response.data["signedURL"]
            
            if not signed_url:
                logger.error(f"No signed URL returned for {file_path}: {response}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found or access denied"
                )
            
            return signed_url
            
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
