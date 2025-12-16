#!/usr/bin/env python3
"""
Quick test to see if job recommendations are showing in notifications
Run this AFTER your backend is running to quickly verify the setup
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_recommendations():
    print("\n" + "="*60)
    print("🚀 QUICK JOB RECOMMENDATIONS TEST")
    print("="*60)
    
    # Test user credentials - UPDATE THESE with your test account
    email = input("\n📧 Enter your email (or press Enter for test@example.com): ").strip() or "test@example.com"
    password = input("🔐 Enter your password (or press Enter for password123): ").strip() or "password123"
    
    print(f"\n🔐 Logging in as: {email}")
    
    # Step 1: Login
    try:
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": email, "password": password}
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return
        
        token = login_response.json().get("access_token")
        print(f"✅ Login successful!")
        
    except Exception as e:
        print(f"❌ Connection error: {e}")
        print(f"   Make sure backend is running at {BASE_URL}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Trigger recommendations
    print("\n🎯 Triggering job recommendations...")
    try:
        rec_response = requests.get(
            f"{BASE_URL}/api/recommendations/daily?limit=10",
            headers=headers
        )
        
        if rec_response.status_code == 200:
            rec_data = rec_response.json()
            print(f"✅ Recommendations API response:")
            print(f"   - Total generated: {rec_data.get('total_recommendations', 0)}")
            print(f"   - From cache: {rec_data.get('from_cache', False)}")
            
            if rec_data.get('recommendations'):
                print(f"\n   Top 3 Recommendations:")
                for i, rec in enumerate(rec_data['recommendations'][:3], 1):
                    print(f"   {i}. {rec['title']} - {rec['match_percentage']}% match")
            else:
                print(f"   ⚠️  No recommendations generated")
                print(f"      Possible reasons: No jobs, no profile embedding, or no skill matches")
        else:
            print(f"❌ Error: {rec_response.status_code}")
            print(f"   {rec_response.text}")
    
    except Exception as e:
        print(f"❌ Error calling recommendations API: {e}")
        return
    
    # Step 3: Check notifications
    print("\n📬 Checking notifications...")
    try:
        notif_response = requests.get(
            f"{BASE_URL}/api/notifications",
            headers=headers
        )
        
        if notif_response.status_code == 200:
            notifications = notif_response.json()
            
            print(f"✅ Total notifications: {len(notifications)}")
            
            # Count by type
            types = {}
            job_recommendations = []
            
            for notif in notifications:
                notif_type = notif.get('type', 'unknown')
                types[notif_type] = types.get(notif_type, 0) + 1
                
                if notif_type == 'job_recommendation':
                    job_recommendations.append(notif)
            
            print(f"\n   Breakdown by type:")
            for notif_type, count in sorted(types.items()):
                print(f"      - {notif_type}: {count}")
            
            if job_recommendations:
                print(f"\n✅ FOUND {len(job_recommendations)} JOB RECOMMENDATION NOTIFICATIONS!")
                print(f"\n   Recent recommendations:")
                for notif in sorted(job_recommendations, key=lambda x: x.get('created_at', ''), reverse=True)[:3]:
                    print(f"\n      📋 ID: {notif['id']}")
                    print(f"         Title: {notif['title']}")
                    print(f"         Message: {notif['message'][:70]}...")
                    print(f"         Read: {notif['is_read']}")
                    
                    if notif.get('data'):
                        try:
                            data = json.loads(notif['data']) if isinstance(notif['data'], str) else notif['data']
                            print(f"         Job ID: {data.get('job_id', 'N/A')}")
                            print(f"         Match: {data.get('match_percentage', 'N/A')}%")
                        except:
                            print(f"         Data: {notif['data']}")
            else:
                print(f"\n❌ NO JOB RECOMMENDATIONS in notifications!")
                print(f"\n   Reasons:")
                print(f"   - Recommendations might not be created yet")
                print(f"   - Check the debug script: python test_job_recommendation_flow.py")
                print(f"   - Verify user has profile embedding")
                print(f"   - Verify open jobs exist with embeddings")
        
        else:
            print(f"❌ Error: {notif_response.status_code}")
            print(f"   {notif_response.text}")
    
    except Exception as e:
        print(f"❌ Error calling notifications API: {e}")
        return
    
    # Summary
    print("\n" + "="*60)
    print("✅ TEST COMPLETE")
    print("="*60)
    print("\nNext steps:")
    print("  1. Check Notifications page in UI")
    print("  2. Look for '🎯 Recommended Job Match' notifications")
    print("  3. Click 'View Recommended Job →' to see if link works")
    print("  4. If not showing, check: python test_job_recommendation_flow.py")
    print()

if __name__ == "__main__":
    test_recommendations()