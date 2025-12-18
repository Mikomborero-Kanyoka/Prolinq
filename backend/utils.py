import jwt
import os
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))  # 30 days in minutes

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        print(f"🔍 Decoding token with SECRET_KEY: {SECRET_KEY[:20]}...")
        print(f"🔍 Algorithm: {ALGORITHM}")
        print(f"🔍 Token preview: {token[:20]}...")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"✅ Token decoded successfully for user: {payload.get('sub', 'unknown')}")
        return payload
    except jwt.ExpiredSignatureError:
        print("⏰ Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"🚨 Invalid token error: {e}")
        print(f"🔑 Using SECRET_KEY: {SECRET_KEY[:20]}...")
        print(f"🔑 Full SECRET_KEY length: {len(SECRET_KEY)}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error decoding token: {type(e).__name__}: {e}")
        return None

def verify_secret_key():
    """Verify that SECRET_KEY is properly set"""
    if SECRET_KEY == "your-secret-key-change-this-in-production":
        print("⚠️ WARNING: Using default SECRET_KEY - this will cause authentication issues!")
        return False
    if len(SECRET_KEY) < 20:
        print("⚠️ WARNING: SECRET_KEY is too short - this is insecure!")
        return False
    print(f"✅ SECRET_KEY is properly configured (length: {len(SECRET_KEY)})")
    return True
