import json, sqlite3, os
from collections import Counter

# Check village_database.json
with open('village_database.json', 'r', encoding='utf-8') as f:
    db_data = json.load(f)
print(f'village_database.json: {len(db_data)} villages')

# Check villages.json
with open('villages.json', 'r', encoding='utf-8') as f:
    vlist_data = json.load(f)
print(f'villages.json: {len(vlist_data["villages"])} villages')

# Check villages.db
if os.path.exists('villages.db'):
    conn = sqlite3.connect('villages.db')
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = c.fetchall()
    for t in tables:
        tname = t[0]
        c.execute(f"SELECT COUNT(*) FROM [{tname}]")
        count = c.fetchone()[0]
        print(f'villages.db - table {tname}: {count} rows')
    conn.close()

# Check village_database.db
if os.path.exists('village_database.db'):
    conn = sqlite3.connect('village_database.db')
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = c.fetchall()
    for t in tables:
        tname = t[0]
        c.execute(f"SELECT COUNT(*) FROM [{tname}]")
        count = c.fetchone()[0]
        print(f'village_database.db - table {tname}: {count} rows')
    conn.close()

# Districts in villages.json
vj_districts = Counter(v['district'] for v in vlist_data['villages'])
print(f'\nvillages.json districts: {len(vj_districts)}')
for d, c in sorted(vj_districts.items()):
    print(f'  {d}: {c}')

# Districts in village_database.json
db_districts = Counter(v['district'] for v in db_data)
print(f'\nvillage_database.json districts: {len(db_districts)}')
for d, c in sorted(db_districts.items()):
    print(f'  {d}: {c}')

# Check if villages in villages.json that are NOT in village_database.json
db_keys = set()
for v in db_data:
    db_keys.add((v['village_name'].lower().strip(), v['district'].lower().strip()))

vj_keys = set()
for v in vlist_data['villages']:
    vj_keys.add((v['name'].lower().strip(), v['district'].lower().strip()))

missing_from_db = vj_keys - db_keys
print(f'\nVillages in villages.json but NOT in village_database.json: {len(missing_from_db)}')

# Districts in generate_tn_database.py
try:
    from generate_tn_database import TAMIL_NADU_DATA
    total_tn = 0
    tn_villages = set()
    for dist, info in TAMIL_NADU_DATA.items():
        for taluk, villages in info['taluks'].items():
            total_tn += len(villages)
            for v in villages:
                tn_villages.add((v.lower().strip(), dist.lower().strip()))
    print(f'\ngenerate_tn_database.py hardcoded: {total_tn} villages')
    missing_from_db_tn = tn_villages - db_keys
    print(f'From generate_tn_database.py not in village_database.json: {len(missing_from_db_tn)}')
except Exception as e:
    print(f'Error loading generate_tn_database: {e}')

# Districts in villages.json that don't appear in village_database.json
vj_only_districts = set(v['district'] for v in vlist_data['villages']) - set(v['district'] for v in db_data)
print(f'\nDistricts in villages.json but NOT in village_database.json: {vj_only_districts}')

# Total unique from all sources combined
all_villages = {}
for v in db_data:
    key = (v['village_name'].lower().strip(), v['district'].lower().strip())
    if key not in all_villages:
        all_villages[key] = v

for v in vlist_data['villages']:
    key = (v['name'].lower().strip(), v['district'].lower().strip())
    if key not in all_villages:
        all_villages[key] = {'village_name': v['name'], 'district': v['district'], 'state': 'Tamil Nadu', 'village_id': 0}

if os.path.exists('villages.db'):
    conn = sqlite3.connect('villages.db')
    c = conn.cursor()
    try:
        c.execute("SELECT name, district_name FROM villages")
        rows = c.fetchall()
        for name, district in rows:
            key = (name.lower().strip(), district.lower().strip())
            if key not in all_villages:
                all_villages[key] = {'village_name': name, 'district': district, 'state': 'Tamil Nadu', 'village_id': 0}
    except:
        pass
    conn.close()

print(f'\nTotal unique villages across ALL sources: {len(all_villages)}')
print(f'Target: ~15,771')
print(f'Shortfall: ~{15771 - len(all_villages)}')
