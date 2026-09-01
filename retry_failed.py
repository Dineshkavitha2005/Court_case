import urllib.request
import ssl
import sqlite3
import json
import time
import random
import os
import re
from html.parser import HTMLParser

BASE_URL = "https://vlist.in"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://vlist.in/'
}

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "villages.db")
JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "villages.json")

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

def fetch_html(url, retries=8):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
                if resp.status == 200:
                    return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            wait_time = (2 ** attempt) + random.uniform(1, 3)
            if attempt > 3:
                print(f"  Retry {attempt+1}/{retries} for {url} (wait {wait_time:.1f}s)")
            time.sleep(wait_time)
    return None

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT district_name, name, href FROM sub_districts WHERE scraped = 0")
    unscraped_rows = cursor.fetchall()
    print(f"Remaining: {len(unscraped_rows)} sub-districts")

    completed = 0
    total = len(unscraped_rows)
    failed_list = []

    for i, (dname, sdname, href) in enumerate(unscraped_rows):
        url = BASE_URL + href
        print(f"[{i+1}/{total}] {dname} -> {sdname}...", end=" ", flush=True)

        html = fetch_html(url)
        if html:
            parser = VillageParser()
            parser.feed(html)
            vlist = []
            for vname, vhref in parser.items:
                code_match = re.search(r'/village/(\d+)\.html', vhref)
                vcode = code_match.group(1) if code_match else ""
                vlist.append((vname, dname, sdname, vcode, BASE_URL + vhref))

            if vlist:
                cursor.executemany("""
                INSERT OR IGNORE INTO villages (name, district_name, sub_district_name, village_code, vlist_url)
                VALUES (?, ?, ?, ?, ?)
                """, vlist)
                cursor.execute("UPDATE sub_districts SET scraped = 1 WHERE name = ? AND district_name = ?",
                               (sdname, dname))
                conn.commit()
                completed += 1
                print(f"{len(vlist)} villages")
            else:
                print("0 villages (empty page)")
                cursor.execute("UPDATE sub_districts SET scraped = 1 WHERE name = ? AND district_name = ?",
                               (sdname, dname))
                conn.commit()
                completed += 1
        else:
            print("FAILED")
            failed_list.append((dname, sdname, href))

        time.sleep(1.5)

    cursor.execute("SELECT COUNT(*) FROM villages")
    final_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sub_districts WHERE scraped = 1")
    scraped = cursor.fetchone()[0]

    print(f"\n=== DONE ===")
    print(f"Completed: {completed}/{total}")
    print(f"Failed: {len(failed_list)}/{total}")
    print(f"Total villages in DB: {final_count}")
    print(f"Sub-districts scraped: {scraped}/215")

    if failed_list:
        print(f"\nFailed sub-districts:")
        for d, sd, h in failed_list:
            print(f"  {d} -> {sd}")

    cursor.execute("SELECT district_name, COUNT(*) FROM villages GROUP BY district_name ORDER BY district_name")
    print("\nDistrict breakdown:")
    for r in cursor.fetchall():
        print(f"  {r[0]}: {r[1]}")

    conn.close()

if __name__ == '__main__':
    main()
