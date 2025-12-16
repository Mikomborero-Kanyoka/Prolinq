#!/usr/bin/env python3
"""
Clean up old/dummy notification data
Removes notifications that are not from the new system
"""

import sqlite3
from datetime import datetime

DB_PATH = 'prolinq.db'

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def get_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def show_before_stats():
    """Show statistics before cleanup"""
    print_header("📊 STATISTICS BEFORE CLEANUP")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Total count
        cursor.execute("SELECT COUNT(*) as count FROM notifications")
        total = cursor.fetchone()['count']
        print(f"📌 Total notifications: {total}")
        
        # By type
        cursor.execute("""
            SELECT type, COUNT(*) as count 
            FROM notifications 
            GROUP BY type 
            ORDER BY count DESC
        """)
        print("\n📋 By type:")
        for row in cursor.fetchall():
            notif_type = row['type'] or 'general'
            print(f"   - {notif_type}: {row['count']}")
        
        # By status
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read
            FROM notifications
        """)
        stats = cursor.fetchone()
        print(f"\n📊 By status:")
        print(f"   - Unread: {stats['unread'] or 0}")
        print(f"   - Read: {stats['read'] or 0}")
        
    finally:
        conn.close()

def cleanup_dummy_notifications():
    """Remove old/dummy notification types"""
    
    print_header("🗑️ CLEANING UP OLD NOTIFICATION DATA")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Identify old notification types that shouldn't exist in the new system
        old_types = [
            'profile_view',
            'interview_scheduled',
            'job_recommendation_old',  # Old recommendation format
            'general',  # Generic old notifications
        ]
        
        # Show what will be deleted
        for old_type in old_types:
            cursor.execute("SELECT COUNT(*) as count FROM notifications WHERE type = ?", (old_type,))
            count = cursor.fetchone()['count']
            if count > 0:
                print(f"❌ Found {count} '{old_type}' notifications - will delete")
        
        # Delete old types
        placeholders = ','.join('?' * len(old_types))
        delete_query = f"DELETE FROM notifications WHERE type IN ({placeholders})"
        cursor.execute(delete_query, old_types)
        
        deleted_count = cursor.rowcount
        conn.commit()
        
        print(f"\n✅ Deleted {deleted_count} old notification(s)")
        
        return deleted_count
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        conn.rollback()
        return 0
    finally:
        conn.close()

def delete_all_notifications(confirm=False):
    """Delete ALL notifications (use with caution)"""
    
    if not confirm:
        print("\n⚠️  DANGER: This will delete ALL notifications!")
        response = input("Type 'DELETE ALL' to confirm: ")
        if response != "DELETE ALL":
            print("❌ Cancelled")
            return 0
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM notifications")
        deleted = cursor.rowcount
        conn.commit()
        print(f"✅ Deleted all {deleted} notifications")
        return deleted
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        return 0
    finally:
        conn.close()

def show_after_stats():
    """Show statistics after cleanup"""
    print_header("📊 STATISTICS AFTER CLEANUP")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Total count
        cursor.execute("SELECT COUNT(*) as count FROM notifications")
        total = cursor.fetchone()['count']
        print(f"📌 Total notifications: {total}")
        
        if total == 0:
            print("\n✅ Database is clean! No notifications.")
        else:
            # By type
            cursor.execute("""
                SELECT type, COUNT(*) as count 
                FROM notifications 
                GROUP BY type 
                ORDER BY count DESC
            """)
            print("\n📋 By type:")
            for row in cursor.fetchall():
                notif_type = row['type'] or 'general'
                print(f"   - {notif_type}: {row['count']}")
        
        # By status
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read
            FROM notifications
        """)
        stats = cursor.fetchone()
        print(f"\n📊 By status:")
        print(f"   - Unread: {stats['unread'] or 0}")
        print(f"   - Read: {stats['read'] or 0}")
        
    finally:
        conn.close()

def main():
    """Main cleanup function"""
    print_header("🧹 NOTIFICATION CLEANUP TOOL")
    
    print("This tool helps clean up old/dummy notification data.")
    print("The new notification system creates these types:")
    print("   ✅ job_application")
    print("   ✅ application_update")
    print("   ✅ new_message")
    print("   ✅ review_received")
    print("   ✅ job_completed")
    print("   ✅ job_recommendation")
    print("   ✅ admin_message")
    
    print("\nOld notification types that should be removed:")
    print("   ❌ profile_view")
    print("   ❌ interview_scheduled")
    print("   ❌ job_recommendation_old")
    print("   ❌ general (untyped)")
    
    # Show before state
    show_before_stats()
    
    # Ask user what to do
    print("\n" + "="*60)
    print("What would you like to do?")
    print("  1. Clean up old notification types (recommended)")
    print("  2. Delete ALL notifications (caution!)")
    print("  3. Exit (no changes)")
    print("="*60)
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        cleaned = cleanup_dummy_notifications()
        if cleaned > 0:
            show_after_stats()
            print("\n✅ Cleanup complete! Old notifications removed.")
        else:
            print("\n✅ No old notifications to clean up.")
    
    elif choice == "2":
        deleted = delete_all_notifications()
        if deleted > 0:
            show_after_stats()
            print("\n✅ All notifications deleted.")
        else:
            print("\n❌ Deletion cancelled or failed.")
    
    elif choice == "3":
        print("\n✅ No changes made. Exiting.")
    
    else:
        print("\n❌ Invalid choice. Exiting.")

if __name__ == "__main__":
    main()