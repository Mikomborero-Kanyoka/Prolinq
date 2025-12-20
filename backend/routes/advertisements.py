from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from PIL import Image, ImageDraw, ImageFont
import io
import base64

from database import get_db
from models import Advertisement, User
from schemas import AdvertisementCreate, AdvertisementUpdate, AdvertisementResponse
from auth import get_current_user
from pydantic import BaseModel
from typing import Optional

class AdvertisementCreateWithImage(AdvertisementCreate):
    image_filename: Optional[str] = None
    image_url: Optional[str] = None

class PictureAdCreate(BaseModel):
    cta_text: str
    cta_url: str
    image_url: str

router = APIRouter(prefix="/api/advertisements", tags=["advertisements"])

# Category color schemes for image generation
CATEGORY_COLORS = {
    "Technology": {"primary": "#3B82F6", "secondary": "#93C5FD", "bg": "#EFF6FF"},
    "Design": {"primary": "#8B5CF6", "secondary": "#C4B5FD", "bg": "#F5F3FF"},
    "Marketing": {"primary": "#14B8A6", "secondary": "#7DD3FC", "bg": "#F0FDFA"},
    "Business": {"primary": "#6B7280", "secondary": "#D1D5DB", "bg": "#F9FAFB"},
    "Furniture": {"primary": "#10B981", "secondary": "#86EFAC", "bg": "#F0FDF4"},
    "Education": {"primary": "#F59E0B", "secondary": "#FCD34D", "bg": "#FFFBEB"},
    "Health": {"primary": "#10B981", "secondary": "#86EFAC", "bg": "#F0FDF4"},
    "Finance": {"primary": "#1E40AF", "secondary": "#93C5FD", "bg": "#EFF6FF"},
    "Entertainment": {"primary": "#EC4899", "secondary": "#F9A8D4", "bg": "#FDF2F8"},
    "Food": {"primary": "#EA580C", "secondary": "#FDBA74", "bg": "#FFF7ED"}
}

def generate_advertisement_text(data: AdvertisementCreate) -> dict:
    """Generate text advertisement following design rules"""
    
    # Generate headline (max 6 words)
    name_words = data.name.split()
    headline = " ".join(name_words[:6])
    
    # Generate description (1-2 lines)
    description = data.benefit
    if len(description) > 120:
        description = description[:117] + "..."
    
    # Generate offer (optional)
    offer = None
    if data.price:
        if data.item_type.lower() in ["service", "gig"]:
            offer = f"Starting at {data.price}"
        else:
            offer = f"Only {data.price}"
    
    return {
        "headline": headline,
        "description": description,
        "offer": offer
    }

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_background(width: int, height: int, color1: str, color2: str) -> Image.Image:
    """Create a gradient background"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    r1, g1, b1 = hex_to_rgb(color1)
    r2, g2, b2 = hex_to_rgb(color2)
    
    for y in range(height):
        ratio = y / height
        r = int(r1 * (1 - ratio) + r2 * ratio)
        g = int(g1 * (1 - ratio) + g2 * ratio)
        b = int(b1 * (1 - ratio) + b2 * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    return img

def generate_advertisement_image(data: AdvertisementCreate, text_data: dict) -> str:
    """Generate advertisement image and return filename"""
    
    # Image dimensions
    width, height = 800, 600
    
    # Get category colors
    colors = CATEGORY_COLORS.get(data.category, CATEGORY_COLORS["Business"])
    
    # Create gradient background
    img = create_gradient_background(width, height, colors["bg"], colors["secondary"])
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to load a nice font
        title_font = ImageFont.truetype("arial.ttf", 48)
        subtitle_font = ImageFont.truetype("arial.ttf", 24)
        small_font = ImageFont.truetype("arial.ttf", 18)
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Draw company name at top
    company_bbox = draw.textbbox((0, 0), data.company_name, font=small_font)
    company_width = company_bbox[2] - company_bbox[0]
    draw.text(((width - company_width) // 2, 40), data.company_name, 
              fill=colors["primary"], font=small_font)
    
    # Draw main headline
    headline_bbox = draw.textbbox((0, 0), text_data["headline"], font=title_font)
    headline_width = headline_bbox[2] - headline_bbox[0]
    headline_height = headline_bbox[3] - headline_bbox[1]
    
    # Center the headline
    headline_x = (width - headline_width) // 2
    headline_y = (height - headline_height) // 2 - 50
    
    draw.text((headline_x, headline_y), text_data["headline"], 
              fill=colors["primary"], font=title_font)
    
    # Draw description
    desc_lines = []
    words = text_data["description"].split()
    current_line = ""
    
    for word in words:
        test_line = current_line + " " + word if current_line else word
        bbox = draw.textbbox((0, 0), test_line, font=subtitle_font)
        if bbox[2] - bbox[0] <= width - 100:
            current_line = test_line
        else:
            if current_line:
                desc_lines.append(current_line)
            current_line = word
    
    if current_line:
        desc_lines.append(current_line)
    
    # Limit to 2 lines
    desc_lines = desc_lines[:2]
    
    desc_y = headline_y + headline_height + 30
    for i, line in enumerate(desc_lines):
        bbox = draw.textbbox((0, 0), line, font=subtitle_font)
        line_width = bbox[2] - bbox[0]
        draw.text(((width - line_width) // 2, desc_y + i * 35), line, 
                  fill="#374151", font=subtitle_font)
    
    # Draw offer if present
    if text_data["offer"]:
        offer_y = desc_y + len(desc_lines) * 35 + 30
        offer_bbox = draw.textbbox((0, 0), text_data["offer"], font=subtitle_font)
        offer_width = offer_bbox[2] - offer_bbox[0]
        draw.text(((width - offer_width) // 2, offer_y), text_data["offer"], 
                  fill=colors["primary"], font=subtitle_font)
    
    # Draw CTA button
    cta_y = height - 120
    cta_bbox = draw.textbbox((0, 0), data.cta_text, font=subtitle_font)
    cta_width = cta_bbox[2] - cta_bbox[0]
    cta_height = cta_bbox[3] - cta_bbox[1]
    
    # Button dimensions
    button_width = cta_width + 40
    button_height = cta_height + 20
    button_x = (width - button_width) // 2
    button_y = cta_y - 10
    
    # Draw button background
    draw.rounded_rectangle(
        [button_x, button_y, button_x + button_width, button_y + button_height],
        radius=8, fill=colors["primary"]
    )
    
    # Draw CTA text
    draw.text((button_x + 20, cta_y), data.cta_text, fill="white", font=subtitle_font)
    
    # Save image
    filename = f"ad_{uuid.uuid4().hex}.png"
    filepath = os.path.join("uploads", filename)
    img.save(filepath, "PNG", quality=95)
    
    return filename

# Picture Ad Endpoint
def get_ad_upload_dir():
    """Get or create ads upload directory"""
    # Get backend directory (parent of routes directory)
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_dir = os.path.join(backend_dir, "uploads")
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir, exist_ok=True)
    return upload_dir

@router.post("/picture", response_model=AdvertisementResponse)
def create_picture_ad(
    ad_data: PictureAdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a picture-only advertisement with a CTA button using Supabase image URL.
    Requires:
    - cta_text: Call-to-action button text (e.g., "Learn More", "Shop Now")
    - cta_url: External URL the button should link to
    - image_url: Supabase storage URL for the uploaded image
    """
    
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create picture ads"
        )
    
    # Validate CTA text length
    if len(ad_data.cta_text.split()) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CTA text should be maximum 3 words"
        )
    
    # Validate CTA URL
    if not ad_data.cta_url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CTA URL must start with http:// or https://"
        )
    
    # Validate image URL
    if not ad_data.image_url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image URL must be a valid URL starting with http:// or https://"
        )
    
    try:
        # Create advertisement record as picture-only ad
        advertisement = Advertisement(
            user_id=current_user.id,
            item_type="Picture Ad",
            name="Picture Advertisement",
            category="Visual",
            company_name=current_user.company_name or current_user.full_name or "Business",
            price=None,
            benefit="Promotional image advertisement",
            cta_text=ad_data.cta_text,
            cta_url=ad_data.cta_url,
            headline="",  # Picture-only ads don't need generated headline
            description="",  # Picture-only ads don't need generated description
            offer=None,
            is_picture_only=True,
            picture_filename=None,  # No local file storage
            image_url=ad_data.image_url,  # Use Supabase URL directly
            status="active"  # Explicitly set status to active
        )
        
        db.add(advertisement)
        db.commit()
        db.refresh(advertisement)
        
        return advertisement
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create picture advertisement: {str(e)}"
        )

@router.post("/upload-image")
def upload_advertisement_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload an image for advertisement"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 5MB"
        )
    
    try:
        # Generate unique filename
        file_extension = file.filename.split('.')[-1].lower()
        filename = f"ad_{current_user.id}_{uuid.uuid4().hex}.{file_extension}"
        filepath = os.path.join("uploads", filename)
        
        # Save file
        with open(filepath, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        # Optional: Resize/optimize image if needed
        try:
            with Image.open(filepath) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize if too large (max 1200x1200)
                if img.width > 1200 or img.height > 1200:
                    img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(filepath, "JPEG", quality=85, optimize=True)
        except Exception as e:
            print(f"Error optimizing image: {e}")
        
        image_url = f"/files/{filename}"
        
        return {
            "message": "Image uploaded successfully",
            "filename": filename,
            "image_url": image_url
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )

@router.post("/with-image", response_model=AdvertisementResponse)
def create_advertisement_with_image(
    ad_data: AdvertisementCreateWithImage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new advertisement with uploaded image"""
    
    # Validate input
    if len(ad_data.name.split()) > 6:
        raise HTTPException(
            status_code=400,
            detail="Name should be maximum 6 words for headline compliance"
        )
    
    if len(ad_data.cta_text.split()) > 3:
        raise HTTPException(
            status_code=400,
            detail="CTA text should be maximum 3 words"
        )
    
    # Generate text content
    text_data = generate_advertisement_text(ad_data)
    
    # Create advertisement record with uploaded image
    advertisement = Advertisement(
        user_id=current_user.id,
        item_type=ad_data.item_type,
        name=ad_data.name,
        category=ad_data.category,
        company_name=ad_data.company_name,
        price=ad_data.price,
        benefit=ad_data.benefit,
        cta_text=ad_data.cta_text,
        headline=text_data["headline"],
        description=text_data["description"],
        offer=text_data["offer"],
        image_filename=ad_data.image_filename,
        image_url=ad_data.image_url
    )
    
    db.add(advertisement)
    db.commit()
    db.refresh(advertisement)
    
    return advertisement

@router.post("/", response_model=AdvertisementResponse)
def create_advertisement(
    ad_data: AdvertisementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new advertisement"""
    # Validate input
    if len(ad_data.name.split()) > 6:
        raise HTTPException(
            status_code=400,
            detail="Name should be maximum 6 words for headline compliance"
        )
    
    if len(ad_data.cta_text.split()) > 3:
        raise HTTPException(
            status_code=400,
            detail="CTA text should be maximum 3 words"
        )
    
    # Generate text content
    text_data = generate_advertisement_text(ad_data)
    
    # Generate image
    try:
        image_filename = generate_advertisement_image(ad_data, text_data)
        image_url = f"/files/{image_filename}"
    except Exception as e:
        print(f"Error generating image: {e}")
        image_filename = None
        image_url = None
    
    # Create advertisement record
    advertisement = Advertisement(
        user_id=current_user.id,
        item_type=ad_data.item_type,
        name=ad_data.name,
        category=ad_data.category,
        company_name=ad_data.company_name,
        price=ad_data.price,
        benefit=ad_data.benefit,
        cta_text=ad_data.cta_text,
        headline=text_data["headline"],
        description=text_data["description"],
        offer=text_data["offer"],
        image_filename=image_filename,
        image_url=image_url
    )
    
    db.add(advertisement)
    db.commit()
    db.refresh(advertisement)
    
    return advertisement

@router.get("/", response_model=List[AdvertisementResponse])
def get_user_advertisements(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's advertisements"""
    query = db.query(Advertisement).filter(Advertisement.user_id == current_user.id)
    
    if status:
        query = query.filter(Advertisement.status == status)
    
    advertisements = query.offset(skip).limit(limit).all()
    return advertisements

@router.get("/public/all", response_model=List[AdvertisementResponse])
def get_public_advertisements(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    item_type: Optional[str] = None,
    is_picture_only: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get public advertisements (for browsing)"""
    query = db.query(Advertisement).filter(Advertisement.status == "active")
    
    if category:
        query = query.filter(Advertisement.category == category)
    
    if item_type:
        query = query.filter(Advertisement.item_type == item_type)
    
    if is_picture_only is not None:
        query = query.filter(Advertisement.is_picture_only == is_picture_only)
    
    advertisements = query.offset(skip).limit(limit).all()
    return advertisements

@router.get("/{ad_id}", response_model=AdvertisementResponse)
def get_advertisement(
    ad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific advertisement"""
    advertisement = db.query(Advertisement).filter(
        Advertisement.id == ad_id,
        Advertisement.user_id == current_user.id
    ).first()
    
    if not advertisement:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    return advertisement

@router.put("/{ad_id}", response_model=AdvertisementResponse)
def update_advertisement(
    ad_id: int,
    ad_update: AdvertisementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update advertisement"""
    advertisement = db.query(Advertisement).filter(
        Advertisement.id == ad_id,
        Advertisement.user_id == current_user.id
    ).first()
    
    if not advertisement:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    # Update fields
    update_data = ad_update.dict(exclude_unset=True)
    
    # If content fields are updated, regenerate text and image
    content_fields = ["item_type", "name", "category", "company_name", "price", "benefit", "cta_text"]
    if any(field in update_data for field in content_fields):
        
        # Validate if name or cta_text are being updated
        if "name" in update_data and len(update_data["name"].split()) > 6:
            raise HTTPException(
                status_code=400,
                detail="Name should be maximum 6 words for headline compliance"
            )
        
        if "cta_text" in update_data and len(update_data["cta_text"].split()) > 3:
            raise HTTPException(
                status_code=400,
                detail="CTA text should be maximum 3 words"
            )
        
        # Update advertisement fields first
        for field, value in update_data.items():
            setattr(advertisement, field, value)
        
        # Create updated data object for regeneration
        updated_ad_data = AdvertisementCreate(
            item_type=advertisement.item_type,
            name=advertisement.name,
            category=advertisement.category,
            company_name=advertisement.company_name,
            price=advertisement.price,
            benefit=advertisement.benefit,
            cta_text=advertisement.cta_text
        )
        
        # Regenerate text content
        text_data = generate_advertisement_text(updated_ad_data)
        advertisement.headline = text_data["headline"]
        advertisement.description = text_data["description"]
        advertisement.offer = text_data["offer"]
        
        # Regenerate image
        try:
            # Delete old image if exists
            if advertisement.image_filename:
                old_image_path = os.path.join("uploads", advertisement.image_filename)
                if os.path.exists(old_image_path):
                    os.remove(old_image_path)
            
            # Generate new image
            image_filename = generate_advertisement_image(updated_ad_data, text_data)
            advertisement.image_filename = image_filename
            advertisement.image_url = f"/files/{image_filename}"
        except Exception as e:
            print(f"Error regenerating image: {e}")
    else:
        # Only update non-content fields
        for field, value in update_data.items():
            setattr(advertisement, field, value)
    
    db.commit()
    db.refresh(advertisement)
    
    return advertisement

@router.delete("/{ad_id}")
def delete_advertisement(
    ad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete advertisement"""
    advertisement = db.query(Advertisement).filter(
        Advertisement.id == ad_id,
        Advertisement.user_id == current_user.id
    ).first()
    
    if not advertisement:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    # Delete image file if exists
    if advertisement.image_filename:
        image_path = os.path.join("uploads", advertisement.image_filename)
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.delete(advertisement)
    db.commit()
    
    return {"message": "Advertisement deleted successfully"}

@router.post("/{ad_id}/view")
def track_advertisement_view(
    ad_id: int,
    db: Session = Depends(get_db)
):
    """Track advertisement view (public endpoint)"""
    advertisement = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    
    if not advertisement:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    advertisement.views += 1
    db.commit()
    
    return {"message": "View tracked"}

@router.post("/{ad_id}/click")
def track_advertisement_click(
    ad_id: int,
    db: Session = Depends(get_db)
):
    """Track advertisement click (public endpoint)"""
    advertisement = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    
    if not advertisement:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    advertisement.clicks += 1
    db.commit()
    
    return {"message": "Click tracked"}
