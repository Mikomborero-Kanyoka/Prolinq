#!/usr/bin/env python3
"""
Check the email_ads table and display current ads
"""
import sqlite3

def check_email_ads():
    conn = sqlite3.connect('prolinq.db')
    cursor = conn.cursor()

    try:
        # Check if email_ads table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='email_ads'")
        table_exists = cursor.fetchone()

        if table_exists:
            print('✅ email_ads table exists')
            
            # Get total count
            cursor.execute('SELECT COUNT(*) FROM email_ads')
            count = cursor.fetchone()[0]
            print(f'📊 Total ads in database: {count}')
            
            if count > 0:
                # Show all ads
                cursor.execute('SELECT id, title, ad_text, ad_link, is_active, impressions FROM email_ads')
                ads = cursor.fetchall()
                print('\n📋 Current ads:')
                for ad in ads:
                    status = '✅ Active' if ad[4] else '❌ Inactive'
                    print(f'  ID {ad[0]}: {ad[1]}')
                    print(f'      Text: {ad[2][:50]}...' if len(ad[2]) > 50 else f'      Text: {ad[2]}')
                    print(f'      Link: {ad[3]}')
                    print(f'      Status: {status} ({ad[5]} impressions)')
                    print()
            else:
                print('❌ No ads found in email_ads table')
                print('💡 This explains why no ads appear in emails!')
        else:
            print('❌ email_ads table does not exist')
            print('💡 Need to run database migrations first')

    except Exception as e:
        print(f'❌ Error: {e}')
    finally:
        conn.close()

if __name__ == "__main__":
    check_email_ads()
