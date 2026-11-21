/*
 * Pure, data-backed helpers for LandGuard voice search.  This file deliberately
 * contains no location catalogue: callers must provide records returned by the
 * LandGuard API before a name can be selected.
 */
(function voiceParserModule(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.LandGuardVoiceParser = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createVoiceParser() {
    const TAMIL_DIGITS = { '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9' };
    const DIGIT_WORDS = {
        zero: '0', oh: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
        'பூஜ்ஜியம்': '0', 'சுழியம்': '0', 'ஒன்று': '1', 'ஒரு': '1', 'இரண்டு': '2', 'மூன்று': '3', 'நான்கு': '4', 'ஐந்து': '5',
        'ஆறு': '6', 'ஏழு': '7', 'எட்டு': '8', 'ஒன்பது': '9'
    };
    const CARDINALS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
    const FIELD_LABELS = {
        district: /(?:\bdistrict\b|மாவட்டம்|ஜில்லா)/iu,
        taluk: /(?:\btaluk\b|\btaluka\b|தாலுகா|வட்டம்)/iu,
        village: /(?:\bvillage\b|\bgramam\b|கிராமம்|ஊர்)/iu,
        survey: /(?:\bsurvey(?:\s*(?:number|no\.?))?\b|சர்வே(?:\s*எண்)?|சர்வேஎண்)/iu
    };

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFKC')
            .replace(/[௦-௯]/g, char => TAMIL_DIGITS[char])
            .replace(/[“”‘’`]/g, "'")
            .replace(/[,_;:()\[\]{}!?]/g, ' ')
            .replace(/[\\|]/g, ' / ')
            .replace(/[–—-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function comparable(value) {
        return normalizeText(value).toLocaleLowerCase('en-IN').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
    }

    function itemAliases(item) {
        return [item && item.name, item && item.name_ta].filter(Boolean).map(comparable);
    }

    function containsPhrase(haystack, phrase) {
        return ` ${haystack} `.includes(` ${phrase} `);
    }

    function findLocationMatches(transcript, records, hint) {
        const source = comparable(transcript);
        const exact = (records || []).filter(record => itemAliases(record).some(alias => alias && containsPhrase(source, alias)));
        if (exact.length || !hint) return exact;
        // A labelled partial phrase is intentionally returned as multiple choices,
        // never promoted to a single "best" location by fuzzy matching.
        const partial = comparable(hint);
        if (partial.length < 3) return [];
        return (records || []).filter(record => itemAliases(record).some(alias => alias && (alias.startsWith(partial) || alias.includes(` ${partial}`))));
    }

    function extractLabelledValue(transcript, field) {
        const normalized = normalizeText(transcript);
        const label = FIELD_LABELS[field];
        if (!label) return '';
        const match = label.exec(normalized);
        if (!match) return '';
        const tail = normalized.slice(match.index + match[0].length).replace(/^\s*(?:number|no\.?|எண்)?\s*/iu, '');
        const nextLabel = Object.entries(FIELD_LABELS)
            .filter(([name]) => name !== field)
            .map(([, expression]) => {
                const found = expression.exec(tail);
                return found ? found.index : -1;
            })
            .filter(index => index >= 0)
            .sort((a, b) => a - b)[0];
        return (nextLabel === undefined ? tail : tail.slice(0, nextLabel)).trim();
    }

    function cardinalToNumber(tokens) {
        let total = 0;
        let current = 0;
        for (const token of tokens) {
            if (token === 'and') continue;
            if (token === 'hundred') {
                current = (current || 1) * 100;
            } else if (token === 'thousand') {
                total += (current || 1) * 1000;
                current = 0;
            } else if (Object.prototype.hasOwnProperty.call(CARDINALS, token)) {
                current += CARDINALS[token];
            } else {
                return null;
            }
        }
        return String(total + current);
    }

    function spokenDigits(part) {
        const cleaned = normalizeText(part).toLowerCase().replace(/\b(?:number|no)\b/g, ' ').trim();
        if (/^\d+$/.test(cleaned)) return cleaned;
        const tokens = cleaned.split(/\s+/).filter(Boolean);
        if (!tokens.length) return '';
        if (tokens.every(token => Object.prototype.hasOwnProperty.call(DIGIT_WORDS, token))) {
            return tokens.map(token => DIGIT_WORDS[token]).join('');
        }
        if (tokens.some(token => token === 'hundred' || token === 'thousand' || Object.prototype.hasOwnProperty.call(CARDINALS, token) && CARDINALS[token] >= 20)) {
            return cardinalToNumber(tokens) || '';
        }
        return '';
    }

    function normalizeSurveyNumber(value) {
        let raw = normalizeText(value)
            .toLowerCase()
            .replace(FIELD_LABELS.survey, ' ')
            .replace(/\b(?:number|no\.?|எண்)\b/giu, ' ')
            .replace(/\b(?:slash|stroke|over)\b/giu, ' / ')
            .replace(/(?:ஸ்லாஷ்|ஸ்லேஷ்|வகுத்தல்)/giu, ' / ')
            .replace(/[.]/g, ' ')
            .replace(/\s*\/\s*/g, '/');
        const pieces = raw.split('/').map(piece => piece.trim()).filter(Boolean);
        if (!pieces.length || pieces.length > 2) return '';
        const normalizedPieces = pieces.map((piece, index) => {
            const direct = piece.match(/^\d+([a-z])?$/i);
            if (direct) return `${direct[0].replace(/[a-z]$/i, '')}${(direct[1] || '').toUpperCase()}`;
            const words = piece.split(/\s+/).filter(Boolean);
            const last = words[words.length - 1];
            const suffix = index === 1 && /^[a-z]$/i.test(last) ? last.toUpperCase() : '';
            if (suffix) words.pop();
            const digits = spokenDigits(words.join(' '));
            return digits ? `${digits}${suffix}` : '';
        });
        const candidate = normalizedPieces.join('/');
        return /^\d+(?:\/\d+[A-Z0-9]*)?$/i.test(candidate) ? candidate : '';
    }

    function extractSurveyNumber(transcript) {
        const labelled = extractLabelledValue(transcript, 'survey');
        if (!labelled) return '';
        // A survey number never needs the entire following sentence.  Keeping a
        // small, label-bounded window avoids turning unrelated spoken words into a number.
        const window = labelled.split(/\s+/).slice(0, 10).join(' ');
        return normalizeSurveyNumber(window);
    }

    function parseVoiceTranscript(transcript, locations) {
        const normalizedTranscript = normalizeText(transcript);
        return {
            transcript: String(transcript || '').trim(),
            normalizedTranscript,
            surveyNumber: extractSurveyNumber(normalizedTranscript),
            hints: {
                district: extractLabelledValue(normalizedTranscript, 'district'),
                taluk: extractLabelledValue(normalizedTranscript, 'taluk'),
                village: extractLabelledValue(normalizedTranscript, 'village')
            },
            matches: {
                district: findLocationMatches(normalizedTranscript, locations && locations.districts, extractLabelledValue(normalizedTranscript, 'district')),
                taluk: findLocationMatches(normalizedTranscript, locations && locations.taluks, extractLabelledValue(normalizedTranscript, 'taluk')),
                village: findLocationMatches(normalizedTranscript, locations && locations.villages, extractLabelledValue(normalizedTranscript, 'village'))
            }
        };
    }

    return { normalizeText, normalizeSurveyNumber, extractSurveyNumber, extractLabelledValue, findLocationMatches, parseVoiceTranscript };
});
