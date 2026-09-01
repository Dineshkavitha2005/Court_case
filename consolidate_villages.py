"""
Consolidate all village data into village_database.json (~15,771 villages)
- Scrapes missing sub-districts from vlist.in
- Merges villages.db, village_database.db, generate_tn_database.py hardcoded data
- Deduplicates and normalizes district names
- Output: village_database.json with village_name, district, state
"""

import json
import sqlite3
import os
import re
import time
import random
import urllib.request
from html.parser import HTMLParser
from collections import Counter

BASE_URL = "https://vlist.in"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36'}
DB_PATH = os.path.join(os.path.dirname(__file__), "villages.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "village_database.json")
SUBDISTRICTS_PATH = os.path.join(os.path.dirname(__file__), "all_subdistricts.json")

# District name normalization map
DISTRICT_NORMALIZE = {
    'thoothukkudi': 'Thoothukudi',
    'thoothukudi': 'Thoothukudi',
    'kancheepuram': 'Kancheepuram',
    'kanchipuram': 'Kancheepuram',
    'kanniyakumari': 'Kanniyakumari',
    'kanyakumari': 'Kanniyakumari',
    'the nilgiris': 'The Nilgiris',
    'nilgiris': 'The Nilgiris',
    'tiruchirappalli': 'Tiruchirappalli',
    'trichy': 'Tiruchirappalli',
    'chengalpattu': 'Chengalpattu',
    'chengalpet': 'Chengalpattu',
    'chennai': 'Chennai',
    'madras': 'Chennai',
    'kallakurichi': 'Kallakurichi',
    'mayiladuthurai': 'Mayiladuthurai',
    'mayiladuthurai': 'Mayiladuthurai',
    'ranipet': 'Ranipet',
    'tenkasi': 'Tenkasi',
    'tirupathur': 'Tirupathur',
    'vellore': 'Vellore',
    'krishnagiri': 'Krishnagiri',
    'madurai': 'Madurai',
    'nagapattinam': 'Nagapattinam',
    'namakkal': 'Namakkal',
    'perambalur': 'Perambalur',
    'pudukkottai': 'Pudukkottai',
}

def normalize_district(name):
    """Normalize district name to standard form."""
    key = name.strip().lower()
    return DISTRICT_NORMALIZE.get(key, name.strip())


class VListParser(HTMLParser):
    def __init__(self, target_pattern):
        super().__init__()
        self.target_pattern = target_pattern
        self.in_link = False
        self.current_href = ""
        self.current_text = ""
        self.results = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            attrs_dict = dict(attrs)
            href = attrs_dict.get('href', '')
            if self.target_pattern in href:
                self.in_link = True
                self.current_href = href
                self.current_text = ""

    def handle_data(self, data):
        if self.in_link:
            self.current_text += data

    def handle_endtag(self, tag):
        if tag == 'a' and self.in_link:
            self.in_link = False
            text = self.current_text.strip()
            if text:
                self.results.append({
                    'name': text,
                    'href': self.current_href
                })


def fetch_html(url, retries=5):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            wait_time = (1.5 ** attempt) + random.uniform(0.3, 0.8)
            time.sleep(wait_time)
    return None


def scrape_missing_subdistricts():
    """Scrape sub-districts from vlist.in that are not yet in villages.db."""
    print("=== Step 1: Scraping missing sub-districts from vlist.in ===")

    # Load all sub-districts
    with open(SUBDISTRICTS_PATH, 'r', encoding='utf-8') as f:
        all_subdistricts = json.load(f)
    print(f"Total sub-districts in all_subdistricts.json: {len(all_subdistricts)}")

    # Check what's already scraped in villages.db
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Ensure tables exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        href TEXT,
        state TEXT DEFAULT 'Tamil Nadu'
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sub_districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        district_name TEXT NOT NULL,
        href TEXT,
        scraped INTEGER DEFAULT 0,
        UNIQUE(name, district_name)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS villages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        district_name TEXT NOT NULL,
        sub_district_name TEXT NOT NULL,
        village_code TEXT,
        vlist_url TEXT,
        UNIQUE(name, district_name, sub_district_name)
    );
    """)
    conn.commit()

    # Get already scraped sub-districts
    cursor.execute("SELECT name, district_name FROM sub_districts WHERE scraped = 1")
    scraped_set = set((row[0], row[1]) for row in cursor.fetchall())
    print(f"Already scraped: {len(scraped_set)} sub-districts")

    # Get already scraped sub-district hrefs
    cursor.execute("SELECT name, district_name, href FROM sub_districts")
    existing_hrefs = {}
    for row in cursor.fetchall():
        existing_hrefs[(row[0], row[1])] = row[2]

    # Find missing sub-districts
    missing = []
    for sd in all_subdistricts:
        district = normalize_district(sd['district'])
        sub_district = sd['sub_district']
        if (sub_district, district) not in scraped_set:
            missing.append({
                'district': district,
                'sub_district': sub_district,
                'href': sd['href']
            })

    print(f"Missing sub-districts to scrape: {len(missing)}")

    if not missing:
        print("All sub-districts already scraped!")
        conn.close()
        return

    # Scrape missing sub-districts
    scraped_count = 0
    total_villages_added = 0

    for i, sd in enumerate(missing):
        district = sd['district']
        sub_district = sd['sub_district']
        href = sd['href']
        url = BASE_URL + href if not href.startswith('http') else href

        print(f"[{i+1}/{len(missing)}] Scraping {district} -> {sub_district}...")

        html = fetch_html(url)
        if html:
            parser = VListParser('/village/')
            parser.feed(html)
            villages = parser.results

            v_rows = []
            for v in villages:
                code_match = re.search(r'/village/(\d+)\.html', v['href'])
                vcode = code_match.group(1) if code_match else ""
                v_rows.append((v['name'], district, sub_district, vcode, BASE_URL + v['href']))

            cursor.executemany("""
            INSERT OR IGNORE INTO villages (name, district_name, sub_district_name, village_code, vlist_url)
            VALUES (?, ?, ?, ?, ?)
            """, v_rows)

            # Insert sub-district record
            cursor.execute("""
            INSERT OR IGNORE INTO sub_districts (name, district_name, href, scraped)
            VALUES (?, ?, ?, 1)
            """, (sub_district, district, href))

            conn.commit()
            scraped_count += 1
            total_villages_added += len(v_rows)
            print(f"  Added {len(villages)} villages")
        else:
            print(f"  FAILED to fetch - skipping")

        time.sleep(0.3)

    conn.close()
    print(f"\nScraped {scraped_count} sub-districts, added {total_villages_added} villages")


def merge_all_sources():
    """Merge all village data sources into a single deduplicated list."""
    print("\n=== Step 2: Merging all sources ===")

    all_villages = {}  # key: (name_lower, district_lower) -> {village_name, district, state}

    def add_village(name, district, state='Tamil Nadu'):
        name = name.strip()
        district = normalize_district(district.strip())
        if not name or not district:
            return
        key = (name.lower(), district.lower())
        if key not in all_villages:
            all_villages[key] = {
                'village_name': name,
                'district': district,
                'state': state
            }

    # Source 1: village_database.json (existing merged)
    print("Loading village_database.json...")
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        db_data = json.load(f)
    for v in db_data:
        add_village(v['village_name'], v['district'], v.get('state', 'Tamil Nadu'))
    print(f"  After village_database.json: {len(all_villages)} villages")

    # Source 2: villages.json (scraped from vlist.in)
    print("Loading villages.json...")
    with open('villages.json', 'r', encoding='utf-8') as f:
        vlist_data = json.load(f)
    for v in vlist_data['villages']:
        add_village(v['name'], v['district'])
    print(f"  After villages.json: {len(all_villages)} villages")

    # Source 3: villages.db (all tables with village data)
    print("Loading villages.db...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = c.fetchall()
    for t in tables:
        tname = t[0]
        try:
            c.execute(f"PRAGMA table_info([{tname}])")
            cols = [r[1] for r in c.fetchall()]

            name_col = None
            dist_col = None
            for col in cols:
                if col.lower() in ('village_name', 'name', 'village'):
                    name_col = col
                if col.lower() in ('district', 'district_name', 'dist'):
                    dist_col = col

            if name_col and dist_col:
                c.execute(f"SELECT [{name_col}], [{dist_col}] FROM [{tname}]")
                rows = c.fetchall()
                added = 0
                for row in rows:
                    n = str(row[0]).strip()
                    d = str(row[1]).strip()
                    if n and d and len(n) > 1:
                        key = (n.lower(), d.lower())
                        if key not in all_villages:
                            add_village(n, d)
                            added += 1
                if added > 0:
                    print(f"  Added {added} new villages from {tname}")
        except Exception as e:
            pass
    conn.close()
    print(f"  After villages.db: {len(all_villages)} villages")

    # Source 4: village_database.db
    print("Loading village_database.db...")
    if os.path.exists('village_database.db'):
        conn = sqlite3.connect('village_database.db')
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = c.fetchall()
        for t in tables:
            tname = t[0]
            try:
                c.execute(f"PRAGMA table_info([{tname}])")
                cols = [r[1] for r in c.fetchall()]

                name_col = None
                dist_col = None
                for col in cols:
                    if col.lower() in ('village_name', 'name', 'village'):
                        name_col = col
                    if col.lower() in ('district', 'district_name', 'dist'):
                        dist_col = col

                if name_col and dist_col:
                    c.execute(f"SELECT [{name_col}], [{dist_col}] FROM [{tname}]")
                    rows = c.fetchall()
                    added = 0
                    for row in rows:
                        n = str(row[0]).strip()
                        d = str(row[1]).strip()
                        if n and d and len(n) > 1:
                            key = (n.lower(), d.lower())
                            if key not in all_villages:
                                add_village(n, d)
                                added += 1
                    if added > 0:
                        print(f"  Added {added} new villages from {tname}")
            except Exception as e:
                pass
        conn.close()
    print(f"  After village_database.db: {len(all_villages)} villages")

    # Source 5: generate_tn_database.py hardcoded data
    print("Loading generate_tn_database.py hardcoded data...")
    try:
        from generate_tn_database import TAMIL_NADU_DATA
        added = 0
        for dist_name, dist_info in TAMIL_NADU_DATA.items():
            for taluk_name, village_list in dist_info['taluks'].items():
                for v_name in village_list:
                    key = (v_name.lower(), dist_name.lower())
                    if key not in all_villages:
                        add_village(v_name, dist_name)
                        added += 1
        print(f"  Added {added} new villages from generate_tn_database.py")
    except Exception as e:
        print(f"  Error loading generate_tn_database.py: {e}")
    print(f"  After generate_tn_database.py: {len(all_villages)} villages")

    return all_villages


def write_final_database(all_villages):
    """Write the final consolidated village_database.json."""
    print("\n=== Step 3: Writing final village_database.json ===")

    # Build sorted list with IDs
    result = []
    for idx, (key, v) in enumerate(sorted(all_villages.items()), 1):
        result.append({
            'village_id': idx,
            'village_name': v['village_name'],
            'district': v['district'],
            'state': v['state']
        })

    # Count by district
    district_counts = Counter(v['district'] for v in result)
    print(f"\nTotal unique villages: {len(result)}")
    print(f"Districts: {len(district_counts)}")
    for d, c in sorted(district_counts.items()):
        print(f"  {d}: {c}")

    # Write to file
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    file_size = os.path.getsize(JSON_PATH) / (1024 * 1024)
    print(f"\nWritten {len(result)} villages to {JSON_PATH}")
    print(f"File size: {file_size:.2f} MB")


def main():
    print("=" * 60)
    print("LandGuard Tamil Nadu Village Database Consolidation")
    print("Target: ~15,771 villages")
    print("=" * 60)

    # Step 1: Scrape missing sub-districts
    scrape_missing_subdistricts()

    # Step 2: Merge all sources
    all_villages = merge_all_sources()

    # Step 3: Write final database
    write_final_database(all_villages)

    print("\n" + "=" * 60)
    print("CONSOLIDATION COMPLETE!")
    print("=" * 60)


if __name__ == '__main__':
    main()
