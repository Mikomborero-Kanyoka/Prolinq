#!/usr/bin/env python3
"""
Create real job recommendation notifications using the existing AI embedding model
"""
import sqlite3
import sys
import os
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from embedding_model import get_model, string_to_embedding
from database import get_db
from models import User, Job
from sqlalchemy.orm import Session

def create_ai_job_recommendations():
    """Create AI-powered job recommendations based on real jobs in database"""
    
    # Use the existing database connection
    conn = sqlite3.connect('prolinq.db')
    cursor = conn.cursor()
    
    try:
        print("🤖 Creating AI-Powered Job Recommendation Notifications")
        print("=" * 60)
        
        # Get all real jobs from database
        cursor.execute("""
            SELECT id, title, description, category, skills_required, 
                   location, job_type, budget_min, budget_max, job_embedding
            FROM jobs 
            WHERE status = 'open' AND job_embedding IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 15
        """)
        jobs = cursor.fetchall()
        
        if not jobs:
            print("❌ No open jobs with embeddings found in database")
            print("💡 Run: python embed-job-db-{job_id} for jobs first")
            return
        
        print(f"📋 Found {len(jobs)} real jobs with embeddings")
        
        # Get all talent users
        cursor.execute("""
            SELECT id, full_name, username, primary_role, skills, location, profile_embedding
            FROM users 
            WHERE primary_role = 'talent' AND profile_embedding IS NOT NULL
        """)
        users = cursor.fetchall()
        
        if not users:
            print("❌ No talent users with embeddings found in database")
            print("💡 Run: python embed-user-db-{user_id} for users first")
            return
        
        print(f"👥 Found {len(users)} talent users with embeddings")
        
        # Clear existing recommendation notifications
        cursor.execute("DELETE FROM notifications WHERE type = 'job_recommendation'")
        conn.commit()
        print("🗑️ Cleared existing job recommendation notifications")
        
        # Get the AI model
        model = get_model()
        
        # Create recommendations for each user
        recommendations_created = 0
        
        for user in users:
            user_id, user_name, username, primary_role, user_skills, user_location, profile_embedding = user
            
            print(f"\n🔍 Processing recommendations for {user_name or username} (User {user_id})")
            
            # Convert user embedding from string to numpy array
            if not profile_embedding:
                print(f"⚠️  No valid embedding for user {user_id}")
                continue
                
            try:
                user_embedding = string_to_embedding(profile_embedding)
                
                if user_embedding.size == 0:
                    print(f"⚠️  Empty embedding for user {user_id}")
                    continue
                
                # Find matching jobs for this user
                matches = []
                for job in jobs:
                    job_id, job_title, job_description, job_category, job_skills, job_location, job_type, budget_min, budget_max, job_embedding_str = job
                    
                    if not job_embedding_str:
                        continue
                    
                    # Convert job embedding from string to numpy array
                    try:
                        job_embedding = string_to_embedding(job_embedding_str)
                        
                        if job_embedding.size == 0:
                            continue
                            
                        # Calculate similarity using the AI model
                        similarity = model.calculate_similarity(job_embedding, user_embedding)
                        
                        # Only include good matches (similarity > 0.3)
                        if similarity > 0.3:
                            matches.append({
                                'job_id': job_id,
                                'title': job_title,
                                'similarity_score': float(similarity),
                                'category': job_category,
                                'location': job_location,
                                'job_type': job_type
                            })
                    except Exception as e:
                        print(f"⚠️  Error processing job {job_id}: {e}")
                        continue
                
                # Sort by similarity score and take top 3
                matches.sort(key=lambda x: x['similarity_score'], reverse=True)
                top_recommendations = matches[:3]
                
                # Create notification for each recommendation
                for i, job_match in enumerate(top_recommendations, 1):
                    similarity_percent = int(job_match['similarity_score'] * 100)
                    
                    cursor.execute("""
                        INSERT INTO notifications 
                        (user_id, title, message, type, is_read, data, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        user_id,
                        f'Job Recommendation #{i} 🔍',
                        f'Great match found! {job_match["title"]} - {job_match["category"]} position. {similarity_percent}% match to your skills!',
                        'job_recommendation',
                        0,  # unread
                        f'{{"job_id": {job_match["job_id"]}, "similarity_score": {job_match["similarity_score"]:.3f}, "match_percentage": {similarity_percent}, "company": "Based on AI matching"}}',
                        datetime.now().isoformat(),
                        datetime.now().isoformat()
                    ))
                    print(f"  ✅ Recommendation {i}: {job_match['title']} ({similarity_percent}% match)")
                    recommendations_created += 1
                
                if top_recommendations:
                    print(f"  📊 Created {len(top_recommendations)} recommendations for {user_name or username}")
                else:
                    print(f"  ⚠️  No good matches found for {user_name or username}")
                    
            except Exception as e:
                print(f"❌ Error processing user {user_id}: {e}")
                continue
        
        conn.commit()
        
        # Summary
        print(f"\n📊 Total AI Recommendations Created: {recommendations_created}")
        
        # Show notification summary by user
        cursor.execute("""
            SELECT user_id, COUNT(*) as count,
                   SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
            FROM notifications 
            WHERE type = 'job_recommendation'
            GROUP BY user_id 
            ORDER BY count DESC
        """)
        user_stats = cursor.fetchall()
        
        print(f"\n👥 AI Recommendation Summary by User:")
        print("   User | Total | Unread")
        print("   -----|-------|--------")
        for user_id, total, unread in user_stats:
            print(f"   {user_id:<4} | {total:<6} | {unread:<6}")
        
        print(f"\n🎉 AI-powered job recommendations created successfully!")
        print("\n💡 Next steps:")
        print("   1. Start the backend server")
        print("   2. Talent users will see AI job recommendations")
        print("   3. Recommendations are based on actual job embeddings")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_ai_job_recommendations()
