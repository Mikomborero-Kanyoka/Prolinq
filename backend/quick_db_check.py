#!/usr/bin/env python3
import sqlite3

DB_PATH = 'prolinq.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("=== USERS ===")
cursor.execute("SELECT id, email, username FROM users LIMIT 5")
for row in cursor.fetchall():
    print(f"ID: {row[0]}, Email: {row[1]}, Username: {row[2]}")

print("\n=== NOTIFICATIONS ===")
cursor.execute("SELECT id, user_id, title, is_read FROM notifications LIMIT 10")
for row in cursor.fetchall():
    print(f"ID: {row[0]}, User: {row[1]}, Title: {row[2]}, Read: {row[3]}")

print("\n=== UNREAD NOTIFICATION COUNT ===")
cursor.execute("SELECT user_id, COUNT(*) as unread_count FROM notifications WHERE is_read = 0 GROUP BY user_id")
for row in cursor.fetchall():
    print(f"User {row[0]}: {row[1]} unread notifications")

print("\n=== MESSAGES ===")
cursor.execute("SELECT id, sender_id, receiver_id, is_read FROM messages LIMIT 10")
for row in cursor.fetchall():
    print(f"ID: {row[0]}, From: {row[1]}, To: {row[2]}, Read: {row[3]}")

print("\n=== UNREAD MESSAGES COUNT ===")
cursor.execute("SELECT receiver_id, COUNT(*) as unread_count FROM messages WHERE is_read = 0 GROUP BY receiver_id")
for row in cursor.fetchall():
    print(f"User {row[0]}: {row[1]} unread messages")

conn.close()