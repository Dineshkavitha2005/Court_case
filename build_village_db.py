import urllib.request
from html.parser import HTMLParser
import sqlite3
import time
import random
import os
import json
import re

BASE_URL = "https://vlist.in"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36'}
DB_PATH = os.path.join(os.path.dirname(__file__), "villages.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "villages.json")

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

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
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
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_villages_name ON villages(name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_villages_district ON villages(district_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_villages_sub_district ON villages(sub_district_name);")
    conn.commit()
    return conn

def main():
    print("=== LandGuard Tamil Nadu Village Database Builder ===")
    conn = init_db()
    cursor = conn.cursor()

    # Step 1: Districts
    cursor.execute("SELECT COUNT(*) FROM districts")
    if cursor.fetchone()[0] == 0:
        print("Fetching districts from https://vlist.in/state/33.html...")
        html = fetch_html(f"{BASE_URL}/state/33.html")
        if not html:
            print("Error: Failed to fetch state page.")
            return
        parser = VListParser('/district/')
        parser.feed(html)
        districts = parser.results
        print(f"Found {len(districts)} districts.")
        for d in districts:
            cursor.execute("INSERT OR IGNORE INTO districts (name, href, state) VALUES (?, ?, 'Tamil Nadu')", (d['name'], d['href']))
        conn.commit()

    cursor.execute("SELECT name, href FROM districts")
    districts = cursor.fetchall()
    print(f"Loaded {len(districts)} districts from DB.")

    # Step 2: Sub-districts
    for dist_name, dist_href in districts:
        cursor.execute("SELECT COUNT(*) FROM sub_districts WHERE district_name = ?", (dist_name,))
        if cursor.fetchone()[0] == 0:
            print(f"Fetching sub-districts for {dist_name}...")
            url = BASE_URL + dist_href if not dist_href.startswith('http') else dist_href
            html = fetch_html(url)
            if html:
                parser = VListParser('/sub-district/')
                parser.feed(html)
                for sd in parser.results:
                    cursor.execute("INSERT OR IGNORE INTO sub_districts (name, district_name, href) VALUES (?, ?, ?)",
                                   (sd['name'], dist_name, sd['href']))
                conn.commit()
            time.sleep(0.2)

    cursor.execute("SELECT id, name, district_name, href FROM sub_districts WHERE scraped = 0")
    unscraped = cursor.fetchall()
    print(f"{len(unscraped)} sub-districts remaining to scrape...")

    # Step 3: Villages per sub-district
    scraped_count = 0
    total_unscraped = len(unscraped)

    for sd_id, sd_name, dist_name, sd_href in unscraped:
        url = BASE_URL + sd_href if not sd_href.startswith('http') else sd_href
        html = fetch_html(url)
        if html:
            parser = VListParser('/village/')
            parser.feed(html)
            villages = parser.results
            
            v_rows = []
            for v in villages:
                code_match = re.search(r'/village/(\d+)\.html', v['href'])
                vcode = code_match.group(1) if code_match else ""
                v_rows.append((v['name'], dist_name, sd_name, vcode, BASE_URL + v['href']))
            
            cursor.executemany("""
            INSERT OR IGNORE INTO villages (name, district_name, sub_district_name, village_code, vlist_url)
            VALUES (?, ?, ?, ?, ?)
            """, v_rows)
            
            cursor.execute("UPDATE sub_districts SET scraped = 1 WHERE id = ?", (sd_id,))
            conn.commit()
            scraped_count += 1
            print(f"[{scraped_count}/{total_unscraped}] {dist_name} -> {sd_name}: {len(villages)} villages added.")
        else:
            print(f"Skipping {sd_name} due to fetch error.")
        
        time.sleep(0.2)

    # Final stats
    cursor.execute("SELECT COUNT(*) FROM districts")
    d_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sub_districts")
    sd_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM villages")
    v_count = cursor.fetchone()[0]

    print("==========================================")
    print(f"COMPLETE DATABASE READY:")
    print(f"- Districts: {d_count}")
    print(f"- Sub-districts (Taluks): {sd_count}")
    print(f"- Villages: {v_count}")
    print(f"- SQLite File: {DB_PATH}")

    # Export JSON
    cursor.execute("SELECT name, district_name, sub_district_name, village_code, vlist_url FROM villages")
    all_villages = [
        {"name": row[0], "district": row[1], "sub_district": row[2], "village_code": row[3], "url": row[4]}
        for row in cursor.fetchall()
    ]
    cursor.execute("SELECT name FROM districts")
    dist_list = [row[0] for row in cursor.fetchall()]

    json_export = {
        "state": "Tamil Nadu",
        "source": "https://vlist.in/state/33.html",
        "total_districts": d_count,
        "total_sub_districts": sd_count,
        "total_villages": v_count,
        "districts": dist_list,
        "villages": all_villages
    }
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_export, f, ensure_ascii=False, indent=2)

    print(f"- JSON File: {JSON_PATH}")
    conn.close()

if __name__ == '__main__':
    main()
