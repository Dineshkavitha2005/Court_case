const test = require('node:test');
const assert = require('node:assert');
const { calculateRisk } = require('../../src/services/riskEngine');

test('Risk Engine: Null parcel returns Unknown / No Record with 0 score', () => {
    const result = calculateRisk(null);
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.level, 'Unknown');
    assert.strictEqual(result.factors.length, 0);
});

test('Risk Engine: Clear land parcel with 0 cases and 0 encumbrances is Low Risk', () => {
    const parcel = { classification: 'Agricultural' };
    const result = calculateRisk(parcel, [], []);
    assert.strictEqual(result.score, 0);
    assert.strictEqual(result.level, 'Low Risk');
    assert.strictEqual(result.color, '#10b981');
});

test('Risk Engine: 1 active court suit adds exactly 35 points (Medium Risk)', () => {
    const parcel = { classification: 'Agricultural' };
    const cases = [
        { case_number: 'OS 100/2022', court_name: 'Sub-Court', current_status: 'Pending', has_stay_injunction: 0 }
    ];
    const result = calculateRisk(parcel, cases, []);
    assert.strictEqual(result.score, 35);
    assert.strictEqual(result.level, 'Medium Risk');
    assert.strictEqual(result.factors.some(f => f.name === 'Active Court Litigation'), true);
});

test('Risk Engine: Multiple active court suits add 55 points (Medium Risk)', () => {
    const parcel = { classification: 'Agricultural' };
    const cases = [
        { case_number: 'OS 100/2022', court_name: 'Sub-Court', current_status: 'Pending', has_stay_injunction: 0 },
        { case_number: 'OS 200/2023', court_name: 'District Court', current_status: 'Active Hearing', has_stay_injunction: 0 }
    ];
    const result = calculateRisk(parcel, cases, []);
    assert.strictEqual(result.score, 55);
    assert.strictEqual(result.level, 'Medium Risk');
    assert.strictEqual(result.factors.some(f => f.name === 'Multiple Active Disputes'), true);
});

test('Risk Engine: Active suit + interim stay/injunction adds 35 + 30 = 65 points (High Risk)', () => {
    const parcel = { classification: 'Agricultural' };
    const cases = [
        { case_number: 'OS 142/2022', court_name: 'Principal Munsif', current_status: 'Pending Trial', has_stay_injunction: 1 }
    ];
    const result = calculateRisk(parcel, cases, []);
    assert.strictEqual(result.score, 65);
    assert.strictEqual(result.level, 'High Risk');
    assert.strictEqual(result.color, '#ef4444');
    assert.strictEqual(result.factors.some(f => f.name === 'Interim Injunction / Stay Order'), true);
});

test('Risk Engine: Active bank mortgage adds 20 points', () => {
    const parcel = { classification: 'Commercial' };
    const encumbrances = [
        { nature_of_deed: 'Simple Mortgage with SBI', status: 'Active Mortgage' }
    ];
    const result = calculateRisk(parcel, [], encumbrances);
    assert.strictEqual(result.score, 20);
    assert.strictEqual(result.level, 'Low Risk');
    assert.strictEqual(result.factors.some(f => f.name === 'Active Registered Mortgage'), true);
});

test('Risk Engine: Court attachment adds 35 points', () => {
    const parcel = { classification: 'Residential' };
    const encumbrances = [
        { nature_of_deed: 'Court Attachment Order', status: 'Active Restraint' }
    ];
    const result = calculateRisk(parcel, [], encumbrances);
    assert.strictEqual(result.score, 35);
    assert.strictEqual(result.factors.some(f => f.name === 'Court Attachment / Lis Pendens'), true);
});

test('Risk Engine: Cumulative score is capped at 100', () => {
    const parcel = { classification: 'Government Poramboke Waterbody' }; // +40
    const cases = [
        { case_number: 'OS 1', court_name: 'Court 1', current_status: 'Pending', has_stay_injunction: 1 }, // +55 multiple
        { case_number: 'OS 2', court_name: 'Court 2', current_status: 'Pending', has_stay_injunction: 1 }  // +30 stay
    ];
    const encumbrances = [
        { nature_of_deed: 'Court Attachment', status: 'Active' } // +35
    ];
    // 40 + 55 + 30 + 35 = 160 -> capped at 100
    const result = calculateRisk(parcel, cases, encumbrances);
    assert.strictEqual(result.score, 100);
    assert.strictEqual(result.level, 'High Risk');
});

test('Risk Engine: Zero randomness - identical inputs produce identical scores', () => {
    const parcel = { classification: 'Agricultural' };
    const cases = [{ case_number: 'OS 50', court_name: 'Sub-Court', current_status: 'Pending', has_stay_injunction: 0 }];
    const res1 = calculateRisk(parcel, cases, []);
    const res2 = calculateRisk(parcel, cases, []);
    assert.deepStrictEqual(res1, res2);
});
