#!/usr/bin/env python3
"""Hard delete all ads using direct SQL"""

import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "prolinq.db")

print(f"🗑️  Hard deleting all ads from: {db_path}\n")

if not os.path.exists(db_path):
    print(f"❌ Database not found")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get count before
    cursor.execute("SELECT COUNT(*) FROM advertisements")
    count_before = cursor.fetchone()[0]
    print(f"📊 Ads before: {count_before}")
    
    # Delete ALL ads
    cursor.execute("DELETE FROM advertisements")
    conn.commit()
    
    # Get count after
    cursor.execute("SELECT COUNT(*) FROM advertisements")
    count_after = cursor.fetchone()[0]
    
    print(f"✅ Deleted {count_before} ads")
    print(f"📊 Ads after: {count_after}")
    
    conn.close()
    print("\n✨ Database cleaned!")
    
except Exception as e:
    print(f"❌ Error: {e}")