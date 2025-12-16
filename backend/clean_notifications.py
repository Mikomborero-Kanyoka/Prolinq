#!/usr/bin/env python3
"""
Clean all test and dummy notifications from database
"""
import sqlite3

DB_PATH = 'prolinq.db'

def clean_all_notifications():
    """Delete all test and dummy notifications"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🗑️ Cleaning All Test Notifications")
        print("=" * 50)
        
        # Delete ALL notifications that are test/dummy data
        cursor.execute("""
            DELETE FROM notifications 
            WHERE title LIKE '%Test%' 
               OR title LIKE '%Job Recommendation%' 
               OR title LIKE '%Application Accepted%' 
               OR title LIKE '%Application Update%' 
               OR title LIKE '%Profile Viewed%' 
               OR title LIKE '%Interview Scheduled%' 
               OR title LIKE '%Perfect Skill Match%' 
               OR title LIKE '%Job Expiring%'
        """)
        deleted_count = cursor.rowcount
        conn.commit()
        
        print(f"🗑️ Deleted {deleted_count} test/dummy notifications")
        
        # Show remaining notifications
        cursor.execute("""
            SELECT user_id, COUNT(*) as count,
                   SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
            FROM notifications 
            GROUP BY user_id 
            ORDER BY user_id
        """)
        remaining = cursor.fetchall()
        
        if remaining:
            print(f"\n📊 Remaining notifications by user:")
            print("   User | Total | Unread")
            print("   -----|-------|--------")
            for user_id, total, unread in remaining:
                print(f"   {user_id:<4} | {total:<6} | {unread:<6}")
        else:
            print("\n✅ No notifications remaining in database")
        
        print(f"\n🎉 All test notifications cleaned successfully!")
        print("\n💡 The notification system is now ready for real notifications only")
        print("   - Messages will create notifications")
        print("   - Job applications will create notifications") 
        print("   - Application status changes will create notifications")
        print("   - Users will only see notifications from real platform activity")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    clean_all_notifications()
