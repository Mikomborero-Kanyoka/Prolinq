#!/usr/bin/env python3
"""
Diagnostic script to check image URLs in the Supabase database
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

load_dotenv()

def check_supabase_image_urls():
    """Check all image URLs in the Supabase database"""
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in .env file")
        return
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print("🔍 Checking image URLs in Supabase database...")
        print("=" * 60)
        
        # Check users table for profile photos and cover photos
        print("\n📸 USERS TABLE - Profile & Cover Photos:")
        try:
            users_response = supabase.table('users').select(
                'id, username, profile_picture, profile_photo, cover_image, portfolio_images, resume_images'
            ).execute()
            
            users = users_response.data
            if users:
                print(f"Found {len(users)} users with images")
                for user in users:
                    user_id = user.get('id')
                    username = user.get('username', 'Unknown')
                    profile_pic = user.get('profile_picture')
                    profile_photo = user.get('profile_photo')
                    cover_image = user.get('cover_image')
                    portfolio_images = user.get('portfolio_images')
                    resume_images = user.get('resume_images')
                    
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
                        if isinstance(portfolio_images, str):
                            try:
                                portfolio_list = json.loads(portfolio_images)
                                for i, img in enumerate(portfolio_list):
                                    print(f"      📸 Portfolio {i+1}: {img}")
                                    if not img.startswith('http'):
                                        print(f"         ⚠️  Not a public URL!")
                            except:
                                print(f"      Raw: {portfolio_images}")
                        else:
                            print(f"      Raw: {portfolio_images}")
                    
                    if resume_images:
                        print(f"   📄 Resume Images: {resume_images}")
                        if isinstance(resume_images, str):
                            try:
                                resume_list = json.loads(resume_images)
                                for i, img in enumerate(resume_list):
                                    print(f"      📄 Resume {i+1}: {img}")
                                    if not img.startswith('http'):
                                        print(f"         ⚠️  Not a public URL!")
                            except:
                                print(f"      Raw: {resume_images}")
                        else:
                            print(f"      Raw: {resume_images}")
            else:
                print("   No profile or cover photos found")
        except Exception as e:
            print(f"   ❌ Error checking users table: {str(e)}")
        
        # Check jobs table for photos
        print("\n💼 JOBS TABLE - Job Photos:")
        try:
            jobs_response = supabase.table('jobs').select(
                'id, title, picture_filename, is_picture_only'
            ).execute()
            
            jobs = jobs_response.data
            if jobs:
                print(f"Found {len(jobs)} jobs with pictures")
                for job in jobs:
                    job_id = job.get('id')
                    title = job.get('title', 'Unknown')
                    picture_filename = job.get('picture_filename')
                    is_picture_only = job.get('is_picture_only')
                    
                    print(f"\n📋 Job: {title} (ID: {job_id})")
                    print(f"   📷 Picture Filename: {picture_filename}")
                    print(f"   🖼️  Picture Only: {is_picture_only}")
                    if picture_filename and not picture_filename.startswith('http'):
                        print(f"      ⚠️  Not a public URL!")
            else:
                print("   No job photos found")
        except Exception as e:
            print(f"   ❌ Error checking jobs table: {str(e)}")
        
        # Check advertisements table for photos
        print("\n📢 ADVERTISEMENTS TABLE - Advertisement Photos:")
        try:
            ads_response = supabase.table('advertisements').select(
                'id, name, image_filename, image_url, picture_filename, is_picture_only'
            ).execute()
            
            ads = ads_response.data
            if ads:
                print(f"Found {len(ads)} advertisements with images")
                for ad in ads:
                    ad_id = ad.get('id')
                    name = ad.get('name', 'Unknown')
                    image_filename = ad.get('image_filename')
                    image_url = ad.get('image_url')
                    picture_filename = ad.get('picture_filename')
                    is_picture_only = ad.get('is_picture_only')
                    
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
        except Exception as e:
            print(f"   ❌ Error checking advertisements table: {str(e)}")
        
        print("\n" + "=" * 60)
        print("✅ Supabase image URL check completed!")
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {str(e)}")

if __name__ == "__main__":
    check_supabase_image_urls()
