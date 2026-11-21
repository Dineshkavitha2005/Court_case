const test = require('node:test');
const assert = require('node:assert');
const {
    analyzeQuery,
    NO_VERIFIED_RECORD,
    DEMO_NOTICE,
    BASELINE
} = require('../../backend/services/aiService');

function verifiedRecord(overrides = {}) {
    const provenance = {
        is_demo: false,
        verification_status: 'VERIFIED',
        source_name: 'eCourts Services (NJDG)',
        source_reference: 'CNR-TN-001',
        last_verified_at: '2026-10-01T10:00:00.000Z'
    };
    return {
        status: 'verified_record',
        record_classification: 'VERIFIED',
        verified: true,
        is_demo: false,
        parcel: {
            owner: { ...provenance, source_name: 'Tamil Nadu e-Services', source_reference: 'PATTA-77', name: 'Recorded Owner' },
            land: { surveyNo: '77/1', extent: '1 Acre', classification: 'Agricultural', passbook: 'PATTA-77' }
        },
        courtCases: [{ ...provenance, case_number: 'OS 10/2025', court_name: 'District Munsif Court', case_type: 'Original Suit', current_status: 'Pending', filing_date: '2025-02-03', has_stay_injunction: true }],
        encumbrances: [{ ...provenance, source_name: 'TNREGINET', source_reference: 'DOC-88', nature_of_deed: 'Simple Mortgage', document_number: '88/2024', status: 'Active', mortgage_amount_inr: '₹100000' }],
        risk: { score: 65, level: 'High Risk', factors: [{ name: 'Active Court Litigation' }] },
        ...overrides
    };
}

test('AI analyst cites only a complete verified record context', async () => {
    const result = await analyzeQuery('What is the case status and filing date?', verifiedRecord(), 'en', { apiKey: null });
    assert.strictEqual(result.source, 'deterministic_engine');
    assert.match(result.response, /Based only on the records retrieved by LandGuard\./);
    assert.match(result.response, /OS 10\/2025/);
    assert.match(result.response, /2025-02-03/);
    assert.match(result.response, /Sources:/);
    assert.match(result.response, /CNR-TN-001/);
});

test('AI analyst rejects absent or unverified record contexts before model use', async () => {
    let called = false;
    const result = await analyzeQuery('Summarize', null, 'en', { apiKey: 'a-very-long-api-key', geminiClient: async () => { called = true; } });
    assert.strictEqual(result.response, NO_VERIFIED_RECORD);
    assert.strictEqual(called, false);
});

test('AI analyst labels demo records and does not call Gemini', async () => {
    let called = false;
    const result = await analyzeQuery('Summarize', { status: 'demo_record', is_demo: true }, 'en', { apiKey: 'a-very-long-api-key', geminiClient: async () => { called = true; } });
    assert.match(result.response, new RegExp(DEMO_NOTICE));
    assert.match(result.response, new RegExp(BASELINE));
    assert.strictEqual(called, false);
});

test('AI analyst treats incomplete provenance and fields as unavailable rather than inventing them', async () => {
    const incomplete = verifiedRecord({ courtCases: [{ ...verifiedRecord().courtCases[0], filing_date: null }] });
    const response = await analyzeQuery('What is the filing date?', incomplete, 'en', { apiKey: null });
    assert.match(response.response, /Not present in the verified record/);

    const missingProvenance = verifiedRecord({ encumbrances: [{ nature_of_deed: 'Mortgage' }] });
    const rejected = await analyzeQuery('Mortgage?', missingProvenance, 'en', { apiKey: null });
    assert.strictEqual(rejected.response, NO_VERIFIED_RECORD);
});

test('Gemini API failure falls back to the deterministic cited response', async () => {
    const result = await analyzeQuery('Mortgage?', verifiedRecord(), 'en', {
        apiKey: 'a-very-long-api-key',
        geminiClient: async () => { throw new Error('service unavailable'); }
    });
    assert.strictEqual(result.source, 'deterministic_engine');
    assert.match(result.response, /Simple Mortgage/);
    assert.match(result.response, /Sources:/);
});

test('hallucinated Gemini prose is never surfaced as legal fact', async () => {
    const result = await analyzeQuery('Who will win and is the land legally clear?', verifiedRecord(), 'en', {
        apiKey: 'a-very-long-api-key',
        geminiClient: async () => 'The buyer will win; this land is legally clear. CASE'
    });
    assert.strictEqual(result.source, 'gemini_assisted_grounded');
    assert.doesNotMatch(result.response, /buyer will win|legally clear\.|court will/i);
    assert.match(result.response, /OS 10\/2025/);
    assert.match(result.response, /prediction of any court judgment/);
});
