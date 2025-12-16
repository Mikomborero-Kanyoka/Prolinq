#!/usr/bin/env python3
"""Delete all ads from the running database"""

from database import SessionLocal
from models import Advertisement

db = SessionLocal()

try:
    # Count before
    count_before = db.query(Advertisement).count()
    print(f"📊 Ads before: {count_before}")
    
    # Delete all
    deleted = db.query(Advertisement).delete(synchronize_session=False)
    db.commit()
    
    # Count after
    count_after = db.query(Advertisement).count()
    print(f"✅ Deleted: {deleted}")
    print(f"📊 Ads after: {count_after}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()