import urllib.request
import ssl
import sqlite3
import json
import time
import random
import os
import re
from html.parser import HTMLParser
import concurrent.futures

BASE_URL = "https://vlist.in"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://vlist.in/'
}

DB_PATH = os.path.join(os.path.dirname(__file__), "villages.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "villages.json")
SUBDIST_FILE = os.path.join(os.path.dirname(__file__), "all_subdistricts.json")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

class VillageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_a = False
        self.current_link = ""
        self.current_data = ""
        self.items = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            attrs_dict = dict(attrs)
            href = attrs_dict.get('href', '')
            if '/village/' in href:
                self.in_a = True
                self.current_link = href
                self.current_data = ""

    def handle_data(self, data):
        if self.in_a:
            self.current_data += data

    def handle_endtag(self, tag):
        if tag == 'a' and self.in_a:
            self.in_a = False
            vname = self.current_text = self.current_data.strip()
            if vname:
                self.items.append((vname, self.current_link))

def fetch_subdistrict_villages(item, retries=4):
    url = BASE_URL + item['href']
    dname = item['district']
    sdname = item['sub_district']

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
                if resp.status == 200:
                    html = resp.read().decode('utf-8', errors='ignore')
                    parser = VillageParser()
                    parser.feed(html)
                    
                    results = []
                    for vname, vhref in parser.items:
                        code_match = re.search(r'/village/(\d+)\.html', vhref)
                        vcode = code_match.group(1) if code_match else ""
                        results.append({
                            'name': vname,
                            'district_name': dname,
                            'sub_district_name': sdname,
                            'village_code': vcode,
                            'vlist_url': BASE_URL + vhref
                        })
                    return item, results
        except Exception as e:
            if attempt == retries - 1:
                print(f"Failed to fetch {sdname} ({dname}): {e}")
                return item, []
            time.sleep(0.5 + random.uniform(0.1, 0.5))

def main():
    print("=== Scraping All ~15,000 Villages for Tamil Nadu ===")
    
    if not os.path.exists(SUBDIST_FILE):
        print("Error: all_subdistricts.json not found!")
        return

    with open(SUBDIST_FILE, "r", encoding="utf-8") as f:
        subdistricts = json.load(f)

    print(f"Loaded {len(subdistricts)} sub-districts to scrape...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS villages;")
    cursor.execute("DROP TABLE IF EXISTS districts;")
    cursor.execute("DROP TABLE IF EXISTS sub_districts;")

    cursor.execute("""
    CREATE TABLE districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        state TEXT DEFAULT 'Tamil Nadu'
    );
    """)

    cursor.execute("""
    CREATE TABLE sub_districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        district_name TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE villages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        district_name TEXT NOT NULL,
        sub_district_name TEXT NOT NULL,
        village_code TEXT,
        vlist_url TEXT
    );
    """)

    cursor.execute("CREATE INDEX idx_villages_name ON villages(name);")
    cursor.execute("CREATE INDEX idx_villages_district ON villages(district_name);")
    cursor.execute("CREATE INDEX idx_villages_sub_district ON villages(sub_district_name);")
    conn.commit()

    # Populate Districts & Sub-districts
    dist_set = set()
    for sd in subdistricts:
        dist_set.add(sd['district'])
        cursor.execute("INSERT INTO sub_districts (name, district_name) VALUES (?, ?)", (sd['sub_district'], sd['district']))

    for d in sorted(dist_set):
        cursor.execute("INSERT INTO districts (name, state) VALUES (?, 'Tamil Nadu')", (d,))
    conn.commit()

    total_villages_scraped = 0
    completed = 0
    total_sd = len(subdistricts)
    all_village_records = []

    print("Starting multi-threaded village scraper...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch_subdistrict_villages, sd) for sd in subdistricts]
        for future in concurrent.futures.as_completed(futures):
            item, vlist = future.result()
            completed += 1
            if vlist:
                v_tuples = [(v['name'], v['district_name'], v['sub_district_name'], v['village_code'], v['vlist_url']) for v in vlist]
                cursor.executemany("""
                INSERT INTO villages (name, district_name, sub_district_name, village_code, vlist_url)
                VALUES (?, ?, ?, ?, ?)
                """, v_tuples)
                conn.commit()
                total_villages_scraped += len(vlist)
                all_village_records.extend(vlist)

            if completed % 20 == 0 or completed == total_sd:
                print(f"Progress: [{completed}/{total_sd}] sub-districts finished ({total_villages_scraped} villages saved)...")

    # Get District breakdown counts from DB
    cursor.execute("""
    SELECT district_name, COUNT(*) as cnt 
    FROM villages 
    GROUP BY district_name 
    ORDER BY district_name;
    """)
    district_counts = cursor.fetchall()

    print("\n=============================================")
    print(f"DATABASE GENERATION COMPLETE!")
    print(f"Total Districts: {len(dist_set)}")
    print(f"Total Sub-Districts (Taluks): {total_sd}")
    print(f"Total Villages Stored in SQLite: {total_villages_scraped}")
    print("=============================================")
    print("\nDistrict-wise Village Breakdown:")
    for dname, cnt in district_counts:
        print(f" - {dname}: {cnt} villages")

    # Export JSON format
    json_export = {
        "state": "Tamil Nadu",
        "source": "https://vlist.in/state/33.html",
        "total_districts": len(dist_set),
        "total_sub_districts": total_sd,
        "total_villages": total_villages_scraped,
        "district_counts": dict(district_counts),
        "villages": all_village_records
    }
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_export, f, ensure_ascii=False, indent=2)

    print(f"\nSQLite Database saved to: {DB_PATH}")
    print(f"JSON Database saved to: {JSON_PATH}")

    conn.close()

if __name__ == '__main__':
    main()
