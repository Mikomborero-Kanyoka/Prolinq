#!/usr/bin/env python3
"""
Setup Admin User Script
This script creates or updates an admin user account for ProLinq
Run this once to set up the default admin account
"""

from database import SessionLocal
from models import User
import sys

def create_admin_user(email="admin@prolinq.com", password="admin123", full_name="Admin User"):
    """Create or update an admin user"""
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == email).first()
        
        if existing_admin:
            # Update existing user to be admin
            print(f"✓ Found existing user: {email}")
            print(f"  Making this user an admin...")
            existing_admin.is_admin = True
            existing_admin.is_verified = True
            existing_admin.is_active = True
            db.commit()
            print(f"✓ User {email} is now an admin!")
            return True
        
        # Create new admin user
        print(f"✓ Creating new admin user: {email}")
        hashed_password = User.hash_password(password)
        admin_user = User(
            email=email,
            username="admin",
            full_name=full_name,
            hashed_password=hashed_password,
            primary_role="employer",
            is_admin=True,
            is_verified=True,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"✓ Admin user created successfully!")
        print(f"\nAdmin Account Details:")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"  ⚠️  IMPORTANT: Change this password after first login!")
        return True
        
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def list_admin_users():
    """List all admin users"""
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.is_admin == True).all()
        if not admins:
            print("No admin users found in the system.")
            return
        
        print("\n=== Admin Users ===")
        for admin in admins:
            print(f"  ID: {admin.id}")
            print(f"  Email: {admin.email}")
            print(f"  Name: {admin.full_name}")
            print(f"  Active: {admin.is_active}")
            print(f"  Verified: {admin.is_verified}")
            print()
    finally:
        db.close()

def promote_user_to_admin(email):
    """Promote an existing user to admin"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"✗ User not found: {email}")
            return False
        
        user.is_admin = True
        user.is_verified = True
        db.commit()
        print(f"✓ User {email} promoted to admin!")
        return True
    except Exception as e:
        print(f"✗ Error promoting user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("ProLinq Admin Setup Script")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "list":
            list_admin_users()
        elif command == "promote" and len(sys.argv) > 2:
            email = sys.argv[2]
            promote_user_to_admin(email)
        elif command == "create":
            email = sys.argv[2] if len(sys.argv) > 2 else "admin@prolinq.com"
            password = sys.argv[3] if len(sys.argv) > 3 else "admin123"
            full_name = sys.argv[4] if len(sys.argv) > 4 else "Admin User"
            create_admin_user(email, password, full_name)
        else:
            print("Commands:")
            print("  python setup_admin.py create [email] [password] [full_name]")
            print("  python setup_admin.py list")
            print("  python setup_admin.py promote [email]")
            print("\nExample:")
            print("  python setup_admin.py create admin@prolinq.com admin123 'Admin User'")
    else:
        # Default: create admin user with default credentials
        print("\nCreating default admin user...\n")
        create_admin_user()
        print("\n" + "=" * 50)
        print("Setup Complete!")
        print("=" * 50)
        print("\nNow:")
        print("1. Make sure your backend is running")
        print("2. Go to http://localhost:5173/login")
        print("3. Login with:")
        print("   Email: admin@prolinq.com")
        print("   Password: admin123")
        print("4. Click the Settings/Admin icon to access the admin panel")
        print("\n⚠️  IMPORTANT: Change your admin password immediately after login!")