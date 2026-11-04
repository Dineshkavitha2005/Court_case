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

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "villages.db")
JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "villages.json")
SUBDIST_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all_subdistricts.json")

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

def fetch_html(url, retries=5):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
                if resp.status == 200:
                    return resp.read().decode('utf-8', errors='ignore')
        except Exception:
            wait_time = (2 ** attempt) + random.uniform(0.5, 1.0)
            time.sleep(wait_time)
    return None

def fetch_subdistrict_villages(item, retries=5):
    url = BASE_URL + item['href']
    dname = item['district']
    sdname = item['sub_district']

    for attempt in range(retries):
        try:
            html = fetch_html(url, retries=2)
            if html:
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
        except Exception:
            time.sleep(1 + random.uniform(0, 1))

    print(f"FAILED: {sdname} ({dname})")
    return item, None

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    with open(SUBDIST_FILE, "r", encoding="utf-8") as f:
        subdistricts = json.load(f)

    for sd in subdistricts:
        cursor.execute("INSERT OR IGNORE INTO districts (name, state) VALUES (?, 'Tamil Nadu')", (sd['district'],))
    conn.commit()

    cursor.execute("SELECT district_name, name, href FROM sub_districts WHERE scraped = 0")
    unscraped_rows = cursor.fetchall()

    unscraped_items = [
        {"district": row[0], "sub_district": row[1], "href": row[2]}
        for row in unscraped_rows
    ]

    print(f"Remaining: {len(unscraped_items)} sub-districts to scrape")

    completed = 0
    total = len(unscraped_items)

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
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
                completed += 1

                cursor.execute("SELECT COUNT(*) FROM villages")
                total_v = cursor.fetchone()[0]
                print(f"[{completed}/{total}] {item['district']} -> {item['sub_district']}: {len(vlist)} villages | Total: {total_v}")
            else:
                print(f"FAILED: {item['district']} -> {item['sub_district']}")
            
            time.sleep(0.1)

    cursor.execute("SELECT COUNT(*) FROM villages")
    final_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sub_districts WHERE scraped = 1")
    scraped = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sub_districts")
    total_sd = cursor.fetchone()[0]

    print(f"\n=== DONE ===")
    print(f"Sub-districts scraped: {scraped}/{total_sd}")
    print(f"Total villages: {final_count}")

    cursor.execute("SELECT district_name, COUNT(*) FROM villages GROUP BY district_name ORDER BY district_name")
    print("\nDistrict breakdown:")
    for r in cursor.fetchall():
        print(f"  {r[0]}: {r[1]}")

    cursor.execute("SELECT name, district_name, sub_district_name, village_code, vlist_url FROM villages")
    all_villages = [
        {"name": r[0], "district": r[1], "sub_district": r[2], "village_code": r[3], "url": r[4]}
        for r in cursor.fetchall()
    ]

    district_breakdown = {}
    for v in all_villages:
        d = v['district']
        district_breakdown[d] = district_breakdown.get(d, 0) + 1

    json_export = {
        "state": "Tamil Nadu",
        "source": "https://vlist.in/state/33.html",
        "total_districts": 31,
        "total_sub_districts": scraped,
        "total_villages": final_count,
        "district_counts": district_breakdown,
        "villages": all_villages
    }
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_export, f, ensure_ascii=False, indent=2)

    print(f"\nSaved villages.json with {final_count} villages")
    conn.close()

if __name__ == '__main__':
    main()
