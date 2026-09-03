/**
 * LandGuard — Legal Data Service & Adapter
 * Handles querying SQLite database (landguard.db) for Tamil Nadu administrative
 * hierarchy, land parcels, court cases, case history, and encumbrances.
 */

const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { calculateRisk } = require('./riskEngine');

const dbPath = path.resolve(__dirname, '..', '..', 'database', 'landguard.db');
let db = null;

function getDb() {
    if (!db) {
        db = new DatabaseSync(dbPath);
    }
    return db;
}

// 1. Get all districts
function getDistricts() {
    const database = getDb();
    const rows = database.prepare(`
        SELECT id, name, name_ta, code, latitude, longitude
        FROM districts
        ORDER BY name ASC
    `).all();
    return rows;
}

// 2. Get taluks for a district
function getTaluks(districtIdentifier) {
    const database = getDb();
    let query;
    let param;

    if (typeof districtIdentifier === 'number' || /^\d+$/.test(districtIdentifier)) {
        query = database.prepare(`
            SELECT id, name, name_ta, code
            FROM taluks
            WHERE district_id = ?
            ORDER BY name ASC
        `);
        param = Number(districtIdentifier);
    } else {
        query = database.prepare(`
            SELECT t.id, t.name, t.name_ta, t.code
            FROM taluks t
            JOIN districts d ON t.district_id = d.id
            WHERE LOWER(d.name) = LOWER(?)
            ORDER BY t.name ASC
        `);
        param = String(districtIdentifier).trim();
    }

    return query.all(param);
}

// 3. Get villages for a district and taluk with optional search query
function getVillages(district, taluk, searchQuery = '', limit = 100) {
    const database = getDb();
    let sql = `
        SELECT v.id, v.name, v.name_ta, v.code, v.vlist_url,
               t.name as taluk_name, d.name as district_name
        FROM villages v
        JOIN taluks t ON v.taluk_id = t.id
        JOIN districts d ON v.district_id = d.id
        WHERE 1=1
    `;
    const params = [];

    if (district) {
        sql += ` AND (LOWER(d.name) = LOWER(?) OR LOWER(d.name_ta) = LOWER(?))`;
        params.push(district.trim(), district.trim());
    }

    if (taluk) {
        sql += ` AND (LOWER(t.name) = LOWER(?) OR LOWER(t.name_ta) = LOWER(?))`;
        params.push(taluk.trim(), taluk.trim());
    }

    if (searchQuery && searchQuery.trim().length > 0) {
        sql += ` AND (LOWER(v.name) LIKE ? OR LOWER(COALESCE(v.name_ta, '')) LIKE ?)`;
        const q = `%${searchQuery.trim().toLowerCase()}%`;
        params.push(q, q);
    }

    sql += ` ORDER BY v.name ASC LIMIT ?`;
    params.push(Number(limit) || 100);

    return database.prepare(sql).all(...params);
}

// 4. Get survey numbers for suggestions in a village
function getSurveyNumbers(villageIdentifier, searchQuery = '', limit = 50) {
    const database = getDb();
    let sql = `
        SELECT DISTINCT p.survey_number
        FROM land_parcels p
        JOIN villages v ON p.village_id = v.id
        WHERE (LOWER(v.name) = LOWER(?) OR v.id = ?)
    `;
    const params = [String(villageIdentifier).trim(), Number(villageIdentifier) || 0];

    if (searchQuery && searchQuery.trim().length > 0) {
        sql += ` AND p.survey_number LIKE ?`;
        params.push(`${searchQuery.trim()}%`);
    }

    sql += ` ORDER BY p.survey_number ASC LIMIT ?`;
    params.push(Number(limit) || 50);

    const rows = database.prepare(sql).all(...params);
    return rows.map(r => r.survey_number);
}

// 5. POST /api/land/search handler
function searchLandParcel({ district, taluk, village, surveyNumber }) {
    if (!village || !surveyNumber) {
        return {
            status: "error",
            error: "Village and Survey Number are required fields."
        };
    }

    const database = getDb();
    const cleanSurvey = surveyNumber.trim().toUpperCase();

    // Query for parcel
    let sql = `
        SELECT p.*,
               v.id as village_id, v.name as village_name, v.name_ta as village_name_ta,
               t.name as taluk_name, t.name_ta as taluk_name_ta,
               d.name as district_name, d.name_ta as district_name_ta,
               d.latitude as dist_lat, d.longitude as dist_lng
        FROM land_parcels p
        JOIN villages v ON p.village_id = v.id
        JOIN taluks t ON v.taluk_id = t.id
        JOIN districts d ON v.district_id = d.id
        WHERE (LOWER(p.survey_number) = LOWER(?) OR LOWER(p.survey_number) = LOWER(?))
          AND (LOWER(v.name) LIKE ? OR LOWER(v.name_ta) LIKE ?)
    `;
    const params = [
        cleanSurvey,
        cleanSurvey.replace(/\s+/g, ''),
        `%${village.trim().toLowerCase()}%`,
        `%${village.trim().toLowerCase()}%`
    ];

    if (district && district.trim()) {
        sql += ` AND (LOWER(d.name) = LOWER(?) OR LOWER(d.name_ta) = LOWER(?))`;
        params.push(district.trim(), district.trim());
    }

    if (taluk && taluk.trim()) {
        sql += ` AND (LOWER(t.name) = LOWER(?) OR LOWER(t.name_ta) = LOWER(?))`;
        params.push(taluk.trim(), taluk.trim());
    }

    sql += ` LIMIT 1`;

    const parcelRow = database.prepare(sql).get(...params);

    // Coordinate fallback lookup
    let coordinates = {
        latitude: 11.1271, // Tamil Nadu center approx
        longitude: 78.6569,
        is_approximate: true
    };

    if (parcelRow && parcelRow.dist_lat && parcelRow.dist_lng) {
        coordinates.latitude = parcelRow.dist_lat;
        coordinates.longitude = parcelRow.dist_lng;
    } else if (district) {
        const distRow = database.prepare(`SELECT latitude, longitude FROM districts WHERE LOWER(name) = LOWER(?) LIMIT 1`).get(district.trim());
        if (distRow && distRow.latitude) {
            coordinates.latitude = distRow.latitude;
            coordinates.longitude = distRow.longitude;
        }
    }

    // CASE 1: No record found
    if (!parcelRow) {
        return {
            status: "no_record",
            verified: false,
            is_demo: false,
            message: "No verified record found in public legal and revenue registries for this survey number.",
            location: {
                district: district || "Tamil Nadu",
                taluk: taluk || "N/A",
                village: village,
                surveyNumber: cleanSurvey,
                coordinates: coordinates
            },
            next_steps: [
                "Verify Patta / Chitta directly on Tamil Nadu e-Services (eservices.tn.gov.in)",
                "Apply for a 30-year Encumbrance Certificate at TNREGINET (tnreginet.gov.in)",
                "Obtain certified Field Measurement Book (FMB) sketch from Taluk Revenue Office",
                "Engage an enrolled advocate for manual title search at the jurisdictional Sub-Registrar Office"
            ],
            disclaimer: "This application provides information for preliminary due diligence and is not legal advice. Absence of a result does not guarantee that a property is free from litigation."
        };
    }

    // CASE 2: Record Found -> Load Cases and Encumbrances
    const courtCaseRows = database.prepare(`
        SELECT * FROM court_cases WHERE parcel_id = ? ORDER BY id ASC
    `).all(parcelRow.id);

    const courtCasesWithHistory = courtCaseRows.map(c => {
        const history = database.prepare(`
            SELECT hearing_date, business_recorded, next_hearing_date, order_summary
            FROM case_history
            WHERE case_id = ?
            ORDER BY id ASC
        `).all(c.id);
        return {
            ...c,
            has_stay_injunction: Boolean(c.has_stay_injunction),
            is_demo: Boolean(c.is_demo),
            history: history
        };
    });

    const encumbrances = database.prepare(`
        SELECT * FROM encumbrances WHERE parcel_id = ? ORDER BY id ASC
    `).all(parcelRow.id).map(e => ({
        ...e,
        is_demo: Boolean(e.is_demo)
    }));

    // Calculate deterministic risk
    const risk = calculateRisk(parcelRow, courtCasesWithHistory, encumbrances);

    return {
        status: parcelRow.is_demo ? "demo_record" : "verified_record",
        verified: !Boolean(parcelRow.is_demo),
        is_demo: Boolean(parcelRow.is_demo),
        demo_notice: parcelRow.is_demo ? "DEMO DATA — SAMPLE RECORD FOR ILLUSTRATION ONLY" : null,
        location: {
            district: parcelRow.district_name,
            district_ta: parcelRow.district_name_ta,
            taluk: parcelRow.taluk_name,
            taluk_ta: parcelRow.taluk_name_ta,
            village: parcelRow.village_name,
            village_ta: parcelRow.village_name_ta,
            surveyNumber: parcelRow.survey_number,
            coordinates: coordinates
        },
        parcel: {
            owner: {
                name: parcelRow.owner_name || "N/A",
                father_name: parcelRow.owner_father_name || "N/A",
                registration_date: parcelRow.registration_date || "N/A"
            },
            land: {
                surveyNo: parcelRow.survey_number,
                subdivision: parcelRow.subdivision,
                extent: parcelRow.extent || "N/A",
                classification: parcelRow.classification || "N/A",
                marketValue: parcelRow.market_value_inr || "N/A",
                passbook: parcelRow.patta_passbook_no || "N/A",
                state: "Tamil Nadu"
            },
            source: {
                name: parcelRow.source_name,
                url: parcelRow.source_url,
                last_verified_at: parcelRow.last_verified_at
            }
        },
        courtCases: courtCasesWithHistory,
        encumbrances: encumbrances,
        risk: risk,
        timeline: [
            {
                date: parcelRow.registration_date || "Registration",
                title: "Property Registration",
                desc: `Registered under deed in revenue records with passbook ${parcelRow.patta_passbook_no || 'N/A'}.`,
                dot: "success"
            },
            ...courtCasesWithHistory.map(c => ({
                date: c.filing_date,
                title: `${c.case_type} Filed`,
                desc: `${c.court_name} (${c.case_number}) — Status: ${c.current_status}.`,
                dot: c.has_stay_injunction ? "danger" : "warning"
            }))
        ],
        disclaimer: "This application provides information for preliminary due diligence and is not legal advice. Absence of a result does not guarantee that a property is free from litigation."
    };
}

module.exports = {
    getDistricts,
    getTaluks,
    getVillages,
    getSurveyNumbers,
    searchLandParcel
};
