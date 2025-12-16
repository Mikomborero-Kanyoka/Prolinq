#!/usr/bin/env python3
"""Delete all advertisements from the database directly"""

import sqlite3
import os

db_path = "prolinq.db"

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get count before deletion
    cursor.execute("SELECT COUNT(*) FROM advertisements")
    count_before = cursor.fetchone()[0]
    print(f"📊 Total ads before deletion: {count_before}")
    
    # Delete all advertisements
    cursor.execute("DELETE FROM advertisements")
    conn.commit()
    
    # Get count after deletion
    cursor.execute("SELECT COUNT(*) FROM advertisements")
    count_after = cursor.fetchone()[0]
    print(f"✅ Deleted {count_before} advertisements")
    print(f"✅ Total ads after deletion: {count_after}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")