/**
 * LandGuard — Main Application Server
 * Hardened HTTP Server with security headers, path traversal defense,
 * rate limiting, and centralized error handling.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Services & Middleware
const { applySecurityHeaders, resolveSafeStaticPath } = require('./src/middleware/security');
const { checkRateLimit } = require('./src/middleware/rateLimiter');
const { getDistricts, getTaluks, getVillages, getSurveyNumbers, searchLandParcel, getDataSourceStatus, RecordClassification } = require('./src/services/legalDataService');
const { analyzeQuery } = require('./src/services/aiService');

// Configuration
const PORT = process.env.PORT || 8765;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.resolve(__dirname, 'public');

// MIME types for static assets
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

// Helper to parse JSON body safely
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1e6) { // 1 MB limit
                req.destroy();
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body || body.trim().length === 0) {
                resolve({});
                return;
            }
            try {
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch (err) {
                reject(new Error('Malformed JSON payload: ' + err.message));
            }
        });
        req.on('error', reject);
    });
}

// Centralized JSON response helper
function sendJson(res, statusCode, data) {
    applySecurityHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

// Server instance
const server = http.createServer(async (req, res) => {
    try {
        applySecurityHeaders(res);

        // Parse URL using WHATWG URL API
        let parsedUrl;
        let pathname;
        try {
            parsedUrl = new URL(req.url, 'http://127.0.0.1');
            pathname = decodeURIComponent(parsedUrl.pathname);
        } catch (_) {
            sendJson(res, 400, { status: "error", error: "Malformed URL encoding." });
            return;
        }

        // Apply rate limiter to API requests
        if (pathname.startsWith('/api/')) {
            if (!checkRateLimit(req, res)) {
                return;
            }
        }

        // ============================================
        // API Routes
        // ============================================

        // 1. GET /api/districts
        if (pathname === '/api/districts' && req.method === 'GET') {
            const districts = getDistricts();
            sendJson(res, 200, {
                status: "success",
                state: "Tamil Nadu",
                total: districts.length,
                districts: districts
            });
            return;
        }

        // 2. GET /api/taluks?district=...
        if (pathname === '/api/taluks' && req.method === 'GET') {
            const district = parsedUrl.searchParams.get('district') || '';
            if (!district) {
                sendJson(res, 400, { status: "error", error: "District parameter is required." });
                return;
            }
            const taluks = getTaluks(district);
            sendJson(res, 200, {
                status: "success",
                district: district,
                total: taluks.length,
                taluks: taluks
            });
            return;
        }

        // 3. GET /api/villages?district=...&taluk=...&q=...
        if (pathname === '/api/villages' && req.method === 'GET') {
            const district = parsedUrl.searchParams.get('district') || '';
            const taluk = parsedUrl.searchParams.get('taluk') || '';
            const query = parsedUrl.searchParams.get('q') || '';
            const limit = Math.min(Number(parsedUrl.searchParams.get('limit')) || 100, 200);

            const villages = getVillages(district, taluk, query, limit);
            sendJson(res, 200, {
                status: "success",
                district: district,
                taluk: taluk,
                total: villages.length,
                results: villages
            });
            return;
        }

        // 4. GET /api/surveynumbers?village=...&q=...
        if (pathname === '/api/surveynumbers' && req.method === 'GET') {
            const village = parsedUrl.searchParams.get('village') || '';
            const query = parsedUrl.searchParams.get('q') || '';
            if (!village) {
                sendJson(res, 400, { status: "error", error: "Village parameter is required." });
                return;
            }
            const surveys = getSurveyNumbers(village, query);
            sendJson(res, 200, {
                status: "success",
                village: village,
                total: surveys.length,
                results: surveys
            });
            return;
        }

        // 5. POST /api/land/search
        if (pathname === '/api/land/search') {
            if (req.method !== 'POST') {
                sendJson(res, 405, { status: "error", error: "Method Not Allowed. Use POST." });
                return;
            }

            let payload;
            try {
                payload = await parseJsonBody(req);
            } catch (err) {
                sendJson(res, 400, { status: "error", error: err.message });
                return;
            }

            const { district, taluk, village, surveyNumber } = payload;

            // Strict Validations
            if (!district || typeof district !== 'string' || district.trim().length === 0) {
                sendJson(res, 400, { status: "error", field: "district", error: "District is required." });
                return;
            }

            if (!taluk || typeof taluk !== 'string' || taluk.trim().length === 0) {
                sendJson(res, 400, { status: "error", field: "taluk", error: "Taluk is required." });
                return;
            }

            if (!village || typeof village !== 'string' || village.trim().length === 0) {
                sendJson(res, 400, { status: "error", field: "village", error: "Village name is required." });
                return;
            }

            if (!surveyNumber || typeof surveyNumber !== 'string' || surveyNumber.trim().length === 0) {
                sendJson(res, 400, { status: "error", field: "surveyNumber", error: "Survey Number is required." });
                return;
            }

            // Survey number format validation (e.g. 12, 12/1, 142/2A, 45/1B1)
            const cleanSurvey = surveyNumber.trim().toUpperCase();
            const surveyRegex = /^[0-9]+(\/[0-9]+[A-Z0-9]*)?$/i;
            if (!surveyRegex.test(cleanSurvey)) {
                sendJson(res, 400, {
                    status: "error",
                    field: "surveyNumber",
                    error: "Invalid survey number format. Examples: 142, 142/1, 88/2A, 45/1."
                });
                return;
            }

            // Disallow suspicious injection patterns
            if (/[<>;'"\\]/.test(cleanSurvey)) {
                sendJson(res, 400, { status: "error", field: "surveyNumber", error: "Survey number contains illegal characters." });
                return;
            }

            const result = searchLandParcel({
                district: district.trim(),
                taluk: taluk.trim(),
                village: village.trim(),
                surveyNumber: cleanSurvey,
                mode: payload.mode || null,
                checkLive: Boolean(payload.checkLive)
            });

            sendJson(res, 200, result);
            return;
        }

        // 6. GET /api/sources/status (and alias /api/sources)
        if ((pathname === '/api/sources/status' || pathname === '/api/sources') && req.method === 'GET') {
            const status = getDataSourceStatus();
            sendJson(res, 200, {
                status: "success",
                data: status
            });
            return;
        }

        // 7. POST /api/ai/chat
        if (pathname === '/api/ai/chat') {
            if (req.method !== 'POST') {
                sendJson(res, 405, { status: "error", error: "Method Not Allowed. Use POST." });
                return;
            }

            let payload;
            try {
                payload = await parseJsonBody(req);
            } catch (err) {
                sendJson(res, 400, { status: "error", error: err.message });
                return;
            }

            const { query, record, language } = payload;
            if (!query || typeof query !== 'string' || query.trim().length === 0) {
                sendJson(res, 400, { status: "error", error: "Query string is required." });
                return;
            }

            const analysis = await analyzeQuery(query.trim(), record, language || 'en');
            sendJson(res, 200, {
                status: "success",
                ...analysis
            });
            return;
        }

        // 8. GET /api/stats
        if (pathname === '/api/stats' && req.method === 'GET') {
            const districts = getDistricts();
            const sourceStatus = getDataSourceStatus();
            sendJson(res, 200, {
                status: "success",
                state: "Tamil Nadu",
                total_districts: districts.length,
                total_villages: 14551,
                source_verification: {
                    system_status: sourceStatus.system_status,
                    live_gateways_active: sourceStatus.live_gateways_active,
                    compliance: sourceStatus.compliance_policy
                },
                data_sources: [
                    "eCourts Services (National Judicial Data Grid)",
                    "Tamil Nadu e-Services (eservices.tn.gov.in)",
                    "TNREGINET (tnreginet.gov.in)",
                    "Local Government Directory (LGD)"
                ]
            });
            return;
        }

        // 9. GET /api/health
        if (pathname === '/api/health' && req.method === 'GET') {
            sendJson(res, 200, { status: "ok", uptime: process.uptime() });
            return;
        }

        // Reject other API routes with 404
        if (pathname.startsWith('/api/')) {
            sendJson(res, 404, { status: "error", error: "API endpoint not found." });
            return;
        }

        // ============================================
        // Static File Serving (public/ ONLY)
        // ============================================
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            sendJson(res, 405, { status: "error", error: "Method Not Allowed" });
            return;
        }

        // Explicit check for traversal tokens in raw request URL
        if (req.url.includes('..') || req.url.toLowerCase().includes('%2e')) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden: Traversal Prohibited');
            return;
        }

        const safeFilePath = resolveSafeStaticPath(pathname, PUBLIC_DIR);

        if (!safeFilePath) {
            // Traversal attempt or forbidden file
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden: Access Denied');
            return;
        }

        fs.stat(safeFilePath, (statErr, stats) => {
            if (statErr || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found');
                return;
            }

            const ext = path.extname(safeFilePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': stats.size,
                'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
            });

            if (req.method === 'HEAD') {
                res.end();
                return;
            }

            const stream = fs.createReadStream(safeFilePath);
            stream.pipe(res);
            stream.on('error', (streamErr) => {
                console.error('File stream error:', streamErr.message);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('500 Internal Server Error');
                }
            });
        });

    } catch (unexpectedErr) {
        console.error('Unhandled server error:', unexpectedErr);
        if (!res.headersSent) {
            sendJson(res, 500, {
                status: "error",
                error: "Internal Server Error"
            });
        }
    }
});

// Process-level safety guards to prevent unexpected crash
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('CRITICAL: Unhandled Rejection:', reason);
});

// Start listening
if (require.main === module) {
    server.listen(PORT, HOST, () => {
        console.log(`====================================================`);
        console.log(` LandGuard Server Running at http://${HOST}:${PORT}`);
        console.log(` Web Root: ${PUBLIC_DIR}`);
        console.log(` Security: Strict Path Traversal Defense & CSP Enabled`);
        console.log(`====================================================`);
    });
}

module.exports = server;
