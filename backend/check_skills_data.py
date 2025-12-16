import sqlite3
import json

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()
cursor.execute('SELECT id, full_name, skills FROM users LIMIT 10')
rows = cursor.fetchall()

print("=" * 80)
print("USER SKILLS DATA")
print("=" * 80)

for row in rows:
    user_id, full_name, skills = row
    print(f"\nUser {user_id}: {full_name}")
    if skills:
        try:
            skills_list = json.loads(skills)
            print(f"  Skills ({len(skills_list)}):")
            for skill in skills_list:
                print(f"    - {skill.get('skill_name')} ({skill.get('proficiency_level')})")
        except:
            print(f"  Skills (raw): {skills[:100]}...")
    else:
        print(f"  Skills: None")

conn.close()