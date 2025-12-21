#!/usr/bin/env python3
"""
Debug Supabase Storage file listing
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def debug_storage_files():
    """Debug file listing in Supabase Storage"""
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in .env file")
        return
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print("🔍 Debugging Supabase Storage files...")
        print("=" * 60)
        
        # List files in prolinq_pictures bucket
        bucket_name = "prolinq_pictures"
        
        try:
            print(f"📁 Listing files in bucket: {bucket_name}")
            
            # Get files
            files_response = supabase.storage.from_(bucket_name).list()
            
            print(f"📊 Response type: {type(files_response)}")
            print(f"📊 Response value: {files_response}")
            
            if files_response:
                print(f"📊 Response length: {len(files_response) if hasattr(files_response, '__len__') else 'N/A'}")
                
                if isinstance(files_response, list):
                    for i, file_item in enumerate(files_response):
                        print(f"📄 File {i}: {type(file_item)} - {file_item}")
                        
                        if isinstance(file_item, dict):
                            print(f"   Keys: {list(file_item.keys())}")
                            for key, value in file_item.items():
                                print(f"   {key}: {value}")
                        elif hasattr(file_item, '__dict__'):
                            print(f"   Attributes: {list(file_item.__dict__.keys())}")
                        else:
                            print(f"   String representation: {str(file_item)}")
                        
                        print("---")
                else:
                    print("📊 Response is not a list")
            else:
                print("📊 Response is None or empty")
                
        except Exception as e:
            print(f"❌ Error listing files: {str(e)}")
            import traceback
            traceback.print_exc()
        
        print("\n" + "=" * 60)
        print("✅ Debug completed!")
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase Storage: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_storage_files()
