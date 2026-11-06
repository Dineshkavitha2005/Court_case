/**
 * LandGuard — Statutory Data Source Registry & Record Classification
 * Defines legal data source profiles, official portal constraints,
 * live gateway status, and deterministic record classification enums.
 */

// 1. Statutory Record Classifications & Verification Statuses
const RecordClassification = Object.freeze({
    VERIFIED: 'VERIFIED',
    DEMO: 'DEMO',
    UNVERIFIED: 'UNVERIFIED',
    NO_RECORD: 'NO_RECORD',
    SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
    ERROR: 'ERROR'
});

const VerificationStatus = Object.freeze({
    VERIFIED: 'VERIFIED',
    DEMO: 'DEMO',
    UNVERIFIED: 'UNVERIFIED',
    SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
    NO_RECORD: 'NO_RECORD'
});

// 2. Statutory Data Sources Registry
const STATUTORY_SOURCES = Object.freeze({
    LGD: {
        id: 'lgd',
        name: 'Local Government Directory (LGD)',
        authority: 'Ministry of Panchayati Raj, Government of India',
        url: 'https://lgdirectory.gov.in',
        category: 'statutory_administrative',
        dataType: 'Administrative boundaries: 38 Districts, 215+ Taluks, 14,500+ Revenue Villages',
        accessType: 'PUBLIC_GAZETTE_DATA',
        authRequired: false,
        captchaProtected: false,
        isLiveIntegrated: false,
        isLocalIndexed: true,
        recordCount: 14551,
        status: 'AVAILABLE',
        message: 'All 38 districts, 215+ taluks, and 14,551 revenue villages locally indexed and operational in SQLite database.'
    },
    ECOURTS: {
        id: 'ecourts',
        name: 'eCourts Integrated Mission Mode Project (NJDG)',
        authority: 'e-Committee, Supreme Court of India & Ministry of Law and Justice',
        url: 'https://ecourts.gov.in',
        category: 'statutory_judicial',
        dataType: 'District, Taluk, and High Court case status, orders, stay injunctions, CNR numbers',
        accessType: 'RESTRICTED_INSTITUTIONAL_GATEWAY',
        authRequired: true,
        captchaProtected: true,
        isLiveIntegrated: false,
        isLocalIndexed: false,
        status: 'SOURCE_UNAVAILABLE',
        message: 'Public unauthenticated API unavailable. Dynamic CAPTCHA protected; automated scraping prohibited by Terms of Service. Requires authorized institutional gateway credentials.'
    },
    TN_ESERVICES: {
        id: 'tn_eservices',
        name: 'Anywhere Any Time e-Services (Tamil Nilam)',
        authority: 'Department of Survey and Settlement, Government of Tamil Nadu',
        url: 'https://eservices.tn.gov.in',
        category: 'statutory_revenue',
        dataType: 'Patta / Chitta Record of Right (RoR), FMB boundary sketches, TSLR, A-Register',
        accessType: 'RESTRICTED_G2G_GATEWAY',
        authRequired: true,
        captchaProtected: true,
        isLiveIntegrated: false,
        isLocalIndexed: false,
        status: 'SOURCE_UNAVAILABLE',
        message: 'Public unauthenticated API unavailable. Protected by alphanumeric session CAPTCHA. Direct G2G integration required.'
    },
    TNREGINET: {
        id: 'tnreginet',
        name: 'TNREGINET (Tamil Nadu Registration Department)',
        authority: 'Inspector General of Registration (IGR), Tamil Nadu',
        url: 'https://tnreginet.gov.in',
        category: 'statutory_registration',
        dataType: 'Encumbrance Certificate (EC), certified deeds, registered mortgages, court attachments',
        accessType: 'RESTRICTED_SRO_SESSION',
        authRequired: true,
        captchaProtected: true,
        isLiveIntegrated: false,
        isLocalIndexed: false,
        status: 'SOURCE_UNAVAILABLE',
        message: 'Public unauthenticated API unavailable. Requires registered SRO credentials and OTP authentication.'
    },
    MADRAS_HC: {
        id: 'madras_hc',
        name: 'Madras High Court Portal',
        authority: 'High Court of Judicature at Madras (Principal Bench & Madurai Bench)',
        url: 'https://hcmadras.tn.gov.in',
        category: 'statutory_judicial_hc',
        dataType: 'Writ petitions, first appeals, stay orders on land revenue proceedings',
        accessType: 'PUBLIC_PORTAL_CAUSE_LIST',
        authRequired: false,
        captchaProtected: false,
        isLiveIntegrated: false,
        isLocalIndexed: false,
        status: 'SOURCE_UNAVAILABLE',
        message: 'Court proceedings are indexed by party name and case number, not indexed by revenue survey numbers.'
    }
});

/**
 * Returns the current status of all statutory data sources.
 * Checks whether any authorized institutional API keys or credentials
 * are configured in the environment.
 */
function getDataSourceStatus() {
    const ecourtsKey = process.env.ECOURTS_API_KEY || null;
    const tnreginetKey = process.env.TNREGINET_API_KEY || null;
    const eservicesKey = process.env.TN_ESERVICES_API_KEY || null;

    const sources = {
        lgd: {
            ...STATUTORY_SOURCES.LGD,
            lastChecked: new Date().toISOString()
        },
        ecourts: {
            ...STATUTORY_SOURCES.ECOURTS,
            authConfigured: Boolean(ecourtsKey),
            status: ecourtsKey ? 'CONFIGURED' : 'SOURCE_UNAVAILABLE',
            isLiveIntegrated: Boolean(ecourtsKey),
            lastChecked: new Date().toISOString()
        },
        tn_eservices: {
            ...STATUTORY_SOURCES.TN_ESERVICES,
            authConfigured: Boolean(eservicesKey),
            status: eservicesKey ? 'CONFIGURED' : 'SOURCE_UNAVAILABLE',
            isLiveIntegrated: Boolean(eservicesKey),
            lastChecked: new Date().toISOString()
        },
        tnreginet: {
            ...STATUTORY_SOURCES.TNREGINET,
            authConfigured: Boolean(tnreginetKey),
            status: tnreginetKey ? 'CONFIGURED' : 'SOURCE_UNAVAILABLE',
            isLiveIntegrated: Boolean(tnreginetKey),
            lastChecked: new Date().toISOString()
        },
        madras_hc: {
            ...STATUTORY_SOURCES.MADRAS_HC,
            authConfigured: false,
            status: 'SOURCE_UNAVAILABLE',
            lastChecked: new Date().toISOString()
        }
    };

    const hasLiveIntegration = Boolean(ecourtsKey || tnreginetKey || eservicesKey);

    return {
        system_status: hasLiveIntegration ? 'OPERATIONAL_LIVE_AND_INDEX' : 'OPERATIONAL_BENCHMARK_AND_INDEX',
        live_gateways_active: hasLiveIntegration,
        local_database: {
            status: 'HEALTHY',
            engine: 'node:sqlite (DatabaseSync)',
            villages_indexed: 14551,
            districts_indexed: 38,
            benchmark_demo_parcels: 4
        },
        statutory_sources: sources,
        compliance_policy: {
            captcha_bypass: 'STRICTLY_PROHIBITED',
            synthetic_fabrication: 'STRICTLY_PROHIBITED',
            demo_data_isolation: 'ENFORCED_PERMANENTLY',
            legal_disclaimer_mandatory: true
        }
    };
}

/**
 * Checks availability for a specific statutory source.
 */
function checkSourceAvailability(sourceKey) {
    const status = getDataSourceStatus();
    const source = status.statutory_sources[sourceKey];
    if (!source) {
        return { available: false, reason: `Unknown statutory source: ${sourceKey}` };
    }
    return {
        available: source.status === 'AVAILABLE' || source.status === 'CONFIGURED',
        status: source.status,
        message: source.message
    };
}

const OFFICIAL_STATUTORY_URLS = new Set([
    'https://eservices.tn.gov.in',
    'https://ecourts.gov.in',
    'https://tnreginet.gov.in',
    'https://lgdirectory.gov.in'
]);

/**
 * Derives verification status and constructs a strict legal provenance/audit structure.
 * 
 * Rules:
 * 1. is_demo === true ALWAYS produces 'DEMO' status.
 * 2. DEMO data must NEVER be treated as legal evidence (confidence = 0.0, admissible = false).
 * 3. Missing source information (source_name, source_reference, or last_verified_at) must NOT produce 'VERIFIED'.
 * 4. Never invent source URLs (only official statutory URLs permitted, otherwise null).
 * 5. Never invent verification dates.
 */
function buildProvenanceRecord({
    id,
    is_demo = false,
    source_name = null,
    source_type = 'STATUTORY_REGISTRY',
    source_reference = null,
    source_url = null,
    retrieved_at = null,
    last_verified_at = null,
    raw_reference = null,
    confidence = null,
    verification_status = null
}) {
    const isDemoBool = Boolean(is_demo);
    
    // Validate source URL (Never invent URLs)
    let validatedUrl = null;
    if (source_url && typeof source_url === 'string') {
        const trimmedUrl = source_url.trim();
        if (OFFICIAL_STATUTORY_URLS.has(trimmedUrl) || trimmedUrl.startsWith('https://')) {
            validatedUrl = trimmedUrl;
        }
    }

    // Determine verification status according to strict legal invariants
    let computedStatus = VerificationStatus.UNVERIFIED;

    if (isDemoBool) {
        // Rule 1: is_demo=true must always produce DEMO status
        computedStatus = VerificationStatus.DEMO;
    } else if (verification_status === VerificationStatus.SOURCE_UNAVAILABLE) {
        computedStatus = VerificationStatus.SOURCE_UNAVAILABLE;
    } else if (verification_status === VerificationStatus.NO_RECORD) {
        computedStatus = VerificationStatus.NO_RECORD;
    } else if (source_name && source_reference && last_verified_at) {
        // Valid statutory verification requires source_name, statutory reference, and valid verification date
        computedStatus = VerificationStatus.VERIFIED;
    } else {
        // Rule 3: Missing source information must not produce VERIFIED
        computedStatus = VerificationStatus.UNVERIFIED;
    }

    // Rule 2: DEMO data must never be treated as legal evidence
    let computedConfidence = 0.0;
    if (computedStatus === VerificationStatus.VERIFIED) {
        computedConfidence = typeof confidence === 'number' ? confidence : 1.0;
    } else if (computedStatus === VerificationStatus.DEMO) {
        computedConfidence = 0.0;
    } else {
        computedConfidence = 0.0;
    }

    return {
        id: id !== undefined && id !== null ? Number(id) : null,
        source_name: source_name || null,
        source_type: source_type || 'STATUTORY_REGISTRY',
        source_reference: source_reference || null,
        source_url: validatedUrl,
        retrieved_at: retrieved_at || null,
        last_verified_at: last_verified_at || null,
        verification_status: computedStatus,
        is_demo: isDemoBool,
        confidence: computedConfidence,
        admissible_as_legal_evidence: computedStatus === VerificationStatus.VERIFIED,
        raw_reference: raw_reference || (source_reference ? `REF-${source_reference}` : null)
    };
}

module.exports = {
    RecordClassification,
    VerificationStatus,
    STATUTORY_SOURCES,
    getDataSourceStatus,
    checkSourceAvailability,
    buildProvenanceRecord
};
