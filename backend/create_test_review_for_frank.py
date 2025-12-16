import sqlite3
from datetime import datetime

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# Find Frank Kamambo and a reviewer
cursor.execute('SELECT id, username, full_name FROM users WHERE username = "kamambo"')
frank = cursor.fetchone()
print(f'Frank Kamambo: {frank}')

# Find a reviewer (let's use the first user that's not Frank)
cursor.execute('SELECT id, username, full_name FROM users WHERE id != ? LIMIT 1', (frank[0],))
reviewer = cursor.fetchone()
print(f'Reviewer: {reviewer}')

# Find a job for the review
cursor.execute('SELECT id, title FROM jobs WHERE creator_id = ? LIMIT 1', (reviewer[0],))
job = cursor.fetchone()
print(f'Job: {job}')

if frank and reviewer and job:
    # Create a test review for Frank Kamambo
    cursor.execute('''
        INSERT INTO reviews (job_id, reviewer_id, reviewed_user_id, rating, comment, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        job[0],  # job_id
        reviewer[0],  # reviewer_id  
        frank[0],  # reviewed_user_id (Frank Kamambo)
        4,  # rating (4 stars)
        'Excellent work! Very professional and delivered on time.',  # comment
        datetime.now().isoformat(),  # created_at
        datetime.now().isoformat()   # updated_at
    ))
    
    conn.commit()
    print('Test review created successfully for Frank Kamambo!')
    
    # Verify the review was created
    cursor.execute('''
        SELECT r.id, r.rating, r.comment, r.created_at, reviewer.full_name as reviewer_name 
        FROM reviews r 
        JOIN users reviewer ON r.reviewer_id = reviewer.id 
        WHERE r.reviewed_user_id = ?
    ''', (frank[0],))
    reviews = cursor.fetchall()
    print('Frank Kamambo reviews:', reviews)
else:
    print('Could not create test review - missing data')

conn.close()
