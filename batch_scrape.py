"""
Batch scrape remaining unscraped sub-districts from vlist.in
"""
import json
import sqlite3
import os
import re
import time
import random
import urllib.request
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://vlist.in"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36'}
DB_PATH = os.path.join(os.path.dirname(__file__), "villages.db")
SUBDISTRICTS_PATH = os.path.join(os.path.dirname(__file__), "all_subdistricts.json")

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

def fetch_html(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            time.sleep((1.5 ** attempt) + random.uniform(0.2, 0.5))
    return None

def scrape_one_subdistrict(sd):
    """Scrape a single sub-district and return villages."""
    district = normalize_district(sd['district'])
    sub_district = sd['sub_district']
    href = sd['href']
    url = BASE_URL + href if not href.startswith('http') else href

    html = fetch_html(url)
    if not html:
        return None

    parser = VListParser('/village/')
    parser.feed(html)
    villages = parser.results

    v_rows = []
    for v in villages:
        code_match = re.search(r'/village/(\d+)\.html', v['href'])
        vcode = code_match.group(1) if code_match else ""
        v_rows.append((v['name'], district, sub_district, vcode, BASE_URL + v['href']))

    return {
        'district': district,
        'sub_district': sub_district,
        'href': href,
        'villages': v_rows
    }

def main():
    print("=== Batch Scraping Remaining Sub-Districts ===")

    with open(SUBDISTRICTS_PATH, 'r', encoding='utf-8') as f:
        all_subdistricts = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get already scraped
    cursor.execute("SELECT name, district_name FROM sub_districts WHERE scraped = 1")
    scraped_set = set((row[0], row[1]) for row in cursor.fetchall())
    print(f"Already scraped: {len(scraped_set)} sub-districts")

    # Find missing
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

    print(f"Remaining to scrape: {len(missing)} sub-districts")

    if not missing:
        print("All done!")
        conn.close()
        return

    # Scrape in batches of 5 concurrent requests
    batch_size = 5
    total_villages = 0
    scraped_count = 0

    for batch_start in range(0, len(missing), batch_size):
        batch = missing[batch_start:batch_start + batch_size]
        print(f"\nBatch {batch_start//batch_size + 1}: Scraping {len(batch)} sub-districts...")

        with ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = {executor.submit(scrape_one_subdistrict, sd): sd for sd in batch}
            for future in as_completed(futures):
                sd = futures[future]
                try:
                    result = future.result()
                    if result and result['villages']:
                        v_rows = result['villages']
                        cursor.executemany("""
                        INSERT OR IGNORE INTO villages (name, district_name, sub_district_name, village_code, vlist_url)
                        VALUES (?, ?, ?, ?, ?)
                        """, v_rows)

                        cursor.execute("""
                        INSERT OR IGNORE INTO sub_districts (name, district_name, href, scraped)
                        VALUES (?, ?, ?, 1)
                        """, (result['sub_district'], result['district'], result['href']))

                        total_villages += len(v_rows)
                        scraped_count += 1
                        print(f"  {result['district']} -> {result['sub_district']}: {len(v_rows)} villages")
                    else:
                        print(f"  FAILED: {sd['district']} -> {sd['sub_district']}")
                except Exception as e:
                    print(f"  ERROR: {sd['district']} -> {sd['sub_district']}: {e}")

        conn.commit()
        time.sleep(0.5)

    conn.close()
    print(f"\n=== Scraping Complete ===")
    print(f"Scraped: {scraped_count} sub-districts")
    print(f"Added: {total_villages} villages")

if __name__ == '__main__':
    main()
