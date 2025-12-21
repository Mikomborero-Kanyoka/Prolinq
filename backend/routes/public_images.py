from fastapi import APIRouter, HTTPException, status
from services.supabase_storage import supabase_storage

router = APIRouter(prefix="/public-images", tags=["public-images"])

@router.get("/get-url/{filename}")
async def get_public_image_url(
    filename: str,
    image_type: str = "profile",
    user_id: str = "1"
):
    """
    Get a public URL for an image by filename (NO AUTHENTICATION REQUIRED)
    This endpoint is used by frontend components to display profile pictures, portfolio images, etc.
    
    Args:
        filename: The filename (e.g., "profile_1.jpg", "portfolio_2.jpg")
        image_type: Image type (profile, portfolio, job, advertisement)
        user_id: User ID for the image
    """
    try:
        print(f"🖼️  Public image request: filename={filename}, image_type={image_type}, user_id={user_id}")
        
        # Use the corrected get_image_url function
        image_url = supabase_storage.get_image_url(
            image_type=image_type,
            identifier=user_id,
            filename=filename
        )
        
        print(f"✅ Generated public URL: {image_url}")
        
        return {
            "url": image_url,
            "filename": filename,
            "image_type": image_type,
            "user_id": user_id
        }
        
    except Exception as e:
        print(f"❌ Error generating public image URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate image URL: {str(e)}"
        )

@router.get("/profile/{user_id}")
async def get_profile_picture_url(user_id: str):
    """
    Get profile picture URL for a specific user (NO AUTHENTICATION REQUIRED)
    """
    try:
        print(f"👤 Profile picture request for user: {user_id}")
        
        # Try to get the profile picture URL
        image_url = supabase_storage.get_image_url(
            image_type="profile",
            identifier=user_id,
            filename=f"profile_{user_id}.jpg"
        )
        
        print(f"✅ Generated profile URL: {image_url}")
        
        return {
            "url": image_url,
            "user_id": user_id,
            "image_type": "profile"
        }
        
    except Exception as e:
        print(f"❌ Error generating profile URL: {str(e)}")
        # Return a default avatar or error
        return {
            "url": "https://via.placeholder.com/150x150.png?text=No+Profile",
            "user_id": user_id,
            "image_type": "profile",
            "error": str(e)
        }

@router.get("/portfolio/{user_id}")
async def get_portfolio_images_urls(user_id: str):
    """
    Get portfolio images URLs for a specific user (NO AUTHENTICATION REQUIRED)
    """
    try:
        print(f"📁 Portfolio images request for user: {user_id}")
        
        # Try to get portfolio images (assuming they follow a naming pattern)
        portfolio_urls = []
        
        # Try common portfolio image patterns
        for i in range(1, 6):  # Try up to 5 portfolio images
            try:
                image_url = supabase_storage.get_image_url(
                    image_type="portfolio",
                    identifier=user_id,
                    filename=f"portfolio_{user_id}_{i}.jpg"
                )
                portfolio_urls.append({
                    "url": image_url,
                    "filename": f"portfolio_{user_id}_{i}.jpg",
                    "index": i
                })
            except:
                continue  # Skip if image doesn't exist
        
        print(f"✅ Found {len(portfolio_urls)} portfolio images")
        
        return {
            "portfolio_urls": portfolio_urls,
            "user_id": user_id,
            "image_type": "portfolio"
        }
        
    except Exception as e:
        print(f"❌ Error generating portfolio URLs: {str(e)}")
        return {
            "portfolio_urls": [],
            "user_id": user_id,
            "image_type": "portfolio",
            "error": str(e)
        }

@router.get("/advertisement/{ad_id}")
async def get_advertisement_image_url(ad_id: str):
    """
    Get advertisement image URL (NO AUTHENTICATION REQUIRED)
    """
    try:
        print(f"📢 Advertisement image request for ad: {ad_id}")
        
        # Try to get the advertisement image URL
        image_url = supabase_storage.get_image_url(
            image_type="advertisement",
            identifier=ad_id,
            filename=f"ad_{ad_id}.jpg"
        )
        
        print(f"✅ Generated advertisement URL: {image_url}")
        
        return {
            "url": image_url,
            "ad_id": ad_id,
            "image_type": "advertisement"
        }
        
    except Exception as e:
        print(f"❌ Error generating advertisement URL: {str(e)}")
        return {
            "url": "https://via.placeholder.com/300x200.png?text=No+Ad+Image",
            "ad_id": ad_id,
            "image_type": "advertisement",
            "error": str(e)
        }

@router.get("/job/{job_id}")
async def get_job_image_url(job_id: str):
    """
    Get job image URL (NO AUTHENTICATION REQUIRED)
    """
    try:
        print(f"💼 Job image request for job: {job_id}")
        
        # Try to get the job image URL
        image_url = supabase_storage.get_image_url(
            image_type="job",
            identifier=job_id,
            filename=f"job_{job_id}.jpg"
        )
        
        print(f"✅ Generated job URL: {image_url}")
        
        return {
            "url": image_url,
            "job_id": job_id,
            "image_type": "job"
        }
        
    except Exception as e:
        print(f"❌ Error generating job URL: {str(e)}")
        return {
            "url": "https://via.placeholder.com/300x200.png?text=No+Job+Image",
            "job_id": job_id,
            "image_type": "job",
            "error": str(e)
        }
