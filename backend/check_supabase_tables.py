#!/usr/bin/env python3
"""
Check what tables exist in Supabase
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def check_supabase_tables():
    """Check what tables exist in Supabase"""
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in .env file")
        return
    
    try:
        # Initialize Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        print("🔍 Checking available tables in Supabase...")
        print("=" * 60)
        
        # Try to get table information
        try:
            # Use RPC to get table information
            response = supabase.rpc('get_table_info').execute()
            print("✅ Tables found via RPC:")
            print(response.data)
        except:
            print("❌ RPC method not available")
        
        # Try direct table queries for common table names
        common_tables = ['users', 'jobs', 'advertisements', 'profiles', 'posts', 'messages']
        
        for table_name in common_tables:
            try:
                response = supabase.table(table_name).select('*').limit(1).execute()
                if response.data:
                    print(f"✅ Table '{table_name}' exists with {len(response.data)} sample records")
                else:
                    print(f"✅ Table '{table_name}' exists but is empty")
            except Exception as e:
                print(f"❌ Table '{table_name}' not found: {str(e)}")
        
        print("\n" + "=" * 60)
        print("✅ Supabase table check completed!")
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {str(e)}")

if __name__ == "__main__":
    check_supabase_tables()
