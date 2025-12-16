#!/usr/bin/env python3
"""Check both database files"""

import sqlite3
import os

db_paths = [
    "prolinq.db",  # Current/backend dir
    "../prolinq.db"  # Root dir
]

for db_path in db_paths:
    if not os.path.exists(db_path):
        print(f"❌ {db_path} - NOT FOUND")
        continue
    
    print(f"\n📊 Checking: {db_path}")
    print(f"   Path: {os.path.abspath(db_path)}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        
        print(f"   Tables found: {len(tables)}")
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"     - {table_name}: {count} rows")
        
        # Specifically check for advertisements
        cursor.execute("SELECT COUNT(*) FROM advertisements")
        ad_count = cursor.fetchone()[0]
        print(f"   ✅ Advertisements: {ad_count} ads found")
        
        conn.close()
        
    except Exception as e:
        print(f"   Error: {e}")