const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const server = require('../../server');

const TEST_PORT = 8790;
let testServer = null;

function makeRequest(pathname, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: TEST_PORT,
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

test('API Test Suite Setup', async () => {
    await new Promise((resolve) => {
        testServer = server.listen(TEST_PORT, '127.0.0.1', resolve);
    });
});

test('GET /api/districts returns all 38 Tamil Nadu districts', async () => {
    const res = await makeRequest('/api/districts');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'success');
    assert.strictEqual(res.body.state, 'Tamil Nadu');
    assert.strictEqual(res.body.total, 38);
    assert.strictEqual(res.body.districts.length, 38);
    assert.strictEqual(res.body.districts.some(d => d.name === 'Coimbatore'), true);
    assert.strictEqual(res.body.districts.some(d => d.name === 'Chennai'), true);
});

test('GET /api/taluks?district=Coimbatore returns taluks', async () => {
    const res = await makeRequest('/api/taluks?district=Coimbatore');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'success');
    assert.strictEqual(res.body.district, 'Coimbatore');
    assert.strictEqual(res.body.taluks.length > 0, true);
    assert.strictEqual(res.body.taluks.some(t => t.name.includes('Coimbatore South')), true);
});

test('GET /api/taluks without district returns 400 Bad Request', async () => {
    const res = await makeRequest('/api/taluks');
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.status, 'error');
});

test('GET /api/villages searches villages within district and taluk', async () => {
    const res = await makeRequest('/api/villages?district=Coimbatore&taluk=Coimbatore%20South&q=Alanthurai');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'success');
    assert.strictEqual(res.body.results.length > 0, true);
    assert.strictEqual(res.body.results[0].name.includes('Alanthurai'), true);
});

test('POST /api/land/search with documented benchmark returns verified demo record', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142/1'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'demo_record');
    assert.strictEqual(res.body.is_demo, true);
    assert.strictEqual(res.body.parcel.land.surveyNo, '142/1');
    assert.strictEqual(res.body.courtCases.length, 1);
    assert.strictEqual(res.body.courtCases[0].case_number, 'OS No. 342/2022');
    assert.strictEqual(res.body.courtCases[0].has_stay_injunction, true);
    assert.strictEqual(res.body.risk.level, 'High Risk');
    assert.strictEqual(res.body.risk.score >= 60, true);
});

test('POST /api/land/search with non-existent survey returns no_record without fabricating data', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '9999/999'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'no_record');
    assert.strictEqual(res.body.verified, false);
    assert.strictEqual(res.body.parcel, undefined);
    assert.strictEqual(res.body.courtCases, undefined);
    assert.strictEqual(Array.isArray(res.body.next_steps), true);
});

test('POST /api/land/search validation: missing district returns 400', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: '',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142/1'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.field, 'district');
});

test('POST /api/land/search validation: invalid survey number format returns 400', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: 'INV@LID*123'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.field, 'surveyNumber');
    assert.strictEqual(res.body.error.includes('Invalid survey number format'), true);
});

test('POST /api/land/search validation: SQL injection / illegal characters returns 400', async () => {
    const res = await makeRequest('/api/land/search', 'POST', {
        district: 'Coimbatore',
        taluk: 'Coimbatore South',
        village: 'Alanthurai (TP)',
        surveyNumber: '142; DROP TABLE districts--'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.field, 'surveyNumber');
});

test('POST /api/ai/chat returns context-grounded legal explanation', async () => {
    const sampleRecord = {
        status: 'demo_record',
        location: { village: 'Alanthurai', district: 'Coimbatore' },
        parcel: {
            owner: { name: 'K. Balasubramaniam', father_name: 'Kuppusamy Gounder' },
            land: { surveyNo: '142/1', extent: '2.45 Acres', classification: 'Agricultural', marketValue: '₹1.85 Cr' }
        },
        courtCases: [
            { case_number: 'OS 342/2022', court_name: 'District Court', current_status: 'Pending Trial', has_stay_injunction: true }
        ],
        encumbrances: [],
        risk: { score: 70, level: 'High Risk' }
    };

    const res = await makeRequest('/api/ai/chat', 'POST', {
        query: 'Are there any court stays or injunctions?',
        record: sampleRecord,
        language: 'en'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'success');
    assert.strictEqual(typeof res.body.response, 'string');
    assert.strictEqual(res.body.response.includes('OS 342/2022'), true);
    assert.strictEqual(res.body.response.includes('stay') || res.body.response.includes('injunction'), true);
});

test('API Test Suite Teardown', async () => {
    if (testServer) {
        await new Promise((resolve) => testServer.close(resolve));
    }
});
