#!/usr/bin/env python3
"""
Debug script to check notifications in the database with correct table name
"""
import sqlite3
from datetime import datetime

DB_PATH = 'prolinq.db'

def check_notifications():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("=" * 80)
    print("DATABASE NOTIFICATIONS DEBUG")
    print("=" * 80)
    
    # Get all users
    print("\n📋 ALL USERS IN DATABASE:")
    print("-" * 80)
    cursor.execute("SELECT id, email, username FROM users")
    users = cursor.fetchall()
    for user in users:
        print(f"  ID: {user['id']:<5} | Email: {user['email']:<30} | Username: {user['username']}")
    
    if not users:
        print("  ❌ No users found!")
        return
    
    # Check total notifications
    cursor.execute("SELECT COUNT(*) as total FROM notifications")
    total_count = cursor.fetchone()['total']
    print(f"\n📊 TOTAL NOTIFICATIONS IN DATABASE: {total_count}")
    
    # For each user, show their notifications
    for user in users:
        user_id = user['id']
        print(f"\n{'='*80}")
        print(f"USER: {user['email']} (ID: {user_id})")
        print(f"{'='*80}")
        
        # Notifications for this user
        print(f"\n🔔 NOTIFICATIONS for user {user_id}:")
        print("-" * 80)
        cursor.execute("""
            SELECT id, title, message, is_read, created_at 
            FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        notifications = cursor.fetchall()
        
        if notifications:
            for notif in notifications:
                read_status = "✅ READ" if notif['is_read'] else "❌ UNREAD"
                print(f"  [{read_status}] {notif['title']}: {notif['message'][:50]}")
                print(f"         Created: {notif['created_at']}")
                print(f"         ID: {notif['id']}")
        else:
            print("  No notifications found")
        
        # Count unread notifications
        cursor.execute("""
            SELECT COUNT(*) as count FROM notifications 
            WHERE user_id = ? AND is_read = 0
        """, (user_id,))
        unread_notif_count = cursor.fetchone()['count']
        print(f"  📊 UNREAD NOTIFICATIONS: {unread_notif_count}")
    
    # Show all notifications in database
    print(f"\n{'='*80}")
    print("ALL NOTIFICATIONS IN DATABASE:")
    print(f"{'='*80}")
    cursor.execute("""
        SELECT n.id, n.user_id, u.email, n.title, n.message, n.is_read, n.created_at 
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
    """)
    all_notifications = cursor.fetchall()
    
    for notif in all_notifications:
        read_status = "✅ READ" if notif['is_read'] else "❌ UNREAD"
        print(f"  [{read_status}] User {notif['user_id']} ({notif['email']}): {notif['title']}")
        print(f"         Message: {notif['message'][:50]}")
        print(f"         Created: {notif['created_at']}")
        print(f"         ID: {notif['id']}")
        print()
    
    conn.close()
    print("\n" + "=" * 80)

if __name__ == '__main__':
    try:
        check_notifications()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
