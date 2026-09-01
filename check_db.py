import sqlite3, json

# Check villages.db
conn = sqlite3.connect('villages.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
print("Tables:", tables)

cursor.execute("SELECT COUNT(*) FROM villages")
total = cursor.fetchone()[0]
print(f"Total villages: {total}")

cursor.execute("SELECT district_name, COUNT(*) FROM villages GROUP BY district_name ORDER BY district_name")
print("\nDistrict breakdown from villages.db:")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]}")
conn.close()

# Check village_database.json
print("\n--- village_database.json ---")
with open('village_database.json', 'r', encoding='utf-8') as f:
    vdb = json.load(f)
print(f"Total entries: {len(vdb)}")

districts_vdb = {}
for v in vdb:
    d = v.get('district', 'UNKNOWN')
    if d not in districts_vdb:
        districts_vdb[d] = 0
    districts_vdb[d] += 1
print("District breakdown:")
for d in sorted(districts_vdb.keys()):
    print(f"  {d}: {districts_vdb[d]}")

# Check villages.json
print("\n--- villages.json ---")
with open('villages.json', 'r', encoding='utf-8') as f:
    vj = json.load(f)
print(f"Total villages: {vj.get('total_villages', 'N/A')}")
print(f"District counts: {vj.get('district_counts', {})}")
districts_vj = {}
for v in vj.get('villages', []):
    d = v.get('district_name', 'UNKNOWN')
    if d not in districts_vj:
        districts_vj[d] = 0
    districts_vj[d] += 1
print("Actual district breakdown:")
for d in sorted(districts_vj.keys()):
    print(f"  {d}: {districts_vj[d]}")
