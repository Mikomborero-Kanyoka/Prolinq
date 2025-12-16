#!/usr/bin/env python3
"""
Debug script to check notifications and messages in the database
"""
import sqlite3
from datetime import datetime

DB_PATH = 'prolinq.db'

def check_database():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("=" * 80)
    print("DATABASE NOTIFICATION & MESSAGE DEBUG")
    print("=" * 80)
    
    # Get all users
    print("\n📋 ALL USERS IN DATABASE:")
    print("-" * 80)
    cursor.execute("SELECT id, email, username FROM user")
    users = cursor.fetchall()
    for user in users:
        print(f"  ID: {user['id']:<5} | Email: {user['email']:<30} | Username: {user['username']}")
    
    if not users:
        print("  ❌ No users found!")
        return
    
    # For each user, show their notifications and messages
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
            FROM notification 
            WHERE recipient_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        notifications = cursor.fetchall()
        
        if notifications:
            for notif in notifications:
                read_status = "✅ READ" if notif['is_read'] else "❌ UNREAD"
                print(f"  [{read_status}] {notif['title']}: {notif['message'][:50]}")
                print(f"         Created: {notif['created_at']}")
        else:
            print("  No notifications found")
        
        # Count unread notifications
        cursor.execute("""
            SELECT COUNT(*) as count FROM notification 
            WHERE recipient_id = ? AND is_read = 0
        """, (user_id,))
        unread_notif_count = cursor.fetchone()['count']
        print(f"  📊 UNREAD NOTIFICATIONS: {unread_notif_count}")
        
        # Messages where this user is receiver
        print(f"\n💬 MESSAGES RECEIVED by user {user_id}:")
        print("-" * 80)
        cursor.execute("""
            SELECT id, sender_id, content, is_read, created_at 
            FROM message 
            WHERE receiver_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        """, (user_id,))
        messages = cursor.fetchall()
        
        if messages:
            for msg in messages:
                read_status = "✅ READ" if msg['is_read'] else "❌ UNREAD"
                print(f"  [{read_status}] From user {msg['sender_id']}: {msg['content'][:50]}")
                print(f"         Created: {msg['created_at']}")
        else:
            print("  No messages found")
        
        # Count unread messages
        cursor.execute("""
            SELECT COUNT(*) as count FROM message 
            WHERE receiver_id = ? AND is_read = 0
        """, (user_id,))
        unread_msg_count = cursor.fetchone()['count']
        print(f"  📊 UNREAD MESSAGES: {unread_msg_count}")
        
        # Admin messages
        print(f"\n👑 ADMIN MESSAGES RECEIVED by user {user_id}:")
        print("-" * 80)
        cursor.execute("""
            SELECT id, content, is_read, created_at 
            FROM admin_message 
            WHERE recipient_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        """, (user_id,))
        admin_messages = cursor.fetchall()
        
        if admin_messages:
            for msg in admin_messages:
                read_status = "✅ READ" if msg['is_read'] else "❌ UNREAD"
                print(f"  [{read_status}] {msg['content'][:50]}")
                print(f"         Created: {msg['created_at']}")
        else:
            print("  No admin messages found")
        
        # Count unread admin messages
        cursor.execute("""
            SELECT COUNT(*) as count FROM admin_message 
            WHERE recipient_id = ? AND is_read = 0
        """, (user_id,))
        unread_admin_msg_count = cursor.fetchone()['count']
        print(f"  📊 UNREAD ADMIN MESSAGES: {unread_admin_msg_count}")
        
        print(f"\n📊 SUMMARY FOR USER {user_id}:")
        print(f"  🔔 Unread Notifications: {unread_notif_count}")
        print(f"  💬 Unread Messages: {unread_msg_count}")
        print(f"  👑 Unread Admin Messages: {unread_admin_msg_count}")
        print(f"  📈 TOTAL UNREAD: {unread_notif_count + unread_msg_count + unread_admin_msg_count}")
    
    conn.close()
    print("\n" + "=" * 80)

if __name__ == '__main__':
    try:
        check_database()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()