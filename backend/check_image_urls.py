#!/usr/bin/env python3
"""
Diagnostic script to check image URLs in the database
"""

import sqlite3
import os
from datetime import datetime

def check_image_urls():
    """Check all image URLs in the database"""
    
    db_path = "prolinq.db"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔍 Checking image URLs in database...")
        print("=" * 60)
        
        # Check users table for profile photos and cover photos
        print("\n📸 USERS TABLE - Profile & Cover Photos:")
        cursor.execute("""
            SELECT id, username, profile_picture, profile_photo, cover_image, portfolio_images, resume_images
            FROM users 
            WHERE profile_picture IS NOT NULL 
               OR profile_photo IS NOT NULL 
               OR cover_image IS NOT NULL 
               OR portfolio_images IS NOT NULL 
               OR resume_images IS NOT NULL
            ORDER BY id
        """)
        
        users = cursor.fetchall()
        if users:
            print(f"Found {len(users)} users with images")
            for user in users:
                user_id, username, profile_pic, profile_photo, cover_image, portfolio_images, resume_images = user
                print(f"\n👤 User: {username} (ID: {user_id})")
                
                if profile_pic:
                    print(f"   📷 Profile Picture: {profile_pic}")
                    if not profile_pic.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
                
                if profile_photo:
                    print(f"   📷 Profile Photo: {profile_photo}")
                    if not profile_photo.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
                
                if cover_image:
                    print(f"   🖼️  Cover Image: {cover_image}")
                    if not cover_image.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
                
                if portfolio_images:
                    print(f"   🎨 Portfolio Images: {portfolio_images}")
                    if not portfolio_images.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
                
                if resume_images:
                    print(f"   📄 Resume Images: {resume_images}")
                    if not resume_images.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
        else:
            print("   No profile or cover photos found")
        
        # Check jobs table for photos
        print("\n💼 JOBS TABLE - Job Photos:")
        cursor.execute("""
            SELECT id, title, picture_filename, is_picture_only
            FROM jobs 
            WHERE picture_filename IS NOT NULL OR is_picture_only = 1
        """)
        
        jobs = cursor.fetchall()
        if jobs:
            print(f"Found {len(jobs)} jobs with pictures")
            for job in jobs:
                job_id, title, picture_filename, is_picture_only = job
                print(f"\n📋 Job: {title} (ID: {job_id})")
                print(f"   📷 Picture Filename: {picture_filename}")
                print(f"   🖼️  Picture Only: {is_picture_only}")
                if picture_filename and not picture_filename.startswith('http'):
                    print(f"      ⚠️  Not a public URL!")
        else:
            print("   No job photos found")
        
        # Check advertisements table for photos
        print("\n📢 ADVERTISEMENTS TABLE - Advertisement Photos:")
        cursor.execute("""
            SELECT id, name, image_filename, image_url, picture_filename, is_picture_only
            FROM advertisements 
            WHERE image_filename IS NOT NULL 
               OR image_url IS NOT NULL 
               OR picture_filename IS NOT NULL 
               OR is_picture_only = 1
        """)
        
        ads = cursor.fetchall()
        if ads:
            print(f"Found {len(ads)} advertisements with images")
            for ad in ads:
                ad_id, name, image_filename, image_url, picture_filename, is_picture_only = ad
                print(f"\n📢 Advertisement: {name} (ID: {ad_id})")
                
                if image_filename:
                    print(f"   📷 Image Filename: {image_filename}")
                    if not image_filename.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
                
                if image_url:
                    print(f"   🔗 Image URL: {image_url}")
                    if not image_url.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
                
                if picture_filename:
                    print(f"   📸 Picture Filename: {picture_filename}")
                    if not picture_filename.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
                
                print(f"   🖼️  Picture Only: {is_picture_only}")
        else:
            print("   No advertisement photos found")
        
        # Check for URL patterns
        print("\n🔍 URL PATTERN ANALYSIS:")
        print("-" * 40)
        
        # Check Supabase URLs
        cursor.execute("""
            SELECT 'users' as table_name, 'profile_picture' as column, profile_picture as url 
            FROM users WHERE profile_picture IS NOT NULL
            UNION ALL
            SELECT 'users' as table_name, 'profile_photo' as column, profile_photo as url 
            FROM users WHERE profile_photo IS NOT NULL
            UNION ALL
            SELECT 'users' as table_name, 'cover_image' as column, cover_image as url 
            FROM users WHERE cover_image IS NOT NULL
            UNION ALL
            SELECT 'jobs' as table_name, 'picture_filename' as column, picture_filename as url 
            FROM jobs WHERE picture_filename IS NOT NULL
            UNION ALL
            SELECT 'advertisements' as table_name, 'image_filename' as column, image_filename as url 
            FROM advertisements WHERE image_filename IS NOT NULL
            UNION ALL
            SELECT 'advertisements' as table_name, 'image_url' as column, image_url as url 
            FROM advertisements WHERE image_url IS NOT NULL
            UNION ALL
            SELECT 'advertisements' as table_name, 'picture_filename' as column, picture_filename as url 
            FROM advertisements WHERE picture_filename IS NOT NULL
        """)
        
        all_urls = cursor.fetchall()
        
        supabase_urls = []
        api_urls = []
        local_paths = []
        other_urls = []
        
        for table_name, column, url in all_urls:
            if url and 'supabase.co' in url:
                supabase_urls.append((table_name, column, url))
            elif url and ('/uploads/' in url or 'api' in url):
                api_urls.append((table_name, column, url))
            elif url and '/' in url and not url.startswith('http'):
                local_paths.append((table_name, column, url))
            elif url and url.startswith('http'):
                other_urls.append((table_name, column, url))
        
        print(f"📊 Supabase URLs: {len(supabase_urls)}")
        for table, column, url in supabase_urls:
            print(f"   {table}.{column}: {url[:80]}...")
        
        print(f"\n📊 API URLs: {len(api_urls)}")
        for table, column, url in api_urls:
            print(f"   {table}.{column}: {url[:80]}...")
        
        print(f"\n📊 Local Paths: {len(local_paths)}")
        for table, column, url in local_paths:
            print(f"   {table}.{column}: {url[:80]}...")
        
        print(f"\n📊 Other HTTP URLs: {len(other_urls)}")
        for table, column, url in other_urls:
            print(f"   {table}.{column}: {url[:80]}...")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ Image URL check completed!")
        
        # Summary and recommendations
        print("\n📋 SUMMARY & RECOMMENDATIONS:")
        print("-" * 40)
        
        total_urls = len(all_urls)
        public_urls = len(supabase_urls) + len(other_urls)
        
        if total_urls == 0:
            print("❌ No image URLs found in the database")
            print("💡 Recommendation: Upload some profile pictures, job photos, or advertisement images")
        elif public_urls == 0:
            print("⚠️  Found image URLs but none are publicly accessible")
            print("💡 Recommendation: Update image paths to use Supabase public URLs")
        elif public_urls < total_urls:
            print(f"⚠️  Only {public_urls} out of {total_urls} image URLs are publicly accessible")
            print("💡 Recommendation: Convert local paths to Supabase public URLs")
        else:
            print(f"✅ All {total_urls} image URLs appear to be publicly accessible")
        
    except Exception as e:
        print(f"❌ Error checking image URLs: {str(e)}")

if __name__ == "__main__":
    check_image_urls()
