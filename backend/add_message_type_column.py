#!/usr/bin/env python3
"""
Migration script to add message_type column to messages table
"""

import sqlite3
import sys
from pathlib import Path

def add_message_type_column():
    """Add message_type column to messages table"""
    db_path = Path(__file__).parent / "prolinq.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(messages)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'message_type' in columns:
            print("✅ message_type column already exists in messages table")
            return True
        
        # Add the column
        print("📝 Adding message_type column to messages table...")
        cursor.execute("""
            ALTER TABLE messages 
            ADD COLUMN message_type VARCHAR(20) DEFAULT 'text'
        """)
        
        # Update existing messages to have 'text' as their type
        print("📝 Updating existing messages to have 'text' type...")
        cursor.execute("""
            UPDATE messages 
            SET message_type = 'text' 
            WHERE message_type IS NULL
        """)
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(messages)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'message_type' in columns:
            print("✅ message_type column added successfully!")
            
            # Show sample of updated messages
            cursor.execute("""
                SELECT id, message_type, content 
                FROM messages 
                LIMIT 5
            """)
            messages = cursor.fetchall()
            
            print("\n📋 Sample messages with new message_type:")
            for msg in messages:
                print(f"  ID: {msg[0]}, Type: {msg[1]}, Content: {msg[2][:50]}...")
            
        else:
            print("❌ Failed to add message_type column")
            return False
        
        conn.commit()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding message_type column: {e}")
        return False

def main():
    print("🔄 Adding message_type column to messages table...")
    print("=" * 50)
    
    success = add_message_type_column()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("\n📝 Summary:")
        print("  - Added message_type column to messages table")
        print("  - Set default value to 'text' for existing messages")
        print("  - Supported message types: 'text', 'location', 'media'")
        print("\n🚀 You can now send messages with different types!")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
