const test = require('node:test');
const assert = require('node:assert/strict');
const parser = require('../../frontend/voiceParser');

test('voice parser normalizes punctuation, whitespace, Tamil digits, and spoken survey digits', () => {
    assert.equal(parser.normalizeText('  Survey—௧௪௨ / ௧! '), 'Survey 142 / 1');
    assert.equal(parser.normalizeSurveyNumber('Survey: 142 / 1a'), '142/1A');
    assert.equal(parser.extractSurveyNumber('district Coimbatore, survey one four two slash one'), '142/1');
    assert.equal(parser.extractSurveyNumber('சர்வே எண் ஒன்று நான்கு இரண்டு ஸ்லாஷ் ஒன்று'), '142/1');
    assert.equal(parser.extractSurveyNumber('survey one hundred forty two slash one'), '142/1');
});

test('voice parser recognizes English, Tamil, and mixed-script API-backed names', () => {
    const districts = [
        { name: 'Coimbatore', name_ta: 'கோயம்புத்தூர்' },
        { name: 'Chennai', name_ta: 'சென்னை' }
    ];
    const taluks = [{ name: 'Coimbatore South' }];
    const villages = [{ name: 'Alanthurai (TP)', name_ta: 'ஆலந்துறை' }];

    const english = parser.parseVoiceTranscript('District Coimbatore Taluk Coimbatore South Village Alanthurai survey 142 slash 1', { districts, taluks, villages });
    assert.equal(english.matches.district[0].name, 'Coimbatore');
    assert.equal(english.matches.taluk[0].name, 'Coimbatore South');
    assert.equal(english.matches.village[0].name, 'Alanthurai (TP)');
    assert.equal(english.surveyNumber, '142/1');

    const mixed = parser.parseVoiceTranscript('மாவட்டம் கோயம்புத்தூர் taluk Coimbatore South கிராமம் ஆலந்துறை சர்வே எண் 142 slash one', { districts, taluks, villages });
    assert.equal(mixed.matches.district[0].name, 'Coimbatore');
    assert.equal(mixed.matches.village[0].name, 'Alanthurai (TP)');
    assert.equal(mixed.surveyNumber, '142/1');
});

test('labelled partial location produces suggestions instead of a guessed location', () => {
    const matches = parser.findLocationMatches('taluk Coimbatore', [
        { name: 'Coimbatore North' },
        { name: 'Coimbatore South' }
    ], parser.extractLabelledValue('taluk Coimbatore', 'taluk'));
    assert.deepEqual(matches.map(item => item.name), ['Coimbatore North', 'Coimbatore South']);
    assert.equal(parser.normalizeSurveyNumber('not a survey'), '');
});
