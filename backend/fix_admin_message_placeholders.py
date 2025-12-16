#!/usr/bin/env python3
"""
Script to fix admin messages that contain placeholders.
This script will replace placeholders with actual user data for existing admin messages.
"""

from database import get_db
from models import AdminMessage, User
from sqlalchemy.orm import Session

def fix_admin_message_placeholders():
    """Fix admin messages that contain placeholders"""
    db = next(get_db())
    
    try:
        # Get all admin messages that contain placeholders
        admin_messages = db.query(AdminMessage).all()
        messages_to_fix = []
        
        for msg in admin_messages:
            if '{{' in msg.content:
                messages_to_fix.append(msg)
        
        print(f"Found {len(messages_to_fix)} admin messages with placeholders")
        
        for msg in messages_to_fix:
            print(f"\nFixing message ID: {msg.id}")
            print(f"Original content: {msg.content}")
            
            # Get the receiver user
            receiver = db.query(User).filter(User.id == msg.receiver_id).first()
            if not receiver:
                print(f"❌ Receiver not found for message {msg.id}")
                continue
            
            # Replace placeholders with actual user data
            new_content = msg.content
            new_content = new_content.replace("{{full_name}}", receiver.full_name or "User")
            new_content = new_content.replace("{{username}}", receiver.username or "")
            new_content = new_content.replace("{{email}}", receiver.email or "")
            
            # Update the message
            msg.content = new_content
            db.commit()
            
            print(f"✅ Fixed message ID: {msg.id}")
            print(f"New content: {new_content}")
        
        print(f"\n✅ Successfully fixed {len(messages_to_fix)} admin messages!")
        
    except Exception as e:
        print(f"❌ Error fixing admin messages: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin_message_placeholders()
