"""
Retry scraping remaining empty sub-districts one by one
"""
import json
import sqlite3
import os
import re
import time
import random
import urllib.request
from html.parser import HTMLParser

BASE_URL = "https://vlist.in"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36'}
DB_PATH = os.path.join(os.path.dirname(__file__), "villages.db")

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
                self.results.append({'name': text, 'href': self.current_href})

def fetch_html(url, retries=5):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                if resp.status == 200:
                    return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            wait = (2.0 ** attempt) + random.uniform(0.5, 1.0)
            time.sleep(wait)
    return None

def main():
    print("=== Retrying Empty Sub-Districts ===")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sd.district_name, sd.name, sd.href 
        FROM sub_districts sd 
        WHERE sd.scraped = 0
        ORDER BY sd.district_name, sd.name
    """)
    unscraped = cursor.fetchall()
    print(f"Empty sub-districts to retry: {len(unscraped)}")

    success = 0
    failed = 0
    total_villages = 0

    for i, (district, sub_district, href) in enumerate(unscraped):
        url = BASE_URL + href if not href.startswith('http') else href
        print(f"[{i+1}/{len(unscraped)}] {district} -> {sub_district}...", end=" ", flush=True)

        html = fetch_html(url)
        if html:
            parser = VListParser('/village/')
            parser.feed(html)
            villages = parser.results

            if villages:
                v_rows = []
                for v in villages:
                    code_match = re.search(r'/village/(\d+)\.html', v['href'])
                    vcode = code_match.group(1) if code_match else ""
                    v_rows.append((v['name'], district, sub_district, vcode, BASE_URL + v['href']))

                cursor.executemany("""
                INSERT OR IGNORE INTO villages (name, district_name, sub_district_name, village_code, vlist_url)
                VALUES (?, ?, ?, ?, ?)
                """, v_rows)

                cursor.execute("""
                UPDATE sub_districts SET scraped = 1 
                WHERE name = ? AND district_name = ?
                """, (sub_district, district))

                conn.commit()
                total_villages += len(v_rows)
                success += 1
                print(f"OK ({len(villages)} villages)")
            else:
                # Mark as scraped even if no villages (page exists but no village links)
                cursor.execute("""
                UPDATE sub_districts SET scraped = 1 
                WHERE name = ? AND district_name = ?
                """, (sub_district, district))
                conn.commit()
                success += 1
                print("OK (0 villages - page exists)")
        else:
            failed += 1
            print("FAILED")

        time.sleep(0.5)

    conn.close()
    print(f"\n=== Retry Complete ===")
    print(f"Success: {success}")
    print(f"Failed: {failed}")
    print(f"Villages added: {total_villages}")

if __name__ == '__main__':
    main()
