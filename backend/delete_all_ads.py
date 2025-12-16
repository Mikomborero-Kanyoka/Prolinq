#!/usr/bin/env python3
"""Delete all advertisements from the database"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import Base, engine
from models import Advertisement

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Get count before deletion
    count_before = db.query(Advertisement).count()
    print(f"📊 Total ads before deletion: {count_before}")
    
    # Delete all advertisements
    db.query(Advertisement).delete(synchronize_session=False)
    db.commit()
    
    # Verify
    count_after = db.query(Advertisement).count()
    print(f"✅ Total ads after deletion: {count_after}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()