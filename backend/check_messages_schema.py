from database import engine
from sqlalchemy import text
import sys

try:
    with engine.connect() as conn:
        result = conn.execute(text('PRAGMA table_info(messages)'))
        columns = result.fetchall()
        print('Messages table columns:')
        for col in columns:
            print(f'  {col[1]} ({col[2]})')
        
        # Check if reply_to_id exists
        has_reply_to = any(col[1] == 'reply_to_id' for col in columns)
        if has_reply_to:
            print('\n✅ reply_to_id column exists')
        else:
            print('\n❌ reply_to_id column MISSING!')
            
        # Also check for replied_to_id (old name)
        has_replied_to = any(col[1] == 'replied_to_id' for col in columns)
        if has_replied_to:
            print('✅ replied_to_id column exists')
        else:
            print('❌ replied_to_id column does not exist')
            
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
