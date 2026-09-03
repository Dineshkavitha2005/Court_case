/**
 * LandGuard — Backend AI Legal Analyst Service
 * Implements context-bound legal analysis based strictly on verified records.
 * Uses Google Gemini API if GEMINI_API_KEY is configured in backend environment;
 * otherwise runs deterministic context-grounded legal explanation engine.
 */

const https = require('https');

// System prompt strictly constraining context
const SYSTEM_PROMPT = `You are LandGuard AI Legal Analyst, an expert land due diligence assistant for Tamil Nadu, India.
CRITICAL OPERATIONAL RULES:
1. Base your answers SOLELY on the provided verified land record context.
2. If the user asks about facts, historical transactions, court orders, or ownership details NOT explicitly present in the context, you MUST explicitly state: "This information is not present in the verified record."
3. NEVER invent, hallucinate, or assume missing facts, case numbers, dates, or parties.
4. Explain legal terms simply (e.g., Injunction, Lis Pendens, Encumbrance, Patta/Chitta, Poramboke, Nanjai/Punjai).
5. Always remind the user that this summary is for preliminary due diligence and does not constitute formal legal counsel.
6. Reply in Tamil if the user asks in Tamil, or in English if the user asks in English.`;

async function callGeminiApi(apiKey, prompt) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature: 0.1, // Minimal temperature for zero-hallucination factual grounding
                maxOutputTokens: 600
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
                        resolve(parsed.candidates[0].content.parts[0].text);
                    } else if (parsed.error) {
                        reject(new Error(parsed.error.message || 'Gemini API returned error'));
                    } else {
                        reject(new Error('Invalid Gemini API response structure'));
                    }
                } catch (e) {
                    reject(new Error('Failed to parse Gemini response: ' + e.message));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Gemini API request timed out'));
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Deterministic fallback legal reasoning engine when no API key is configured.
 * Strictly references facts present in the verified record.
 */
function generateDeterministicLegalResponse(query, record, isTamil = false) {
    const q = (query || '').toLowerCase().trim();

    if (!record || record.status === 'no_record') {
        return isTamil
            ? "இந்த சர்வே எண்ணுக்கு சரிபார்க்கப்பட்ட பதிவுகள் எதுவும் கிடைக்கவில்லை. இல்லாத தகவல்களை உருவாக்க முடியாது. தயவுசெய்து வருவாய் துறை அல்லது சார்-பதிவாளர் அலுவலகத்தை அணுகவும்."
            : "No verified record is currently loaded for this parcel. In accordance with LandGuard data integrity standards, missing facts are never generated. Please verify through official revenue portals (eservices.tn.gov.in).";
    }

    const { parcel, courtCases = [], encumbrances = [], risk = {} } = record;
    const casesCount = courtCases.length;
    const activeCases = courtCases.filter(c => !((c.current_status || '').toLowerCase().includes('disposed')));
    const hasStay = courtCases.some(c => c.has_stay_injunction);

    // 1. Question about court cases / disputes / stays / injunctions
    if (q.includes('case') || q.includes('court') || q.includes('dispute') || q.includes('stay') || q.includes('injunction') ||
        q.includes('வழக்கு') || q.includes('நீதிமன்ற') || q.includes('தடை')) {
        if (casesCount === 0) {
            return isTamil
                ? `சரிபார்க்கப்பட்ட பதிவுகளின்படி, சர்வே எண் ${parcel.land.surveyNo}-ல் செயலில் உள்ள அல்லது பதிவு செய்யப்பட்ட நீதிமன்ற வழக்குகள் எதுவும் இல்லை. (குறிப்பு: நிலுவையில் உள்ள பதிவு செய்யப்படாத வழக்குகள் இருக்கக்கூடும், எனவே வழக்கறிஞர் ஆய்வு அவசியம்).`
                : `According to verified public registry records, there are 0 active or historical court cases recorded against Survey No. ${parcel.land.surveyNo}. Note that unindexed or newly filed suits may require physical advocate inspection at the local Munsif/Sub-Court.`;
        }

        const caseDetails = activeCases.map(c => 
            `- ${c.case_number} (${c.court_name}): ${c.case_type} — Status: ${c.current_status}. Summary: ${c.case_summary || 'N/A'}`
        ).join('\n');

        return isTamil
            ? `இந்த நிலத்தில் ${activeCases.length} வழக்கு(கள்) நிலுவையில் உள்ளன:\n${caseDetails}\n${hasStay ? '⚠️ முக்கிய குறிப்பு: நிலத்தை மாற்றுவதற்கு நீதிமன்ற இடைக்கால தடை உத்தரவு உள்ளது.' : ''}`
            : `Verified legal records identify ${activeCases.length} pending court proceeding(s) on this parcel:\n${caseDetails}\n\n${hasStay ? 'CRITICAL LEGAL WARNING: An active interim injunction/stay order is recorded, restraining alienation or transfer of title.' : 'No stay order is recorded in the current docket.'}`;
    }

    // 2. Question about mortgage / loans / encumbrance / bank
    if (q.includes('loan') || q.includes('mortgage') || q.includes('bank') || q.includes('encumbrance') || q.includes('ec') ||
        q.includes('கடன்') || q.includes('அடமானம்') || q.includes('வில்லங்கம்') || q.includes('வங்கி')) {
        if (!encumbrances || encumbrances.length === 0) {
            return isTamil
                ? `வில்லங்க விவரங்கள்: இந்த சர்வே எண்ணுக்கு நிலுவையில் உள்ள அடமானம் அல்லது நீதிமன்ற பற்று எதுவும் பதிவாகவில்லை. (30 ஆண்டு வில்லங்கச் சான்று பெற்று உறுதிப்படுத்தவும்).`
                : `Encumbrance Analysis: No active adverse mortgages or court attachments are recorded in the current dataset for Survey No. ${parcel.land.surveyNo}. A formal 30-year Encumbrance Certificate should be verified at TNREGINET.`;
        }

        const encList = encumbrances.map(e => 
            `- ${e.nature_of_deed} (Doc No: ${e.document_number || 'N/A'}): Executant: ${e.executant || 'N/A'}, Claimant: ${e.claimant || 'N/A'}, Status: ${e.status || 'Active'}`
        ).join('\n');

        return isTamil
            ? `பதிவு செய்யப்பட்ட வில்லங்க விவரங்கள்:\n${encList}\nஅடமானம் அல்லது பற்று இருப்பின், விற்பனைக்கு முன் வங்கியிடம் தடையின்மை சான்று (NOC) பெற வேண்டும்.`
            : `Registered Encumbrance Details:\n${encList}\n\nLegal Recommendation: If an active mortgage or charge is listed, ensure a formal Discharge Deed and Bank No-Objection Certificate (NOC) are executed prior to transaction.`;
    }

    // 3. Question about ownership / patta / extent
    if (q.includes('owner') || q.includes('patta') || q.includes('extent') || q.includes('area') || q.includes('value') ||
        q.includes('உரிமையாளர்') || q.includes('பட்டா') || q.includes('பரப்பளவு') || q.includes('மதிப்பு')) {
        return isTamil
            ? `நில விவரங்கள்:\n- பதிவு செய்யப்பட்ட உரிமையாளர்: ${parcel.owner.name}\n- தந்தை பெயர்: ${parcel.owner.father_name}\n- பரப்பளவு: ${parcel.land.extent}\n- வகைப்பாடு: ${parcel.land.classification}\n- பாஸ்புக்/பட்டா எண்: ${parcel.land.passbook}\n- தோராய சந்தை மதிப்பு: ${parcel.land.marketValue}`
            : `Verified Land & Ownership Details:\n- Recorded Owner: ${parcel.owner.name}\n- Father's Name: ${parcel.owner.father_name}\n- Extent / Area: ${parcel.land.extent}\n- Classification: ${parcel.land.classification}\n- Patta / Passbook Reference: ${parcel.land.passbook}\n- Estimated Valuation: ${parcel.land.marketValue}`;
    }

    // 4. Default: Comprehensive Legal Risk Summary
    return isTamil
        ? `சர்வே எண் ${parcel.land.surveyNo}, ${record.location.village} (${record.location.district}):\n- கணக்கிடப்பட்ட வழக்கு அபாயம்: ${risk.score || 0}/100 (${risk.level || 'Low Risk'}).\n- பதிவு செய்யப்பட்ட உரிமையாளர்: ${parcel.owner.name}.\n- நீதிமன்ற வழக்குகள்: ${casesCount} வழக்கு(கள்) பதிவாகியுள்ளன.\n- வில்லங்க நிலை: ${encumbrances.length > 0 ? encumbrances[0].nature_of_deed : 'தெளிவான நிலை'}.\n(குறிப்பு: இது தகவல் நோக்கத்திற்காக மட்டுமே; அதிகாரப்பூர்வ ஆவணங்களை நேரடியாக சரிபார்க்கவும்).`
        : `Verified Due Diligence Summary for Survey No. ${parcel.land.surveyNo}, ${record.location.village}, ${record.location.district} District:\n- Calculated Risk Score: ${risk.score || 0}/100 (${risk.level || 'Low Risk'}).\n- Recorded Titleholder: ${parcel.owner.name}.\n- Active Litigation: ${casesCount} recorded case(s).\n- Encumbrance Status: ${encumbrances.length > 0 ? encumbrances[0].nature_of_deed : 'No active encumbrances listed'}.\n\nDisclaimer: This summary is based exclusively on recorded entries in the dataset and does not substitute for an enrolled advocate's formal title search.`;
}

async function analyzeQuery(query, record, language = 'en') {
    const isTamil = language === 'ta' || /[\u0B80-\u0BFF]/.test(query);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 10) {
        try {
            const contextText = JSON.stringify(record, null, 2);
            const userPrompt = `${SYSTEM_PROMPT}\n\nVERIFIED RECORD CONTEXT:\n${contextText}\n\nUSER QUESTION: ${query}\n\nANALYSIS:`;
            const geminiAnswer = await callGeminiApi(apiKey.trim(), userPrompt);
            return {
                source: "gemini_llm",
                response: geminiAnswer
            };
        } catch (err) {
            console.warn('Gemini API call failed, using deterministic legal engine fallback:', err.message);
        }
    }

    // Fallback: Deterministic Legal Reasoning Engine
    const fallbackAnswer = generateDeterministicLegalResponse(query, record, isTamil);
    return {
        source: "deterministic_engine",
        response: fallbackAnswer
    };
}

module.exports = {
    analyzeQuery
};
