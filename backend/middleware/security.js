/**
 * LandGuard — Security Middleware
 * Provides path traversal defense, security headers injection, and sanitization.
 */

const path = require('path');

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'microphone=(self)',
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'"
    ].join('; ')
};

function applySecurityHeaders(res) {
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
        res.setHeader(header, value);
    }
}

/**
 * Validates whether a requested static URL path is safe to serve from publicDir.
 * Rejects path traversal, null bytes, and requests outside publicDir.
 */
function resolveSafeStaticPath(urlPath, publicDir) {
    if (!urlPath || typeof urlPath !== 'string') {
        return null;
    }

    // 1. Reject null bytes
    if (urlPath.includes('\0') || urlPath.includes('%00')) {
        return null;
    }

    // 2. Decode URL safely
    let decodedPath;
    try {
        decodedPath = decodeURIComponent(urlPath);
    } catch (_) {
        return null;
    }

    // 3. Reject directory traversal tokens
    if (decodedPath.includes('..') || decodedPath.includes('\\')) {
        return null;
    }

    // 4. Default root to index.html
    const cleanPath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');

    // 5. Reject hidden files (.env, .git, etc.)
    const segments = cleanPath.split('/');
    if (segments.some(seg => seg.startsWith('.'))) {
        return null;
    }

    // 6. Resolve absolute path and verify boundary
    const resolvedPath = path.resolve(publicDir, cleanPath);
    const normalizedPublic = path.resolve(publicDir);

    if (!resolvedPath.startsWith(normalizedPublic + path.sep) && resolvedPath !== normalizedPublic && resolvedPath !== path.join(normalizedPublic, 'index.html')) {
        return null;
    }

    return resolvedPath;
}

module.exports = {
    applySecurityHeaders,
    resolveSafeStaticPath
};
