#!/usr/bin/env python3
"""Create a test picture ad"""

from database import SessionLocal, engine
from models import Base, Advertisement, User
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # First create a test admin user
    test_user = User(
        email="admin@test.com",
        hashed_password="test",
        full_name="Test Admin",
        primary_role="employer",
        is_admin=True,
        company_name="Test Company"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    print(f"✅ Created admin user: {test_user.id}")
    
    # Create a test picture ad
    test_ad = Advertisement(
        user_id=test_user.id,
        item_type="Picture Ad",
        name="Picture Advertisement",
        category="Visual",
        company_name="Test Company",
        price=None,
        benefit="Promotional image advertisement",
        cta_text="Learn More",
        cta_url="https://example.com",
        headline="",
        description="",
        offer=None,
        is_picture_only=True,
        picture_filename="test_ad_picture.jpg",
        image_url="/uploads/test_ad_picture.jpg",
        status="active"
    )
    db.add(test_ad)
    db.commit()
    db.refresh(test_ad)
    print(f"✅ Created test picture ad: {test_ad.id}")
    
    # Verify it was created
    ads = db.query(Advertisement).all()
    print(f"\n📺 Total ads in database: {len(ads)}")
    for ad in ads:
        print(f"  - ID: {ad.id}")
        print(f"    Name: {ad.name}")
        print(f"    Type: {ad.item_type}")
        print(f"    Picture Only: {ad.is_picture_only}")
        print(f"    Status: {ad.status}")
        print(f"    Image URL: {ad.image_url}")
        print(f"    Created: {ad.created_at}")

finally:
    db.close()