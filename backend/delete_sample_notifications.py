#!/usr/bin/env python3
"""
Delete the 3 sample test notifications from all users
"""
import sqlite3

DB_PATH = 'prolinq.db'

def delete_sample_notifications():
    """Delete sample test notifications"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Delete the 3 sample test notifications
        cursor.execute("DELETE FROM notifications WHERE title LIKE 'Test Notification%'")
        deleted_count = cursor.rowcount
        conn.commit()
        
        print(f"🗑️ Deleted {deleted_count} sample test notifications")
        
        # Show remaining notifications
        cursor.execute("""
            SELECT user_id, COUNT(*) as count 
            FROM notifications 
            GROUP BY user_id 
            ORDER BY user_id
        """)
        remaining = cursor.fetchall()
        
        print("\n📊 Remaining notifications per user:")
        for user_id, count in remaining:
            print(f"  User {user_id}: {count} notifications")
        
        # Show all remaining notifications
        cursor.execute("""
            SELECT n.user_id, u.email, n.title, n.message, n.type, n.created_at
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            ORDER BY n.created_at DESC
        """)
        all_notifications = cursor.fetchall()
        
        print(f"\n📋 All {len(all_notifications)} remaining notifications:")
        for notif in all_notifications:
            print(f"  User {notif[0]} ({notif[1]}): {notif[2]} - {notif[3][:50]}...")
            print(f"    Type: {notif[4]}, Created: {notif[5]}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()
    
    print("\n✅ Sample notifications deletion completed!")

if __name__ == "__main__":
    delete_sample_notifications()
