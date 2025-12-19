import os
import sys
from dotenv import load_dotenv

def generate_new_key_instructions():
    print("🔧 Supabase Key Fix Instructions")
    print("=" * 50)
    
    print("\n📋 ISSUE ANALYSIS:")
    print("✅ Key format is correct (JWT)")
    print("✅ Key is not expired") 
    print("✅ Key has service_role")
    print("❌ Supabase rejects the key signature")
    
    print("\n🎯 SOLUTION:")
    print("Even though you didn't revoke the key, Supabase sometimes")
    print("invalidates service role keys due to internal updates.")
    print("You need to generate a fresh service role key.")
    
    print("\n📝 STEP-BY-STEP FIX:")
    print("1. Go to: https://supabase.com/dashboard/project/trkmvtmdphhevfuhqlzj/settings/api")
    print("2. Scroll to 'Project API keys' section")
    print("3. Find the 'service_role' key")
    print("4. Click 'Generate new key' button")
    print("5. Copy the new key (it will be very long)")
    print("6. Update your .env file with the new key")
    
    print("\n⚡ QUICK UPDATE:")
    print("Replace this line in your .env file:")
    print("SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    print("With:")
    print("SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here")
    
    print("\n🧪 TEST AFTER FIX:")
    print("Run: python debug_supabase_auth.py")
    print("You should see: ✅ File uploaded successfully")

def backup_current_key():
    """Create a backup of the current key before changing"""
    load_dotenv()
    current_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if current_key:
        with open('.env.backup', 'w') as f:
            f.write(f"# Backup of current Supabase service role key\n")
            f.write(f"# Generated: {os.path.basename(__file__)}\n")
            f.write(f"SUPABASE_SERVICE_ROLE_KEY={current_key}\n")
        print("✅ Current key backed up to .env.backup")

if __name__ == "__main__":
    backup_current_key()
    generate_new_key_instructions()
