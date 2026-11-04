/**
 * LandGuard — Main Client Application
 * Handles 4-tier location selection, real API search, bilingual localization (EN/TA),
 * Web Speech voice recognition (en-IN, ta-IN), Leaflet approximate map, and context-bound AI chat.
 * ZERO CLIENT-SIDE MOCK GENERATION.
 */

let mapInstance = null;
let activeRecord = null;
let currentLanguage = localStorage.getItem('landguard-language') || 'en';
let currentTheme = localStorage.getItem('landguard-theme') || 'dark';
let speechRecognition = null;
let isRecording = false;

// Complete bilingual translation dictionary
const TRANSLATIONS = {
    ta: {
        nav_home: "முகப்பு",
        nav_search: "தேடல்",
        nav_features: "அம்சங்கள்",
        nav_about: "பற்றி",
        hero_badge: "தமிழ்நாடு நில சரிபார்ப்பு தளம்",
        hero_title_1: "நிலத்தை சரிபார்த்து",
        hero_title_2: "வழக்கு அபாயம்",
        hero_title_3: "முதலீடு செய்வதற்கு முன்",
        hero_subtitle: "தமிழ்நாடு முழுவதும் முறைப்படியான சட்ட ஆய்வு. மாவட்டம், தாலுகா, கிராமம், சர்வே எண்ணை வைத்து நிலுவை நீதிமன்ற வழக்குகள், இடைக்கால தடைகள் மற்றும் வில்லங்கங்களை அறியுங்கள்.",
        btn_start_search: "சரிபார்ப்பு தேடலை தொடங்கவும்",
        stat_districts: "மாவட்டங்கள்",
        stat_taluks: "தாலுகாக்கள்",
        stat_villages: "வருவாய் கிராமங்கள்",
        fc_clear: "தெளிவான உரிமை",
        fc_clear_sub: "எதிர்மறை வழக்குகள் இல்லை",
        fc_medium: "நடுத்தர அபாயம்",
        fc_medium_sub: "பதிவு செய்யப்பட்ட அடமானம்",
        fc_high: "அதிக அபாயம்",
        fc_high_sub: "செயலில் உள்ள வழக்கு மற்றும் தடை",
        search_title: "நில பதிவுகளை தேடுங்கள்",
        search_subtitle: "மாவட்டம் → தாலுகா → கிராமம் தேர்ந்தெடுத்து, சர்வே எண்ணை உள்ளிட்டு சரிபார்க்கவும்.",
        label_district: "மாவட்டம்",
        opt_select_district: "மாவட்டத்தை தேர்ந்தெடுக்கவும்...",
        label_taluk: "தாலுகா",
        opt_select_taluk: "முதலில் மாவட்டத்தை தேர்ந்தெடுக்கவும்...",
        label_village: "கிராமம்",
        label_survey: "சர்வே எண்",
        btn_voice: "குரல் தேடல்",
        btn_check_risk: "வழக்கு அபாயத்தை சரிபார்க்கவும்",
        sample_cases: "குறிப்பு மாதிரி வழக்குகள்:",
        loading_title: "பதிவு தரவுத்தளங்களில் தேடப்படுகிறது",
        loading_step_1: "தமிழ்நாடு வருவாய் மற்றும் நீதிமன்ற பதிவுகள் ஆய்வு செய்யப்படுகின்றன...",
        report_title: "நில சட்ட சரிபார்ப்பு அறிக்கை",
        btn_pdf: "அறிக்கை பதிவிறக்கம்",
        btn_new_search: "புதிய தேடல்",
        card_owner: "பதிவு செய்யப்பட்ட உரிமையாளர்",
        card_land: "வருவாய் மற்றும் நில விவரங்கள்",
        card_map: "தோராய கிராம இருப்பிடம்",
        card_court: "நீதிமன்ற வழக்கு விவரங்கள்",
        card_encumbrance: "பதிவு செய்யப்பட்ட வில்லங்கங்கள்",
        card_ai: "AI சட்ட ஆய்வாளர் குறிப்புகள்",
        card_sources: "தரவு ஆதாரங்கள் மற்றும் தணிக்கை விவரம்",
        no_record_title: "அரசு பொது பதிவேட்டில் சரிபார்க்கப்பட்ட பதிவு இல்லை",
        chat_title: "AI சட்ட ஆய்வாளர்",
        chat_welcome: "வணக்கம்! LandGuard AI சட்ட ஆய்வாளருக்கு நல்வரவு. மேலே உள்ள அறிக்கையின் அடிப்படையில் சட்ட சொற்கள், நீதிமன்ற தடைகள் மற்றும் உண்மை விவரங்களை விளக்க நான் தயார்.",
        feat_title: "சட்ட சரிபார்ப்பு கொள்கைகள்",
        feat_subtitle: "நம்பகமான, வெளிப்படையான, போலி இல்லாத நில புலனாய்வு",
        feat_1_title: "தமிழ்நாடு நிர்வாக கட்டமைப்பு",
        feat_1_desc: "38 மாவட்டங்கள், 178+ தாலுகாக்கள், 14,500+ கிராமங்கள் முழுமையாக இணைக்கப்பட்டுள்ளன.",
        feat_2_title: "தெளிவான விதிமுறை அபாய மதிப்பீடு",
        feat_2_desc: "100% வெளிப்படையான கணக்கீடு. வழக்குகள், தடை உத்தரவுகள், அடமானங்கள் துல்லியமான மதிப்பெண்களாக கணக்கிடப்படுகின்றன.",
        feat_3_title: "போலி தரவு இல்லை என்ற உத்தரவாதம்",
        feat_3_desc: "நாங்கள் ஒருபோதும் கற்பனையான வழக்குகள் அல்லது உரிமையாளர்களை உருவாக்க மாட்டோம்.",
        about_title: "LandGuard பற்றி",
        about_desc_1: "தமிழ்நாடு நில வாங்குபவர்கள், வழக்கறிஞர்கள், மற்றும் நிதி நிறுவனங்களுக்கு நம்பகமான முதற்கட்ட ஆய்வு தகவல்களை வழங்குவதற்காக LandGuard உருவாக்கப்பட்டுள்ளது."
    },
    en: {
        nav_home: "Home",
        nav_search: "Search",
        nav_features: "Features",
        nav_about: "About",
        hero_badge: "Tamil Nadu Land Due Diligence Platform",
        hero_title_1: "Verify Land",
        hero_title_2: "Litigation Risk",
        hero_title_3: "Before You Invest",
        hero_subtitle: "Systematic statutory due diligence across Tamil Nadu. Search by District, Taluk, Village, and Survey Number to uncover recorded court suits, interim stay orders, and encumbrances.",
        btn_start_search: "Start Verification Search",
        stat_districts: "Districts Covered",
        stat_taluks: "Taluks Indexed",
        stat_villages: "Revenue Villages",
        fc_clear: "Clear Title",
        fc_clear_sub: "No adverse suits found",
        fc_medium: "Medium Risk",
        fc_medium_sub: "Active mortgage recorded",
        fc_high: "High Risk",
        fc_high_sub: "Active suit & stay order",
        search_title: "Search Land Records",
        search_subtitle: "Select District → Taluk → Village and enter Survey Number to perform due diligence.",
        label_district: "District",
        opt_select_district: "Select District...",
        label_taluk: "Taluk",
        opt_select_taluk: "Select District First...",
        label_village: "Village",
        label_survey: "Survey Number",
        btn_voice: "Voice Search",
        btn_check_risk: "Check Litigation Risk",
        sample_cases: "Documented Reference Cases:",
        loading_title: "Querying Registry Records",
        loading_step_1: "Querying Tamil Nadu revenue and court databases...",
        report_title: "Land Due Diligence Report",
        btn_pdf: "Download Summary",
        btn_new_search: "New Search",
        card_owner: "Recorded Ownership",
        card_land: "Revenue & Land Details",
        card_map: "Approximate Village Location",
        card_court: "Verified Court Proceedings",
        card_encumbrance: "Registered Encumbrances",
        card_ai: "AI Legal Analyst Due Diligence Notes",
        card_sources: "Data Sources & Document Audit Trail",
        no_record_title: "No Verified Record Found in Public Registries",
        chat_title: "AI Legal Analyst",
        chat_welcome: "Welcome to LandGuard Legal Analyst. Select a village and survey number above, and I can explain the legal terminology, stay orders, and verified facts grounded strictly in the report.",
        feat_title: "Statutory Verification Principles",
        feat_subtitle: "Reliable, explainable, and zero-hallucination land intelligence",
        feat_1_title: "Tamil Nadu Hierarchy",
        feat_1_desc: "Rigorous 4-level navigation across all 38 districts, 178+ taluks, and 14,500+ revenue villages.",
        feat_2_title: "Deterministic Risk Scoring",
        feat_2_desc: "Rule-based scoring with 100% explainability. Active suits, stay orders, and mortgages contribute exact weighted points.",
        feat_3_title: "Zero Fabrication Guarantee",
        feat_3_desc: "We never invent court cases, owners, or risk values. When unindexed, we return an honest 'No verified record found' status.",
        about_title: "About LandGuard",
        about_desc_1: "LandGuard is developed for Tamil Nadu property buyers, advocates, and lending institutions seeking verifiable preliminary due diligence."
    }
};

function t(key) {
    const langDict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
}

// ============================================
// Initialization & Bootstrap
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initLocationHierarchy();
    initFormValidationAndSubmit();
    initVoiceRecognition();
    initChatBot();
    initSampleChips();
});

// ============================================
// Theme Management
// ============================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');

    applyTheme(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('landguard-theme', currentTheme);
            applyTheme(currentTheme);
        });
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
}

// ============================================
// Language Management
// ============================================
function initLanguage() {
    const langToggle = document.getElementById('languageToggle');
    applyLanguage(currentLanguage);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'ta' : 'en';
            localStorage.setItem('landguard-language', currentLanguage);
            applyLanguage(currentLanguage);
            updateDistrictsDropdown();
        });
    }
}

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.textContent = lang === 'en' ? 'தமிழ்' : 'English';
    }

    const villageInput = document.getElementById('villageInput');
    if (villageInput) {
        villageInput.placeholder = lang === 'ta' ? 'கிராமப் பெயரை தட்டச்சு செய்க...' : 'Type village name...';
    }

    const surveyInput = document.getElementById('surveyInput');
    if (surveyInput) {
        surveyInput.placeholder = lang === 'ta' ? 'உதா. 142/1, 88/2A...' : 'e.g., 142/1, 88/2A...';
    }
}

// ============================================
// 4-Level Location Hierarchy (District -> Taluk -> Village -> Survey)
// ============================================
let cachedDistricts = [];

async function initLocationHierarchy() {
    const distSelect = document.getElementById('districtSelect');
    const talukSelect = document.getElementById('talukSelect');
    const villageInput = document.getElementById('villageInput');
    const villageSuggestions = document.getElementById('villageSuggestions');
    const surveyInput = document.getElementById('surveyInput');
    const surveySuggestions = document.getElementById('surveySuggestions');

    try {
        const res = await fetch('/api/districts');
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.districts)) {
            cachedDistricts = data.districts;
            updateDistrictsDropdown();
        }
    } catch (err) {
        console.error('Failed to load districts:', err);
    }

    // District Change Listener
    distSelect.addEventListener('change', async () => {
        const selectedDist = distSelect.value;
        hideAlert();

        talukSelect.innerHTML = `<option value="" disabled selected>${t('opt_select_taluk')}</option>`;
        talukSelect.disabled = true;
        villageInput.value = '';
        villageInput.disabled = true;
        surveyInput.value = '';
        villageSuggestions.classList.remove('active');

        if (!selectedDist) return;

        try {
            const res = await fetch(`/api/taluks?district=${encodeURIComponent(selectedDist)}`);
            const data = await res.json();
            if (data.status === 'success' && Array.isArray(data.taluks)) {
                talukSelect.innerHTML = `<option value="" disabled selected>${currentLanguage === 'ta' ? 'தாலுகாவை தேர்ந்தெடுக்கவும்...' : 'Select Taluk...'}</option>`;
                data.taluks.forEach(tItem => {
                    const opt = document.createElement('option');
                    opt.value = tItem.name;
                    opt.textContent = currentLanguage === 'ta' && tItem.name_ta ? tItem.name_ta : tItem.name;
                    talukSelect.appendChild(opt);
                });
                talukSelect.disabled = false;
            }
        } catch (err) {
            console.error('Failed to load taluks:', err);
        }
    });

    // Taluk Change Listener
    talukSelect.addEventListener('change', () => {
        hideAlert();
        villageInput.value = '';
        villageInput.disabled = false;
        surveyInput.value = '';
        villageInput.focus();
    });

    // Village Autocomplete Search (Debounced API call)
    let debounceTimer = null;
    villageInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = villageInput.value.trim();
        const dist = distSelect.value;
        const taluk = talukSelect.value;

        if (query.length < 1) {
            villageSuggestions.innerHTML = '';
            villageSuggestions.classList.remove('active');
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/villages?district=${encodeURIComponent(dist)}&taluk=${encodeURIComponent(taluk)}&q=${encodeURIComponent(query)}&limit=15`);
                const data = await res.json();
                villageSuggestions.innerHTML = '';

                if (data.status === 'success' && data.results && data.results.length > 0) {
                    data.results.forEach(v => {
                        const item = document.createElement('div');
                        item.classList.add('suggestion-item');
                        item.textContent = v.name;
                        item.addEventListener('click', () => {
                            villageInput.value = v.name;
                            villageSuggestions.classList.remove('active');
                            surveyInput.focus();
                            loadSurveySuggestions(v.name);
                        });
                        villageSuggestions.appendChild(item);
                    });
                    villageSuggestions.classList.add('active');
                } else {
                    villageSuggestions.classList.remove('active');
                }
            } catch (err) {
                console.error('Village search failed:', err);
            }
        }, 180);
    });

    // Survey Suggestions on focus
    surveyInput.addEventListener('focus', () => {
        const v = villageInput.value.trim();
        if (v) loadSurveySuggestions(v);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#villageInput') && !e.target.closest('#villageSuggestions')) {
            villageSuggestions.classList.remove('active');
        }
        if (!e.target.closest('#surveyInput') && !e.target.closest('#surveySuggestions')) {
            surveySuggestions.classList.remove('active');
        }
    });
}

function updateDistrictsDropdown() {
    const distSelect = document.getElementById('districtSelect');
    if (!distSelect || cachedDistricts.length === 0) return;

    const currentVal = distSelect.value;
    distSelect.innerHTML = `<option value="" disabled ${!currentVal ? 'selected' : ''}>${t('opt_select_district')}</option>`;

    cachedDistricts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.name;
        opt.textContent = currentLanguage === 'ta' && d.name_ta ? d.name_ta : d.name;
        if (d.name === currentVal) opt.selected = true;
        distSelect.appendChild(opt);
    });
}

async function loadSurveySuggestions(villageName) {
    const surveySuggestions = document.getElementById('surveySuggestions');
    const surveyInput = document.getElementById('surveyInput');
    if (!villageName) return;

    try {
        const res = await fetch(`/api/surveynumbers?village=${encodeURIComponent(villageName)}`);
        const data = await res.json();
        surveySuggestions.innerHTML = '';
        if (data.status === 'success' && Array.isArray(data.results) && data.results.length > 0) {
            data.results.forEach(sn => {
                const item = document.createElement('div');
                item.classList.add('suggestion-item');
                item.textContent = `Survey ${sn}`;
                item.addEventListener('click', () => {
                    surveyInput.value = sn;
                    surveySuggestions.classList.remove('active');
                });
                surveySuggestions.appendChild(item);
            });
            surveySuggestions.classList.add('active');
        } else {
            surveySuggestions.classList.remove('active');
        }
    } catch (_) {
        // silent
    }
}

// ============================================
// Form Validation & Search Execution
// ============================================
function initFormValidationAndSubmit() {
    const form = document.getElementById('searchForm');
    const distSelect = document.getElementById('districtSelect');
    const talukSelect = document.getElementById('talukSelect');
    const villageInput = document.getElementById('villageInput');
    const surveyInput = document.getElementById('surveyInput');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hideAlert();

        const district = distSelect.value;
        const taluk = talukSelect.value;
        const village = villageInput.value.trim();
        const survey = surveyInput.value.trim();

        // 1. Empty field checks
        if (!district) {
            showAlert(currentLanguage === 'ta' ? 'தயவுசெய்து ஒரு மாவட்டத்தை தேர்ந்தெடுக்கவும்.' : 'Please select a District from the dropdown.');
            distSelect.focus();
            return;
        }

        if (!taluk) {
            showAlert(currentLanguage === 'ta' ? 'தயவுசெய்து ஒரு தாலுகாவை தேர்ந்தெடுக்கவும்.' : 'Please select a Taluk from the dropdown.');
            talukSelect.focus();
            return;
        }

        if (!village) {
            showAlert(currentLanguage === 'ta' ? 'கிராமப் பெயரை உள்ளிடவும்.' : 'Please enter a Village name.');
            villageInput.focus();
            return;
        }

        if (!survey) {
            showAlert(currentLanguage === 'ta' ? 'சர்வே எண்ணை உள்ளிடவும்.' : 'Please enter a Survey Number.');
            surveyInput.focus();
            return;
        }

        // 2. Survey Number Format Validation
        const surveyRegex = /^[0-9]+(\/[0-9]+[A-Za-z0-9]*)?$/i;
        if (!surveyRegex.test(survey)) {
            showAlert(currentLanguage === 'ta'
                ? 'தவறான சர்வே எண் வடிவம். சரியான உதாரணங்கள்: 142, 142/1, 88/2A, 45/1.'
                : 'Invalid survey number format. Examples of valid formats: 142, 142/1, 88/2A, 45/1.');
            surveyInput.focus();
            return;
        }

        // 3. Characters check
        if (/[<>;'"\\]/.test(survey) || /[<>;'"\\]/.test(village)) {
            showAlert(currentLanguage === 'ta' ? 'உள்ளீட்டில் அனுமதிக்கப்படாத குறியீடுகள் உள்ளன.' : 'Inputs contain disallowed characters.');
            return;
        }

        executeSearch({ district, taluk, village, surveyNumber: survey });
    });

    const newSearchBtn = document.getElementById('newSearchBtn');
    if (newSearchBtn) {
        newSearchBtn.addEventListener('click', resetSearch);
    }
    const noRecordNewSearchBtn = document.getElementById('noRecordNewSearchBtn');
    if (noRecordNewSearchBtn) {
        noRecordNewSearchBtn.addEventListener('click', resetSearch);
    }
}

function showAlert(message) {
    const alertBox = document.getElementById('validationAlert');
    const msgSpan = document.getElementById('validationAlertMsg');
    if (alertBox && msgSpan) {
        msgSpan.textContent = message;
        alertBox.style.display = 'flex';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideAlert() {
    const alertBox = document.getElementById('validationAlert');
    if (alertBox) alertBox.style.display = 'none';
}

function resetSearch() {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'none';
    document.getElementById('home').style.display = '';
    document.querySelector('.search-section').style.display = '';
    document.querySelector('.features-section').style.display = '';
    document.querySelector('.about-section').style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Real Backend Search Request
// ============================================
async function executeSearch(searchParams) {
    const overlay = document.getElementById('loadingOverlay');
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');

    overlay.classList.add('active');
    progressBar.style.width = '20%';
    loadingText.textContent = t('loading_step_1');

    try {
        progressBar.style.width = '60%';
        const response = await fetch('/api/land/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchParams)
        });

        progressBar.style.width = '90%';
        const data = await response.json();

        setTimeout(() => {
            progressBar.style.width = '100%';
            setTimeout(() => {
                overlay.classList.remove('active');
                if (data.status === 'error') {
                    showAlert(data.error || 'Server returned an error.');
                    return;
                }
                renderReport(data);
            }, 300);
        }, 400);

    } catch (err) {
        overlay.classList.remove('active');
        showAlert(currentLanguage === 'ta'
            ? 'சர்வர் இணைப்பு தோல்வியடைந்தது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
            : 'Could not connect to the backend verification server. Please check your connection.');
        console.error('Search request failed:', err);
    }
}

// ============================================
// Render Verification Report
// ============================================
function renderReport(record) {
    activeRecord = record;

    document.getElementById('home').style.display = 'none';
    document.querySelector('.search-section').style.display = 'none';
    document.querySelector('.features-section').style.display = 'none';
    document.querySelector('.about-section').style.display = 'none';

    const resultsSection = document.getElementById('resultsSection');
    const verifiedContainer = document.getElementById('verifiedResultsContainer');
    const noRecordCard = document.getElementById('noRecordCard');
    const demoBanner = document.getElementById('demoBanner');

    resultsSection.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // CASE 0: Official Source Unavailable
    if (record.status === 'source_unavailable' || record.record_classification === 'SOURCE_UNAVAILABLE') {
        verifiedContainer.style.display = 'none';
        demoBanner.style.display = 'none';
        noRecordCard.style.display = 'block';

        const title = noRecordCard.querySelector('h3');
        if (title) {
            title.textContent = currentLanguage === 'ta'
                ? 'அதிகாரப்பூர்வ அரசு இணையதளம் தற்போது கிடைக்கவில்லை'
                : 'Official Source Currently Unavailable';
        }
        const desc = document.getElementById('noRecordDesc');
        desc.textContent = record.message || (currentLanguage === 'ta'
            ? 'அதிகாரப்பூர்வ அரசு தரவுத்தளம் தற்போது கிடைக்கவில்லை. சரிபார்ப்பை நிறைவு செய்ய முடியவில்லை.'
            : 'Official source currently unavailable. Verification could not be completed.');
        return;
    }

    // CASE 1: No record found in index
    if (record.status === 'no_record' || record.record_classification === 'NO_RECORD') {
        verifiedContainer.style.display = 'none';
        demoBanner.style.display = 'none';
        noRecordCard.style.display = 'block';

        const title = noRecordCard.querySelector('h3');
        if (title) {
            title.textContent = t('no_record_title');
        }
        const desc = document.getElementById('noRecordDesc');
        desc.textContent = currentLanguage === 'ta'
            ? `சர்வே எண் ${record.location.surveyNumber} (${record.location.village}, ${record.location.district}) குறித்து அதிகாரப்பூர்வ நீதிமன்ற வழக்குகள் அல்லது வில்லங்கப் பதிவுகள் எதுவும் தற்போது குறியிடப்படவில்லை.`
            : `No verified court case, caveat, or registered encumbrance entry is listed in our statutory index for Survey No. ${record.location.surveyNumber} in ${record.location.village}, ${record.location.district} District.`;
        return;
    }

    // CASE 2: Record Found (Verified or Demo)
    noRecordCard.style.display = 'none';
    verifiedContainer.style.display = 'block';

    // Demo Banner
    if (record.is_demo) {
        demoBanner.style.display = 'flex';
    } else {
        demoBanner.style.display = 'none';
    }

    // Result Meta
    document.getElementById('resultMeta').textContent =
        `${t('label_district')}: ${record.location.district} | ${t('label_taluk')}: ${record.location.taluk} | ${t('label_village')}: ${record.location.village} | ${t('label_survey')}: ${record.location.surveyNumber} | ${currentLanguage === 'ta' ? 'அறிக்கை தேதி' : 'Report Date'}: ${new Date().toLocaleDateString('en-IN')}`;

    // Risk Gauge & Transparent Factors
    renderRiskCard(record.risk);

    // Owner Details
    renderOwnerDetails(record.parcel.owner);

    // Land Details
    renderLandDetails(record.parcel.land);

    // Court Cases
    renderCourtCases(record.courtCases);

    // Encumbrances
    renderEncumbrances(record.encumbrances);

    // Leaflet Approximate Centroid Map
    renderApproximateMap(record);

    // AI Analyst Notes
    renderAiAnalystNotes(record);

    // Audit Sources List
    renderSourcesList(record);

    // Update Floating Chatbot state
    updateChatbotState(record);
}

// ============================================
// Sub-component Renderers
// ============================================
function renderRiskCard(risk) {
    const gaugeValue = document.getElementById('gaugeValue');
    const riskLevel = document.getElementById('riskLevel');
    const riskDesc = document.getElementById('riskDescription');
    const riskFactors = document.getElementById('riskFactors');
    const gaugeArc = document.getElementById('gaugeArc');

    if (!risk) return;

    gaugeValue.textContent = risk.score;
    riskLevel.textContent = risk.level.toUpperCase();
    riskLevel.style.color = risk.color;

    // Animate arc
    const maxOffset = 251.2;
    const offset = maxOffset - (risk.score / 100) * maxOffset;
    if (gaugeArc) gaugeArc.style.strokeDashoffset = offset;

    riskDesc.textContent = risk.disclaimer;

    riskFactors.innerHTML = '';
    if (Array.isArray(risk.factors) && risk.factors.length > 0) {
        risk.factors.forEach(f => {
            const el = document.createElement('div');
            el.classList.add('risk-factor-item');
            el.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: var(--text-primary); font-size: 0.9rem;">${f.name}</strong>
                    <span class="status-badge" style="background: ${f.severity === 'danger' ? 'rgba(239,68,68,0.2)' : f.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${f.severity === 'danger' ? '#ef4444' : f.severity === 'warning' ? '#f59e0b' : '#10b981'}; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700;">
                        ${f.weight > 0 ? '+' + f.weight + ' pts' : '0 pts'}
                    </span>
                </div>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${f.description}</p>
            `;
            riskFactors.appendChild(el);
        });
    } else {
        riskFactors.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No adverse litigation or encumbrance risk factors registered in this record.</p>`;
    }
}

function renderOwnerDetails(owner) {
    const container = document.getElementById('ownerDetails');
    if (!owner) return;
    container.innerHTML = `
        <div class="detail-row"><span class="detail-label">Titleholder Name</span><span class="detail-value font-bold">${owner.name}</span></div>
        <div class="detail-row"><span class="detail-label">Father / Spouse Name</span><span class="detail-value">${owner.father_name}</span></div>
        <div class="detail-row"><span class="detail-label">Deed Registration Date</span><span class="detail-value">${owner.registration_date}</span></div>
    `;
}

function renderLandDetails(land) {
    const container = document.getElementById('landDetails');
    if (!land) return;
    container.innerHTML = `
        <div class="detail-row"><span class="detail-label">Survey Number</span><span class="detail-value font-bold">${land.surveyNo}</span></div>
        <div class="detail-row"><span class="detail-label">Subdivision</span><span class="detail-value">${land.subdivision || 'N/A'}</span></div>
        <div class="detail-row"><span class="detail-label">Total Extent / Area</span><span class="detail-value">${land.extent}</span></div>
        <div class="detail-row"><span class="detail-label">Revenue Classification</span><span class="detail-value">${land.classification}</span></div>
        <div class="detail-row"><span class="detail-label">Patta Passbook No.</span><span class="detail-value">${land.passbook}</span></div>
        <div class="detail-row"><span class="detail-label">Guideline / Market Estimate</span><span class="detail-value">${land.marketValue}</span></div>
    `;
}

function renderCourtCases(cases) {
    const container = document.getElementById('courtCases');
    if (!cases || cases.length === 0) {
        container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--success);">
                <strong style="display: block; margin-bottom: 4px;">✔ 0 Active Lawsuits Recorded</strong>
                <span style="font-size: 0.85rem; color: var(--text-muted);">No pending original suits or title litigation registered against this parcel in the current docket.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = cases.map(c => `
        <div class="court-case-item" style="border: 1px solid var(--border-glass); border-radius: var(--radius-xs); padding: 14px; margin-bottom: 12px; background: rgba(255,255,255,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                    <span style="font-size: 1rem; font-weight: 700; color: #ef4444;">${c.case_number}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 8px;">CNR: ${c.cnr_number || 'N/A'}</span>
                </div>
                <span class="status-badge" style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
                    ${c.current_status}
                </span>
            </div>
            <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary);">
                <div><strong>Court:</strong> ${c.court_name}</div>
                <div><strong>Type:</strong> ${c.case_type} | <strong>Filing Date:</strong> ${c.filing_date}</div>
                <div><strong>Parties:</strong> ${c.petitioner} <em>vs.</em> ${c.respondent}</div>
                ${c.has_stay_injunction ? '<div style="color: #ef4444; font-weight: 700; margin-top: 4px;">⚠️ Active Interim Injunction / Stay Order Restraining Transfer</div>' : ''}
                <div style="margin-top: 6px; font-style: italic; color: var(--text-muted);">${c.case_summary || ''}</div>
                ${c.history && c.history.length > 0 ? `
                    <div style="margin-top: 8px; border-top: 1px dotted var(--border-glass); padding-top: 6px;">
                        <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">Recorded Proceedings (${c.history.length} orders):</span>
                        <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 0.8rem;">
                            ${c.history.map(h => `<li><strong>${h.hearing_date}:</strong> ${h.order_summary} (Next: ${h.next_hearing_date || 'N/A'})</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderEncumbrances(encList) {
    const container = document.getElementById('encDetails');
    if (!encList || encList.length === 0) {
        container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--success);">
                <strong style="display: block; margin-bottom: 4px;">✔ Clear Encumbrance Certificate</strong>
                <span style="font-size: 0.85rem; color: var(--text-muted);">No adverse registered mortgage, lien, or court attachment found in this record.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = encList.map(e => `
        <div style="border: 1px solid var(--border-glass); border-radius: var(--radius-xs); padding: 12px; margin-bottom: 10px; background: rgba(255,255,255,0.02);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: var(--text-primary); font-size: 0.9rem;">${e.nature_of_deed}</strong>
                <span class="status-badge" style="background: rgba(245,158,11,0.2); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
                    ${e.status}
                </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                <div><strong>Document No:</strong> ${e.document_number || 'N/A'} | <strong>SRO:</strong> ${e.sro_office || 'N/A'}</div>
                <div><strong>Parties:</strong> Executant: ${e.executant || 'N/A'} | Claimant: ${e.claimant || 'N/A'}</div>
                ${e.mortgage_amount_inr ? `<div><strong>Registered Amount:</strong> ${e.mortgage_amount_inr}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function renderApproximateMap(record) {
    const mapContainer = document.getElementById('gisMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
    mapContainer.innerHTML = '';

    const coords = record.location.coordinates || { latitude: 11.0168, longitude: 76.9558 };
    const lat = coords.latitude;
    const lng = coords.longitude;

    try {
        mapInstance = L.map('gisMap', {
            center: [lat, lng],
            zoom: 13,
            scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(mapInstance);

        const circle = L.circle([lat, lng], {
            color: record.risk.color,
            fillColor: record.risk.color,
            fillOpacity: 0.25,
            radius: 800
        }).addTo(mapInstance);

        circle.bindPopup(`
            <div style="font-family: var(--font-body); font-size: 0.85rem; padding: 4px;">
                <strong>${record.location.village}</strong> (Approximate Centroid)<br>
                <span>Survey Plot: ${record.location.surveyNumber}</span><br>
                <span>Risk Level: <strong>${record.risk.level}</strong></span>
            </div>
        `);

        setTimeout(() => {
            if (mapInstance) mapInstance.invalidateSize();
        }, 300);

    } catch (e) {
        console.warn('Leaflet map render warning:', e.message);
    }
}

async function renderAiAnalystNotes(record) {
    const container = document.getElementById('aiAnalystDetails');
    const badge = document.getElementById('aiModelBadge');
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.9rem;">Generating verified legal context analysis...</div>`;

    try {
        const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: "Summarize legal risk and title findings for preliminary due diligence",
                record: record,
                language: currentLanguage
            })
        });
        const data = await res.json();
        if (data.status === 'success' && data.response) {
            badge.textContent = data.source === 'gemini_llm' ? 'Gemini AI Verified' : 'Context-Bound Legal Reasoning';
            container.innerHTML = `
                <div style="line-height: 1.6; font-size: 0.95rem; color: var(--text-secondary); white-space: pre-line;">
                    ${data.response}
                </div>
            `;
        }
    } catch (err) {
        container.innerHTML = `<div style="color: var(--text-muted);">Due diligence notes based on verified records: Title registered under ${record.parcel.owner.name} with ${record.courtCases.length} court proceedings recorded.</div>`;
    }
}

function renderSourcesList(record) {
    const container = document.getElementById('sourcesList');
    if (!container) return;

    container.innerHTML = `
        <div class="source-item">
            <div>
                <span class="source-name">1. Statutory Land Revenue Registry</span>
                <div class="source-meta">Source: ${record.parcel.source.name} (${record.parcel.source.url})</div>
            </div>
            <span class="status-badge" style="background: rgba(16,185,129,0.15); color: #10b981; font-size: 0.75rem;">Verified ${record.parcel.source.last_verified_at || 'Recent'}</span>
        </div>
        <div class="source-item">
            <div>
                <span class="source-name">2. Judicial Case Status Portal</span>
                <div class="source-meta">Source: eCourts Services / NJDG (https://ecourts.gov.in)</div>
            </div>
            <span class="status-badge" style="background: rgba(16,185,129,0.15); color: #10b981; font-size: 0.75rem;">Indexed Public Docket</span>
        </div>
        <div class="source-item">
            <div>
                <span class="source-name">3. Encumbrance & Registration Records</span>
                <div class="source-meta">Source: Inspector General of Registration, Tamil Nadu (https://tnreginet.gov.in)</div>
            </div>
            <span class="status-badge" style="background: rgba(16,185,129,0.15); color: #10b981; font-size: 0.75rem;">SRO Registered Book</span>
        </div>
    `;
}

// ============================================
// Reference Example Chips Handler
// ============================================
function initSampleChips() {
    document.querySelectorAll('.example-chip').forEach(chip => {
        chip.addEventListener('click', async () => {
            const dist = chip.getAttribute('data-dist');
            const taluk = chip.getAttribute('data-taluk');
            const village = chip.getAttribute('data-village');
            const survey = chip.getAttribute('data-survey');

            const distSelect = document.getElementById('districtSelect');
            const talukSelect = document.getElementById('talukSelect');
            const villageInput = document.getElementById('villageInput');
            const surveyInput = document.getElementById('surveyInput');

            distSelect.value = dist;
            distSelect.dispatchEvent(new Event('change'));

            // Allow taluks to populate
            setTimeout(() => {
                talukSelect.value = taluk;
                talukSelect.disabled = false;
                villageInput.value = village;
                villageInput.disabled = false;
                surveyInput.value = survey;
                hideAlert();
                executeSearch({ district: dist, taluk, village, surveyNumber: survey });
            }, 300);
        });
    });
}

// ============================================
// Voice Recognition (ta-IN, en-IN)
// ============================================
function initVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatusBanner = document.getElementById('voiceStatusBanner');
    const voiceStatusText = document.getElementById('voiceStatusText');
    const voiceCancelBtn = document.getElementById('voiceCancelBtn');

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
        if (voiceBtn) {
            voiceBtn.title = "Web Speech API is not supported in this browser. Please use Chrome or Edge.";
            voiceBtn.style.opacity = '0.7';
        }
        return;
    }

    speechRecognition = new SpeechRec();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;

    voiceBtn.addEventListener('click', () => {
        if (isRecording) {
            stopVoice();
            return;
        }
        startVoice();
    });

    if (voiceCancelBtn) {
        voiceCancelBtn.addEventListener('click', stopVoice);
    }

    function startVoice() {
        const langCode = currentLanguage === 'ta' ? 'ta-IN' : 'en-IN';
        speechRecognition.lang = langCode;

        try {
            speechRecognition.start();
            isRecording = true;
            voiceBtn.classList.add('recording');
            voiceStatusBanner.style.display = 'flex';
            voiceStatusText.textContent = currentLanguage === 'ta'
                ? 'பேசுங்கள்... மாவட்டம், தாலுகா, கிராமம், சர்வே எண் கூறவும் (எ.கா: கோயம்புத்தூர் ஆலந்துறை சர்வே 142/1)'
                : 'Listening... Speak District, Taluk, Village, and Survey Number (e.g. Coimbatore South Alanthurai Survey 142/1)';
        } catch (e) {
            console.warn('Speech recognition start failed:', e);
        }
    }

    function stopVoice() {
        if (speechRecognition && isRecording) {
            try { speechRecognition.stop(); } catch (_) {}
        }
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceStatusBanner.style.display = 'none';
    }

    speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        stopVoice();
        parseVoiceTranscript(transcript);
    };

    speechRecognition.onerror = (event) => {
        stopVoice();
        if (event.error === 'not-allowed') {
            showAlert(currentLanguage === 'ta'
                ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. பிரவுசர் அமைப்புகளில் மைக்ரோஃபோனை இயக்கவும்.'
                : 'Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error !== 'no-speech') {
            showAlert(`Voice recognition error: ${event.error}`);
        }
    };

    speechRecognition.onend = () => {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceStatusBanner.style.display = 'none';
    };
}

function parseVoiceTranscript(text) {
    const clean = text.toLowerCase();
    showAlert(`${currentLanguage === 'ta' ? 'கேட்கப்பட்டது' : 'Heard'}: "${text}"`);

    // Try to match District from cachedDistricts
    const distSelect = document.getElementById('districtSelect');
    const matchedDist = cachedDistricts.find(d => 
        clean.includes(d.name.toLowerCase()) || 
        (d.name_ta && text.includes(d.name_ta))
    );

    if (matchedDist) {
        distSelect.value = matchedDist.name;
        distSelect.dispatchEvent(new Event('change'));
    }

    // Try to extract survey number (e.g., "survey 142/1" or "சர்வே எண் 142")
    const surveyMatch = text.match(/(?:survey|survey no|சர்வே|சர்வே எண்|எண்)\s*[:.]?\s*([0-9]+(\/[0-9]+[A-Za-z0-9]*)?)/i);
    if (surveyMatch && surveyMatch[1]) {
        document.getElementById('surveyInput').value = surveyMatch[1].toUpperCase();
    }
}

// ============================================
// Context-Bound AI Legal Chatbot
// ============================================
function initChatBot() {
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatInputArea');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    if (!chatToggleBtn || !chatWindow) return;

    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        const isOpen = chatWindow.classList.contains('active');
        chatToggleBtn.querySelector('.chat-icon-open').style.display = isOpen ? 'none' : '';
        chatToggleBtn.querySelector('.chat-icon-close').style.display = isOpen ? '' : 'none';
        if (isOpen && !chatInput.disabled) chatInput.focus();
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        chatToggleBtn.querySelector('.chat-icon-open').style.display = '';
        chatToggleBtn.querySelector('.chat-icon-close').style.display = 'none';
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;

        appendChatMessage(query, 'user');
        chatInput.value = '';

        const typingEl = appendTypingIndicator();
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    record: activeRecord,
                    language: currentLanguage
                })
            });
            const data = await res.json();
            typingEl.remove();
            if (data.status === 'success' && data.response) {
                appendChatMessage(data.response, 'bot');
            } else {
                appendChatMessage(data.error || 'Failed to analyze query.', 'bot');
            }
        } catch (err) {
            typingEl.remove();
            appendChatMessage('Could not connect to AI service.', 'bot');
        }
    });

    // Suggestion chips
    document.querySelectorAll('.chat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const q = chip.getAttribute('data-query');
            if (q) {
                chatInput.value = q;
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    });
}

function updateChatbotState(record) {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatSuggestions = document.getElementById('chatSuggestions');

    if (chatInput && chatSendBtn) {
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.placeholder = currentLanguage === 'ta'
            ? 'இந்த அறிக்கை பற்றி கேள்வி கேட்கவும்...'
            : 'Ask a question about this report...';
    }
    if (chatSuggestions) chatSuggestions.style.display = 'flex';
}

function appendChatMessage(text, sender) {
    const chatBody = document.getElementById('chatBody');
    const msg = document.createElement('div');
    msg.classList.add('chat-msg', sender === 'user' ? 'user-msg' : 'bot-msg');
    const bubble = document.createElement('div');
    bubble.classList.add('msg-bubble');
    bubble.style.whiteSpace = 'pre-line';
    bubble.textContent = text;
    msg.appendChild(bubble);
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function appendTypingIndicator() {
    const chatBody = document.getElementById('chatBody');
    const msg = document.createElement('div');
    msg.classList.add('chat-msg', 'bot-msg');
    msg.innerHTML = `<div class="msg-bubble" style="font-style: italic; color: var(--text-muted);">${currentLanguage === 'ta' ? 'ஆய்வு செய்யப்படுகிறது...' : 'Analyzing verified record...'}</div>`;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
}
