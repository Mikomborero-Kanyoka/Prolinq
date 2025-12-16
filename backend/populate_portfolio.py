import sqlite3
import json
import os

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# List available uploads
uploads_dir = 'uploads'
files = os.listdir(uploads_dir) if os.path.exists(uploads_dir) else []
portfolio_files = [f for f in files if f.startswith('portfolio_')]

print(f"Available portfolio files: {portfolio_files}")

# If we have portfolio files, assign them to users
if portfolio_files:
    # User 1 gets first 2 portfolio images
    if len(portfolio_files) >= 1:
        portfolio_user1 = json.dumps(portfolio_files[:2])
        cursor.execute("UPDATE users SET portfolio_images = ? WHERE id = 1", (portfolio_user1,))
        print(f"User 1: {portfolio_files[:2]}")
    
    # User 3 gets remaining portfolio images
    if len(portfolio_files) > 2:
        portfolio_user3 = json.dumps(portfolio_files[2:])
        cursor.execute("UPDATE users SET portfolio_images = ? WHERE id = 3", (portfolio_user3,))
        print(f"User 3: {portfolio_files[2:]}")
else:
    print("No portfolio files found. You can upload them through the UI or add placeholders.")

conn.commit()

# Verify
cursor.execute("SELECT id, full_name, portfolio_images FROM users WHERE portfolio_images IS NOT NULL")
users = cursor.fetchall()

print("\nUsers with portfolio images:")
for user_id, name, portfolio_json in users:
    portfolio_list = json.loads(portfolio_json)
    print(f"User {user_id}: {name}")
    print(f"  Portfolio images: {portfolio_list}")

conn.close()
print("\n✅ Portfolio data verified!")