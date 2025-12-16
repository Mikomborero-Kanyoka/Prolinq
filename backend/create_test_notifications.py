#!/usr/bin/env python3
"""
Create test notifications for users to test the notification system
"""
import sqlite3
import sys
sys.path.insert(0, '.')

DB_PATH = 'prolinq.db'
from models import Notification
from database import SessionLocal
from datetime import datetime

def create_test_notifications():
    db = SessionLocal()
    
    try:
        # Get all users
        cursor = sqlite3.connect(DB_PATH).cursor()
        cursor.execute("SELECT id, email FROM users LIMIT 5")
        users = cursor.fetchall()
        
        print("📝 Creating test notifications for each user...")
        print("=" * 60)
        
        for user_id, email in users:
            # Create 3 test notifications for each user
            for i in range(3):
                notification = Notification(
                    user_id=user_id,
                    title=f"Test Notification #{i+1}",
                    message=f"This is test notification #{i+1} for debugging. Created at {datetime.utcnow()}",
                    type="test",
                    is_read=False
                )
                db.add(notification)
                print(f"  ✅ Created notification for user {user_id} ({email})")
        
        db.commit()
        print("\n" + "=" * 60)
        print("✅ All test notifications created successfully!")
        
        # Show what was created
        print("\n📊 VERIFICATION:")
        cursor.execute("SELECT user_id, COUNT(*) as count FROM notifications WHERE is_read = 0 GROUP BY user_id")
        for user_id, count in cursor.fetchall():
            print(f"  User {user_id}: {count} unread notifications")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    create_test_notifications()