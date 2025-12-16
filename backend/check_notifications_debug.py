import sqlite3

# Check if notifications table exists
conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='notifications'")
    result = cursor.fetchone()
    if result:
        print('✅ Notifications table exists')
        
        # Check table structure
        cursor.execute('PRAGMA table_info(notifications)')
        columns = cursor.fetchall()
        print('Table structure:')
        for col in columns:
            print(f'  {col[1]} {col[2]} (nullable: {not col[3]})')
            
        # Check if there are any notifications
        cursor.execute('SELECT COUNT(*) FROM notifications')
        count = cursor.fetchone()[0]
        print(f'Total notifications: {count}')
        
        # Check a sample notification if any exist
        if count > 0:
            cursor.execute('SELECT * FROM notifications LIMIT 1')
            sample = cursor.fetchone()
            print(f'Sample notification: {sample}')
        
    else:
        print('❌ Notifications table does not exist')
        
except Exception as e:
    print(f'Error checking table: {e}')
finally:
    conn.close()
