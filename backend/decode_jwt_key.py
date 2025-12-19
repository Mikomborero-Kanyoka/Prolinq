import base64
import json
import os
from dotenv import load_dotenv

def decode_jwt_without_verification(token):
    """Decode JWT without verification to see the payload"""
    try:
        # Remove Bearer prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Split token parts
        parts = token.split('.')
        
        if len(parts) != 3:
            print(f"❌ Invalid JWT format - expected 3 parts, got {len(parts)}")
            return None
        
        # Decode header
        header_data = parts[0]
        # Add padding if needed
        header_data += '=' * (-len(header_data) % 4)
        header = json.loads(base64.b64decode(header_data))
        
        # Decode payload  
        payload_data = parts[1]
        # Add padding if needed
        payload_data += '=' * (-len(payload_data) % 4)
        payload = json.loads(base64.b64decode(payload_data))
        
        return header, payload, parts[2]  # Return signature separately
        
    except Exception as e:
        print(f"❌ Error decoding token: {e}")
        return None

def analyze_key():
    load_dotenv()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print("🔍 JWT Key Analysis")
    print("=" * 40)
    print(f"🔑 Full key: {key}")
    print(f"📏 Key length: {len(key)}")
    
    result = decode_jwt_without_verification(key)
    
    if result:
        header, payload, signature = result
        
        print(f"\n📋 Header: {json.dumps(header, indent=2)}")
        print(f"\n📋 Payload: {json.dumps(payload, indent=2)}")
        print(f"\n🔏 Signature length: {len(signature)}")
        print(f"🔏 Signature: {signature[:50]}...")
        
        # Check if this looks like a real Supabase key
        if 'iss' in payload and payload['iss'] == 'supabase':
            print(f"\n✅ This looks like a valid Supabase JWT")
            print(f"🏢 Project ref: {payload.get('ref', 'N/A')}")
            print(f"👤 Role: {payload.get('role', 'N/A')}")
            print(f"⏰ Issued: {payload.get('iat', 'N/A')}")
            print(f"⏰ Expires: {payload.get('exp', 'N/A')}")
            
            # Check if it's a test/demo key
            if payload.get('ref') == 'trkmvtmdphhevfuhqlzj':
                print(f"\n⚠️  ISSUE DETECTED!")
                print(f"This appears to be a test/demo key that may not be active")
                print(f"Real Supabase service role keys are much longer")
                print(f"Your key length: {len(key)}")
                print(f"Expected length: 300+ characters for real service role keys")
                
                return False
        else:
            print(f"\n❌ This doesn't look like a Supabase key")
            return False
    
    return True

if __name__ == "__main__":
    analyze_key()
