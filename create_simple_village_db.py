import sqlite3
import json
import os

ROOT_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(ROOT_DIR, "village_database.db")
VILLAGES_DB_PATH = os.path.join(ROOT_DIR, "villages.db")

# Comprehensive Tamil Nadu administrative dataset (all districts & villages)
from generate_tn_database import TAMIL_NADU_DATA

def create_exact_village_table():
    print("=== Creating Village Database with exact requested schema ===")
    print("Schema:\n | Field | Type |\n | village_id | INT |\n | village_name | VARCHAR |\n | district | VARCHAR |\n")

    records = []
    
    # 1. Pull from TAMIL_NADU_DATA dictionary
    for dist_name, dist_info in TAMIL_NADU_DATA.items():
        for taluk_name, village_list in dist_info['taluks'].items():
            for vname in village_list:
                records.append((vname, dist_name))

    # 2. Also check existing villages.db if it has scraped rows
    if os.path.exists(VILLAGES_DB_PATH):
        try:
            conn_old = sqlite3.connect(VILLAGES_DB_PATH)
            cur_old = conn_old.cursor()
            cur_old.execute("SELECT name, district_name FROM villages")
            existing = cur_old.fetchall()
            for vname, dname in existing:
                if (vname, dname) not in records:
                    records.append((vname, dname))
            conn_old.close()
        except Exception as e:
            print("Notice:", e)

    print(f"Total unique village records to insert: {len(records)}")

    # Create dedicated SQLite database `village_database.db`
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS villages;")
    cursor.execute("""
    CREATE TABLE villages (
        village_id INTEGER PRIMARY KEY AUTOINCREMENT,
        village_name VARCHAR(255) NOT NULL,
        district VARCHAR(255) NOT NULL
    );
    """)

    cursor.execute("CREATE INDEX idx_village_name ON villages(village_name);")
    cursor.execute("CREATE INDEX idx_district ON villages(district);")

    cursor.executemany("INSERT INTO villages (village_name, district) VALUES (?, ?)", records)
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM villages;")
    total_inserted = cursor.fetchone()[0]

    # Also update `villages.db` with table `villages_exact`
    conn2 = sqlite3.connect(VILLAGES_DB_PATH)
    cursor2 = conn2.cursor()
    cursor2.execute("DROP TABLE IF EXISTS villages_exact;")
    cursor2.execute("""
    CREATE TABLE villages_exact (
        village_id INTEGER PRIMARY KEY AUTOINCREMENT,
        village_name VARCHAR(255) NOT NULL,
        district VARCHAR(255) NOT NULL
    );
    """)
    cursor2.executemany("INSERT INTO villages_exact (village_name, district) VALUES (?, ?)", records)
    conn2.commit()
    conn2.close()

    print(f"\nSuccessfully created `village_database.db` with {total_inserted} records!")
    print(f"Successfully updated `villages.db` table `villages_exact` with {total_inserted} records!")

    # Display Sample Rows
    cursor.execute("SELECT village_id, village_name, district FROM villages LIMIT 15;")
    samples = cursor.fetchall()
    
    print("\n" + "=" * 65)
    print("DATABASE SAMPLE OUTPUT:")
    print("=" * 65)
    print(f"{'village_id':<12} | {'village_name':<30} | {'district':<20}")
    print("-" * 65)
    for row in samples:
        print(f"{row[0]:<12} | {row[1]:<30} | {row[2]:<20}")
    print("=" * 65)

    conn.close()

if __name__ == '__main__':
    create_exact_village_table()
