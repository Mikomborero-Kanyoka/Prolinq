import os
from dotenv import load_dotenv
from supabase import create_client

def test_supabase_auth():
    print("🔍 Debugging Supabase Authentication...")
    print("=" * 50)
    
    # Load environment variables from .env file
    load_dotenv()
    print("✅ Environment variables loaded from .env file")
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"🔑 SUPABASE_URL: {supabase_url}")
    if supabase_key:
        print(f"🔑 SUPABASE_SERVICE_ROLE_KEY: {supabase_key[:20]}...{supabase_key[-10:]}")
    else:
        print("🔑 SUPABASE_SERVICE_ROLE_KEY: None")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing environment variables")
        return
    
    try:
        # Test basic client creation
        print("\n🧪 Testing client creation...")
        client = create_client(supabase_url, supabase_key)
        print("✅ Client created successfully")
        
        # Test storage access
        print("\n🧪 Testing storage access...")
        storage = client.storage
        print("✅ Storage client accessible")
        
        # Test bucket listing
        print("\n🧪 Testing bucket access...")
        try:
            # Try to list buckets (this should work with service role key)
            response = storage.list_buckets()
            print(f"✅ Buckets listed successfully: {response}")
            
            if hasattr(response, 'data') and response.data:
                bucket_names = [bucket['name'] for bucket in response.data]
                print(f"📦 Available buckets: {bucket_names}")
            else:
                print("⚠️  No bucket data returned")
                
        except Exception as e:
            print(f"❌ Bucket listing failed: {e}")
        
        # Test specific bucket access
        print("\n🧪 Testing specific bucket access...")
        bucket_name = "prolinq-uploads"
        try:
            bucket_response = storage.get_bucket(bucket_name)
            print(f"✅ Bucket '{bucket_name}' accessible: {bucket_response}")
        except Exception as e:
            print(f"❌ Bucket access failed: {e}")
            
        # Test simple file operations
        print("\n🧪 Testing file operations...")
        try:
            # Try to upload a simple text file
            test_content = b"Hello, Supabase!"
            test_path = "test/test-file.txt"
            
            upload_response = storage.from_(bucket_name).upload(
                path=test_path,
                file=test_content
            )
            print(f"📤 Upload response: {upload_response}")
            
            if upload_response.data:
                print("✅ File uploaded successfully")
                
                # Try to delete it
                delete_response = storage.from_(bucket_name).remove([test_path])
                print(f"🗑️  Delete response: {delete_response}")
                
                if delete_response.data:
                    print("✅ File deleted successfully")
            else:
                print(f"❌ Upload failed: {upload_response}")
                
        except Exception as e:
            print(f"❌ File operations failed: {e}")
            
    except Exception as e:
        print(f"❌ Client creation failed: {e}")

if __name__ == "__main__":
    test_supabase_auth()
