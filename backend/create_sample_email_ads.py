#!/usr/bin/env python3
"""
Create sample text-based email ads for the email_ads table
"""
import sqlite3
from datetime import datetime

def create_sample_email_ads():
    conn = sqlite3.connect('prolinq.db')
    cursor = conn.cursor()

    # Sample text ads for emails
    sample_ads = [
        {
            'title': 'Prolinq Pro - Upgrade Your Job Search',
            'ad_text': 'Get priority access to the best job opportunities, advanced AI matching, and dedicated support. Limited time offer: 30% off your first month! Stand out from the competition and land your dream job faster.',
            'ad_link': 'https://prolinq.app/upgrade',
            'created_by_id': 1  # Assuming admin user ID 1
        },
        {
            'title': 'Career Development Courses',
            'ad_text': 'Enhance your skills with our professional development courses. Learn in-demand technologies, get certified, and boost your earning potential. Special discount for Prolinq members!',
            'ad_link': 'https://prolinq.app/courses',
            'created_by_id': 1
        },
        {
            'title': 'Resume Writing Service',
            'ad_text': 'Professional resume writers will transform your resume to highlight your strengths and pass ATS screenings. Get 2x more interviews with a polished, professional resume.',
            'ad_link': 'https://prolinq.app/resume-service',
            'created_by_id': 1
        },
        {
            'title': 'Employer Spotlight - TechCorp Hiring',
            'ad_text': 'TechCorp is actively hiring developers, designers, and project managers. Competitive salaries, remote options, and amazing company culture. Apply today!',
            'ad_link': 'https://prolinq.app/employers/techcorp',
            'created_by_id': 1
        },
        {
            'title': 'Interview Preparation Masterclass',
            'ad_text': 'Ace your next interview with our comprehensive preparation course. Practice with real interview questions, get expert feedback, and build confidence.',
            'ad_link': 'https://prolinq.app/interview-prep',
            'created_by_id': 1
        }
    ]

    try:
        print('🚀 Creating sample email ads...')
        
        # Clear existing ads (if any)
        cursor.execute('DELETE FROM email_ads')
        
        # Insert sample ads
        for ad in sample_ads:
            cursor.execute("""
                INSERT INTO email_ads 
                (created_by_id, title, ad_text, ad_link, is_active, impressions, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ad['created_by_id'],
                ad['title'],
                ad['ad_text'],
                ad['ad_link'],
                True,  # is_active
                0,     # impressions
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            print(f'✅ Created ad: {ad["title"]}')
        
        conn.commit()
        
        # Verify creation
        cursor.execute('SELECT COUNT(*) FROM email_ads WHERE is_active = 1')
        active_count = cursor.fetchone()[0]
        
        print(f'\n📊 Successfully created {active_count} active email ads')
        print('\n🎉 Email ads are now ready to appear in recommendation emails!')
        print('\n💡 Next steps:')
        print('   1. Send a test recommendation email to verify ads appear')
        print('   2. Check admin dashboard for email ad management')
        print('   3. Monitor ad impressions in email metrics')
        
    except Exception as e:
        print(f'❌ Error creating email ads: {e}')
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_email_ads()
