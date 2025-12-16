from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import hashlib
import secrets

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    professional_title = Column(String, nullable=True)  # Job title/Professional title
    location = Column(String, nullable=True)  # User location
    primary_role = Column(String, nullable=True, default="talent")  # talent, employer, client
    profile_picture = Column(String, nullable=True)
    profile_photo = Column(String, nullable=True)  # Profile photo filename
    cover_image = Column(String, nullable=True)  # Cover image filename
    portfolio_images = Column(Text, nullable=True)  # JSON array of portfolio image filenames (freelancers)
    resume_images = Column(Text, nullable=True)  # JSON array of resume image filenames (job seekers)
    bio = Column(Text, nullable=True)
    skills = Column(String, nullable=True)
    portfolio_link = Column(String, nullable=True)  # Works for both
    hourly_rate = Column(Float, nullable=True)  # For freelancers
    # Employer-specific fields
    company_name = Column(String, nullable=True)
    company_email = Column(String, nullable=True)
    company_cell = Column(String, nullable=True)
    company_address = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI matching fields
    profile_embedding = Column(Text, nullable=True)  # Store user profile embedding as JSON string
    embedding_updated_at = Column(DateTime, nullable=True)  # Track when embedding was last updated

    # Relationships
    jobs = relationship("Job", back_populates="creator")
    applications = relationship("Application", back_populates="applicant")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user")

    @staticmethod
    def hash_password(password):
        """Hash password using SHA256"""
        salt = secrets.token_hex(8)
        hashed = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}${hashed}"

    def verify_password(self, password):
        """Verify password against hash"""
        try:
            salt, hashed = self.hashed_password.split('$')
            return hashlib.sha256((password + salt).encode()).hexdigest() == hashed
        except:
            return False


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    budget = Column(Float, nullable=True)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    budget_currency = Column(String, default="USD")
    category = Column(String)
    skills_required = Column(String)
    experience_required = Column(Text, nullable=True)  # Experience requirements
    qualifications = Column(Text, nullable=True)  # Required qualifications
    responsibilities = Column(Text, nullable=True)  # Job responsibilities
    benefits = Column(Text, nullable=True)  # Job benefits
    job_type = Column(String, nullable=True)  # full_time, part_time, contract, gig, freelance
    location = Column(String, nullable=True)
    is_remote = Column(Boolean, default=False)
    positions = Column(Integer, nullable=True, default=1)  # Number of available positions
    deadline = Column(DateTime, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="open")
    payment_status = Column(String, default="pending")  # pending, paid, disputed, refunded
    final_amount = Column(Float, nullable=True)
    completion_notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    talent_rating = Column(Integer, nullable=True)  # Rating given by employer to talent (1-5)
    employer_rating = Column(Integer, nullable=True)  # Rating given by talent to employer (1-5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Picture-only job fields
    is_picture_only = Column(Boolean, default=False)  # True if this is a picture-only job
    picture_filename = Column(String, nullable=True)  # Filename of the picture
    
    # AI matching fields
    job_embedding = Column(Text, nullable=True)  # Store job embedding as JSON string
    embedding_updated_at = Column(DateTime, nullable=True)  # Track when embedding was last updated

    # Relationships
    creator = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    applicant_id = Column(Integer, ForeignKey("users.id"))
    cover_letter = Column(Text)
    proposed_price = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="applications")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    reply_to_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    message_type = Column(String, nullable=True, default="text")  # text, location, media, file
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    replied_to = relationship("Message", remote_side=[id], foreign_keys=[reply_to_id])


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # User giving the review
    reviewed_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # User being reviewed
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job = relationship("Job")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewed_user = relationship("User", foreign_keys=[reviewed_user_id])


class AdminMessage(Base):
    __tablename__ = "admin_messages"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text)  # Template content with potential {{placeholders}}
    is_bulk = Column(Boolean, default=False)
    bulk_campaign_id = Column(String, nullable=True)  # UUID to group bulk messages
    bulk_campaign_name = Column(String, nullable=True)  # Human-readable campaign name
    is_read = Column(Boolean, default=False)
    is_deleted_by_user = Column(Boolean, default=False)  # Soft delete from user perspective
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    admin = relationship("User", foreign_keys=[admin_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=True, default="general")  # admin_message, job_application, etc.
    is_read = Column(Boolean, default=False)
    data = Column(Text, nullable=True)  # JSON string for additional data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class Advertisement(Base):
    __tablename__ = "advertisements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_type = Column(String, nullable=False)  # Service, Product, Event, Gig, Digital Product
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Technology, Design, Marketing, etc.
    company_name = Column(String, nullable=False)
    price = Column(String, nullable=True)
    benefit = Column(Text, nullable=False)
    cta_text = Column(String, nullable=False)
    cta_url = Column(String, nullable=True)  # External URL for the CTA button
    
    # Generated content
    headline = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    offer = Column(String, nullable=True)
    
    # Image information
    image_filename = Column(String, nullable=True)  # Generated image filename
    image_url = Column(String, nullable=True)  # Full image URL
    
    # Picture-only ad fields
    is_picture_only = Column(Boolean, default=False)  # True if this is a picture-only ad
    picture_filename = Column(String, nullable=True)  # Filename of the uploaded picture
    
    # Status and metadata
    status = Column(String, default="active")  # active, paused, archived
    views = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class EmailQueue(Base):
    """Tracks emails to be sent via SMTP with rate limiting"""
    __tablename__ = "email_queue"
    
    id = Column(Integer, primary_key=True, index=True)
    to = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=False)
    text_content = Column(Text, nullable=False)
    html_content = Column(Text, nullable=True)  # HTML version of email
    email_type = Column(String, nullable=False)  # welcome, daily_jobs, promotional, test
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional user reference
    status = Column(String, default="pending", index=True)  # pending, sent, failed, retry
    retry_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    sent_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class EmailAd(Base):
    """Stores promotional ads for daily emails"""
    __tablename__ = "email_ads"
    
    id = Column(Integer, primary_key=True, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Admin who created it
    title = Column(String, nullable=False)
    ad_text = Column(Text, nullable=False)  # Promotional text
    ad_link = Column(String, nullable=True)  # URL for "More info"
    is_active = Column(Boolean, default=True, index=True)
    impressions = Column(Integer, default=0)  # How many times shown in emails
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])


class EmailMetrics(Base):
    """Stores daily email statistics"""
    __tablename__ = "email_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow, unique=True, index=True)  # Date of metrics
    total_sent = Column(Integer, default=0)  # Total emails sent
    total_welcome = Column(Integer, default=0)  # Welcome emails sent
    total_job_recommendations = Column(Integer, default=0)  # Job recommendation emails
    total_ads_shown = Column(Integer, default=0)  # Number of ads included in emails
    total_failed = Column(Integer, default=0)  # Failed emails
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships - none needed, this is stats only
