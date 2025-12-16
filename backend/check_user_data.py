import sqlite3
import json

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# Get first user
cursor.execute("SELECT id, full_name, professional_title, location, cover_image, company_name FROM users LIMIT 1")
user = cursor.fetchone()

if user:
    user_id, full_name, prof_title, location, cover_img, company = user
    print(f"\nFirst user in database:")
    print(f"  ID: {user_id}")
    print(f"  Name: {full_name}")
    print(f"  Professional Title: {prof_title}")
    print(f"  Location: {location}")
    print(f"  Cover Image: {cover_img}")
    print(f"  Company Name: {company}")
else:
    print("No users found")

# Count users
cursor.execute("SELECT COUNT(*) FROM users")
count = cursor.fetchone()[0]
print(f"\nTotal users: {count}")

conn.close()