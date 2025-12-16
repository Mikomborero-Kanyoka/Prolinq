#!/usr/bin/env python3
import sqlite3
from datetime import datetime

DB_PATH = 'prolinq.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("📝 Creating test notifications...")
print("=" * 60)

# Get users
cursor.execute("SELECT id, email FROM users LIMIT 5")
users = cursor.fetchall()

for user_id, email in users:
    for i in range(3):
        now = datetime.utcnow().isoformat()
        cursor.execute("""
            INSERT INTO notifications 
            (user_id, title, message, type, is_read, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            f"Test Notification #{i+1}",
            f"This is test notification #{i+1} for debugging",
            "test",
            0,  # is_read = False
            now,
            now
        ))
        print(f"✅ Created test notification #{i+1} for user {user_id} ({email})")

conn.commit()

print("\n" + "=" * 60)
print("✅ Test notifications created successfully!")

# Verify
print("\n📊 UNREAD NOTIFICATIONS BY USER:")
cursor.execute("SELECT user_id, COUNT(*) as count FROM notifications WHERE is_read = 0 GROUP BY user_id")
for user_id, count in cursor.fetchall():
    print(f"  User {user_id}: {count} unread notifications")

conn.close()