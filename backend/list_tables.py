#!/usr/bin/env python3
import sqlite3

DB_PATH = 'prolinq.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print("=== TABLES IN DATABASE ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
for row in cursor.fetchall():
    print(f"  - {row[0]}")

conn.close()