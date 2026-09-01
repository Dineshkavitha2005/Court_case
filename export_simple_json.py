import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "village_database.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "village_database.json")

def export_json():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT village_id, village_name, district FROM villages ORDER BY village_id;")
    rows = cursor.fetchall()
    
    data = [
        {
            "village_id": row[0],
            "village_name": row[1],
            "district": row[2]
        }
        for row in rows
    ]

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Exported {len(data)} records to {JSON_PATH}")
    conn.close()

if __name__ == '__main__':
    export_json()
