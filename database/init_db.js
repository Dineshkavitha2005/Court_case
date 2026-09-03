/**
 * LandGuard — Database Initializer & Compiler
 * Compiles all 38 Tamil Nadu districts, taluks, and 13,900+ villages
 * into a clean, relational SQLite database (database/landguard.db).
 * Populates documented benchmark demonstration records (clearly flagged is_demo=1).
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(__dirname, 'landguard.db');
const schemaPath = path.join(__dirname, 'schema.sql');

console.log('Initializing LandGuard SQLite database at:', dbPath);

// If database already exists, remove for clean rebuild
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
    } catch (e) {
        console.warn('Could not unlink old DB:', e.message);
    }
}

const db = new DatabaseSync(dbPath);

// Execute schema
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('Database schema created successfully.');

// 38 Districts of Tamil Nadu with Tamil names and centroid coordinates
const TN_DISTRICTS = [
    { name: "Ariyalur", name_ta: "அரியலூர்", code: "616", lat: 11.1401, lng: 79.0786 },
    { name: "Chengalpattu", name_ta: "செங்கல்பட்டு", code: "604A", lat: 12.6939, lng: 79.9757 },
    { name: "Chennai", name_ta: "சென்னை", code: "603", lat: 13.0827, lng: 80.2707 },
    { name: "Coimbatore", name_ta: "கோயம்புத்தூர்", code: "632", lat: 11.0168, lng: 76.9558 },
    { name: "Cuddalore", name_ta: "கடலூர்", code: "617", lat: 11.7480, lng: 79.7714 },
    { name: "Dharmapuri", name_ta: "தர்மபுரி", code: "630", lat: 12.1211, lng: 78.1582 },
    { name: "Dindigul", name_ta: "திண்டுக்கல்", code: "612", lat: 10.3673, lng: 77.9803 },
    { name: "Erode", name_ta: "ஈரோடு", code: "610", lat: 11.3410, lng: 77.7172 },
    { name: "Kallakurichi", name_ta: "கள்ளக்குறிச்சி", code: "607A", lat: 11.7383, lng: 78.9639 },
    { name: "Kancheepuram", name_ta: "காஞ்சிபுரம்", code: "604", lat: 12.8342, lng: 79.7036 },
    { name: "Kanniyakumari", name_ta: "கன்னியாகுமரி", code: "629", lat: 8.0883, lng: 77.5385 },
    { name: "Karur", name_ta: "கரூர்", code: "613", lat: 10.9601, lng: 78.0766 },
    { name: "Krishnagiri", name_ta: "கிருஷ்ணகிரி", code: "631", lat: 12.5186, lng: 78.2137 },
    { name: "Madurai", name_ta: "மதுரை", code: "623", lat: 9.9252, lng: 78.1198 },
    { name: "Mayiladuthurai", name_ta: "மயிலாடுதுறை", code: "618A", lat: 11.1075, lng: 79.6524 },
    { name: "Nagapattinam", name_ta: "நாகப்பட்டினம்", code: "618", lat: 10.7672, lng: 79.8449 },
    { name: "Namakkal", name_ta: "நாமக்கல்", code: "609", lat: 11.2189, lng: 78.1674 },
    { name: "Perambalur", name_ta: "பெரம்பலூர்", code: "615", lat: 11.2342, lng: 78.8819 },
    { name: "Pudukkottai", name_ta: "புதுக்கோட்டை", code: "621", lat: 10.3797, lng: 78.8208 },
    { name: "Ramanathapuram", name_ta: "ராமநாதபுரம்", code: "626", lat: 9.3639, lng: 78.8395 },
    { name: "Ranipet", name_ta: "ராணிப்பேட்டை", code: "605A", lat: 12.9272, lng: 79.3330 },
    { name: "Salem", name_ta: "சேலம்", code: "608", lat: 11.6643, lng: 78.1460 },
    { name: "Sivaganga", name_ta: "சிவகங்கை", code: "622", lat: 9.8433, lng: 78.4809 },
    { name: "Tenkasi", name_ta: "தென்காசி", code: "628A", lat: 8.9594, lng: 77.3150 },
    { name: "Thanjavur", name_ta: "தஞ்சாவூர்", code: "620", lat: 10.7870, lng: 79.1378 },
    { name: "The Nilgiris", name_ta: "நீலகிரி", code: "611", lat: 11.4102, lng: 76.6950 },
    { name: "Theni", name_ta: "தேனி", code: "624", lat: 10.0104, lng: 77.4768 },
    { name: "Thiruvallur", name_ta: "திருவள்ளூர்", code: "602", lat: 13.1432, lng: 79.9074 },
    { name: "Thiruvarur", name_ta: "திருவாரூர்", code: "619", lat: 10.7725, lng: 79.6365 },
    { name: "Thoothukudi", name_ta: "தூத்துக்குடி", code: "627", lat: 8.7642, lng: 78.1348 },
    { name: "Tiruchirappalli", name_ta: "திருச்சிராப்பள்ளி", code: "614", lat: 10.7905, lng: 78.7047 },
    { name: "Tirunelveli", name_ta: "திருநெல்வேலி", code: "628", lat: 8.7139, lng: 77.7567 },
    { name: "Tirupathur", name_ta: "திருப்பத்தூர்", code: "605B", lat: 12.4926, lng: 78.5678 },
    { name: "Tiruppur", name_ta: "திருப்பூர்", code: "633", lat: 11.1085, lng: 77.3411 },
    { name: "Tiruvannamalai", name_ta: "திருவண்ணாமலை", code: "606", lat: 12.2253, lng: 79.0747 },
    { name: "Vellore", name_ta: "வேலூர்", code: "605", lat: 12.9165, lng: 79.1325 },
    { name: "Viluppuram", name_ta: "விழுப்புரம்", code: "607", lat: 11.9401, lng: 79.4861 },
    { name: "Virudhunagar", name_ta: "விருதுநகர்", code: "625", lat: 9.5872, lng: 77.9514 }
];

const insertDistrict = db.prepare(`
    INSERT INTO districts (name, name_ta, code, state, latitude, longitude)
    VALUES (?, ?, ?, 'Tamil Nadu', ?, ?)
`);

const districtMap = new Map();
for (const d of TN_DISTRICTS) {
    const res = insertDistrict.run(d.name, d.name_ta, d.code, d.lat, d.lng);
    districtMap.set(d.name.toLowerCase(), Number(res.lastInsertRowid));
}
console.log(`Inserted ${districtMap.size} Tamil Nadu districts.`);

// Helper map for Taluks
const insertTaluk = db.prepare(`
    INSERT INTO taluks (district_id, name, name_ta)
    VALUES (?, ?, ?)
`);
const talukMap = new Map(); // key: districtId + '::' + talukName.toLowerCase()

function getOrCreateTaluk(districtId, talukName, talukNameTa = null) {
    const cleanName = talukName.trim();
    const key = `${districtId}::${cleanName.toLowerCase()}`;
    if (talukMap.has(key)) {
        return talukMap.get(key);
    }
    const res = insertTaluk.run(districtId, cleanName, talukNameTa);
    const id = Number(res.lastInsertRowid);
    talukMap.set(key, id);
    return id;
}

// 1. Load taluks and villages from generate_tn_database hierarchy
console.log('Loading administrative data from generate_tn_database.py definitions...');
try {
    const genPyPath = path.join(rootDir, 'generate_tn_database.py');
    if (fs.existsSync(genPyPath)) {
        const content = fs.readFileSync(genPyPath, 'utf8');
        // Extract TAMIL_NADU_DATA structure via JSON or regex
        // generate_tn_database has 38 districts with their taluks and sample villages
        const match = content.match(/TAMIL_NADU_DATA\s*=\s*(\{[\s\S]*?\n\})/);
        if (match) {
            // Evaluated safely in sandbox or parsed
            const pyDictStr = match[1]
                .replace(/'/g, '"')
                .replace(/True/g, 'true')
                .replace(/False/g, 'false')
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']');
            try {
                const pyData = JSON.parse(pyDictStr);
                for (const [distName, info] of Object.entries(pyData)) {
                    const distId = districtMap.get(distName.toLowerCase());
                    if (!distId) continue;
                    if (info.taluks) {
                        for (const [tName, vList] of Object.entries(info.taluks)) {
                            const talukId = getOrCreateTaluk(distId, tName);
                            const insertVillage = db.prepare(`
                                INSERT INTO villages (taluk_id, district_id, name, vlist_url)
                                VALUES (?, ?, ?, ?)
                            `);
                            for (const vName of vList) {
                                insertVillage.run(talukId, distId, vName, `https://vlist.in/village/${vName.toLowerCase().replace(/\s+/g, '-')}`);
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn('Notice: Could not parse python dict as JSON, continuing with villages.db:', err.message);
            }
        }
    }
} catch (err) {
    console.warn('generate_tn_database check warning:', err.message);
}

// 2. Load all 13,981 villages from villages.db
const oldDbPath = path.join(rootDir, 'villages.db');
if (fs.existsSync(oldDbPath)) {
    console.log('Ingesting villages from villages.db...');
    const oldDb = new DatabaseSync(oldDbPath);
    const rows = oldDb.prepare(`
        SELECT name, district_name, sub_district_name, village_code, vlist_url
        FROM villages
    `).all();

    const insertVillage = db.prepare(`
        INSERT INTO villages (taluk_id, district_id, name, code, vlist_url)
        VALUES (?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION');
    let villageCount = 0;
    for (const r of rows) {
        if (!r.name || !r.district_name) continue;
        const distKey = r.district_name.trim().toLowerCase();
        let distId = districtMap.get(distKey);
        
        // Handle name variations (e.g., Kancheepuram vs Kanchipuram)
        if (!distId) {
            if (distKey.includes('kanchi')) distId = districtMap.get('kancheepuram');
            else if (distKey.includes('kallak')) distId = districtMap.get('kallakurichi');
            else if (distKey.includes('chengal')) distId = districtMap.get('chengalpattu');
            else if (distKey.includes('nilgiri')) distId = districtMap.get('the nilgiris');
            else if (distKey.includes('thoothu') || distKey.includes('tuticorin')) distId = districtMap.get('thoothukudi');
            else if (distKey.includes('kanni')) distId = districtMap.get('kanniyakumari');
        }

        if (!distId) continue;

        const talukName = (r.sub_district_name && r.sub_district_name.trim()) || 'Taluk HQ';
        const talukId = getOrCreateTaluk(distId, talukName);

        try {
            insertVillage.run(talukId, distId, r.name.trim(), r.village_code || '', r.vlist_url || '');
            villageCount++;
        } catch (_) {
            // Skip duplicate entry
        }
    }
    db.exec('COMMIT');
    oldDb.close();
    console.log(`Ingested ${villageCount} villages from villages.db into new schema.`);
}

// Ensure default taluks exist for any district that currently has 0 taluks
for (const [dName, dId] of districtMap.entries()) {
    const hasTaluk = db.prepare(`SELECT count(*) as c FROM taluks WHERE district_id = ?`).get(dId);
    if (hasTaluk.c === 0) {
        const defaultTaluk = TN_DISTRICTS.find(x => x.name.toLowerCase() === dName)?.name || 'Central';
        const tId = getOrCreateTaluk(dId, defaultTaluk);
        // Add District Headquarters Village
        db.prepare(`INSERT INTO villages (taluk_id, district_id, name) VALUES (?, ?, ?)`).run(tId, dId, `${defaultTaluk} Town`);
    }
}

// Check total counts
const totalDistricts = db.prepare(`SELECT count(*) as c FROM districts`).get().c;
const totalTaluks = db.prepare(`SELECT count(*) as c FROM taluks`).get().c;
const totalVillages = db.prepare(`SELECT count(*) as c FROM villages`).get().c;
console.log(`Summary: ${totalDistricts} districts, ${totalTaluks} taluks, ${totalVillages} revenue villages compiled.`);

// 3. Seed Documented Benchmark Demonstration Records (Clearly marked is_demo = 1)
console.log('Seeding documented demonstration benchmark records (is_demo=1)...');

// Helper to find village ID
function findVillageId(districtName, talukName, villageName) {
    const row = db.prepare(`
        SELECT v.id FROM villages v
        JOIN taluks t ON v.taluk_id = t.id
        JOIN districts d ON v.district_id = d.id
        WHERE d.name LIKE ? AND t.name LIKE ? AND v.name LIKE ?
        LIMIT 1
    `).get(`%${districtName}%`, `%${talukName}%`, `%${villageName}%`);
    return row ? row.id : null;
}

// Seed Benchmark 1: High Risk Title Dispute with Active Court Stay
// Coimbatore -> Coimbatore South -> Alanthurai (TP) -> Survey No: 142/1
let vId1 = findVillageId('Coimbatore', 'Coimbatore South', 'Alanthurai');
if (!vId1) {
    const distId = districtMap.get('coimbatore');
    const talukId = getOrCreateTaluk(distId, 'Coimbatore South');
    const res = db.prepare(`INSERT INTO villages (taluk_id, district_id, name) VALUES (?, ?, ?)`).run(talukId, distId, 'Alanthurai (TP)');
    vId1 = Number(res.lastInsertRowid);
}

const p1 = db.prepare(`
    INSERT INTO land_parcels (
        village_id, survey_number, subdivision, extent, classification,
        market_value_inr, patta_passbook_no, owner_name, owner_father_name,
        registration_date, is_demo, source_name, source_url, last_verified_at
    ) VALUES (
        ?, '142/1', '1', '2.45 Acres', 'Agricultural / Nanjai',
        '₹ 1,85,00,000', 'TN/CBE/2019/P0452', 'K. Balasubramaniam', 'Kuppusamy Gounder',
        '14-06-2019', 1, 'Tamil Nadu Land Records Registry (e-Services)', 'https://eservices.tn.gov.in', '01-09-2026'
    )
`).run(vId1);
const parcelId1 = Number(p1.lastInsertRowid);

const c1 = db.prepare(`
    INSERT INTO court_cases (
        parcel_id, case_number, cnr_number, court_name, case_type,
        filing_date, petitioner, respondent, current_status, judge_bench,
        has_stay_injunction, case_summary, source_name, source_url, last_updated_at, is_demo
    ) VALUES (
        ?, 'OS No. 342/2022', 'TNCB01-002341-2022', 'Principal District Munsif Court, Coimbatore', 'Original Civil Suit (Title Dispute)',
        '12-04-2022', 'Natarajan & Others', 'K. Balasubramaniam & Sub-Registrar', 'Pending Trial', 'Hon. Principal District Munsif',
        1, 'Suit for declaration of title and permanent injunction alleging invalid partition deed executed in 2018. Interim order restraining alienation in effect.',
        'eCourts Services (NJDG)', 'https://ecourts.gov.in', '28-08-2026', 1
    )
`).run(parcelId1);
const caseId1 = Number(c1.lastInsertRowid);

db.prepare(`
    INSERT INTO case_history (case_id, hearing_date, business_recorded, next_hearing_date, order_summary)
    VALUES (?, '12-04-2022', 'Plaint admitted. Notice ordered.', '15-06-2022', 'Summons issued to defendants.')
`).run(caseId1);
db.prepare(`
    INSERT INTO case_history (case_id, hearing_date, business_recorded, next_hearing_date, order_summary)
    VALUES (?, '18-11-2022', 'IA 45/2022 heard.', '20-01-2023', 'Interim injunction granted restraining creation of third-party encumbrances until further orders.')
`).run(caseId1);
db.prepare(`
    INSERT INTO case_history (case_id, hearing_date, business_recorded, next_hearing_date, order_summary)
    VALUES (?, '14-07-2026', 'Written statement filed by D1. Issues framed.', '25-09-2026', 'Posted for plaintiff evidence.')
`).run(caseId1);

db.prepare(`
    INSERT INTO encumbrances (
        parcel_id, document_number, execution_date, registration_date, nature_of_deed,
        executant, claimant, mortgage_amount_inr, status, sro_office, source_name, is_demo
    ) VALUES (
        ?, 'Doc 1120/2022 (Book 1)', '20-11-2022', '22-11-2022', 'Court Injunction Attachment Order',
        'Principal District Munsif Court', 'Natarajan', 'N/A', 'Active Court Restraint', 'Thondamuthur SRO', 'TNREGINET', 1
    )
`).run(parcelId1);

// Seed Benchmark 2: Medium Risk - Active Bank Mortgage
// Kancheepuram -> Sriperumbudur -> Nemili -> Survey No: 88/2A
let vId2 = findVillageId('Kancheepuram', 'Sriperumbudur', 'Nemili');
if (!vId2) {
    const distId = districtMap.get('kancheepuram');
    const talukId = getOrCreateTaluk(distId, 'Sriperumbudur');
    const res = db.prepare(`INSERT INTO villages (taluk_id, district_id, name) VALUES (?, ?, ?)`).run(talukId, distId, 'Nemili');
    vId2 = Number(res.lastInsertRowid);
}

const p2 = db.prepare(`
    INSERT INTO land_parcels (
        village_id, survey_number, subdivision, extent, classification,
        market_value_inr, patta_passbook_no, owner_name, owner_father_name,
        registration_date, is_demo, source_name, source_url, last_verified_at
    ) VALUES (
        ?, '88/2A', '2A', '1.15 Acres', 'Industrial / Commercial Approved',
        '₹ 95,00,000', 'TN/KPM/2020/P1823', 'S. Meenakshi Sundaram', 'Sankaranarayanan',
        '05-02-2020', 1, 'Tamil Nadu Land Records Registry (e-Services)', 'https://eservices.tn.gov.in', '25-08-2026'
    )
`).run(vId2);
const parcelId2 = Number(p2.lastInsertRowid);

db.prepare(`
    INSERT INTO encumbrances (
        parcel_id, document_number, execution_date, registration_date, nature_of_deed,
        executant, claimant, mortgage_amount_inr, status, sro_office, source_name, is_demo
    ) VALUES (
        ?, 'Doc 3450/2021', '10-08-2021', '12-08-2021', 'Simple Mortgage with Deposit of Title Deeds',
        'S. Meenakshi Sundaram', 'State Bank of India (Sriperumbudur SME Branch)', '₹ 45,00,000', 'Active Mortgage', 'Sriperumbudur SRO', 'TNREGINET', 1
    )
`).run(parcelId2);

// Seed Benchmark 3: Low Risk - Clear Verified Title
// Chennai -> Velachery -> Velachery -> Survey No: 45/1
let vId3 = findVillageId('Chennai', 'Velachery', 'Velachery');
if (!vId3) {
    const distId = districtMap.get('chennai');
    const talukId = getOrCreateTaluk(distId, 'Velachery');
    const res = db.prepare(`INSERT INTO villages (taluk_id, district_id, name) VALUES (?, ?, ?)`).run(talukId, distId, 'Velachery');
    vId3 = Number(res.lastInsertRowid);
}

const p3 = db.prepare(`
    INSERT INTO land_parcels (
        village_id, survey_number, subdivision, extent, classification,
        market_value_inr, patta_passbook_no, owner_name, owner_father_name,
        registration_date, is_demo, source_name, source_url, last_verified_at
    ) VALUES (
        ?, '45/1', '1', '2400 Sq.Ft (1 Ground)', 'Residential (Grama Natham)',
        '₹ 1,20,00,000', 'TN/CHN/2016/P9921', 'R. Ananthapadmanabhan', 'Ramaswamy Iyer',
        '10-11-2016', 1, 'Tamil Nadu Land Records Registry (e-Services)', 'https://eservices.tn.gov.in', '30-08-2026'
    )
`).run(vId3);
const parcelId3 = Number(p3.lastInsertRowid);

db.prepare(`
    INSERT INTO encumbrances (
        parcel_id, document_number, execution_date, registration_date, nature_of_deed,
        executant, claimant, mortgage_amount_inr, status, sro_office, source_name, is_demo
    ) VALUES (
        ?, 'EC Certificate No. EC/2026/04192', '01-01-1994', '30-08-2026', 'Nil Encumbrance Certificate (32-Year Search Period)',
        'Sub-Registrar Velachery', 'R. Ananthapadmanabhan', 'None', 'Clear Title', 'Velachery SRO', 'TNREGINET', 1
    )
`).run(parcelId3);

// Seed Benchmark 4: Multiple Active Suits & Writ Petition (Very High Risk)
// Madurai -> Madurai North -> Othakadai -> Survey No: 72/3
let vId4 = findVillageId('Madurai', 'Madurai North', 'Othakadai');
if (!vId4) {
    const distId = districtMap.get('madurai');
    const talukId = getOrCreateTaluk(distId, 'Madurai North');
    const res = db.prepare(`INSERT INTO villages (taluk_id, district_id, name) VALUES (?, ?, ?)`).run(talukId, distId, 'Othakadai');
    vId4 = Number(res.lastInsertRowid);
}

const p4 = db.prepare(`
    INSERT INTO land_parcels (
        village_id, survey_number, subdivision, extent, classification,
        market_value_inr, patta_passbook_no, owner_name, owner_father_name,
        registration_date, is_demo, source_name, source_url, last_verified_at
    ) VALUES (
        ?, '72/3', '3', '3.80 Acres', 'Agricultural / Punjai',
        '₹ 2,40,00,000', 'TN/MDU/2014/P5510', 'P. Muthuramalingam (Disputed)', 'Palaniandi Thevar',
        '20-03-2014', 1, 'Tamil Nadu Land Records Registry (e-Services)', 'https://eservices.tn.gov.in', '02-09-2026'
    )
`).run(vId4);
const parcelId4 = Number(p4.lastInsertRowid);

const c4_1 = db.prepare(`
    INSERT INTO court_cases (
        parcel_id, case_number, cnr_number, court_name, case_type,
        filing_date, petitioner, respondent, current_status, judge_bench,
        has_stay_injunction, case_summary, source_name, source_url, last_updated_at, is_demo
    ) VALUES (
        ?, 'OS No. 112/2021', 'TNMD02-001920-2021', 'Sub-Court, Madurai', 'Civil Suit for Declaration & Possession',
        '15-03-2021', 'Sundaram & Co-heirs', 'P. Muthuramalingam & 4 Others', 'Pending Evidence', 'Hon. Sub-Judge',
        1, 'Ancestral title partition suit claiming illegal alienation by deceased power agent.',
        'eCourts Services (NJDG)', 'https://ecourts.gov.in', '20-08-2026', 1
    )
`).run(parcelId4);

const c4_2 = db.prepare(`
    INSERT INTO court_cases (
        parcel_id, case_number, cnr_number, court_name, case_type,
        filing_date, petitioner, respondent, current_status, judge_bench,
        has_stay_injunction, case_summary, source_name, source_url, last_updated_at, is_demo
    ) VALUES (
        ?, 'WP(MD) No. 8921/2023', 'MHC-MAD-WP-8921-2023', 'Madras High Court (Madurai Bench)', 'Writ Petition (Revenue Jurisdiction)',
        '04-06-2023', 'P. Muthuramalingam', 'The District Collector, Madurai & Tahsildar Madurai North', 'Pending Final Hearing', 'Hon. Division Bench',
        1, 'Writ challenging Tahsildar order cancelling joint patta transfer. Interim status quo order granted.',
        'Madras High Court Portal', 'https://hcmadras.tn.gov.in', '15-08-2026', 1
    )
`).run(parcelId4);

db.prepare(`
    INSERT INTO encumbrances (
        parcel_id, document_number, execution_date, registration_date, nature_of_deed,
        executant, claimant, mortgage_amount_inr, status, sro_office, source_name, is_demo
    ) VALUES (
        ?, 'Lis Pendens Notice Doc 45/2021', '25-03-2021', '28-03-2021', 'Notice of Pending Litigation (Lis Pendens)',
        'Sub-Court Madurai', 'Sundaram', 'N/A', 'Registered Lis Pendens', 'Othakadai SRO', 'TNREGINET', 1
    )
`).run(parcelId4);

db.close();
console.log('Database initialization complete! landguard.db is ready.');
