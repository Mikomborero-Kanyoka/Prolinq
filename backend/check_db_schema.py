#!/usr/bin/env python3
"""
Check database schema to understand table structure
"""

import sqlite3
import os

def check_schema():
    """Check the schema of all tables"""
    
    db_path = "prolinq.db"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Checking database schema...")
        print("=" * 60)
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table_name, in tables:
            print(f"\n📋 Table: {table_name}")
            print("-" * 40)
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            for col in columns:
                col_id, name, type_name, not_null, default_val, pk = col
                pk_str = " (PRIMARY KEY)" if pk else ""
                null_str = " NOT NULL" if not_null else ""
                default_str = f" DEFAULT {default_val}" if default_val else ""
                
                print(f"   {name}: {type_name}{null_str}{default_str}{pk_str}")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Schema check completed!")
        
    except Exception as e:
        print(f"❌ Error checking schema: {str(e)}")

if __name__ == "__main__":
    check_schema()
