const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const server = require('../../server');

const SEC_TEST_PORT = 8791;
let secServer = null;

function makeRawRequest(rawPath, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: SEC_TEST_PORT,
            path: rawPath,
            method: method
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

test('Security Test Suite Setup', async () => {
    await new Promise((resolve) => {
        secServer = server.listen(SEC_TEST_PORT, '127.0.0.1', resolve);
    });
});

test('Security: Root GET / serves index.html with 200 OK', async () => {
    const res = await makeRawRequest('/');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.includes('LandGuard'), true);
});

test('Security: Reject path traversal /../server.js with 403 Forbidden', async () => {
    const res = await makeRawRequest('/../server.js');
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.includes('403 Forbidden'), true);
});

test('Security: Reject encoded traversal /..%2Fserver.js with 403 Forbidden', async () => {
    const res = await makeRawRequest('/..%2Fserver.js');
    assert.strictEqual(res.statusCode, 403);
});

test('Security: Reject attempt to access sensitive database file /../database/landguard.db with 403', async () => {
    const res = await makeRawRequest('/../database/landguard.db');
    assert.strictEqual(res.statusCode, 403);
});

test('Security: Reject access to hidden files /.env with 403 Forbidden', async () => {
    const res = await makeRawRequest('/.env');
    assert.strictEqual(res.statusCode, 403);
});

test('Security: Reject access to .git directory /.git/config with 403 Forbidden', async () => {
    const res = await makeRawRequest('/.git/config');
    assert.strictEqual(res.statusCode, 403);
});

test('Security: Response includes mandatory HTTP security headers', async () => {
    const res = await makeRawRequest('/');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(res.headers['x-frame-options'], 'DENY');
    assert.strictEqual(typeof res.headers['content-security-policy'], 'string');
    assert.strictEqual(res.headers['content-security-policy'].includes("default-src 'self'"), true);
    assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
});

test('Security: Server handles malformed URL encoding gracefully without crashing', async () => {
    const res = await makeRawRequest('/%E0%A4%A');
    assert.strictEqual(res.statusCode, 400);
});

test('Security: Non-existent static file returns 404 Not Found', async () => {
    const res = await makeRawRequest('/non_existent_file.png');
    assert.strictEqual(res.statusCode, 404);
});

test('Security Test Suite Teardown', async () => {
    if (secServer) {
        await new Promise((resolve) => secServer.close(resolve));
    }
});
