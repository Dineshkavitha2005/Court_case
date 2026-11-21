/**
 * LandGuard AI Legal Analyst.
 * The model may select a supported subject, but it never supplies facts to the
 * user. Facts and citations are rendered from a validated backend record only.
 */
const https = require('https');

const BASELINE = 'Based only on the records retrieved by LandGuard.';
const NO_VERIFIED_RECORD = 'No verified legal record is available for analysis.';
const DEMO_NOTICE = 'This is demonstration data and must not be treated as an actual legal record.';
const LEGAL_NOTICE = 'This is preliminary information, not definitive legal advice or a prediction of any court judgment.';
const TOPICS = new Set(['CASE', 'ENCUMBRANCE', 'OWNERSHIP', 'RISK', 'GENERAL']);

function valueOrUnavailable(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : 'Not present in the verified record';
}

function citation(label, item) {
    return `- ${label}: ${valueOrUnavailable(item && item.source_name)} — ${valueOrUnavailable(item && item.source_reference)}`;
}

function sourcesFor(record) {
    const sources = [];
    if (record.parcel && record.parcel.owner) sources.push(citation('Land record', record.parcel.owner));
    (record.courtCases || []).forEach((item, index) => sources.push(citation(`Court proceeding ${index + 1}`, item)));
    (record.encumbrances || []).forEach((item, index) => sources.push(citation(`Encumbrance ${index + 1}`, item)));
    return sources.length ? `Sources:\n${sources.join('\n')}` : 'Sources:\n- No source reference is present in the verified record.';
}

function hasVerifiedProvenance(item) {
    return Boolean(item && item.is_demo !== true && item.verification_status === 'VERIFIED' &&
        typeof item.source_name === 'string' && item.source_name.trim() &&
        typeof item.source_reference === 'string' && item.source_reference.trim() &&
        typeof item.last_verified_at === 'string' && item.last_verified_at.trim());
}

/** Validates every request before any model call. */
function validateRecordContext(record) {
    if (!record || typeof record !== 'object') return { state: 'no_record' };
    if (record.is_demo === true || record.record_classification === 'DEMO' || record.status === 'demo_record') return { state: 'demo' };
    if (record.record_classification !== 'VERIFIED' || record.verified !== true || record.status !== 'verified_record' ||
        !record.parcel || !record.parcel.owner || !record.parcel.land || !Array.isArray(record.courtCases) || !Array.isArray(record.encumbrances)) {
        return { state: 'no_record' };
    }
    if (!hasVerifiedProvenance(record.parcel.owner) || record.courtCases.some(item => !hasVerifiedProvenance(item)) ||
        record.encumbrances.some(item => !hasVerifiedProvenance(item))) return { state: 'no_record' };
    return { state: 'verified' };
}

function topicFromQuery(query) {
    const q = String(query || '').toLowerCase();
    if (/(case|court|status|filing|stay|injunction|வழக்கு|நீதிமன்ற|தடை)/.test(q)) return 'CASE';
    if (/(mortgage|encumbrance|attachment|charge|loan|அடமான|வில்லங்கம்|பற்று)/.test(q)) return 'ENCUMBRANCE';
    if (/(owner|patta|extent|area|titleholder|உரிமையாளர்|பட்டா|பரப்பளவு)/.test(q)) return 'OWNERSHIP';
    if (/(risk|litigation|clear|safe|legal advice|risk factor|அபாயம்)/.test(q)) return 'RISK';
    return 'GENERAL';
}

function factLine(label, value) { return `- ${label}: ${valueOrUnavailable(value)}`; }

function renderCaseFacts(record) {
    if (record.courtCases.length === 0) return ['- No court proceeding is included in the retrieved record.', '- This is not a finding that the land is legally clear.'];
    const lines = ['- A recorded case status describes the procedural state in the retrieved entry; it does not predict an outcome.'];
    record.courtCases.forEach((item, index) => lines.push(
        `- Proceeding ${index + 1}: ${valueOrUnavailable(item.case_number)}`,
        factLine('Court', item.court_name), factLine('Case type', item.case_type), factLine('Recorded status', item.current_status),
        factLine('Filing date', item.filing_date), `- Interim stay / injunction recorded: ${item.has_stay_injunction === true ? 'Yes' : 'No'}`
    ));
    if (record.courtCases.some(item => item.has_stay_injunction === true)) lines.push('- An interim stay or injunction is a temporary court direction; this response reports only whether one is recorded here.');
    return lines;
}

function renderEncumbranceFacts(record) {
    if (record.encumbrances.length === 0) return ['- No mortgage, attachment, or other encumbrance is included in the retrieved record.', '- This is not a finding that no such interest exists.'];
    const lines = ['- A mortgage or attachment entry identifies a recorded interest or restraint; its presence alone does not decide title or the eventual court result.'];
    record.encumbrances.forEach((item, index) => lines.push(
        `- Encumbrance ${index + 1}: ${valueOrUnavailable(item.nature_of_deed)}`,
        factLine('Document reference', item.document_number), factLine('Recorded status', item.status), factLine('Mortgage amount', item.mortgage_amount_inr),
        `- Recorded court attachment / lis pendens: ${/attachment|lis pendens/i.test(String(item.nature_of_deed || '')) ? 'Yes' : 'No'}`
    ));
    return lines;
}

function renderOwnershipFacts(record) {
    const land = record.parcel.land;
    return [factLine('Recorded titleholder', record.parcel.owner.name), factLine('Survey number', land.surveyNo),
        factLine('Extent / area', land.extent), factLine('Land classification', land.classification), factLine('Patta / passbook reference', land.passbook)];
}

function renderRiskFacts(record) {
    const risk = record.risk || {};
    const lines = [factLine('Recorded risk score', typeof risk.score === 'number' ? `${risk.score}/100` : null), factLine('Recorded risk level', risk.level)];
    if (Array.isArray(risk.factors) && risk.factors.length) risk.factors.forEach(factor => lines.push(`- Recorded risk factor: ${valueOrUnavailable(factor.name || factor.description)}`));
    else lines.push('- No detailed risk factors are present in the verified record.');
    return lines;
}

function generateDeterministicLegalResponse(query, record, requestedTopic) {
    const topic = requestedTopic || topicFromQuery(query);
    let facts;
    switch (topic) {
        case 'CASE': facts = renderCaseFacts(record); break;
        case 'ENCUMBRANCE': facts = renderEncumbranceFacts(record); break;
        case 'OWNERSHIP': facts = renderOwnershipFacts(record); break;
        case 'RISK': facts = renderRiskFacts(record); break;
        default: facts = [...renderCaseFacts(record), ...renderEncumbranceFacts(record), ...renderRiskFacts(record)];
    }
    return [BASELINE, '', ...facts, '', sourcesFor(record), '', LEGAL_NOTICE].join('\n');
}

function callGeminiApi(apiKey, prompt) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0, maxOutputTokens: 20 } });
        const req = https.request({ hostname: 'generativelanguage.googleapis.com', port: 443, path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }, timeout: 10000 }, res => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const text = parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts[0] && parsed.candidates[0].content.parts[0].text;
                    if (text) resolve(text); else reject(new Error(parsed.error?.message || 'Invalid Gemini API response structure'));
                } catch (error) { reject(new Error(`Failed to parse Gemini response: ${error.message}`)); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Gemini API request timed out')); });
        req.write(payload); req.end();
    });
}

function parseTopicSelection(text) {
    const match = String(text || '').toUpperCase().match(/\b(CASE|ENCUMBRANCE|OWNERSHIP|RISK|GENERAL)\b/);
    return match && TOPICS.has(match[1]) ? match[1] : null;
}

async function analyzeQuery(query, record, language = 'en', dependencies = {}) {
    const validation = validateRecordContext(record);
    if (validation.state === 'no_record') return { source: 'context_validation', response: NO_VERIFIED_RECORD };
    if (validation.state === 'demo') return { source: 'context_validation', response: `${DEMO_NOTICE}\n\n${BASELINE}\n\nSources:\n- Demonstration dataset only; no actual legal record is relied on.\n\n${LEGAL_NOTICE}` };

    const apiKey = dependencies.apiKey === undefined ? process.env.GEMINI_API_KEY : dependencies.apiKey;
    const geminiClient = dependencies.geminiClient || callGeminiApi;
    let topic = topicFromQuery(query);
    let source = 'deterministic_engine';
    if (apiKey && String(apiKey).trim().length > 10) {
        try {
            // Gemini may choose a subject only. It cannot add response facts.
            const selection = await geminiClient(String(apiKey).trim(), `Choose one topic only: CASE, ENCUMBRANCE, OWNERSHIP, RISK, or GENERAL. Use only this verified record context: ${JSON.stringify(record)}. User question: ${query}`);
            const selectedTopic = parseTopicSelection(selection);
            if (selectedTopic) { topic = selectedTopic; source = 'gemini_assisted_grounded'; }
        } catch (error) { console.warn('Gemini API unavailable; using deterministic verified-record response:', error.message); }
    }
    return { source, response: generateDeterministicLegalResponse(query, record, topic), language };
}

module.exports = { BASELINE, NO_VERIFIED_RECORD, DEMO_NOTICE, analyzeQuery, validateRecordContext, generateDeterministicLegalResponse, topicFromQuery };
