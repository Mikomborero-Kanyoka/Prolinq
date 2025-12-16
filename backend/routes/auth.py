from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token
from utils import create_access_token
from services.email_service import EmailService
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])
email_service = EmailService()

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = User.hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        primary_role=user_data.primary_role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send welcome email (only for talent users)
    if db_user.primary_role == "talent":
        try:
            email_service.send_welcome_email(db, db_user)
            logger.info(f"✉️  Welcome email queued for {db_user.email}")
        except Exception as e:
            logger.error(f"❌ Error sending welcome email: {str(e)}")
            # Don't fail registration if email fails
    
    # Create access token (convert id to string - PyJWT requires string subject)
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    # Explicitly convert to UserResponse schema
    user_response = UserResponse.model_validate(db_user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not user.verify_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    print(f"🔑 Backend Login - User found: {user.email}")
    print(f"  is_admin: {user.is_admin}")
    print(f"  is_verified: {user.is_verified}")
    print(f"  is_active: {user.is_active}")
    print(f"  User object attributes: {user.__dict__}")
    
    # Create access token (convert id to string - PyJWT requires string subject)
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Explicitly convert to UserResponse schema
    user_response = UserResponse.model_validate(user)
    print(f"🔑 Converted UserResponse:")
    print(f"  is_admin: {user_response.is_admin}")
    print(f"  is_verified: {user_response.is_verified}")
    print(f"  is_active: {user_response.is_active}")
    
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }
    print(f"🔑 Backend returning response user: {user_response}")
    
    return response_data

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}