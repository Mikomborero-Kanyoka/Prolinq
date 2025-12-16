import sqlite3

conn = sqlite3.connect('prolinq.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()

print("Current users table columns:")
print("-" * 80)
for col in columns:
    cid, name, type_, notnull, dflt_value, pk = col
    print(f"ID: {cid:2d} | Name: {name:20s} | Type: {type_:10s} | NotNull: {notnull} | PK: {pk}")

conn.close()

# Check for missing columns
required_fields = ['professional_title', 'location', 'cover_image', 'company_name', 'company_email', 'company_cell', 'company_address']
existing_fields = [col[1] for col in columns]
missing = [f for f in required_fields if f not in existing_fields]

if missing:
    print(f"\n❌ Missing fields: {missing}")
else:
    print("\n✅ All required fields exist!")