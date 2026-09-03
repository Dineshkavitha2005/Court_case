/**
 * LandGuard — Statutory Data Source Registry & Record Classification
 * Defines legal data source profiles, official portal constraints,
 * live gateway status, and deterministic record classification enums.
 */

// 1. Five Statutory Record Classifications
const RecordClassification = Object.freeze({
    VERIFIED: 'VERIFIED',
    DEMO: 'DEMO',
    NO_RECORD: 'NO_RECORD',
    SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
    ERROR: 'ERROR'
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

module.exports = {
    RecordClassification,
    STATUTORY_SOURCES,
    getDataSourceStatus,
    checkSourceAvailability
};
