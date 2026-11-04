"""
Final merge: combine all village sources into village_database.json
Sources: villages.db, village_database.db, villages.json, village_database.json, generate_tn_database.py
"""
import json
import sqlite3
import os
from collections import Counter

JSON_PATH = os.path.join(os.path.dirname(__file__), "village_database.json")

DISTRICT_NORMALIZE = {
    'thoothukkudi': 'Thoothukudi', 'thoothukudi': 'Thoothukudi',
    'kancheepuram': 'Kancheepuram', 'kanchipuram': 'Kancheepuram',
    'kanniyakumari': 'Kanniyakumari', 'kanyakumari': 'Kanniyakumari',
    'the nilgiris': 'The Nilgiris', 'nilgiris': 'The Nilgiris',
    'chengalpattu': 'Chengalpattu', 'chengalpet': 'Chengalpattu',
    'chennai': 'Chennai', 'madras': 'Chennai',
    'kallakurichi': 'Kallakurichi', 'mayiladuthurai': 'Mayiladuthurai',
    'ranipet': 'Ranipet', 'tenkasi': 'Tenkasi', 'tirupathur': 'Tirupathur',
    'vellore': 'Vellore', 'krishnagiri': 'Krishnagiri', 'madurai': 'Madurai',
    'nagapattinam': 'Nagapattinam', 'namakkal': 'Namakkal',
    'perambalur': 'Perambalur', 'pudukkottai': 'Pudukkottai',
}

def normalize_district(name):
    key = name.strip().lower()
    return DISTRICT_NORMALIZE.get(key, name.strip())

all_villages = {}

def add_village(name, district, state='Tamil Nadu'):
    name = str(name).strip()
    district = normalize_district(str(district).strip())
    if not name or not district or len(name) < 2:
        return
    # Clean up name - remove leading numbers/dots like "100.Paruthiyur" -> "Paruthiyur"
    import re
    cleaned = re.sub(r'^\d+[\.\s]+', '', name).strip()
    if cleaned:
        name = cleaned
    key = (name.lower(), district.lower())
    if key not in all_villages:
        all_villages[key] = {
            'village_name': name,
            'district': district,
            'state': state
        }

# Source 1: villages.db (main scraped database - 13,981 villages)
print("Loading villages.db...")
conn = sqlite3.connect('villages.db')
c = conn.cursor()
c.execute("SELECT name, district_name FROM villages")
rows = c.fetchall()
for name, district in rows:
    add_village(name, district)
print(f"  After villages.db: {len(all_villages)} villages")
conn.close()

# Source 2: villages.json (scraped from vlist.in - 10,261 villages)
print("Loading villages.json...")
with open('villages.json', 'r', encoding='utf-8') as f:
    vlist_data = json.load(f)
for v in vlist_data['villages']:
    add_village(v['name'], v['district'])
print(f"  After villages.json: {len(all_villages)} villages")

# Source 3: village_database.json (existing merged - 10,535 villages)
print("Loading village_database.json...")
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    db_data = json.load(f)
for v in db_data:
    add_village(v['village_name'], v['district'], v.get('state', 'Tamil Nadu'))
print(f"  After village_database.json: {len(all_villages)} villages")

# Source 4: village_database.db
print("Loading village_database.db...")
if os.path.exists('village_database.db'):
    conn = sqlite3.connect('village_database.db')
    c = conn.cursor()
    try:
        c.execute("SELECT village_name, district FROM villages")
        rows = c.fetchall()
        for name, district in rows:
            add_village(name, district)
    except:
        pass
    conn.close()
print(f"  After village_database.db: {len(all_villages)} villages")

# Source 5: generate_tn_database.py hardcoded data
print("Loading generate_tn_database.py...")
try:
    from generate_tn_database import TAMIL_NADU_DATA
    for dist_name, dist_info in TAMIL_NADU_DATA.items():
        for taluk_name, village_list in dist_info['taluks'].items():
            for v_name in village_list:
                add_village(v_name, dist_name)
except Exception as e:
    print(f"  Error: {e}")
print(f"  After generate_tn_database.py: {len(all_villages)} villages")

# Build final sorted list with IDs
result = []
for idx, (key, v) in enumerate(sorted(all_villages.items()), 1):
    result.append({
        'village_id': idx,
        'village_name': v['village_name'],
        'district': v['district'],
        'state': v['state']
    })

# Stats
district_counts = Counter(v['district'] for v in result)
print(f"\n{'='*60}")
print(f"FINAL RESULTS")
print(f"{'='*60}")
print(f"Total unique villages: {len(result)}")
print(f"Districts: {len(district_counts)}")
print(f"\nVillages by district:")
for d, c in sorted(district_counts.items()):
    print(f"  {d}: {c}")

# Write to file
with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

file_size = os.path.getsize(JSON_PATH) / (1024 * 1024)
print(f"\nWritten {len(result)} villages to {JSON_PATH}")
print(f"File size: {file_size:.2f} MB")
print(f"\nSchema: village_id, village_name, district, state")
