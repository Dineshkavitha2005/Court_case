/**
 * LandGuard — Verified Data Audit Trail & Provenance Test Suite
 * 
 * Verifies that:
 * 1. Every court case, ownership record, and encumbrance record contains:
 *    - id
 *    - source_name
 *    - source_type
 *    - source_reference
 *    - retrieved_at
 *    - last_verified_at
 *    - verification_status
 *    - is_demo
 *    - confidence
 *    - raw_reference where legally permitted
 * 
 * 2. Allowed verification statuses:
 *    VERIFIED, DEMO, UNVERIFIED, SOURCE_UNAVAILABLE, NO_RECORD
 * 
 * 3. Enforces the 5 strict legal rules:
 *    Rule 1: is_demo=true must always produce DEMO status.
 *    Rule 2: DEMO data must never be treated as legal evidence (confidence: 0.0, admissible: false).
 *    Rule 3: Missing source information must not produce VERIFIED (produces UNVERIFIED).
 *    Rule 4: Never invent source URLs.
 *    Rule 5: Never invent verification dates.
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const server = require('../../backend/server');
const {
    VerificationStatus,
    buildProvenanceRecord,
    getDataSourceStatus
} = require('../../backend/services/dataSourceStatus');
const { searchLandParcel } = require('../../backend/services/legalDataService');

const PROVENANCE_TEST_PORT = 8793;
let testServer = null;

const ALLOWED_STATUSES = new Set([
    'VERIFIED',
    'DEMO',
    'UNVERIFIED',
    'SOURCE_UNAVAILABLE',
    'NO_RECORD'
]);

const REQUIRED_PROVENANCE_FIELDS = [
    'id',
    'source_name',
    'source_type',
    'source_reference',
    'retrieved_at',
    'last_verified_at',
    'verification_status',
    'is_demo',
    'confidence',
    'raw_reference'
];

function makeRequest(pathname, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: PROVENANCE_TEST_PORT,
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
                    body: parsed
                });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

test('Provenance Audit Suite: Start test server', async () => {
    await new Promise((resolve) => {
        testServer = server.listen(PROVENANCE_TEST_PORT, '127.0.0.1', resolve);
    });
});

// ============================================================================
// PART 1: Core Provenance Invariants & The 5 Legal Rules
// ============================================================================

test('Rule 1: is_demo=true must ALWAYS produce DEMO status regardless of other inputs', () => {
    const record = buildProvenanceRecord({
        id: 101,
        is_demo: true,
        source_name: 'eCourts Services (NJDG)',
        source_type: 'JUDICIAL_CAUSE_LIST',
        source_reference: 'OS No. 123/2022',
        source_url: 'https://ecourts.gov.in',
        last_verified_at: '2026-08-28T09:30:00.000Z',
        verification_status: 'VERIFIED' // attempted override must be rejected
    });

    assert.strictEqual(record.verification_status, 'DEMO');
    assert.strictEqual(record.is_demo, true);
    assert.strictEqual(ALLOWED_STATUSES.has(record.verification_status), true);
});

test('Rule 2: DEMO data must never be treated as legal evidence (confidence: 0.0)', () => {
    const demoRecord = buildProvenanceRecord({
        id: 102,
        is_demo: true,
        source_name: 'TNREGINET',
        source_reference: 'Doc 1120/2022',
        confidence: 0.95 // attempted high confidence on demo
    });

    assert.strictEqual(demoRecord.confidence, 0.0);
    assert.strictEqual(demoRecord.admissible_as_legal_evidence, false);
});

test('Rule 3: Missing source information must NEVER produce VERIFIED', () => {
    // Missing source_name
    const missingName = buildProvenanceRecord({
        id: 103,
        is_demo: false,
        source_name: null,
        source_reference: 'REF-001',
        last_verified_at: '2026-08-28T09:30:00.000Z'
    });
    assert.notStrictEqual(missingName.verification_status, 'VERIFIED');
    assert.strictEqual(missingName.verification_status, 'UNVERIFIED');
    assert.strictEqual(missingName.confidence, 0.0);

    // Missing source_reference
    const missingRef = buildProvenanceRecord({
        id: 104,
        is_demo: false,
        source_name: 'eCourts',
        source_reference: null,
        last_verified_at: '2026-08-28T09:30:00.000Z'
    });
    assert.notStrictEqual(missingRef.verification_status, 'VERIFIED');
    assert.strictEqual(missingRef.verification_status, 'UNVERIFIED');

    // Missing last_verified_at
    const missingDate = buildProvenanceRecord({
        id: 105,
        is_demo: false,
        source_name: 'eCourts',
        source_reference: 'REF-002',
        last_verified_at: null
    });
    assert.notStrictEqual(missingDate.verification_status, 'VERIFIED');
    assert.strictEqual(missingDate.verification_status, 'UNVERIFIED');
});

test('Rule 4: Never invent source URLs (only validated official statutory URLs allowed)', () => {
    const officialRecord = buildProvenanceRecord({
        id: 106,
        source_url: 'https://ecourts.gov.in'
    });
    assert.strictEqual(officialRecord.source_url, 'https://ecourts.gov.in');

    const inventedRecord = buildProvenanceRecord({
        id: 107,
        source_url: 'not-a-valid-url'
    });
    assert.strictEqual(inventedRecord.source_url, null);

    const emptyRecord = buildProvenanceRecord({
        id: 108,
        source_url: ''
    });
    assert.strictEqual(emptyRecord.source_url, null);
});

test('Rule 5: Never invent verification dates (null when not verified)', () => {
    const unverifiedRecord = buildProvenanceRecord({
        id: 109,
        last_verified_at: null
    });
    assert.strictEqual(unverifiedRecord.last_verified_at, null);
    assert.strictEqual(unverifiedRecord.verification_status, 'UNVERIFIED');
});

test('All verification statuses belong strictly to the allowed set', () => {
    const cases = [
        { is_demo: true },
        { is_demo: false, source_name: 'A', source_reference: 'B', last_verified_at: '2026-01-01' },
        { is_demo: false, source_name: null },
        { verification_status: VerificationStatus.SOURCE_UNAVAILABLE },
        { verification_status: VerificationStatus.NO_RECORD }
    ];

    for (const c of cases) {
        const record = buildProvenanceRecord(c);
        assert.strictEqual(
            ALLOWED_STATUSES.has(record.verification_status),
            true,
            `Status "${record.verification_status}" is not in allowed set`
        );
    }
});

// ============================================================================
// PART 2: Service-Level Provenance on Ownership, Court Cases, and Encumbrances
// ============================================================================

test('Every court case, ownership record, and encumbrance has all 10 provenance fields', () => {
    const result = searchLandParcel({
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142/1'
    });

    assert.strictEqual(result.status, 'demo_record');

    // 1. Verify Ownership record
    const owner = result.parcel.owner;
    for (const field of REQUIRED_PROVENANCE_FIELDS) {
        assert.ok(
            field in owner,
            `Missing required provenance field "${field}" on parcel.owner`
        );
    }
    assert.strictEqual(ALLOWED_STATUSES.has(owner.verification_status), true);
    assert.strictEqual(owner.is_demo, true);
    assert.strictEqual(owner.verification_status, 'DEMO');
    assert.strictEqual(owner.confidence, 0.0);

    // 2. Verify Court Cases
    assert.ok(result.courtCases.length > 0, 'Expected court cases on high-risk demo parcel');
    for (const courtCase of result.courtCases) {
        for (const field of REQUIRED_PROVENANCE_FIELDS) {
            assert.ok(
                field in courtCase,
                `Missing required provenance field "${field}" on court case ${courtCase.case_number}`
            );
        }
        assert.strictEqual(ALLOWED_STATUSES.has(courtCase.verification_status), true);
        assert.strictEqual(courtCase.is_demo, true);
        assert.strictEqual(courtCase.verification_status, 'DEMO');
        assert.strictEqual(courtCase.confidence, 0.0);
        assert.ok(courtCase.source_name, 'Court case must have source_name');
        assert.ok(courtCase.source_reference, 'Court case must have source_reference');
    }

    // 3. Verify Encumbrances
    assert.ok(result.encumbrances.length > 0, 'Expected encumbrances on demo parcel');
    for (const enc of result.encumbrances) {
        for (const field of REQUIRED_PROVENANCE_FIELDS) {
            assert.ok(
                field in enc,
                `Missing required provenance field "${field}" on encumbrance ${enc.document_number}`
            );
        }
        assert.strictEqual(ALLOWED_STATUSES.has(enc.verification_status), true);
        assert.strictEqual(enc.is_demo, true);
        assert.strictEqual(enc.verification_status, 'DEMO');
        assert.strictEqual(enc.confidence, 0.0);
        assert.ok(enc.source_name, 'Encumbrance must have source_name');
        assert.ok(enc.source_reference, 'Encumbrance must have source_reference');
    }
});

// ============================================================================
// PART 3: HTTP API Endpoint Provenance Audit
// ============================================================================

test('POST /api/land/search returns complete provenance structure across all records', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142/1'
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.body;

    // Check ownership provenance
    const owner = body.parcel.owner;
    REQUIRED_PROVENANCE_FIELDS.forEach(f => assert.ok(f in owner, `Missing ${f} in API owner`));
    assert.strictEqual(owner.verification_status, 'DEMO');
    assert.strictEqual(owner.confidence, 0.0);

    // Check court cases provenance
    assert.ok(body.courtCases.length > 0);
    body.courtCases.forEach((c, idx) => {
        REQUIRED_PROVENANCE_FIELDS.forEach(f => assert.ok(f in c, `Missing ${f} in API court case ${idx}`));
        assert.strictEqual(c.verification_status, 'DEMO');
        assert.strictEqual(c.confidence, 0.0);
        assert.ok(c.source_name.length > 0);
    });

    // Check encumbrance provenance
    assert.ok(body.encumbrances.length > 0);
    body.encumbrances.forEach((e, idx) => {
        REQUIRED_PROVENANCE_FIELDS.forEach(f => assert.ok(f in e, `Missing ${f} in API encumbrance ${idx}`));
        assert.strictEqual(e.verification_status, 'DEMO');
        assert.strictEqual(e.confidence, 0.0);
        assert.ok(e.source_name.length > 0);
    });
});

test('Provenance Audit Suite: Teardown test server', async () => {
    if (testServer) {
        await new Promise((resolve) => testServer.close(resolve));
    }
});
