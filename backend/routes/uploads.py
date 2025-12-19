from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import os

from database import get_db
from services.supabase_storage import supabase_storage
from ..auth import get_current_user
from models import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a photo to Supabase storage
    Supports user profile photos, job photos, and advertisement photos
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            )
        
        # Validate file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 10MB."
            )
        
        # Determine user ID (from parameter or current user)
        target_user_id = user_id if user_id else str(current_user.id)
        
        # Generate unique file path
        file_path = supabase_storage.generate_file_path(
            folder="photos",
            user_id=target_user_id,
            filename=file.filename or "unknown.jpg"
        )
        
        # Upload to Supabase
        signed_url = await supabase_storage.upload_file(
            file_data=file.file,
            file_path=file_path,
            content_type=file.content_type,
            user_id=target_user_id
        )
        
        return {
            "message": "Photo uploaded successfully",
            "url": signed_url,
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload photo: {str(e)}"
        )

@router.post("/upload-cover")
async def upload_cover_photo(
    file: UploadFile = File(...),
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a cover photo to Supabase storage
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            )
        
        # Validate file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 10MB."
            )
        
        # Determine user ID (from parameter or current user)
        target_user_id = user_id if user_id else str(current_user.id)
        
        # Generate unique file path for cover photos
        file_path = supabase_storage.generate_file_path(
            folder="covers",
            user_id=target_user_id,
            filename=file.filename or "unknown.jpg"
        )
        
        # Upload to Supabase
        signed_url = await supabase_storage.upload_file(
            file_data=file.file,
            file_path=file_path,
            content_type=file.content_type,
            user_id=target_user_id
        )
        
        return {
            "message": "Cover photo uploaded successfully",
            "url": signed_url,
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload cover photo: {str(e)}"
        )

@router.post("/upload-advertisement")
async def upload_advertisement_image(
    file: UploadFile = File(...),
    advertisement_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload an advertisement image to Supabase storage
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            )
        
        # Validate file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB in bytes
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 10MB."
            )
        
        # Generate unique file path for advertisement images
        file_path = supabase_storage.generate_file_path(
            folder="advertisements",
            user_id=str(current_user.id),
            filename=file.filename or "unknown.jpg"
        )
        
        # Upload to Supabase
        signed_url = await supabase_storage.upload_file(
            file_data=file.file,
            file_path=file_path,
            content_type=file.content_type,
            user_id=str(current_user.id)
        )
        
        return {
            "message": "Advertisement image uploaded successfully",
            "url": signed_url,
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_size,
            "advertisement_id": advertisement_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload advertisement image: {str(e)}"
        )

@router.post("/upload-portfolio")
async def upload_portfolio_file(
    file: UploadFile = File(...),
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a portfolio file (PDF, DOC, DOCX, or image) to Supabase storage
    """
    try:
        # Validate file type
        allowed_types = [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf", 
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only images, PDF, DOC, and DOCX files are allowed."
            )
        
        # Validate file size (15MB max for portfolio files)
        max_size = 15 * 1024 * 1024  # 15MB in bytes
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 15MB."
            )
        
        # Determine user ID (from parameter or current user)
        target_user_id = user_id if user_id else str(current_user.id)
        
        # Generate unique file path for portfolio files
        file_path = supabase_storage.generate_file_path(
            folder="portfolio",
            user_id=target_user_id,
            filename=file.filename or "unknown.pdf"
        )
        
        # Upload to Supabase
        signed_url = await supabase_storage.upload_file(
            file_data=file.file,
            file_path=file_path,
            content_type=file.content_type,
            user_id=target_user_id
        )
        
        return {
            "message": "Portfolio file uploaded successfully",
            "url": signed_url,
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload portfolio file: {str(e)}"
        )

@router.get("/get-url/{file_path:path}")
async def get_file_url(
    file_path: str,
    expires_in: int = 3600,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a signed URL for accessing a file from Supabase storage
    """
    try:
        signed_url = await supabase_storage.get_signed_url(
            file_path=file_path,
            expires_in=expires_in
        )
        
        return {
            "url": signed_url,
            "expires_in": expires_in,
            "file_path": file_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate file URL: {str(e)}"
        )

@router.delete("/delete/{file_path:path}")
async def delete_file(
    file_path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a file from Supabase storage
    """
    try:
        # Check if user has permission to delete this file
        # Files are organized by user_id, so we can check the path
        path_parts = file_path.split('/')
        if len(path_parts) >= 2 and path_parts[1] != str(current_user.id):
            # User is trying to delete someone else's file
            # Allow admin users to delete any file
            if not bool(current_user.is_admin):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to delete this file"
                )
        
        # Delete file from Supabase
        success = await supabase_storage.delete_file(file_path)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file"
            )
        
        return {
            "message": "File deleted successfully",
            "file_path": file_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )
