import sqlite3

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# Check admin user
cursor.execute("SELECT email, is_admin, is_verified, is_active FROM users WHERE email = ?", ("admin@prolinq.com",))
result = cursor.fetchone()
print('Admin user data:', result)

# Check all users with admin status
cursor.execute("SELECT email, is_admin FROM users WHERE is_admin = 1")
admin_users = cursor.fetchall()
print('All admin users:', admin_users)

conn.close()
