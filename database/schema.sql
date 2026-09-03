-- ============================================
-- LandGuard Database Schema
-- Tamil Nadu Land Due Diligence & Court Cases
-- ============================================

PRAGMA foreign_keys = ON;

-- 1. Districts (All 38 Districts of Tamil Nadu)
CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    name_ta TEXT,
    code TEXT,
    state TEXT DEFAULT 'Tamil Nadu',
    latitude REAL,
    longitude REAL
);

-- 2. Taluks / Sub-districts
CREATE TABLE IF NOT EXISTS taluks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_ta TEXT,
    code TEXT,
    FOREIGN KEY (district_id) REFERENCES districts (id) ON DELETE CASCADE,
    UNIQUE(district_id, name)
);

-- 3. Revenue Villages
CREATE TABLE IF NOT EXISTS villages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taluk_id INTEGER NOT NULL,
    district_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_ta TEXT,
    code TEXT,
    vlist_url TEXT,
    latitude REAL,
    longitude REAL,
    FOREIGN KEY (taluk_id) REFERENCES taluks (id) ON DELETE CASCADE,
    FOREIGN KEY (district_id) REFERENCES districts (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_villages_name ON villages (name);
CREATE INDEX IF NOT EXISTS idx_villages_taluk ON villages (taluk_id);
CREATE INDEX IF NOT EXISTS idx_villages_district ON villages (district_id);

-- 4. Land Parcels (Survey Numbers)
CREATE TABLE IF NOT EXISTS land_parcels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL,
    survey_number TEXT NOT NULL,
    subdivision TEXT DEFAULT '',
    extent TEXT,
    classification TEXT DEFAULT 'Agricultural',
    market_value_inr TEXT,
    patta_passbook_no TEXT,
    owner_name TEXT,
    owner_father_name TEXT,
    registration_date TEXT,
    is_demo INTEGER DEFAULT 0,
    source_name TEXT DEFAULT 'Tamil Nadu Land Records Registry',
    source_url TEXT DEFAULT 'https://eservices.tn.gov.in',
    last_verified_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages (id) ON DELETE CASCADE,
    UNIQUE(village_id, survey_number)
);

CREATE INDEX IF NOT EXISTS idx_parcels_survey ON land_parcels (village_id, survey_number);

-- 5. Court Cases
CREATE TABLE IF NOT EXISTS court_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id INTEGER NOT NULL,
    case_number TEXT NOT NULL,
    cnr_number TEXT,
    court_name TEXT NOT NULL,
    case_type TEXT NOT NULL,
    filing_date TEXT,
    petitioner TEXT NOT NULL,
    respondent TEXT NOT NULL,
    current_status TEXT NOT NULL,
    judge_bench TEXT,
    has_stay_injunction INTEGER DEFAULT 0,
    case_summary TEXT,
    source_name TEXT DEFAULT 'eCourts Services (NJDG)',
    source_url TEXT DEFAULT 'https://ecourts.gov.in',
    last_updated_at TEXT,
    is_demo INTEGER DEFAULT 0,
    FOREIGN KEY (parcel_id) REFERENCES land_parcels (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cases_parcel ON court_cases (parcel_id);

-- 6. Case History (Hearings & Proceedings)
CREATE TABLE IF NOT EXISTS case_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    hearing_date TEXT NOT NULL,
    business_recorded TEXT,
    next_hearing_date TEXT,
    order_summary TEXT,
    FOREIGN KEY (case_id) REFERENCES court_cases (id) ON DELETE CASCADE
);

-- 7. Encumbrances (Registered Mortgages, Liens, Attachments)
CREATE TABLE IF NOT EXISTS encumbrances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id INTEGER NOT NULL,
    document_number TEXT,
    execution_date TEXT,
    registration_date TEXT,
    nature_of_deed TEXT NOT NULL,
    executant TEXT,
    claimant TEXT,
    mortgage_amount_inr TEXT,
    status TEXT DEFAULT 'Active',
    sro_office TEXT,
    source_name TEXT DEFAULT 'TNREGINET',
    source_url TEXT DEFAULT 'https://tnreginet.gov.in',
    last_verified_at TEXT,
    is_demo INTEGER DEFAULT 0,
    FOREIGN KEY (parcel_id) REFERENCES land_parcels (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_encumbrances_parcel ON encumbrances (parcel_id);
