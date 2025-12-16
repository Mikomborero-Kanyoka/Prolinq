#!/usr/bin/env python3
"""
Add a single real text ad to demonstrate the system
"""
import sqlite3
from datetime import datetime

def add_real_email_ad(title, ad_text, ad_link, created_by_id=1):
    """Add a single text ad to the database"""
    
    conn = sqlite3.connect('prolinq.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO email_ads 
            (created_by_id, title, ad_text, ad_link, is_active, impressions, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            created_by_id,
            title,
            ad_text,
            ad_link,
            True,  # is_active
            0,     # impressions
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        
        # Get the ID of the inserted ad
        ad_id = cursor.lastrowid
        print(f'✅ Successfully added email ad (ID: {ad_id})')
        print(f'📝 Title: {title}')
        print(f'🔗 Link: {ad_link}')
        print(f'📊 Status: Active (0 impressions)')
        
        return ad_id
        
    except Exception as e:
        print(f'❌ Error adding ad: {e}')
        conn.rollback()
        return None
    finally:
        conn.close()

if __name__ == "__main__":
    print('🚀 Add Real Email Ad')
    print('=' * 30)
    
    # Example usage - you can modify these values
    title = input('Enter ad title (or press Enter for default): ').strip()
    if not title:
        title = "Prolinq Pro - Premium Job Matching"
    
    ad_text = input('Enter ad text (or press Enter for default): ').strip()
    if not ad_text:
        ad_text = "Upgrade to Prolinq Pro for priority job matching, advanced analytics, and dedicated support. Get hired faster with our premium features!"
    
    ad_link = input('Enter ad link (or press Enter for default): ').strip()
    if not ad_link:
        ad_link = "https://prolinq.app/upgrade"
    
    print(f'\n📧 Adding email ad:')
    print(f'Title: {title}')
    print(f'Text: {ad_text}')
    print(f'Link: {ad_link}')
    
    confirm = input('\nConfirm? (y/n): ').lower().strip()
    if confirm == 'y':
        ad_id = add_real_email_ad(title, ad_text, ad_link)
        if ad_id:
            print(f'\n🎉 Ad added successfully!')
            print(f'💡 This ad will now appear randomly in recommendation emails')
            print(f'📊 Impressions will be tracked automatically')
    else:
        print('❌ Cancelled')
