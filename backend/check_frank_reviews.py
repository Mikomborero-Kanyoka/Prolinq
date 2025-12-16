import sqlite3

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# Find Frank Kamambo
cursor.execute('SELECT id, username, full_name FROM users WHERE username LIKE "%Frank%" OR full_name LIKE "%Frank%" OR username LIKE "%Kamambo%" OR full_name LIKE "%Kamambo%"')
users = cursor.fetchall()
print('Users found:', users)

if users:
    user_id = users[0][0]
    print(f'\nChecking reviews for user ID {user_id}...')
    
    # Check reviews for this user
    cursor.execute('''
        SELECT r.id, r.rating, r.comment, r.created_at, reviewer.full_name as reviewer_name 
        FROM reviews r 
        JOIN users reviewer ON r.reviewer_id = reviewer.id 
        WHERE r.reviewed_user_id = ?
    ''', (user_id,))
    reviews = cursor.fetchall()
    print('Reviews found:', reviews)
    
    # Also check all reviews in the database
    cursor.execute('SELECT COUNT(*) FROM reviews')
    total_reviews = cursor.fetchone()[0]
    print(f'Total reviews in database: {total_reviews}')
    
    if total_reviews > 0:
        cursor.execute('''
            SELECT r.id, r.rating, r.comment, r.created_at, 
                   reviewer.full_name as reviewer_name,
                   reviewed_user.full_name as reviewed_user_name
            FROM reviews r 
            JOIN users reviewer ON r.reviewer_id = reviewer.id 
            JOIN users reviewed_user ON r.reviewed_user_id = reviewed_user.id
            LIMIT 5
        ''')
        all_reviews = cursor.fetchall()
        print('Sample reviews:', all_reviews)
else:
    print('No Frank Kamambo found in database')

conn.close()
