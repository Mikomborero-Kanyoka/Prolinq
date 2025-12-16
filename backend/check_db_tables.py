#!/usr/bin/env python3
"""Check database tables"""

import sqlite3
import os

db_path = "prolinq.db"

if not os.path.exists(db_path):
    print(f"❌ Database not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print("📊 Available tables in database:")
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  - {table_name}: {count} rows")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")