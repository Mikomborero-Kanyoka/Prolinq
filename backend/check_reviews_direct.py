#!/usr/bin/env python3
"""
Direct database check for reviews to identify why they're not displaying in UI
"""

import sqlite3
from datetime import datetime

def check_reviews_system():
    """Check the complete review system directly from database"""
    print("🔍 DIRECT DATABASE REVIEW SYSTEM CHECK")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect("prolinq.db")
        cursor = conn.cursor()
        
        # Check if reviews table exists
        print("\n1️⃣ Checking reviews table structure...")
        cursor.execute("PRAGMA table_info(reviews)")
        columns = cursor.fetchall()
        
        if columns:
            print("✅ Reviews table exists with columns:")
            for col in columns:
                print(f"   - {col[1]} ({col[2]})")
        else:
            print("❌ Reviews table doesn't exist!")
            return False
        
        # Check total reviews count
        print("\n2️⃣ Checking total reviews in database...")
        cursor.execute("SELECT COUNT(*) FROM reviews")
        total_reviews = cursor.fetchone()[0]
        print(f"✅ Total reviews in database: {total_reviews}")
        
        if total_reviews == 0:
            print("❌ No reviews found in database!")
            print("   This is likely why reviews aren't showing in UI.")
            print("   Reviews need to be created first via job completion.")
            return False
        
        # Check recent reviews with full details
        print("\n3️⃣ Checking recent reviews with user details...")
        cursor.execute("""
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                r.reviewer_id,
                r.reviewed_user_id,
                reviewer.full_name as reviewer_name,
                reviewee.full_name as reviewee_name,
                j.title as job_title
            FROM reviews r
            JOIN users reviewer ON r.reviewer_id = reviewer.id
            JOIN users reviewee ON r.reviewed_user_id = reviewee.id
            LEFT JOIN jobs j ON r.job_id = j.id
            ORDER BY r.created_at DESC
            LIMIT 10
        """)
        
        recent_reviews = cursor.fetchall()
        
        if recent_reviews:
            print(f"✅ Found {len(recent_reviews)} recent reviews:")
            for i, review in enumerate(recent_reviews):
                review_id, rating, comment, created_at, reviewer_id, reviewed_user_id, reviewer_name, reviewee_name, job_title = review
                print(f"\n   {i+1}. Review ID: {review_id}")
                print(f"      Rating: {rating}/5")
                print(f"      Comment: {comment[:100]}{'...' if len(comment) > 100 else ''}")
                print(f"      Reviewer: {reviewer_name} (ID: {reviewer_id})")
                print(f"      Reviewee: {reviewee_name} (ID: {reviewed_user_id})")
                print(f"      Job: {job_title or 'Unknown'}")
                print(f"      Created: {created_at}")
        else:
            print("❌ No reviews found even though count > 0")
            print("   This suggests a data integrity issue.")
        
        # Check reviews for specific users
        print("\n4️⃣ Checking reviews per user...")
        cursor.execute("""
            SELECT 
                reviewed_user_id,
                reviewee.full_name,
                COUNT(*) as review_count,
                AVG(rating) as avg_rating
            FROM reviews r
            JOIN users reviewee ON r.reviewed_user_id = reviewee.id
            GROUP BY reviewed_user_id, reviewee.full_name
            ORDER BY review_count DESC
        """)
        
        user_reviews = cursor.fetchall()
        
        if user_reviews:
            print("✅ Reviews per user:")
            for user_id, name, count, avg_rating in user_reviews:
                print(f"   - {name} (ID: {user_id}): {count} reviews, avg rating: {avg_rating:.1f}/5")
        else:
            print("❌ No user reviews found")
        
        # Check if there are any completed jobs that should have reviews
        print("\n5️⃣ Checking completed jobs...")
        cursor.execute("""
            SELECT 
                j.id,
                j.title,
                j.status,
                j.talent_rating,
                j.employer_rating,
                creator.full_name as creator_name,
                assigned.full_name as assigned_name
            FROM jobs j
            JOIN users creator ON j.creator_id = creator.id
            LEFT JOIN users assigned ON j.assigned_to = assigned.id
            WHERE j.status = 'completed'
            ORDER BY j.updated_at DESC
            LIMIT 10
        """)
        
        completed_jobs = cursor.fetchall()
        
        if completed_jobs:
            print(f"✅ Found {len(completed_jobs)} completed jobs:")
            for job in completed_jobs:
                job_id, title, status, talent_rating, employer_rating, creator_name, assigned_name = job
                print(f"\n   Job ID: {job_id}")
                print(f"   Title: {title}")
                print(f"   Status: {status}")
                print(f"   Creator: {creator_name}")
                print(f"   Assigned to: {assigned_name or 'Unassigned'}")
                print(f"   Talent Rating: {talent_rating or 'Not set'}")
                print(f"   Employer Rating: {employer_rating or 'Not set'}")
        else:
            print("ℹ️ No completed jobs found")
            print("   Reviews are typically created when jobs are completed.")
        
        # Check applications table for completed applications
        print("\n6️⃣ Checking completed applications...")
        cursor.execute("""
            SELECT 
                a.id,
                a.status,
                a.rating,
                a.review,
                a.completion_notes,
                job.title as job_title,
                applicant.full_name as applicant_name,
                creator.full_name as creator_name
            FROM applications a
            JOIN jobs job ON a.job_id = job.id
            JOIN users applicant ON a.applicant_id = applicant.id
            JOIN users creator ON job.creator_id = creator.id
            WHERE a.status = 'completed'
            ORDER BY a.updated_at DESC
            LIMIT 10
        """)
        
        completed_applications = cursor.fetchall()
        
        if completed_applications:
            print(f"✅ Found {len(completed_applications)} completed applications:")
            for app in completed_applications:
                app_id, status, rating, review, notes, job_title, applicant_name, creator_name = app
                print(f"\n   Application ID: {app_id}")
                print(f"   Job: {job_title}")
                print(f"   Applicant: {applicant_name}")
                print(f"   Creator: {creator_name}")
                print(f"   Status: {status}")
                print(f"   Rating: {rating or 'Not set'}")
                print(f"   Review: {review[:50] if review else 'None'}{'...' if review and len(review) > 50 else ''}")
        else:
            print("ℹ️ No completed applications found")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("🎯 DIAGNOSIS COMPLETE")
        print("=" * 60)
        
        if total_reviews == 0:
            print("❌ ROOT CAUSE IDENTIFIED:")
            print("   No reviews exist in the database.")
            print("   Reviews are created when:")
            print("   1. Jobs are marked as completed")
            print("   2. Applications are marked as completed with ratings")
            print("   3. Job completion endpoint is called with review data")
            print("\n   SOLUTION:")
            print("   1. Complete some jobs/applications with reviews")
            print("   2. Use the job completion endpoint to create reviews")
            print("   3. Check if the review creation logic is working")
        elif len(recent_reviews) == 0:
            print("⚠️ DATA INTEGRITY ISSUE:")
            print("   Reviews exist but can't be queried with user joins")
            print("   This suggests orphaned reviews or user data issues")
        else:
            print("✅ REVIEWS EXIST IN DATABASE:")
            print("   The issue is likely in:")
            print("   1. Frontend API calls to /api/reviews/user/{id}")
            print("   2. Authentication issues with the reviews endpoint")
            print("   3. ReviewsSection component rendering logic")
            print("   4. Network connectivity between frontend and backend")
        
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

if __name__ == "__main__":
    check_reviews_system()
