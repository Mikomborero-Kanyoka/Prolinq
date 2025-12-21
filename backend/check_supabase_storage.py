#!/usr/bin/env python3
"""
Check Supabase Storage buckets and files
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def check_supabase_storage():
    """Check Supabase Storage buckets and files"""
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in .env file")
        return
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print("🔍 Checking Supabase Storage buckets and files...")
        print("=" * 60)
        
        # List all buckets
        try:
            buckets_response = supabase.storage.list_buckets()
            buckets = buckets_response
            
            print(f"📦 Found {len(buckets)} storage buckets:")
            for bucket in buckets:
                # Handle different bucket object types
                if hasattr(bucket, 'name'):
                    bucket_name = bucket.name
                    bucket_id = getattr(bucket, 'id', bucket_name)
                elif hasattr(bucket, '__dict__'):
                    bucket_name = getattr(bucket, 'name', 'Unknown')
                    bucket_id = getattr(bucket, 'id', bucket_name)
                else:
                    bucket_name = str(bucket)
                    bucket_id = str(bucket)
                
                print(f"\n   📁 Bucket: {bucket_name} (ID: {bucket_id})")
                
                # List files in this bucket
                try:
                    files_response = supabase.storage.from_(bucket_name).list()
                    files = files_response
                    
                    if files:
                        print(f"      📄 Files in bucket ({len(files)}):")
                        for i, file in enumerate(files[:10]):  # Show first 10 files
                            # Handle different file object types
                            if isinstance(file, dict):
                                file_name = file.get('name', f'file_{i}')
                                file_size = file.get('metadata', {}).get('size', 'Unknown')
                            elif hasattr(file, 'name'):
                                file_name = file.name
                                file_size = getattr(file, 'size', 'Unknown')
                            else:
                                file_name = str(file)
                                file_size = 'Unknown'
                            
                            print(f"         📎 {file_name} ({file_size} bytes)")
                        
                        if len(files) > 10:
                            print(f"         ... and {len(files) - 10} more files")
                        
                        # Get public URLs for some files
                        print(f"      🔗 Public URLs (first 5):")
                        for i, file in enumerate(files[:5]):
                            # Handle different file object types
                            if isinstance(file, dict):
                                file_name = file.get('name', f'file_{i}')
                            elif hasattr(file, 'name'):
                                file_name = file.name
                            else:
                                file_name = str(file)
                            
                            try:
                                public_url = supabase.storage.from_(bucket_name).get_public_url(file_name)
                                print(f"         🌐 {file_name}: {public_url}")
                            except Exception as e:
                                print(f"         ❌ Error getting URL for {file_name}: {str(e)}")
                    else:
                        print("      📭 No files found in this bucket")
                        
                except Exception as e:
                    print(f"      ❌ Error listing files in bucket {bucket_name}: {str(e)}")
                    
        except Exception as e:
            print(f"❌ Error listing buckets: {str(e)}")
        
        print("\n" + "=" * 60)
        print("✅ Supabase Storage check completed!")
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase Storage: {str(e)}")

if __name__ == "__main__":
    check_supabase_storage()
