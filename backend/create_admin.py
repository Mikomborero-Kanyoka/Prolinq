"""
Script to create an admin user for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db, SessionLocal
from models import User

def create_admin_user():
    """Create an admin user if it doesn't exist"""
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@prolinq.com").first()
        
        if admin_user:
            print("Admin user already exists!")
            if not admin_user.is_admin:
                admin_user.is_admin = True
                db.commit()
                print("Updated existing user to admin status!")
            else:
                print("Admin user is already set as admin!")
        else:
            # Create new admin user
            admin_user = User(
                email="admin@prolinq.com",
                username="admin",
                full_name="System Administrator",
                hashed_password=User.hash_password("admin123"),
                is_admin=True,
                is_active=True,
                is_verified=True,
                primary_role="admin"
            )
            
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully!")
            print("Email: admin@prolinq.com")
            print("Password: admin123")
            print("Please change the password after first login!")
            
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
