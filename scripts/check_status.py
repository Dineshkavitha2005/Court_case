import sqlite3, json

# Check villages.db status
conn = sqlite3.connect('villages.db')
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM districts")
print(f"Districts in DB: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM sub_districts")
total_sd = cursor.fetchone()[0]
print(f"Total sub-districts: {total_sd}")

cursor.execute("SELECT COUNT(*) FROM sub_districts WHERE scraped = 1")
scraped_sd = cursor.fetchone()[0]
print(f"Scraped sub-districts: {scraped_sd}")

cursor.execute("SELECT COUNT(*) FROM sub_districts WHERE scraped = 0")
remaining_sd = cursor.fetchone()[0]
print(f"Remaining sub-districts: {remaining_sd}")

cursor.execute("SELECT COUNT(*) FROM villages")
print(f"Villages in DB: {cursor.fetchone()[0]}")

print("\n--- District breakdown (villages) ---")
cursor.execute("SELECT district_name, COUNT(*) FROM villages GROUP BY district_name ORDER BY district_name")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]}")

print("\n--- Unscraped sub-districts by district ---")
cursor.execute("SELECT district_name, COUNT(*) FROM sub_districts WHERE scraped = 0 GROUP BY district_name ORDER BY district_name")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]} remaining")

conn.close()

# Check all_subdistricts.json
print("\n--- all_subdistricts.json ---")
with open('all_subdistricts.json', 'r', encoding='utf-8') as f:
    all_sd = json.load(f)
print(f"Total sub-districts in file: {len(all_sd)}")

# Check districts
districts = set()
for sd in all_sd:
    districts.add(sd['district'])
print(f"Districts in file: {len(districts)}")
