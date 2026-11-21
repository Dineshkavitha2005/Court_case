/** Short-lived, server-owned contexts for AI analysis. */
const crypto = require('crypto');

const TTL_MS = 10 * 60 * 1000;
const MAX_CONTEXTS = 200;
const contexts = new Map();

function prune(now = Date.now()) {
    for (const [id, entry] of contexts) {
        if (entry.expiresAt <= now) contexts.delete(id);
    }
    while (contexts.size > MAX_CONTEXTS) contexts.delete(contexts.keys().next().value);
}

function storeAnalysisContext(record) {
    prune();
    const id = crypto.randomUUID();
    contexts.set(id, { record, expiresAt: Date.now() + TTL_MS });
    return id;
}

function getAnalysisContext(id) {
    if (typeof id !== 'string' || !id) return null;
    prune();
    const entry = contexts.get(id);
    return entry ? entry.record : null;
}

module.exports = { storeAnalysisContext, getAnalysisContext };
