/**
 * LandGuard — In-Memory Rate Limiter Middleware
 * Protects endpoints from brute-force and excessive automated traffic.
 */

const requestCounts = new Map(); // ip -> { count, resetTime }

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || 60;

// Periodic cleanup of expired records every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestCounts.entries()) {
        if (now > data.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 300000).unref();

function checkRateLimit(req, res, max = MAX_REQUESTS, windowMs = WINDOW_MS) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = requestCounts.get(clientIp);
    if (!record || now > record.resetTime) {
        record = {
            count: 1,
            resetTime: now + windowMs
        };
        requestCounts.set(clientIp, record);
    } else {
        record.count++;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
        res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            status: "error",
            code: 429,
            error: "Too many requests. Please slow down and try again shortly."
        }));
        return false;
    }

    return true;
}

module.exports = {
    checkRateLimit
};
