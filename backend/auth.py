from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import Optional
from utils import decode_access_token
from sqlalchemy.orm import Session
from database import get_db
from models import User

security = HTTPBearer()

async def get_current_user(
    credentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    print(f"🔐 Received token: {token[:20] if token else 'EMPTY'}...")
    payload = decode_access_token(token)
    print(f"📦 Decoded payload: {payload}")
    
    if payload is None:
        print("❌ Token decode failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    # Convert user_id from string to integer
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


async def get_admin_user(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user and verify they are an admin"""
    
    if not bool(current_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user
