/**
 * LandGuard — Legal Data Verification & Provenance Test Suite
 * Automated tests proving:
 * 1. DEMO != VERIFIED (DEMO records can NEVER appear as VERIFIED)
 * 2. NO_RECORD != VERIFIED (Absence of record is not clean title verification)
 * 3. SOURCE_UNAVAILABLE != NO_RECORD (Government downtime != no litigation)
 * 4. Zero fabricated legal fields (no fake owner, case, date, status, court, survey, risk)
 * 5. Source information is preserved across all records
 * 6. Provenance of all 12 legal fields
 * 7. Backend data-source status object accuracy
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const server = require('../../server');
const { RecordClassification, getDataSourceStatus } = require('../../src/services/dataSourceStatus');
const { searchLandParcel } = require('../../src/services/legalDataService');

const VERIFY_TEST_PORT = 8792;
let verifyServer = null;

function makeRequest(pathname, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: VERIFY_TEST_PORT,
            path: pathname,
            method: method,
            headers: {}
        };

        if (payload) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch (_) {
                    parsed = data;
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

test('Legal Data Verification Suite Setup', async () => {
    await new Promise((resolve) => {
        verifyServer = server.listen(VERIFY_TEST_PORT, '127.0.0.1', resolve);
    });
});

// ============================================
// REQUIREMENT 3 & 4: DEMO != VERIFIED
// ============================================
test('DEMO != VERIFIED: Benchmark records are strictly classified as DEMO with verified=false', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142/1'
    });

    assert.strictEqual(res.statusCode, 200);
    // Hard invariant: Must be DEMO
    assert.strictEqual(res.body.record_classification, RecordClassification.DEMO);
    // Hard invariant: Can NEVER be VERIFIED
    assert.notStrictEqual(res.body.record_classification, RecordClassification.VERIFIED);
    assert.strictEqual(res.body.is_demo, true);
    assert.strictEqual(res.body.verified, false);
    assert.strictEqual(res.body.status, 'demo_record');
    assert.strictEqual(typeof res.body.demo_notice, 'string');
    assert.strictEqual(res.body.demo_notice.includes('DEMO DATA'), true);
});

test('DEMO != VERIFIED: All 4 benchmark demo records permanently enforce verified=false', () => {
    const benchmarks = [
        { district: 'Coimbatore', taluk: 'Coimbatore South', village: 'Alanthurai (TP)', survey: '142/1' },
        { district: 'Kancheepuram', taluk: 'Sriperumbudur', village: 'Nemili', survey: '88/2A' },
        { district: 'Chennai', taluk: 'Velachery', village: 'Velachery', survey: '45/1' },
        { district: 'Madurai', taluk: 'Madurai North', village: 'Othakadai', survey: '72/3' }
    ];

    for (const b of benchmarks) {
        const result = searchLandParcel({
            district: b.district,
            taluk: b.taluk,
            village: b.village,
            surveyNumber: b.survey
        });

        assert.strictEqual(result.is_demo, true, `Survey ${b.survey} must have is_demo=true`);
        assert.strictEqual(result.verified, false, `Survey ${b.survey} must have verified=false`);
        assert.strictEqual(result.record_classification, RecordClassification.DEMO, `Survey ${b.survey} must be DEMO`);
        assert.notStrictEqual(result.record_classification, RecordClassification.VERIFIED, `Survey ${b.survey} can NEVER be VERIFIED`);
    }
});

// ============================================
// REQUIREMENT 3 & 10: NO_RECORD != VERIFIED
// ============================================
test('NO_RECORD != VERIFIED: Unknown survey numbers return NO_RECORD without title verification', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '9999/999'
    });

    assert.strictEqual(res.statusCode, 200);
    // Hard invariant: Must be NO_RECORD
    assert.strictEqual(res.body.record_classification, RecordClassification.NO_RECORD);
    // Hard invariant: Can NEVER be VERIFIED
    assert.notStrictEqual(res.body.record_classification, RecordClassification.VERIFIED);
    assert.strictEqual(res.body.verified, false);
    assert.strictEqual(res.body.is_demo, false);
    assert.strictEqual(res.body.status, 'no_record');
    assert.strictEqual(res.body.parcel, undefined);
    assert.strictEqual(res.body.courtCases, undefined);
    assert.strictEqual(res.body.encumbrances, undefined);
    assert.strictEqual(res.body.risk, undefined);
    assert.strictEqual(res.body.disclaimer.includes('Absence of a result does not guarantee'), true);
});

// ============================================
// REQUIREMENT 5 & 10: SOURCE_UNAVAILABLE != NO_RECORD
// ============================================
test('SOURCE_UNAVAILABLE != NO_RECORD: Government downtime returns explicit unavailability notice', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142/1',
        mode: 'live' // Request live official verification
    });

    assert.strictEqual(res.statusCode, 200);
    // Hard invariant: Must be SOURCE_UNAVAILABLE
    assert.strictEqual(res.body.record_classification, RecordClassification.SOURCE_UNAVAILABLE);
    // Hard invariant: Must NOT be NO_RECORD
    assert.notStrictEqual(res.body.record_classification, RecordClassification.NO_RECORD);
    assert.notStrictEqual(res.body.status, 'no_record');
    assert.strictEqual(res.body.status, 'source_unavailable');
    assert.strictEqual(res.body.verified, false);
    assert.strictEqual(res.body.is_demo, false);

    // Exact statutory message required by Requirement 5
    assert.strictEqual(
        res.body.message,
        'Official source currently unavailable. Verification could not be completed.'
    );
    // Must NOT claim "No litigation found"
    assert.strictEqual(res.body.message.includes('No litigation found'), false);
    assert.strictEqual(res.body.message.includes('No verified record found'), false);
});

// ============================================
// REQUIREMENT 6: NO FABRICATED RECORDS
// ============================================
test('Zero fabrication: Non-existent parcels generate zero fake owners, cases, courts, or risk scores', () => {
    const searches = [
        { village: 'Alanthurai (TP)', survey: '7777/8' },
        { village: 'Nemili', survey: '555/9B' },
        { village: 'Velachery', survey: '999/1' }
    ];

    for (const s of searches) {
        const result = searchLandParcel({
            district: 'Coimbatore',
            taluk: 'Coimbatore South',
            village: s.village,
            surveyNumber: s.survey
        });

        assert.strictEqual(result.record_classification, RecordClassification.NO_RECORD);
        assert.strictEqual(result.parcel, undefined, 'Owner/parcel must not be generated');
        assert.strictEqual(result.courtCases, undefined, 'Court cases must not be generated');
        assert.strictEqual(result.encumbrances, undefined, 'Encumbrances must not be generated');
        assert.strictEqual(result.risk, undefined, 'Risk score must not be generated');
        assert.strictEqual(result.verified, false);
    }
});

// ============================================
// REQUIREMENT 2: FIELD PROVENANCE IDENTIFICATION
// ============================================
test('Field Provenance: Every legal field maps to a verified statutory origin', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142/1'
    });

    assert.strictEqual(res.statusCode, 200);
    const data = res.body;

    // 1. Case number
    assert.strictEqual(data.courtCases[0].case_number, 'OS No. 342/2022');
    // 2. Court
    assert.strictEqual(data.courtCases[0].court_name, 'Principal District Munsif Court, Coimbatore');
    // 3. Case type
    assert.strictEqual(data.courtCases[0].case_type, 'Original Civil Suit (Title Dispute)');
    // 4. Filing date
    assert.strictEqual(data.courtCases[0].filing_date, '12-04-2022');
    // 5. Parties (Petitioner vs Respondent)
    assert.strictEqual(data.courtCases[0].petitioner, 'Natarajan & Others');
    assert.strictEqual(data.courtCases[0].respondent, 'K. Balasubramaniam & Sub-Registrar');
    // 6. Status
    assert.strictEqual(data.courtCases[0].current_status, 'Pending Trial');
    // 7. Case history
    assert.strictEqual(Array.isArray(data.courtCases[0].history), true);
    assert.strictEqual(data.courtCases[0].history.length >= 3, true);
    assert.strictEqual(data.courtCases[0].history[0].hearing_date, '12-04-2022');
    assert.strictEqual(typeof data.courtCases[0].history[0].order_summary, 'string');
    // 8. Survey reference
    assert.strictEqual(data.parcel.land.surveyNo, '142/1');
    assert.strictEqual(data.parcel.land.subdivision, '1');
    // 9. Owner
    assert.strictEqual(data.parcel.owner.name, 'K. Balasubramaniam');
    assert.strictEqual(data.parcel.owner.father_name, 'Kuppusamy Gounder');
    // 10. Encumbrance
    assert.strictEqual(data.encumbrances[0].document_number, 'Doc 1120/2022 (Book 1)');
    assert.strictEqual(data.encumbrances[0].nature_of_deed, 'Court Injunction Attachment Order');
    // 11. Source
    assert.strictEqual(data.parcel.source.name, 'Tamil Nadu Land Records Registry (e-Services)');
    assert.strictEqual(data.parcel.source.url, 'https://eservices.tn.gov.in');
    assert.strictEqual(data.courtCases[0].source_name, 'eCourts Services (NJDG)');
    assert.strictEqual(data.courtCases[0].source_url, 'https://ecourts.gov.in');
    assert.strictEqual(data.encumbrances[0].source_name, 'TNREGINET');
    // 12. Last updated
    assert.strictEqual(typeof data.parcel.source.last_verified_at, 'string');
    assert.strictEqual(typeof data.courtCases[0].last_updated_at, 'string');
});

// ============================================
// REQUIREMENT 9: BACKEND DATA-SOURCE STATUS OBJECT
// ============================================
test('Data Source Status: Backend provides transparent statutory source audit object', async () => {
    const res = await makeRequest('/api/sources/status');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'success');

    const statusObj = res.body.data;
    assert.strictEqual(statusObj.system_status, 'OPERATIONAL_BENCHMARK_AND_INDEX');
    assert.strictEqual(statusObj.live_gateways_active, false);

    // LGD is available as local relational index
    assert.strictEqual(statusObj.statutory_sources.lgd.status, 'AVAILABLE');
    assert.strictEqual(statusObj.statutory_sources.lgd.isLocalIndexed, true);
    assert.strictEqual(statusObj.statutory_sources.lgd.recordCount, 14551);

    // eCourts, TN e-Services, TNREGINET accurately declared as SOURCE_UNAVAILABLE without live credentials
    assert.strictEqual(statusObj.statutory_sources.ecourts.status, 'SOURCE_UNAVAILABLE');
    assert.strictEqual(statusObj.statutory_sources.tn_eservices.status, 'SOURCE_UNAVAILABLE');
    assert.strictEqual(statusObj.statutory_sources.tnreginet.status, 'SOURCE_UNAVAILABLE');

    // Compliance policies explicitly declared
    assert.strictEqual(statusObj.compliance_policy.captcha_bypass, 'STRICTLY_PROHIBITED');
    assert.strictEqual(statusObj.compliance_policy.synthetic_fabrication, 'STRICTLY_PROHIBITED');
    assert.strictEqual(statusObj.compliance_policy.demo_data_isolation, 'ENFORCED_PERMANENTLY');
});

// ============================================
// REQUIREMENT 10: SOURCE INFORMATION IS PRESERVED
// ============================================
test('Source Preservation: Source metadata is attached to all search responses', async () => {
    // 1. Search demo record
    const resDemo = await makeRequest('/api/land/search', 'POST', {
        district: 'Chennai',
        taluk: 'Velachery',
        village: 'Velachery',
        surveyNumber: '45/1'
    });
    assert.strictEqual(resDemo.statusCode, 200);
    assert.strictEqual(typeof resDemo.body.data_source_status, 'object');
    assert.strictEqual(resDemo.body.data_source_status.statutory_sources.lgd.recordCount, 14551);
    assert.strictEqual(resDemo.body.parcel.source.name.includes('e-Services'), true);

    // 2. Search unindexed record
    const resUnknown = await makeRequest('/api/land/search', 'POST', {
        district: 'Chennai',
        taluk: 'Velachery',
        village: 'Velachery',
        surveyNumber: '999/999'
    });
    assert.strictEqual(resUnknown.statusCode, 200);
    assert.strictEqual(typeof resUnknown.body.data_source_status, 'object');
    assert.strictEqual(resUnknown.body.data_source_status.compliance_policy.captcha_bypass, 'STRICTLY_PROHIBITED');
});

test('Legal Data Verification Suite Teardown', async () => {
    if (verifyServer) {
        await new Promise((resolve) => verifyServer.close(resolve));
    }
});
