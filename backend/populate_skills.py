import sqlite3
import json

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()

# Update user 1 with skills
skills_user1 = json.dumps([
    {"id": 1, "skill_name": "Python", "proficiency_level": "expert"},
    {"id": 2, "skill_name": "JavaScript", "proficiency_level": "expert"},
    {"id": 3, "skill_name": "React", "proficiency_level": "advanced"},
    {"id": 4, "skill_name": "FastAPI", "proficiency_level": "advanced"}
])

# Update user 3 with skills
skills_user3 = json.dumps([
    {"id": 1, "skill_name": "Product Management", "proficiency_level": "expert"},
    {"id": 2, "skill_name": "Data Analysis", "proficiency_level": "advanced"},
    {"id": 3, "skill_name": "SQL", "proficiency_level": "advanced"}
])

cursor.execute("UPDATE users SET skills = ? WHERE id = 1", (skills_user1,))
cursor.execute("UPDATE users SET skills = ? WHERE id = 3", (skills_user3,))

conn.commit()

# Verify
cursor.execute("SELECT id, full_name, skills FROM users WHERE skills IS NOT NULL")
users = cursor.fetchall()

print("Users with skills:")
for user_id, name, skills_json in users:
    skills_list = json.loads(skills_json)
    print(f"\nUser {user_id}: {name}")
    for skill in skills_list:
        print(f"  - {skill['skill_name']} ({skill['proficiency_level']})")

conn.close()
print("\n✅ Skills populated successfully!")