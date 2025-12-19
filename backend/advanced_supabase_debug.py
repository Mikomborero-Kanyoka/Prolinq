import os
import sys
import json
from supabase import create_client, Client
from dotenv import load_dotenv

def advanced_supabase_debug():
    print("🔍 Advanced Supabase Diagnostics...")
    print("=" * 60)
    
    # Load environment
    load_dotenv()
    
    # Get credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"🔑 SUPABASE_URL: {supabase_url}")
    print(f"🔑 SUPABASE_KEY_LENGTH: {len(supabase_key) if supabase_key else 'None'}")
    print(f"🔑 SUPABASE_KEY_START: {supabase_key[:20]}...{supabase_key[-10:] if supabase_key else 'None'}")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing credentials!")
        return False
    
    try:
        # Test 1: Basic client creation
        print("\n🧪 Test 1: Client Creation...")
        client = create_client(supabase_url, supabase_key)
        print("✅ Client created successfully")
        
        # Test 2: Simple health check
        print("\n🧪 Test 2: Health Check...")
        try:
            # Try to get auth user info (this tests if key is valid)
            response = client.auth.get_user(supabase_key[:10])  # This should fail gracefully
            print("📊 Auth response:", response)
        except Exception as e:
            print(f"📊 Auth test failed (expected): {str(e)[:100]}...")
        
        # Test 3: Storage access with different methods
        print("\n🧪 Test 3: Storage Access Methods...")
        
        # Method 1: Direct storage access
        try:
            storage = client.storage
            print("✅ Storage client accessible")
            
            # Try to list buckets
            buckets_response = storage.list_buckets()
            print(f"📦 Buckets response: {buckets_response}")
            
            if hasattr(buckets_response, 'data'):
                print(f"✅ Buckets found: {buckets_response.data}")
            elif isinstance(buckets_response, dict):
                print(f"📦 Buckets dict: {buckets_response}")
            else:
                print(f"📦 Buckets raw: {type(buckets_response)} - {buckets_response}")
                
        except Exception as e:
            print(f"❌ Storage access failed: {str(e)}")
            error_details = str(e)
            
            # Analyze specific errors
            if "signature verification failed" in error_details:
                print("🔍 DIAGNOSIS: JWT signature verification failed")
                print("💡 SOLUTION: Key may be expired or corrupted")
                print("📝 ACTION: Generate new service role key in Supabase dashboard")
            
            elif "unauthorized" in error_details.lower():
                print("🔍 DIAGNOSIS: Unauthorized access")
                print("💡 SOLUTION: Key may not have storage permissions")
                print("📝 ACTION: Check key permissions in Supabase settings")
            
            elif "invalid" in error_details.lower():
                print("🔍 DIAGNOSIS: Invalid key format")
                print("💡 SOLUTION: Key may be malformed")
                print("📝 ACTION: Ensure key is complete and properly formatted")
        
        # Test 4: Try with anon key as fallback
        print("\n🧪 Test 4: Fallback with Anon Key...")
        anon_key = os.getenv("SUPABASE_ANON_KEY")
        if anon_key:
            try:
                anon_client = create_client(supabase_url, anon_key)
                anon_storage = anon_client.storage
                anon_buckets = anon_storage.list_buckets()
                print(f"✅ Anon key works: {anon_buckets}")
            except Exception as e:
                print(f"❌ Anon key also failed: {str(e)[:100]}...")
        else:
            print("⚠️ No anon key found in environment")
        
        # Test 5: Manual bucket creation attempt
        print("\n🧪 Test 5: Bucket Creation Test...")
        try:
            # Try to create the bucket if it doesn't exist
            create_response = client.storage.create_bucket('prolinq-uploads', {
                'public': True,
                'file_size_limit': 10485760
            })
            print(f"📦 Bucket creation response: {create_response}")
        except Exception as e:
            print(f"📦 Bucket creation failed: {str(e)[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        return False

def check_key_structure():
    print("\n🔍 Key Structure Analysis...")
    print("=" * 40)
    
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_key:
        print("❌ No service role key found")
        return
    
    # Check JWT structure
    parts = supabase_key.split('.')
    print(f"🔑 Key parts: {len(parts)} (should be 3 for JWT)")
    
    if len(parts) == 3:
        try:
            import base64
            import json
            
            # Decode header
            header = base64.b64decode(parts[0] + '==').decode()
            header_data = json.loads(header)
            print(f"📋 Header: {header_data}")
            
            # Decode payload
            payload = base64.b64decode(parts[1] + '==').decode()
            payload_data = json.loads(payload)
            print(f"📋 Payload: {payload_data}")
            
            # Check expiration
            if 'exp' in payload_data:
                import time
                exp_time = payload_data['exp']
                current_time = int(time.time())
                print(f"⏰ Expires: {exp_time} (current: {current_time})")
                
                if exp_time < current_time:
                    print("❌ KEY IS EXPIRED!")
                    return True
                else:
                    print("✅ Key is not expired")
            
            # Check role
            if 'role' in payload_data:
                print(f"👤 Role: {payload_data['role']}")
                if payload_data['role'] != 'service_role':
                    print("⚠️ This is not a service_role key!")
            
        except Exception as e:
            print(f"❌ Could not decode JWT: {str(e)}")
    else:
        print("❌ Invalid JWT structure")

if __name__ == "__main__":
    advanced_supabase_debug()
    check_key_structure()
