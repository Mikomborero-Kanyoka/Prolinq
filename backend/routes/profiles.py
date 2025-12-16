from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserResponse, UserUpdate
from auth import get_current_user

router = APIRouter(prefix="/api/profiles", tags=["profiles"])

@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/me/profile", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me/profile", response_model=UserResponse)
def update_my_profile(profile_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user