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
    'Accept-Language': 'en-US,en;q=0.9',
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
            vname = self.current_data.strip()
            if vname:
                self.items.append((vname, self.current_link))

def fetch_subdistrict_villages(item, retries=6):
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
                    if results or len(parser.items) == 0:
                        return item, results
        except Exception as e:
            wait_time = (2 ** attempt) + random.uniform(0.5, 1.5)
            time.sleep(wait_time)
            
    print(f"FAILED after retries: {sdname} ({dname})")
    return item, None

def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("CREATE TABLE IF NOT EXISTS districts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, state TEXT DEFAULT 'Tamil Nadu');")
    
    # Check if sub_districts table has href column, if not recreate
    cursor.execute("PRAGMA table_info(sub_districts);")
    cols = [r[1] for r in cursor.fetchall()]
    if 'href' not in cols or 'scraped' not in cols:
        cursor.execute("DROP TABLE IF EXISTS sub_districts;")

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

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_villages_name ON villages(name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_villages_district ON villages(district_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_villages_sub_district ON villages(sub_district_name);")
    conn.commit()
    return conn

def main():
    print("=== Resumable Tamil Nadu 15,000+ Village Scraper ===")
    
    if not os.path.exists(SUBDIST_FILE):
        print("Error: all_subdistricts.json not found!")
        return

    with open(SUBDIST_FILE, "r", encoding="utf-8") as f:
        subdistricts = json.load(f)

    conn = init_database()
    cursor = conn.cursor()

    # Populate sub_districts table if empty
    for sd in subdistricts:
        cursor.execute("INSERT OR IGNORE INTO sub_districts (name, district_name, href) VALUES (?, ?, ?)",
                       (sd['sub_district'], sd['district'], sd['href']))
        cursor.execute("INSERT OR IGNORE INTO districts (name, state) VALUES (?, 'Tamil Nadu')", (sd['district'],))
    conn.commit()

    # Mark sub_districts as scraped if villages already exist in DB
    cursor.execute("SELECT DISTINCT district_name, sub_district_name FROM villages")
    existing_sds = cursor.fetchall()
    for dname, sdname in existing_sds:
        cursor.execute("UPDATE sub_districts SET scraped = 1 WHERE name = ? AND district_name = ?", (sdname, dname))
    conn.commit()

    # Find remaining unscraped sub-districts
    cursor.execute("SELECT district_name, name, href FROM sub_districts WHERE scraped = 0")
    unscraped_rows = cursor.fetchall()
    
    unscraped_items = [
        {"district": row[0], "sub_district": row[1], "href": row[2]}
        for row in unscraped_rows
    ]

    total_subdistricts = len(subdistricts)
    already_done = total_subdistricts - len(unscraped_items)

    print(f"Status: {already_done}/{total_subdistricts} sub-districts already scraped.")
    print(f"Remaining to scrape: {len(unscraped_items)} sub-districts.\n")

    if not unscraped_items:
        print("All sub-districts are already 100% scraped!")
    else:
        completed = already_done
        success_in_run = 0

        # Scraping with 3 workers and rate limiting
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(fetch_subdistrict_villages, sd): sd for sd in unscraped_items}
            for future in concurrent.futures.as_completed(futures):
                item, vlist = future.result()
                if vlist is not None:
                    v_tuples = [(v['name'], v['district_name'], v['sub_district_name'], v['village_code'], v['vlist_url']) for v in vlist]
                    cursor.executemany("""
                    INSERT OR IGNORE INTO villages (name, district_name, sub_district_name, village_code, vlist_url)
                    VALUES (?, ?, ?, ?, ?)
                    """, v_tuples)
                    
                    cursor.execute("UPDATE sub_districts SET scraped = 1 WHERE name = ? AND district_name = ?",
                                   (item['sub_district'], item['district']))
                    conn.commit()
                    success_in_run += 1
                    completed += 1
                    
                    cursor.execute("SELECT COUNT(*) FROM villages")
                    current_total_v = cursor.fetchone()[0]
                    print(f"[{completed}/{total_subdistricts}] Done: {item['district']} -> {item['sub_district']} ({len(vlist)} villages) | Total Villages in DB: {current_total_v}")
                else:
                    print(f"Warning: {item['district']} -> {item['sub_district']} failed, will retry on next pass.")
                
                time.sleep(0.3)

    # Final DB Audit & JSON Export
    cursor.execute("SELECT COUNT(*) FROM districts")
    d_cnt = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sub_districts")
    sd_cnt = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sub_districts WHERE scraped = 1")
    sd_done = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM villages")
    v_cnt = cursor.fetchone()[0]

    cursor.execute("""
    SELECT district_name, COUNT(*) as cnt 
    FROM villages 
    GROUP BY district_name 
    ORDER BY cnt DESC;
    """)
    district_breakdown = cursor.fetchall()

    print("\n=============================================")
    print("TAMIL NADU VILLAGE DATABASE SUMMARY:")
    print(f"- Total Districts: {d_cnt}")
    print(f"- Sub-Districts Scraped: {sd_done} / {sd_cnt}")
    print(f"- Total Villages Stored in SQLite: {v_cnt}")
    print("=============================================")
    print("\nDistrict-wise Breakdown:")
    for dname, cnt in district_breakdown:
        print(f"  {dname:20s}: {cnt} villages")

    # Export to JSON
    cursor.execute("SELECT name, district_name, sub_district_name, village_code, vlist_url FROM villages")
    all_villages = [
        {"name": r[0], "district": r[1], "sub_district": r[2], "village_code": r[3], "url": r[4]}
        for r in cursor.fetchall()
    ]

    json_export = {
        "state": "Tamil Nadu",
        "source": "https://vlist.in/state/33.html",
        "total_districts": d_cnt,
        "total_sub_districts": sd_done,
        "total_villages": v_cnt,
        "district_counts": dict(district_breakdown),
        "villages": all_villages
    }
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_export, f, ensure_ascii=False, indent=2)

    print(f"\nSQLite DB saved to: {DB_PATH}")
    print(f"JSON Export saved to: {JSON_PATH}")
    conn.close()

if __name__ == '__main__':
    main()
