import sqlite3
from datetime import datetime

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# Update the first talent user with test data
cursor.execute("""
    UPDATE users 
    SET 
        professional_title = 'Senior Full Stack Developer',
        location = 'San Francisco, CA',
        cover_image = NULL,
        bio = 'Passionate developer with 5+ years of experience',
        portfolio_link = 'https://github.com/example'
    WHERE id = 1
""")

# Update the second user (employer) with company data
cursor.execute("""
    UPDATE users 
    SET 
        professional_title = 'Hiring Manager',
        location = 'New York, NY',
        company_name = 'Tech Innovations Inc',
        company_email = 'info@techinnovations.com',
        company_cell = '+1-212-555-0100',
        company_address = '123 Tech Avenue, New York, NY 10001'
    WHERE id = 2
""")

# Update the third user
cursor.execute("""
    UPDATE users 
    SET 
        professional_title = 'Product Manager',
        location = 'Austin, TX',
        portfolio_link = 'https://linkedin.com/in/example'
    WHERE id = 3
""")

conn.commit()

# Verify updates
cursor.execute("SELECT id, full_name, professional_title, location, company_name FROM users")
users = cursor.fetchall()

print("Updated users:")
for user_id, name, prof_title, location, company in users:
    print(f"\nID {user_id}: {name}")
    print(f"  Title: {prof_title}")
    print(f"  Location: {location}")
    print(f"  Company: {company}")

conn.close()
print("\n✅ Test data populated successfully!")