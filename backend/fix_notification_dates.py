#!/usr/bin/env python3
"""
Fix notification dates to use current date instead of future dates
"""
import sqlite3
from datetime import datetime

DB_PATH = 'prolinq.db'

def fix_notification_dates():
    """Update notification dates to current date"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔧 Fixing Notification Dates")
        print("=" * 50)
        
        # Update notifications to use current date
        cursor.execute("""
            UPDATE notifications 
            SET created_at = ?, updated_at = ?
            WHERE created_at > ?
        """, (
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        updated_count = cursor.rowcount
        conn.commit()
        
        print(f"✅ Updated {updated_count} notifications to use current date")
        
        # Show current notifications
        cursor.execute("""
            SELECT user_id, title, type, created_at 
            FROM notifications 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        recent = cursor.fetchall()
        
        print(f"\n📋 Recent Notifications (with current dates):")
        print("   User | Title | Type | Created")
        print("   -----|-------|------|--------")
        for notif in recent:
            created_date = notif[4][:19]  # Just show date part
            print(f"   {notif[0]:<4} | {notif[1][:20]:<20} | {notif[2]:<8} | {created_date}")
        
        conn.close()
        print(f"\n🎉 Notification dates fixed successfully!")
        print("\n💡 All notifications now use current date")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_notification_dates()
