#!/usr/bin/env python3
"""
Explore Supabase Storage folders to find actual image files
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def explore_storage_folders():
    """Explore folders in Supabase Storage to find actual files"""
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in .env file")
        return
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print("🔍 Exploring Supabase Storage folders...")
        print("=" * 60)
        
        bucket_name = "prolinq_pictures"
        
        # Get top-level items (folders)
        folders_response = supabase.storage.from_(bucket_name).list()
        
        print(f"📁 Found {len(folders_response)} folders in bucket '{bucket_name}':")
        
        all_files = []
        
        for folder in folders_response:
            folder_name = folder['name']
            print(f"\n📂 Exploring folder: {folder_name}")
            print("-" * 40)
            
            try:
                # List files in this folder
                files_response = supabase.storage.from_(bucket_name).list(folder_name)
                
                if files_response:
                    print(f"📄 Found {len(files_response)} files in '{folder_name}' folder:")
                    
                    for file_item in files_response:
                        if isinstance(file_item, dict) and 'name' in file_item:
                            file_name = file_item['name']
                            file_path = f"{folder_name}/{file_name}"
                            
                            print(f"   📄 {file_name}")
                            
                            # Generate public URL
                            try:
                                public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
                                print(f"   🔗 URL: {public_url}")
                                
                                all_files.append({
                                    'folder': folder_name,
                                    'filename': file_name,
                                    'path': file_path,
                                    'url': public_url
                                })
                            except Exception as url_error:
                                print(f"   ❌ Error generating URL: {str(url_error)}")
                            
                            print("   ---")
                else:
                    print(f"   📭 No files found in '{folder_name}' folder")
                    
            except Exception as e:
                print(f"   ❌ Error exploring folder '{folder_name}': {str(e)}")
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 SUMMARY:")
        print(f"📁 Total folders explored: {len(folders_response)}")
        print(f"📄 Total files found: {len(all_files)}")
        
        if all_files:
            print("\n📋 All files with URLs:")
            for i, file_info in enumerate(all_files, 1):
                print(f"{i}. {file_info['folder']}/{file_info['filename']}")
                print(f"   URL: {file_info['url']}")
                print()
        else:
            print("\n❌ No image files found in any folder!")
        
        print("✅ Exploration completed!")
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase Storage: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    explore_storage_folders()
