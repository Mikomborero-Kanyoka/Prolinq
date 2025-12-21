from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import os

from database import get_db
from services.supabase_storage import supabase_storage
from auth import get_current_user
from models import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/supabase")
async def upload_to_supabase(
    file: UploadFile = File(...),
    folder: Optional[str] = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generic upload endpoint for Supabase storage
    Supports profile photos, cover photos, advertisement images, and portfolio files
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if folder == "portfolio":
            allowed_types.extend([
                "application/pdf", 
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ])
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Validate file size (15MB max for portfolio, 10MB for others)
        max_size = 15 * 1024 * 1024 if folder == "portfolio" else 10 * 1024 * 1024
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {max_size // (1024*1024)}MB."
            )
        
        # Generate unique file path
        file_path = supabase_storage.generate_file_path(
            folder=folder or "general",
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
            "message": "File uploaded successfully",
            "url": signed_url,
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": file_size,
            "folder": folder
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

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

@router.get("/get-url/{filename}")
async def get_image_url_by_filename(
    filename: str,
    image_type: Optional[str] = None,
    user_id: Optional[str] = None
):
    """
    Get a public URL for an image by filename using the corrected path structure
    This endpoint is used by frontend components to display profile pictures, portfolio images, etc.
    
    Args:
        filename: The filename (can contain user_id and image_type info)
        image_type: Optional image type (profile, portfolio, job, advertisement)
        user_id: Optional user ID for profile/portfolio images
    """
    try:
        # Try to extract image type and user ID from filename if not provided
        if not image_type or not user_id:
            # Parse filename patterns like:
            # "profile_1.jpg", "portfolio_2.jpg", "job_123.jpg", "ad_456.jpg"
            if filename.startswith("profile_"):
                image_type = "profile"
                user_id = filename.replace("profile_", "").replace(".jpg", "")
            elif filename.startswith("portfolio_"):
                image_type = "portfolio" 
                user_id = filename.replace("portfolio_", "").replace(".jpg", "")
            elif filename.startswith("job_"):
                image_type = "job"
                user_id = filename.replace("job_", "").replace(".jpg", "")
            elif filename.startswith("ad_"):
                image_type = "advertisement"
                user_id = filename.replace("ad_", "").replace(".jpg", "")
            else:
                # Default to profile if we can't determine
                image_type = "profile"
                user_id = "1"
        
        # Use the corrected get_image_url function
        image_url = supabase_storage.get_image_url(
            image_type=image_type,
            identifier=user_id,
            filename=filename if not filename.startswith(("profile_", "portfolio_", "job_", "ad_")) else filename
        )
        
        return {
            "url": image_url,
            "filename": filename,
            "image_type": image_type,
            "user_id": user_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate image URL: {str(e)}"
        )

@router.get("/get-url/{file_path:path}")
async def get_file_url(
    file_path: str,
    expires_in: int = 3600,
    db: Session = Depends(get_db)
):
    """
    Get a signed URL for accessing a file from Supabase storage (public access)
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

@router.get("/public-url/{file_path:path}")
async def get_public_file_url(
    file_path: str,
    db: Session = Depends(get_db)
):
    """
    Get a public URL for accessing a file from Supabase storage (no authentication required)
    This is used for profile photos and other publicly accessible images
    """
    try:
        # Get the public URL directly from Supabase
        public_url = supabase_storage.get_public_url(file_path=file_path)
        
        return {
            "url": public_url,
            "file_path": file_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate public file URL: {str(e)}"
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
