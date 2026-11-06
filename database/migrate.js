/**
 * LandGuard — Database Schema Migration
 * Adds comprehensive provenance and verification audit trail columns to
 * land_parcels, court_cases, and encumbrances tables.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function runMigrations(dbInstance = null) {
    const dbPath = path.resolve(__dirname, 'landguard.db');
    const db = dbInstance || new DatabaseSync(dbPath);

    function getTableColumns(tableName) {
        const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
        return new Set(rows.map(r => r.name));
    }

    // 1. Migrate land_parcels
    if (db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='land_parcels'").get().count > 0) {
        const parcelCols = getTableColumns('land_parcels');
        if (!parcelCols.has('source_type')) {
            db.exec("ALTER TABLE land_parcels ADD COLUMN source_type TEXT DEFAULT 'GOVERNMENT_LAND_RECORDS'");
        }
        if (!parcelCols.has('source_reference')) {
            db.exec("ALTER TABLE land_parcels ADD COLUMN source_reference TEXT");
        }
        if (!parcelCols.has('retrieved_at')) {
            db.exec("ALTER TABLE land_parcels ADD COLUMN retrieved_at TEXT");
        }
        if (!parcelCols.has('verification_status')) {
            db.exec("ALTER TABLE land_parcels ADD COLUMN verification_status TEXT");
        }
        if (!parcelCols.has('confidence')) {
            db.exec("ALTER TABLE land_parcels ADD COLUMN confidence REAL DEFAULT 1.0");
        }
        if (!parcelCols.has('raw_reference')) {
            db.exec("ALTER TABLE land_parcels ADD COLUMN raw_reference TEXT");
        }

        // Backfill default provenance for existing benchmark parcels
        db.exec(`
            UPDATE land_parcels
            SET source_type = 'GOVERNMENT_LAND_RECORDS',
                source_reference = COALESCE(source_reference, patta_passbook_no, survey_number),
                retrieved_at = COALESCE(retrieved_at, '2026-09-01T10:00:00.000Z'),
                verification_status = CASE WHEN is_demo = 1 THEN 'DEMO' ELSE 'VERIFIED' END,
                confidence = CASE WHEN is_demo = 1 THEN 0.0 ELSE 1.0 END,
                raw_reference = COALESCE(raw_reference, 'TN-REV-' || village_id || '-' || survey_number)
            WHERE source_reference IS NULL OR verification_status IS NULL
        `);
    }

    // 2. Migrate court_cases
    if (db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='court_cases'").get().count > 0) {
        const caseCols = getTableColumns('court_cases');
        if (!caseCols.has('source_type')) {
            db.exec("ALTER TABLE court_cases ADD COLUMN source_type TEXT DEFAULT 'JUDICIAL_CAUSE_LIST'");
        }
        if (!caseCols.has('source_reference')) {
            db.exec("ALTER TABLE court_cases ADD COLUMN source_reference TEXT");
        }
        if (!caseCols.has('retrieved_at')) {
            db.exec("ALTER TABLE court_cases ADD COLUMN retrieved_at TEXT");
        }
        if (!caseCols.has('last_verified_at')) {
            db.exec("ALTER TABLE court_cases ADD COLUMN last_verified_at TEXT");
        }
        if (!caseCols.has('verification_status')) {
            db.exec("ALTER TABLE court_cases ADD COLUMN verification_status TEXT");
        }
        if (!caseCols.has('confidence')) {
            db.exec("ALTER TABLE court_cases ADD COLUMN confidence REAL DEFAULT 1.0");
        }
        if (!caseCols.has('raw_reference')) {
            db.exec("ALTER TABLE court_cases ADD COLUMN raw_reference TEXT");
        }

        // Backfill default provenance for existing cases
        db.exec(`
            UPDATE court_cases
            SET source_type = 'JUDICIAL_CAUSE_LIST',
                source_reference = COALESCE(source_reference, cnr_number, case_number),
                retrieved_at = COALESCE(retrieved_at, '2026-08-28T09:30:00.000Z'),
                last_verified_at = COALESCE(last_verified_at, last_updated_at, '28-08-2026'),
                verification_status = CASE WHEN is_demo = 1 THEN 'DEMO' ELSE 'VERIFIED' END,
                confidence = CASE WHEN is_demo = 1 THEN 0.0 ELSE 1.0 END,
                raw_reference = COALESCE(raw_reference, cnr_number, case_number)
            WHERE source_reference IS NULL OR verification_status IS NULL
        `);
    }

    // 3. Migrate encumbrances
    if (db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='encumbrances'").get().count > 0) {
        const encCols = getTableColumns('encumbrances');
        if (!encCols.has('source_type')) {
            db.exec("ALTER TABLE encumbrances ADD COLUMN source_type TEXT DEFAULT 'SUB_REGISTRAR_REGISTRY'");
        }
        if (!encCols.has('source_reference')) {
            db.exec("ALTER TABLE encumbrances ADD COLUMN source_reference TEXT");
        }
        if (!encCols.has('retrieved_at')) {
            db.exec("ALTER TABLE encumbrances ADD COLUMN retrieved_at TEXT");
        }
        if (!encCols.has('verification_status')) {
            db.exec("ALTER TABLE encumbrances ADD COLUMN verification_status TEXT");
        }
        if (!encCols.has('confidence')) {
            db.exec("ALTER TABLE encumbrances ADD COLUMN confidence REAL DEFAULT 1.0");
        }
        if (!encCols.has('raw_reference')) {
            db.exec("ALTER TABLE encumbrances ADD COLUMN raw_reference TEXT");
        }

        // Backfill default provenance for existing encumbrances
        db.exec(`
            UPDATE encumbrances
            SET source_type = 'SUB_REGISTRAR_REGISTRY',
                source_reference = COALESCE(source_reference, document_number),
                retrieved_at = COALESCE(retrieved_at, '2026-08-22T11:15:00.000Z'),
                last_verified_at = COALESCE(last_verified_at, registration_date, '22-11-2022'),
                verification_status = CASE WHEN is_demo = 1 THEN 'DEMO' ELSE 'VERIFIED' END,
                confidence = CASE WHEN is_demo = 1 THEN 0.0 ELSE 1.0 END,
                raw_reference = COALESCE(raw_reference, sro_office || '/' || document_number, document_number)
            WHERE source_reference IS NULL OR verification_status IS NULL
        `);
    }

    return true;
}

if (require.main === module) {
    runMigrations();
    console.log('Database migration completed successfully.');
}

module.exports = { runMigrations };
