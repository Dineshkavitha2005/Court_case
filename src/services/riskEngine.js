/**
 * LandGuard — Deterministic Risk Rules Engine
 * Calculates litigation and encumbrance risk scores using transparent,
 * explainable statutory criteria with ZERO randomness.
 */

function calculateRisk(parcel, courtCases = [], encumbrances = []) {
    if (!parcel) {
        return {
            score: 0,
            level: "Unknown",
            label: "No Record",
            color: "gray",
            factors: [],
            disclaimer: "No verified record was found in the statutory database. Absence of a record does not guarantee freedom from litigation."
        };
    }

    let score = 0;
    const factors = [];

    // Factor 1: Court Cases & Litigation
    const activeCases = courtCases.filter(c => 
        (c.current_status || '').toLowerCase().includes('pending') ||
        (c.current_status || '').toLowerCase().includes('trial') ||
        (c.current_status || '').toLowerCase().includes('active') ||
        (c.current_status || '').toLowerCase().includes('hearing') ||
        (c.current_status || '').toLowerCase().includes('evidence')
    );

    const disposedCases = courtCases.filter(c => 
        (c.current_status || '').toLowerCase().includes('disposed') ||
        (c.current_status || '').toLowerCase().includes('dismissed') ||
        (c.current_status || '').toLowerCase().includes('decreed')
    );

    if (activeCases.length >= 2) {
        score += 55;
        factors.push({
            name: "Multiple Active Disputes",
            weight: 55,
            severity: "danger",
            description: `${activeCases.length} active lawsuits pending against parcel across judicial forums.`
        });
    } else if (activeCases.length === 1) {
        score += 35;
        factors.push({
            name: "Active Court Litigation",
            weight: 35,
            severity: "danger",
            description: `1 active lawsuit pending (${activeCases[0].case_number} in ${activeCases[0].court_name}).`
        });
    } else if (disposedCases.length > 0) {
        score += 10;
        factors.push({
            name: "Historical Litigated Title",
            weight: 10,
            severity: "info",
            description: `${disposedCases.length} historical court case(s) previously recorded and disposed.`
        });
    }

    // Factor 2: Injunction / Stay Orders
    const injunctionCases = courtCases.filter(c => c.has_stay_injunction === 1);
    if (injunctionCases.length > 0) {
        score += 30;
        factors.push({
            name: "Interim Injunction / Stay Order",
            weight: 30,
            severity: "danger",
            description: "Judicial order restraining alienation, construction, or title transfer is currently in effect."
        });
    }

    // Factor 3: Encumbrances & Liens
    const activeEncumbrances = encumbrances.filter(e => {
        const s = (e.status || '').toLowerCase();
        return s.includes('active') || s.includes('restraint') || s.includes('attachment') || s.includes('lis pendens');
    });

    const attachments = encumbrances.filter(e => {
        const d = (e.nature_of_deed || '').toLowerCase() + ' ' + (e.status || '').toLowerCase();
        return d.includes('attachment') || d.includes('court') || d.includes('lis pendens');
    });

    const mortgages = encumbrances.filter(e => {
        const d = (e.nature_of_deed || '').toLowerCase();
        return d.includes('mortgage') || d.includes('loan') || d.includes('charge');
    });

    if (attachments.length > 0) {
        score += 35;
        factors.push({
            name: "Court Attachment / Lis Pendens",
            weight: 35,
            severity: "danger",
            description: "Registered court attachment or notice of pending litigation (Lis Pendens) recorded at Sub-Registrar Office."
        });
    } else if (mortgages.length > 0 && mortgages.some(m => (m.status || '').toLowerCase().includes('active'))) {
        score += 20;
        factors.push({
            name: "Active Registered Mortgage",
            weight: 20,
            severity: "warning",
            description: "Active mortgage or bank charge registered against the property. No-Objection Certificate (NOC) required."
        });
    } else if (activeEncumbrances.length === 0 && encumbrances.length > 0) {
        factors.push({
            name: "Encumbrance History Verified",
            weight: 0,
            severity: "success",
            description: "Encumbrance certificate search indicates nil active adverse charges."
        });
    }

    // Factor 4: Land Classification Vulnerability
    const classification = (parcel.classification || '').toLowerCase();
    if (classification.includes('poramboke') || classification.includes('water') || classification.includes('temple') || classification.includes('wakf')) {
        score += 40;
        factors.push({
            name: "Protected Land Classification",
            weight: 40,
            severity: "danger",
            description: `Land classified under vulnerable category (${parcel.classification}), subject to special statutory transfer restrictions.`
        });
    }

    // Cap at 100 max
    const finalScore = Math.min(100, Math.max(0, score));

    let riskLevel = "Low Risk";
    let color = "#10b981"; // green

    if (finalScore >= 60) {
        riskLevel = "High Risk";
        color = "#ef4444"; // red
    } else if (finalScore >= 25) {
        riskLevel = "Medium Risk";
        color = "#f59e0b"; // amber
    }

    return {
        score: finalScore,
        level: riskLevel,
        color: color,
        factors: factors,
        disclaimer: "Litigation risk scoring is an indicative calculation based solely on recorded database entries and does not constitute a legal guarantee or title certification."
    };
}

module.exports = {
    calculateRisk
};
