import sqlite3
import json

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# Add skills to user 1
test_skills = json.dumps([
    {"id": 1, "skill_name": "Python", "proficiency_level": "expert"},
    {"id": 2, "skill_name": "JavaScript", "proficiency_level": "advanced"},
    {"id": 3, "skill_name": "React", "proficiency_level": "advanced"},
    {"id": 4, "skill_name": "FastAPI", "proficiency_level": "expert"}
])

cursor.execute("UPDATE users SET skills = ? WHERE id = 1", (test_skills,))

# Add skills to user 3
test_skills_3 = json.dumps([
    {"id": 1, "skill_name": "UI/UX Design", "proficiency_level": "expert"},
    {"id": 2, "skill_name": "Figma", "proficiency_level": "advanced"},
    {"id": 3, "skill_name": "CSS", "proficiency_level": "advanced"}
])

cursor.execute("UPDATE users SET skills = ? WHERE id = 3", (test_skills_3,))

conn.commit()

# Verify
cursor.execute('SELECT id, full_name, skills FROM users WHERE id IN (1, 3)')
rows = cursor.fetchall()

print("=" * 80)
print("UPDATED SKILLS")
print("=" * 80)

for user_id, full_name, skills in rows:
    print(f"\nUser {user_id}: {full_name}")
    if skills:
        skills_list = json.loads(skills)
        print(f"  Skills ({len(skills_list)}):")
        for skill in skills_list:
            print(f"    - {skill.get('skill_name')} ({skill.get('proficiency_level')})")

conn.close()
print("\n✅ Test skills added successfully!")