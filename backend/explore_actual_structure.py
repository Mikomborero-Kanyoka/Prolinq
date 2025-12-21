#!/usr/bin/env python3
"""
Explore the actual structure of the Supabase storage bucket
"""

import os
import sys
sys.path.append('.')
from services.supabase_storage import supabase_storage

def explore_storage_structure():
    """Explore the actual structure of the storage bucket"""
    
    print("🔍 Exploring Supabase Storage Structure")
    print("=" * 60)
    
    if not supabase_storage.enabled or not supabase_storage.client:
        print("❌ Supabase storage not configured")
        return
    
    print(f"📦 Bucket: {supabase_storage.bucket_name}")
    
    # List root level items
    print("\n📁 Root level items:")
    try:
        root_items = supabase_storage.client.storage.from_(supabase_storage.bucket_name).list()
        for item in root_items:
            print(f"   - {item['name']} (type: {item.get('type', 'unknown')})")
            
            # If it's a folder, explore its contents
            if item.get('type') == 'folder' or not item['name'].count('.'):
                print(f"     📂 Exploring {item['name']}...")
                try:
                    folder_contents = supabase_storage.client.storage.from_(supabase_storage.bucket_name).list(item['name'])
                    for file in folder_contents:
                        full_path = f"{item['name']}/{file['name']}"
                        print(f"       - {file['name']}")
                        
                        # Generate public URL for this file
                        public_url = supabase_storage.get_public_url(full_path)
                        print(f"         🌐 Public URL: {public_url}")
                        
                        # Test if public URL is accessible (basic check)
                        print(f"         ✅ URL generated successfully")
                        
                except Exception as e:
                    print(f"     ❌ Error exploring {item['name']}: {e}")
            else:
                # It's a file at root level
                full_path = item['name']
                public_url = supabase_storage.get_public_url(full_path)
                print(f"     🌐 Public URL: {public_url}")
                
    except Exception as e:
        print(f"❌ Error listing root items: {e}")
    
    # Also try some common folder structures that might exist
    common_folders = [
        "profile",
        "portfolio", 
        "test",
        "profile-pictures",
        "portfolio-pictures",
        "job-photos",
        "advertisement-photos"
    ]
    
    print("\n🔍 Checking common folder structures:")
    for folder in common_folders:
        try:
            contents = supabase_storage.client.storage.from_(supabase_storage.bucket_name).list(folder)
            if contents:
                print(f"   📂 {folder} contains {len(contents)} items:")
                for item in contents[:5]:  # Show first 5 items
                    print(f"      - {item['name']}")
            else:
                print(f"   📂 {folder} is empty or doesn't exist")
        except Exception as e:
            print(f"   📂 {folder} - Error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Structure exploration completed!")

if __name__ == "__main__":
    explore_storage_structure()
