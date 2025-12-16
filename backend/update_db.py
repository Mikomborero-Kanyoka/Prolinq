#!/usr/bin/env python3
"""Script to manually update database schema"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'prolinq.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if resume_images column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'resume_images' not in columns:
        print("Adding resume_images column to users table...")
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN resume_images TEXT NULL
        """)
        print("✓ resume_images column added successfully")
    else:
        print("✓ resume_images column already exists")
    
    conn.commit()
    print("✓ Database updated successfully")
    
except sqlite3.OperationalError as e:
    print(f"✗ Error: {e}")
    conn.rollback()
except Exception as e:
    print(f"✗ Unexpected error: {e}")
    conn.rollback()
finally:
    conn.close()