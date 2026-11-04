import csv
import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "villages.db")
CSV_PATH = os.path.join(os.path.dirname(__file__), "tamilnadu_synthetic_survey_numbers_10000.csv")
JSON_PATH = os.path.join(os.path.dirname(__file__), "survey_numbers.json")

def load_survey_numbers():
    print(f"Reading survey numbers from {CSV_PATH}...")
    
    survey_list = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sn = row["survey_number"].strip()
            if sn:
                survey_list.append(sn)

    print(f"Loaded {len(survey_list)} survey numbers.")

    # Save to SQLite Database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS survey_numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        survey_number TEXT UNIQUE NOT NULL
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_survey_number ON survey_numbers(survey_number);")

    # Insert batch
    rows = [(sn,) for sn in survey_list]
    cursor.executemany("INSERT OR IGNORE INTO survey_numbers (survey_number) VALUES (?)", rows)
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM survey_numbers;")
    db_count = cursor.fetchone()[0]
    conn.close()

    print(f"Stored {db_count} survey numbers in SQLite database ({DB_PATH}).")

    # Save to JSON file for fast Node server memory loading
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(survey_list, f)

    print(f"Exported {len(survey_list)} survey numbers to {JSON_PATH}.")

if __name__ == "__main__":
    load_survey_numbers()
