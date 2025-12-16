from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: str
    username: str
    full_name: str

class UserCreate(UserBase):
    password: str
    primary_role: Optional[str] = "talent"

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    professional_title: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None
    profile_picture: Optional[str] = None
    profile_photo: Optional[str] = None
    portfolio_link: Optional[str] = None
    portfolio_images: Optional[str] = None
    resume_images: Optional[str] = None
    cover_image: Optional[str] = None
    primary_role: Optional[str] = None  # Allow role changes
    # Employer-specific fields
    company_name: Optional[str] = None
    company_email: Optional[str] = None
    company_cell: Optional[str] = None
    company_address: Optional[str] = None

class UserResponse(UserBase):
    id: int
    professional_title: Optional[str]
    location: Optional[str]
    primary_role: Optional[str]
    bio: Optional[str]
    skills: Optional[str]
    hourly_rate: Optional[float]
    profile_picture: Optional[str]
    profile_photo: Optional[str]
    portfolio_link: Optional[str]
    portfolio_images: Optional[str]
    resume_images: Optional[str]
    cover_image: Optional[str]
    company_name: Optional[str]
    company_email: Optional[str]
    company_cell: Optional[str]
    company_address: Optional[str]
    is_admin: bool = False
    is_verified: bool = False
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

# Job Schemas
class JobBase(BaseModel):
    title: str
    description: str
    category: str
    skills_required: str

class JobCreate(JobBase):
    budget: Optional[float] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    budget_currency: Optional[str] = "USD"
    experience_required: Optional[str] = None
    qualifications: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    is_remote: Optional[bool] = False
    positions: Optional[int] = 1
    deadline: Optional[datetime] = None
    is_picture_only: Optional[bool] = False
    picture_filename: Optional[str] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    status: Optional[str] = None
    experience_required: Optional[str] = None
    qualifications: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    is_remote: Optional[bool] = None
    positions: Optional[int] = None

class JobResponse(JobBase):
    id: int
    budget: Optional[float] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    budget_currency: Optional[str] = None
    experience_required: Optional[str] = None
    qualifications: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    is_remote: Optional[bool] = None
    positions: Optional[int] = None
    deadline: Optional[datetime] = None
    creator_id: int
    status: str
    created_at: datetime
    is_picture_only: Optional[bool] = False
    picture_filename: Optional[str] = None

    class Config:
        from_attributes = True

# Application Schemas
class ApplicationBase(BaseModel):
    cover_letter: Optional[str] = None
    proposed_price: Optional[float] = None

class ApplicationCreate(ApplicationBase):
    job_id: int

class ApplicationUpdate(BaseModel):
    status: str

class TalentInfo(BaseModel):
    """Simplified talent information for applications"""
    id: int
    full_name: str
    profile_photo: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None

    class Config:
        from_attributes = True

class ApplicationResponse(ApplicationBase):
    id: int
    job_id: int
    applicant_id: int
    status: str
    created_at: datetime
    applicant: Optional[TalentInfo] = None

    class Config:
        from_attributes = True

# Message Schemas
class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    receiver_id: int
    reply_to_id: Optional[int] = None
    message_type: Optional[str] = "text"

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    is_read: bool
    reply_to_id: Optional[int] = None
    message_type: Optional[str] = "text"
    created_at: datetime

    class Config:
        from_attributes = True

# Admin Message Schemas
class AdminMessageCreate(BaseModel):
    receiver_id: int
    content: str

class BulkMessageRequest(BaseModel):
    content: str  # Template with {{placeholders}}
    campaign_name: str  # Human-readable name for the campaign
    recipient_ids: Optional[list[int]] = None  # Specific users
    filter_role: Optional[str] = None  # Filter by primary_role (talent, employer, client)
    filter_verified: Optional[bool] = None  # Filter by verification status
    include_all: bool = False  # Send to all users

class AdminMessageResponse(BaseModel):
    id: int
    admin_id: int
    receiver_id: int
    content: str
    is_bulk: bool
    bulk_campaign_id: Optional[str] = None
    bulk_campaign_name: Optional[str] = None
    is_read: bool
    is_deleted_by_user: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class BulkMessageResponse(BaseModel):
    campaign_id: str
    campaign_name: str
    total_sent: int
    success_count: int
    failed_count: int
    timestamp: datetime

# Advertisement Schemas
class AdvertisementBase(BaseModel):
    item_type: str
    name: str
    category: str
    company_name: str
    price: Optional[str] = None
    benefit: str
    cta_text: str
    cta_url: Optional[str] = None

class AdvertisementCreate(AdvertisementBase):
    is_picture_only: Optional[bool] = False
    picture_filename: Optional[str] = None

class AdvertisementUpdate(BaseModel):
    item_type: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    company_name: Optional[str] = None
    price: Optional[str] = None
    benefit: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    status: Optional[str] = None

class AdvertisementResponse(AdvertisementBase):
    id: int
    user_id: int
    headline: str
    description: str
    offer: Optional[str] = None
    image_filename: Optional[str] = None
    image_url: Optional[str] = None
    is_picture_only: Optional[bool] = False
    picture_filename: Optional[str] = None
    status: str
    views: int
    clicks: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Auth Response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
