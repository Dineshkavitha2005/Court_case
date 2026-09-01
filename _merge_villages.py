import json
import sqlite3
import os

# Collect all villages from all sources
all_villages = {}  # key: (village_name.lower().strip(), district) -> village dict

# Source 1: village_database.json (2587 entries)
print("Loading village_database.json...")
with open('village_database.json', 'r', encoding='utf-8') as f:
    db_data = json.load(f)
for v in db_data:
    name = v['village_name'].strip()
    district = v['district'].strip()
    key = (name.lower(), district.lower())
    if key not in all_villages:
        all_villages[key] = {'village_name': name, 'district': district, 'state': v['state']}
print(f"  After village_database.json: {len(all_villages)} villages")

# Source 2: villages.json (10261 entries)
print("Loading villages.json...")
with open('villages.json', 'r', encoding='utf-8') as f:
    vlist_data = json.load(f)
for v in vlist_data['villages']:
    name = v['name'].strip()
    district = v['district'].strip()
    key = (name.lower(), district.lower())
    if key not in all_villages:
        all_villages[key] = {'village_name': name, 'district': district, 'state': 'Tamil Nadu'}
print(f"  After villages.json: {len(all_villages)} villages")

# Source 3: Check DBs
for db_file in ['villages.db', 'village_database.db']:
    if os.path.exists(db_file):
        print(f"Loading {db_file}...")
        try:
            conn = sqlite3.connect(db_file)
            c = conn.cursor()
            c.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = c.fetchall()
            for t in tables:
                tname = t[0]
                c.execute(f"PRAGMA table_info([{tname}])")
                cols = [r[1] for r in c.fetchall()]
                print(f"  Table '{tname}' columns: {cols}")
                c.execute(f"SELECT COUNT(*) FROM [{tname}]")
                count = c.fetchone()[0]
                print(f"  Table '{tname}' has {count} rows")
                
                # Try to find village_name, district columns
                name_col = None
                dist_col = None
                for col in cols:
                    if col.lower() in ('village_name', 'name', 'village'):
                        name_col = col
                    if col.lower() in ('district', 'dist'):
                        dist_col = col
                
                if name_col and dist_col:
                    c.execute(f"SELECT [{name_col}], [{dist_col}] FROM [{tname}]")
                    rows = c.fetchall()
                    added = 0
                    for row in rows:
                        name = str(row[0]).strip()
                        district = str(row[1]).strip()
                        if name and district:
                            key = (name.lower(), district.lower())
                            if key not in all_villages:
                                all_villages[key] = {'village_name': name, 'district': district, 'state': 'Tamil Nadu'}
                                added += 1
                    print(f"    Added {added} new villages from {tname}")
            conn.close()
        except Exception as e:
            print(f"  Error reading {db_file}: {e}")

# Build final list with IDs
result = []
for idx, (key, v) in enumerate(sorted(all_villages.items()), 1):
    result.append({
        'village_id': idx,
        'village_name': v['village_name'],
        'district': v['district'],
        'state': v['state']
    })

print(f"\nTotal unique villages: {len(result)}")

# Count by district
from collections import Counter
district_counts = Counter(v['district'] for v in result)
print(f"Districts: {len(district_counts)}")
for d, c in sorted(district_counts.items()):
    print(f"  {d}: {c}")

# Write to village_database.json
with open('village_database.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
print(f"\nWritten {len(result)} villages to village_database.json")
