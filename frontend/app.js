/**
 * LandGuard — Main Client Application
 * Handles 4-tier location selection, real API search, bilingual localization (EN/TA),
 * Web Speech voice recognition (en-IN, ta-IN), Leaflet approximate map, and context-bound AI chat.
 * ZERO CLIENT-SIDE MOCK GENERATION.
 */

let mapInstance = null;
let mapTileLayer = null;
let currentMapLayerType = 'street';
let activeRecord = null;
let currentCourtFilter = 'all';
let currentEncFilter = 'all';
let latestAiAnalysisText = '';
let currentLanguage = localStorage.getItem('landguard-language') || 'en';
let currentTheme = localStorage.getItem('landguard-theme') || 'dark';
let speechRecognition = null;
let isRecording = false;
let voiceRecognitionTimeout = null;
let voiceDraft = null;

// Complete bilingual translation dictionary
const TRANSLATIONS = {
    ta: {
        nav_home: "முகப்பு",
        nav_search: "தேடல்",
        nav_features: "அம்சங்கள்",
        nav_about: "பற்றி",
        nav_gateway_status: "TN Gateway நேரலை",
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
        btn_share: "அறிக்கையை நகலெடு",
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
        about_desc_1: "தமிழ்நாடு நில வாங்குபவர்கள், வழக்கறிஞர்கள், மற்றும் நிதி நிறுவனங்களுக்கு நம்பகமான முதற்கட்ட ஆய்வு தகவல்களை வழங்குவதற்காக LandGuard உருவாக்கப்பட்டுள்ளது.",
        toast_copied: "அறிக்கை சுருக்கம் நகலெடுக்கப்பட்டது",
        toast_cnr_copied: "CNR எண் நகலெடுக்கப்பட்டது",
        toast_doc_copied: "ஆவண எண் நகலெடுக்கப்பட்டது"
    },
    en: {
        nav_home: "Home",
        nav_search: "Search",
        nav_features: "Features",
        nav_about: "About",
        nav_gateway_status: "TN Gateway Live",
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
        btn_share: "Copy Abstract",
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
        about_desc_1: "LandGuard is developed for Tamil Nadu property buyers, advocates, and lending institutions seeking verifiable preliminary due diligence.",
        toast_copied: "Report abstract copied to clipboard",
        toast_cnr_copied: "CNR number copied to clipboard",
        toast_doc_copied: "Document number copied to clipboard"
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
    initMobileMenu();
    initClearButtons();
    initActionsBar();
    initFilterTabs();
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
        distSelect.classList.remove('is-invalid');

        talukSelect.innerHTML = `<option value="" disabled selected>${t('opt_select_taluk')}</option>`;
        talukSelect.disabled = true;
        villageInput.value = '';
        villageInput.disabled = true;
        surveyInput.value = '';
        villageSuggestions.classList.remove('active');
        updateClearButtons();

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
        talukSelect.classList.remove('is-invalid');
        villageInput.value = '';
        villageInput.disabled = false;
        surveyInput.value = '';
        updateClearButtons();
        villageInput.focus();
    });

    // Village Autocomplete Search (Debounced API call)
    let debounceTimer = null;
    const villageSpinner = document.getElementById('villageSpinner');

    villageInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        villageInput.classList.remove('is-invalid');
        updateClearButtons();
        const query = villageInput.value.trim();
        const dist = distSelect.value;
        const taluk = talukSelect.value;

        if (query.length < 1) {
            villageSuggestions.innerHTML = '';
            villageSuggestions.classList.remove('active');
            if (villageSpinner) villageSpinner.style.display = 'none';
            return;
        }

        if (villageSpinner) villageSpinner.style.display = 'block';

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/villages?district=${encodeURIComponent(dist)}&taluk=${encodeURIComponent(taluk)}&q=${encodeURIComponent(query)}&limit=15`);
                const data = await res.json();
                villageSuggestions.innerHTML = '';
                if (villageSpinner) villageSpinner.style.display = 'none';

                if (data.status === 'success' && data.results && data.results.length > 0) {
                    data.results.forEach(v => {
                        const item = document.createElement('div');
                        item.classList.add('suggestion-item');

                        // Highlight matched query in suggestion
                        const lowerName = v.name.toLowerCase();
                        const lowerQuery = query.toLowerCase();
                        const idx = lowerName.indexOf(lowerQuery);
                        if (idx !== -1) {
                            const before = escapeHtml(v.name.substring(0, idx));
                            const match = escapeHtml(v.name.substring(idx, idx + query.length));
                            const after = escapeHtml(v.name.substring(idx + query.length));
                            item.innerHTML = `${before}<strong class="match-highlight">${match}</strong>${after}`;
                        } else {
                            item.textContent = v.name;
                        }

                        item.addEventListener('click', () => {
                            villageInput.value = v.name;
                            villageSuggestions.classList.remove('active');
                            updateClearButtons();
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
                if (villageSpinner) villageSpinner.style.display = 'none';
                console.error('Village search failed:', err);
            }
        }, 180);
    });

    // Keyboard navigation in village autocomplete
    handleKeyboardSuggestions(villageInput, villageSuggestions, (val) => {
        villageInput.value = val;
        updateClearButtons();
        surveyInput.focus();
        loadSurveySuggestions(val);
    });

    // Survey Suggestions on focus and input
    surveyInput.addEventListener('focus', () => {
        const v = villageInput.value.trim();
        if (v) loadSurveySuggestions(v);
    });

    surveyInput.addEventListener('input', () => {
        surveyInput.classList.remove('is-invalid');
        updateClearButtons();
    });

    // Keyboard navigation in survey autocomplete
    handleKeyboardSuggestions(surveyInput, surveySuggestions, (val) => {
        surveyInput.value = val;
        updateClearButtons();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#villageInput') && !e.target.closest('#villageSuggestions') && !e.target.closest('#villageClearBtn')) {
            villageSuggestions.classList.remove('active');
        }
        if (!e.target.closest('#surveyInput') && !e.target.closest('#surveySuggestions') && !e.target.closest('#surveyClearBtn')) {
            surveySuggestions.classList.remove('active');
        }
    });
}

function handleKeyboardSuggestions(inputEl, dropdownEl, onSelect) {
    inputEl.addEventListener('keydown', (e) => {
        if (!dropdownEl.classList.contains('active')) return;
        const items = Array.from(dropdownEl.querySelectorAll('.suggestion-item'));
        if (items.length === 0) return;

        let currentIndex = items.findIndex(it => it.classList.contains('highlighted'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items.forEach(it => it.classList.remove('highlighted'));
            items[nextIndex].classList.add('highlighted');
            items[nextIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items.forEach(it => it.classList.remove('highlighted'));
            items[prevIndex].classList.add('highlighted');
            items[prevIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            if (currentIndex !== -1 && items[currentIndex]) {
                e.preventDefault();
                const text = items[currentIndex].textContent.replace(/^Survey\s+/, '').trim();
                onSelect(text);
                dropdownEl.classList.remove('active');
            }
        } else if (e.key === 'Escape') {
            dropdownEl.classList.remove('active');
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
                item.innerHTML = `Survey <strong class="match-highlight">${escapeHtml(sn)}</strong>`;
                item.addEventListener('click', () => {
                    surveyInput.value = sn;
                    surveySuggestions.classList.remove('active');
                    updateClearButtons();
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

    // Reset filters
    currentCourtFilter = 'all';
    currentEncFilter = 'all';

    const courtFilterTabs = document.getElementById('courtFilterTabs');
    if (courtFilterTabs) {
        courtFilterTabs.style.display = (record.courtCases && record.courtCases.length > 0) ? 'flex' : 'none';
        courtFilterTabs.querySelectorAll('.tab-chip').forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === 'all'));
    }

    const encFilterTabs = document.getElementById('encFilterTabs');
    if (encFilterTabs) {
        encFilterTabs.style.display = (record.encumbrances && record.encumbrances.length > 0) ? 'flex' : 'none';
        encFilterTabs.querySelectorAll('.tab-chip').forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === 'all'));
    }

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

            let jumpBtnHtml = '';
            const combined = (f.name + ' ' + f.description).toLowerCase();
            if (combined.includes('suit') || combined.includes('injunction') || combined.includes('stay') || combined.includes('lawsuit')) {
                jumpBtnHtml = `
                    <button type="button" class="factor-jump-btn" data-target="courtCard" title="Jump to court proceedings card">
                        <span>View Lawsuit Details</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                `;
            } else if (combined.includes('mortgage') || combined.includes('encumbrance') || combined.includes('attachment') || combined.includes('hypothec')) {
                jumpBtnHtml = `
                    <button type="button" class="factor-jump-btn" data-target="encCard" title="Jump to encumbrances card">
                        <span>View Encumbrance Record</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                `;
            }

            el.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: var(--text-primary); font-size: 0.9rem;">${escapeHtml(f.name)}</strong>
                    <span class="status-badge" style="background: ${f.severity === 'danger' ? 'rgba(239,68,68,0.2)' : f.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${f.severity === 'danger' ? '#ef4444' : f.severity === 'warning' ? '#f59e0b' : '#10b981'}; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700;">
                        ${f.weight > 0 ? '+' + f.weight + ' pts' : '0 pts'}
                    </span>
                </div>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(f.description)}</p>
                ${jumpBtnHtml}
            `;
            riskFactors.appendChild(el);
        });

        // Wire jump buttons to smooth-scroll
        riskFactors.querySelectorAll('.factor-jump-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetEl.classList.remove('target-highlight');
                    void targetEl.offsetWidth;
                    targetEl.classList.add('target-highlight');
                }
            });
        });
    } else {
        riskFactors.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No adverse litigation or encumbrance risk factors registered in this record.</p>`;
    }
}

function renderOwnerDetails(owner) {
    const container = document.getElementById('ownerDetails');
    if (!owner) return;
    const statusClass = owner.verification_status === 'VERIFIED' ? 'status-badge clear' : 'status-badge pending';
    container.innerHTML = `
        <div class="detail-row"><span class="detail-label">Titleholder Name</span><span class="detail-value font-bold">${escapeHtml(owner.name)}</span></div>
        <div class="detail-row"><span class="detail-label">Father / Spouse Name</span><span class="detail-value">${escapeHtml(owner.father_name)}</span></div>
        <div class="detail-row"><span class="detail-label">Deed Registration Date</span><span class="detail-value mono">${escapeHtml(owner.registration_date)}</span></div>
        <div class="detail-row"><span class="detail-label">Statutory Source</span><span class="detail-value provenance-source">${escapeHtml(owner.source_name || 'Tamil Nadu Land Records Registry (e-Services)')}</span></div>
        <div class="detail-row"><span class="detail-label">Source Reference</span><span class="detail-value mono">${escapeHtml(owner.source_reference || 'N/A')}</span></div>
        <div class="detail-row"><span class="detail-label">Verification Date</span><span class="detail-value provenance-date mono">${escapeHtml(owner.last_verified_at || 'Unverified')}</span></div>
        <div class="detail-row"><span class="detail-label">Verification Status</span><span class="detail-value"><span class="${statusClass}">${escapeHtml(owner.verification_status || 'DEMO')}</span></span></div>
        ${owner.is_demo ? '<div class="detail-row" style="border: none;"><span class="detail-label" style="color: var(--warning-ink);">Legal Evidence Notice</span><span class="detail-value" style="color: var(--warning-ink); font-size: 11px;">[DEMO RECORD &bull; Not Admissible as Legal Evidence]</span></div>' : ''}
    `;
}

function renderLandDetails(land) {
    const container = document.getElementById('landDetails');
    if (!land) return;
    container.innerHTML = `
        <div class="detail-row"><span class="detail-label">Survey Number</span><span class="detail-value font-bold mono">${escapeHtml(land.surveyNo)}</span></div>
        <div class="detail-row"><span class="detail-label">Subdivision</span><span class="detail-value mono">${escapeHtml(land.subdivision || 'N/A')}</span></div>
        <div class="detail-row"><span class="detail-label">Total Extent / Area</span><span class="detail-value">${escapeHtml(land.extent)}</span></div>
        <div class="detail-row"><span class="detail-label">Revenue Classification</span><span class="detail-value">${escapeHtml(land.classification)}</span></div>
        <div class="detail-row"><span class="detail-label">Patta Passbook No.</span><span class="detail-value mono">${escapeHtml(land.passbook)}</span></div>
        <div class="detail-row"><span class="detail-label">Guideline / Market Estimate</span><span class="detail-value mono">${escapeHtml(land.marketValue)}</span></div>
    `;
}

function renderCourtCases(cases) {
    const container = document.getElementById('courtCases');
    if (!cases || cases.length === 0) {
        container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--positive-ink);">
                <strong style="display: block; margin-bottom: 4px;">0 Active Lawsuits Recorded</strong>
                <span style="font-size: 0.85rem; color: var(--muted);">No pending original suits or title litigation registered against this parcel in the current docket.</span>
            </div>
        `;
        return;
    }

    const filtered = currentCourtFilter === 'stay' ? cases.filter(c => c.has_stay_injunction) : cases;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--muted);">
                <strong style="display: block; margin-bottom: 4px;">No Injunctions in Filter</strong>
                <span style="font-size: 0.85rem;">None of the recorded suits currently carry an active interim injunction or stay order.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(c => {
        const statusBadgeClass = c.verification_status === 'VERIFIED' ? 'status-badge clear' : 'status-badge pending';
        const cnrBtn = c.cnr_number ? `
            <button type="button" class="copy-chip-btn copy-cnr-btn" data-cnr="${escapeHtml(c.cnr_number)}" title="Copy CNR Number">
                Copy CNR
            </button>
        ` : '';

        return `
        <div class="court-case-item">
            <div class="case-header">
                <div>
                    <span class="case-number">${escapeHtml(c.case_number)}</span>
                    <span style="font-size: 0.8rem; color: var(--faint); margin-left: 8px;">CNR: <span class="mono">${escapeHtml(c.cnr_number || 'N/A')}</span>${cnrBtn}</span>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <span class="${statusBadgeClass}">${escapeHtml(c.verification_status || 'DEMO')}</span>
                    <span class="status-badge active">${escapeHtml(c.current_status)}</span>
                </div>
            </div>
            <div class="case-details">
                <div class="case-detail"><span class="case-detail-label">Court</span><span>${escapeHtml(c.court_name)}</span></div>
                <div class="case-detail"><span class="case-detail-label">Type & Date</span><span>${escapeHtml(c.case_type)} &bull; Filed: <span class="mono">${escapeHtml(c.filing_date)}</span></span></div>
                <div class="case-detail"><span class="case-detail-label">Parties</span><span>${escapeHtml(c.petitioner)} <em>vs.</em> ${escapeHtml(c.respondent)}</span></div>
                <div class="case-detail"><span class="case-detail-label">Source</span><span class="provenance-source">${escapeHtml(c.source_name || 'eCourts Services (NJDG)')} (<span class="mono">${escapeHtml(c.source_reference || c.case_number)}</span>)</span></div>
                <div class="case-detail"><span class="case-detail-label">Verified At</span><span class="provenance-date mono">${escapeHtml(c.last_verified_at || 'Unverified')}</span></div>
                ${c.has_stay_injunction ? '<div style="color: var(--negative-ink); font-weight: 600; margin-top: 4px;">Active Interim Injunction / Stay Order Restraining Transfer</div>' : ''}
                ${c.is_demo ? '<div style="font-size: 11px; color: var(--warning-ink); margin-top: 2px;">[DEMO RECORD &mdash; Sample Benchmark &bull; Not Admissible as Legal Evidence]</div>' : ''}
                <div style="margin-top: 6px; font-style: italic; color: var(--muted);">${escapeHtml(c.case_summary || '')}</div>
                ${c.history && c.history.length > 0 ? `
                    <div style="margin-top: 8px; border-top: 1px solid var(--rule); padding-top: 6px;">
                        <span style="font-size: 0.75rem; font-weight: 600; color: var(--faint);">Recorded Proceedings (${c.history.length} orders):</span>
                        <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 0.8rem; color: var(--muted);">
                            ${c.history.map(h => `<li><strong class="mono">${escapeHtml(h.hearing_date)}:</strong> ${escapeHtml(h.order_summary)} (Next: <span class="mono">${escapeHtml(h.next_hearing_date || 'N/A')}</span>)</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    }).join('');

    container.querySelectorAll('.copy-cnr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cnr = btn.getAttribute('data-cnr');
            if (cnr) copyToClipboard(cnr, t('toast_cnr_copied'));
        });
    });
}

function renderEncumbrances(encList) {
    const container = document.getElementById('encDetails');
    if (!encList || encList.length === 0) {
        container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--positive-ink);">
                <strong style="display: block; margin-bottom: 4px;">Clear Encumbrance Certificate</strong>
                <span style="font-size: 0.85rem; color: var(--muted);">No adverse registered mortgage, lien, or court attachment found in this record.</span>
            </div>
        `;
        return;
    }

    const filtered = currentEncFilter === 'mortgage'
        ? encList.filter(e => /mortgage|hypothec|loan/i.test(e.nature_of_deed || ''))
        : encList;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--muted);">
                <strong style="display: block; margin-bottom: 4px;">No Mortgages in Filter</strong>
                <span style="font-size: 0.85rem;">No active bank mortgages recorded in this encumbrance certificate.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(e => {
        const statusBadgeClass = e.verification_status === 'VERIFIED' ? 'status-badge clear' : 'status-badge pending';
        const docBtn = e.document_number ? `
            <button type="button" class="copy-chip-btn copy-doc-btn" data-doc="${escapeHtml(e.document_number)}" title="Copy Document Number">
                Copy Doc
            </button>
        ` : '';

        return `
        <div class="encumbrance-item">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: var(--text); font-size: 0.9rem;">${escapeHtml(e.nature_of_deed)}</strong>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <span class="${statusBadgeClass}">${escapeHtml(e.verification_status || 'DEMO')}</span>
                    <span class="status-badge pending">${escapeHtml(e.status)}</span>
                </div>
            </div>
            <div style="font-size: 0.85rem; color: var(--muted); line-height: 1.45;">
                <div><span class="case-detail-label">Document:</span> <span class="mono">${escapeHtml(e.document_number || 'N/A')}</span>${docBtn} &bull; <strong>SRO:</strong> ${escapeHtml(e.sro_office || 'N/A')}</div>
                <div><span class="case-detail-label">Parties:</span> Executant: ${escapeHtml(e.executant || 'N/A')} &bull; Claimant: ${escapeHtml(e.claimant || 'N/A')}</div>
                ${e.mortgage_amount_inr ? `<div><span class="case-detail-label">Amount:</span> <span class="mono">${escapeHtml(e.mortgage_amount_inr)}</span></div>` : ''}
                <div><span class="case-detail-label">Source:</span> <span class="provenance-source">${escapeHtml(e.source_name || 'TNREGINET')}</span> &bull; <strong>Verified At:</strong> <span class="provenance-date mono">${escapeHtml(e.last_verified_at || 'Unverified')}</span></div>
                ${e.is_demo ? '<div style="font-size: 11px; color: var(--warning-ink); margin-top: 2px;">[DEMO RECORD &mdash; Sample Benchmark &bull; Not Admissible as Legal Evidence]</div>' : ''}
            </div>
        </div>
    `;
    }).join('');

    container.querySelectorAll('.copy-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const doc = btn.getAttribute('data-doc');
            if (doc) copyToClipboard(doc, t('toast_doc_copied'));
        });
    });
}

function setMapTileLayer(type) {
    if (!mapInstance) return;
    if (mapTileLayer) {
        mapInstance.removeLayer(mapTileLayer);
    }
    currentMapLayerType = type;
    if (type === 'satellite') {
        mapTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri &mdash; Earthstar Geographics',
            maxZoom: 18
        });
    } else {
        mapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        });
    }
    mapTileLayer.addTo(mapInstance);

    const btnStreet = document.getElementById('btnStreetLayer');
    const btnSat = document.getElementById('btnSatelliteLayer');
    if (btnStreet && btnSat) {
        btnStreet.classList.toggle('active', type === 'street');
        btnSat.classList.toggle('active', type === 'satellite');
    }
}

function renderApproximateMap(record) {
    const mapContainer = document.getElementById('gisMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        mapTileLayer = null;
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

        setMapTileLayer(currentMapLayerType || 'street');

        const circle = L.circle([lat, lng], {
            color: record.risk.color,
            fillColor: record.risk.color,
            fillOpacity: 0.25,
            radius: 800
        }).addTo(mapInstance);

        circle.bindPopup(`
            <div style="font-family: var(--font-body); font-size: 0.85rem; padding: 4px;">
                <strong>${escapeHtml(record.location.village)}</strong> (Approximate Centroid)<br>
                <span>Survey Plot: ${escapeHtml(record.location.surveyNumber)}</span><br>
                <span>Risk Level: <strong>${escapeHtml(record.risk.level)}</strong></span>
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
                analysis_context_id: record.analysis_context_id,
                language: currentLanguage
            })
        });
        const data = await res.json();
        if (data.status === 'success' && data.response) {
            badge.textContent = data.source === 'gemini_llm' ? 'Gemini AI Verified' : 'Context-Bound Legal Reasoning';
            latestAiAnalysisText = data.response;
            container.innerHTML = `
                <div class="ai-analysis-formatted" style="line-height: 1.6; font-size: 0.95rem; color: var(--text-secondary);">
                    ${formatMarkdown(data.response)}
                </div>
            `;
        }
    } catch (err) {
        const fallback = record.is_demo
            ? 'This is demonstration data and must not be treated as an actual legal record.'
            : 'No verified legal record is available for analysis.';
        latestAiAnalysisText = fallback;
        container.innerHTML = `<div style="color: var(--text-muted);">${escapeHtml(fallback)}</div>`;
    }
}

function renderSourcesList(record) {
    const container = document.getElementById('sourcesList');
    if (!container) return;

    const ownerSrc = record.parcel && record.parcel.owner ? record.parcel.owner : {};
    const firstCase = (record.courtCases && record.courtCases[0]) || {};
    const firstEnc = (record.encumbrances && record.encumbrances[0]) || {};

    container.innerHTML = `
        <div class="source-item">
            <div>
                <span class="source-name">1. Statutory Land Revenue Registry</span>
                <div class="source-meta">
                    Source: <span class="provenance-source">${ownerSrc.source_name || (record.parcel && record.parcel.source && record.parcel.source.name) || 'Tamil Nadu Land Records Registry (e-Services)'}</span> &bull; Ref: <span class="mono">${ownerSrc.source_reference || 'N/A'}</span>
                    <br>Retrieved: <span class="mono">${ownerSrc.retrieved_at ? ownerSrc.retrieved_at.split('T')[0] : 'N/A'}</span> &bull; Verified: <span class="provenance-date mono">${ownerSrc.last_verified_at || 'Unverified'}</span>
                </div>
            </div>
            <span class="status-badge ${ownerSrc.verification_status === 'VERIFIED' ? 'clear' : 'pending'}">${ownerSrc.verification_status || 'DEMO'}</span>
        </div>
        <div class="source-item">
            <div>
                <span class="source-name">2. Judicial Case Status Portal</span>
                <div class="source-meta">
                    Source: <span class="provenance-source">${firstCase.source_name || 'eCourts Services (NJDG)'}</span> &bull; Ref: <span class="mono">${firstCase.source_reference || 'N/A'}</span>
                    <br>Retrieved: <span class="mono">${firstCase.retrieved_at ? firstCase.retrieved_at.split('T')[0] : 'N/A'}</span> &bull; Verified: <span class="provenance-date mono">${firstCase.last_verified_at || 'Unverified'}</span>
                </div>
            </div>
            <span class="status-badge ${firstCase.verification_status === 'VERIFIED' ? 'clear' : 'pending'}">${firstCase.verification_status || 'DEMO'}</span>
        </div>
        <div class="source-item">
            <div>
                <span class="source-name">3. Encumbrance & Registration Records</span>
                <div class="source-meta">
                    Source: <span class="provenance-source">${firstEnc.source_name || 'TNREGINET'}</span> &bull; Ref: <span class="mono">${firstEnc.source_reference || 'N/A'}</span>
                    <br>Retrieved: <span class="mono">${firstEnc.retrieved_at ? firstEnc.retrieved_at.split('T')[0] : 'N/A'}</span> &bull; Verified: <span class="provenance-date mono">${firstEnc.last_verified_at || 'Unverified'}</span>
                </div>
            </div>
            <span class="status-badge ${firstEnc.verification_status === 'VERIFIED' ? 'clear' : 'pending'}">${firstEnc.verification_status || 'DEMO'}</span>
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
            voiceBtn.setAttribute('aria-disabled', 'true');
            voiceBtn.addEventListener('click', () => showAlert(currentLanguage === 'ta'
                ? 'இந்த பிரவுசரில் குரல் அறிதல் ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge-ஐ முயற்சிக்கவும்.'
                : 'Voice recognition is not supported in this browser. Please use Chrome or Edge.'));
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
            clearTimeout(voiceRecognitionTimeout);
            voiceRecognitionTimeout = setTimeout(() => {
                if (!isRecording) return;
                stopVoice();
                showAlert(currentLanguage === 'ta'
                    ? 'குரல் உள்ளீடு நேரம் முடிந்தது. மீண்டும் முயற்சித்து தெளிவாகப் பேசவும்.'
                    : 'Voice input timed out. Please try again and speak clearly.');
            }, 12000);
        } catch (e) {
            console.warn('Speech recognition start failed:', e);
            showAlert(currentLanguage === 'ta'
                ? 'குரல் அறிதலைத் தொடங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
                : 'Could not start voice recognition. Please try again.');
        }
    }

    function stopVoice() {
        clearTimeout(voiceRecognitionTimeout);
        voiceRecognitionTimeout = null;
        if (speechRecognition && isRecording) {
            try { speechRecognition.stop(); } catch (_) { }
        }
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceStatusBanner.style.display = 'none';
    }

    speechRecognition.onresult = (event) => {
        const transcript = event.results && event.results[0] && event.results[0][0]
            ? event.results[0][0].transcript.trim()
            : '';
        stopVoice();
        if (!transcript) {
            showAlert(currentLanguage === 'ta' ? 'குரல் உள்ளீடு கேட்கப்படவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'No speech was detected. Please try again.');
            return;
        }
        parseVoiceTranscript(transcript);
    };

    speechRecognition.onerror = (event) => {
        stopVoice();
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            showAlert(currentLanguage === 'ta'
                ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. பிரவுசர் அமைப்புகளில் மைக்ரோஃபோனை இயக்கவும்.'
                : 'Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
            showAlert(currentLanguage === 'ta' ? 'பேச்சு கேட்கப்படவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'No speech was detected. Please try again.');
        } else if (event.error === 'network') {
            showAlert(currentLanguage === 'ta' ? 'குரல் அறிதல் நெட்வொர்க் பிழை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.' : 'Voice recognition had a network error. Check your connection and try again.');
        } else if (event.error !== 'aborted') {
            showAlert(currentLanguage === 'ta' ? 'குரல் அறிதல் பிழை. மீண்டும் முயற்சிக்கவும்.' : 'Voice recognition could not understand that. Please try again.');
        }
    };

    speechRecognition.onend = () => {
        clearTimeout(voiceRecognitionTimeout);
        voiceRecognitionTimeout = null;
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceStatusBanner.style.display = 'none';
    };
}

async function parseVoiceTranscript(text) {
    const parser = window.LandGuardVoiceParser;
    if (!parser) {
        showAlert('Voice parser could not be loaded. Please type the search details.');
        return;
    }
    if (!text || !text.trim()) {
        showAlert(currentLanguage === 'ta' ? 'காலியான குரல் உள்ளீடு. மீண்டும் முயற்சிக்கவும்.' : 'Empty voice transcript. Please try again.');
        return;
    }
    if (!cachedDistricts.length) {
        showAlert(currentLanguage === 'ta' ? 'இடத் தரவு இன்னும் ஏற்றப்படுகிறது. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்.' : 'Location data is still loading. Please try voice search again in a moment.');
        return;
    }

    voiceDraft = {
        text,
        parsed: parser.parseVoiceTranscript(text, { districts: cachedDistricts }),
        selections: {},
        candidates: {},
        error: ''
    };
    hideAlert();
    await resolveVoiceDraft();
}

function chooseVoiceCandidate(field, candidates) {
    const chosenName = voiceDraft.selections[field];
    const explicit = candidates.find(item => item.name === chosenName);
    return explicit || (candidates.length === 1 ? candidates[0] : null);
}

async function getVoiceJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Location lookup failed');
    const data = await response.json();
    if (data.status !== 'success') throw new Error(data.error || 'Location lookup failed');
    return data;
}

async function resolveVoiceDraft() {
    if (!voiceDraft || !window.LandGuardVoiceParser) return;
    const parser = window.LandGuardVoiceParser;
    const transcript = voiceDraft.parsed.normalizedTranscript;
    try {
        const districts = parser.findLocationMatches(transcript, cachedDistricts, voiceDraft.parsed.hints.district);
        voiceDraft.candidates.district = districts;
        const district = chooseVoiceCandidate('district', districts);
        voiceDraft.resolved = { district, taluk: null, village: null, surveyNumber: voiceDraft.parsed.surveyNumber };
        if (!district) return renderVoiceReview();

        const talukData = await getVoiceJson(`/api/taluks?district=${encodeURIComponent(district.name)}`);
        const taluks = parser.findLocationMatches(transcript, talukData.taluks, voiceDraft.parsed.hints.taluk);
        voiceDraft.candidates.taluk = taluks;
        const taluk = chooseVoiceCandidate('taluk', taluks);
        voiceDraft.resolved.taluk = taluk;
        if (!taluk) return renderVoiceReview();

        const villageHint = voiceDraft.parsed.hints.village;
        const villageData = await getVoiceJson(`/api/villages?district=${encodeURIComponent(district.name)}&taluk=${encodeURIComponent(taluk.name)}&q=${encodeURIComponent(villageHint)}&limit=200`);
        // If no labelled phrase was available, the API returns the scoped catalogue;
        // matching remains strict and is never inferred from a similar name.
        const villages = parser.findLocationMatches(transcript, villageData.results, villageHint);
        voiceDraft.candidates.village = villages;
        voiceDraft.resolved.village = chooseVoiceCandidate('village', villages);
        voiceDraft.error = '';
    } catch (error) {
        console.warn('Voice location lookup failed:', error);
        voiceDraft.error = currentLanguage === 'ta'
            ? 'குரல் இடப் பொருத்தங்களைச் சரிபார்க்க முடியவில்லை. விவரங்களைத் தட்டச்சு செய்து மீண்டும் முயற்சிக்கவும்.'
            : 'We could not verify voice location matches. Please type the details and try again.';
    }
    renderVoiceReview();
}

function voiceFieldLabel(field) {
    return ({ district: 'District', taluk: 'Taluk', village: 'Village', surveyNumber: 'Survey number' })[field] || field;
}

function renderVoiceReview() {
    const panel = document.getElementById('voiceReview');
    if (!panel || !voiceDraft) return;
    const { resolved, candidates, parsed } = voiceDraft;
    panel.replaceChildren();
    panel.hidden = false;

    const title = document.createElement('h3');
    title.textContent = currentLanguage === 'ta' ? 'குரல் தேடலை உறுதிப்படுத்தவும்' : 'Confirm voice search details';
    const intro = document.createElement('p');
    intro.textContent = `${currentLanguage === 'ta' ? 'கேட்கப்பட்டது' : 'Heard'}: “${parsed.transcript}”`;
    panel.append(title, intro);

    if (voiceDraft.error) {
        const error = document.createElement('p');
        error.setAttribute('role', 'alert');
        error.textContent = voiceDraft.error;
        panel.appendChild(error);
    }

    const grid = document.createElement('div');
    grid.className = 'voice-review-grid';
    ['district', 'taluk', 'village', 'surveyNumber'].forEach(field => {
        const cell = document.createElement('div');
        const value = resolved && resolved[field];
        cell.className = `voice-review-field${value ? '' : ' missing'}`;
        const label = document.createElement('span');
        label.textContent = voiceFieldLabel(field);
        const strong = document.createElement('strong');
        strong.textContent = field === 'surveyNumber' ? (value || 'Not recognized') : (value ? value.name : 'Not recognized');
        cell.append(label, strong);
        grid.appendChild(cell);
    });
    panel.appendChild(grid);

    ['district', 'taluk', 'village'].forEach(field => {
        const choices = candidates[field] || [];
        if (resolved && resolved[field] || choices.length < 2) return;
        const instruction = document.createElement('p');
        instruction.textContent = `More than one ${voiceFieldLabel(field).toLowerCase()} matches your speech. Select one to continue:`;
        const list = document.createElement('div');
        list.className = 'voice-suggestions';
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'voice-suggestion-btn';
            button.dataset.voiceField = field;
            button.dataset.voiceValue = choice.name;
            button.textContent = choice.name;
            list.appendChild(button);
        });
        panel.append(instruction, list);
    });

    const complete = resolved && resolved.district && resolved.taluk && resolved.village && resolved.surveyNumber && !voiceDraft.error;
    const guidance = document.createElement('p');
    guidance.textContent = complete
        ? 'Review the verified matches, then explicitly confirm before LandGuard searches.'
        : 'LandGuard did not guess missing or ambiguous details. Choose a suggestion or complete the form manually.';
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.id = 'voiceConfirmBtn';
    confirm.className = 'voice-confirm-btn';
    confirm.disabled = !complete;
    confirm.textContent = currentLanguage === 'ta' ? 'உறுதிசெய்து தேடவும்' : 'Confirm and search';
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.id = 'voiceDismissBtn';
    dismiss.className = 'voice-dismiss-btn';
    dismiss.textContent = currentLanguage === 'ta' ? 'மூடு' : 'Dismiss';
    panel.append(guidance, confirm, dismiss);

    panel.querySelectorAll('.voice-suggestion-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const field = button.dataset.voiceField;
            voiceDraft.selections[field] = button.dataset.voiceValue;
            if (field === 'district') delete voiceDraft.selections.taluk;
            if (field === 'district' || field === 'taluk') delete voiceDraft.selections.village;
            await resolveVoiceDraft();
        });
    });
    confirm.addEventListener('click', confirmVoiceSearch);
    dismiss.addEventListener('click', () => { panel.hidden = true; });
}

function confirmVoiceSearch() {
    if (!voiceDraft || !voiceDraft.resolved) return;
    const { district, taluk, village, surveyNumber } = voiceDraft.resolved;
    if (!district || !taluk || !village || !surveyNumber) return;
    document.getElementById('districtSelect').value = district.name;
    const talukSelect = document.getElementById('talukSelect');
    if (!Array.from(talukSelect.options).some(option => option.value === taluk.name)) {
        talukSelect.append(new Option(taluk.name, taluk.name));
    }
    talukSelect.value = taluk.name;
    talukSelect.disabled = false;
    const villageInput = document.getElementById('villageInput');
    villageInput.disabled = false;
    villageInput.value = village.name;
    document.getElementById('surveyInput').value = surveyNumber;
    updateClearButtons();
    document.getElementById('voiceReview').hidden = true;
    executeSearch({ district: district.name, taluk: taluk.name, village: village.name, surveyNumber });
}

// ============================================
// Context-Bound AI Legal Chatbot
// ============================================
function initChatBot() {
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatExpandBtn = document.getElementById('chatExpandBtn');
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

    if (chatExpandBtn) {
        chatExpandBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('expanded');
            const isExpanded = chatWindow.classList.contains('expanded');
            const expandIcon = chatExpandBtn.querySelector('.expand-icon');
            const collapseIcon = chatExpandBtn.querySelector('.collapse-icon');
            if (expandIcon) expandIcon.style.display = isExpanded ? 'none' : '';
            if (collapseIcon) collapseIcon.style.display = isExpanded ? '' : 'none';
            chatExpandBtn.setAttribute('title', isExpanded ? 'Collapse Window' : 'Expand Window');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWindow.classList.contains('active')) {
            chatWindow.classList.remove('active');
            chatToggleBtn.querySelector('.chat-icon-open').style.display = '';
            chatToggleBtn.querySelector('.chat-icon-close').style.display = 'none';
        }
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

    if (sender === 'bot') {
        bubble.innerHTML = formatMarkdown(text);

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'msg-copy-btn';
        copyBtn.setAttribute('title', 'Copy response');
        copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>Copy</span>
        `;
        copyBtn.addEventListener('click', () => {
            copyToClipboard(text, 'Response copied to clipboard');
        });
        bubble.appendChild(copyBtn);
    } else {
        bubble.textContent = text;
    }

    msg.appendChild(bubble);
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function appendTypingIndicator() {
    const chatBody = document.getElementById('chatBody');
    const msg = document.createElement('div');
    msg.classList.add('chat-msg', 'bot-msg');
    msg.innerHTML = `
        <div class="msg-bubble" style="display: flex; align-items: center; gap: 6px;">
            <span class="typing-dot" style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: typingDot 1.4s infinite;"></span>
            <span class="typing-dot" style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: typingDot 1.4s 0.2s infinite;"></span>
            <span class="typing-dot" style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: typingDot 1.4s 0.4s infinite;"></span>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 6px;">${currentLanguage === 'ta' ? 'ஆய்வு செய்யப்படுகிறது...' : 'Analyzing verified record...'}</span>
        </div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
}

// ============================================
// Enhanced UI/UX Helper Implementations
// ============================================

function initClearButtons() {
    const villageInput = document.getElementById('villageInput');
    const villageClearBtn = document.getElementById('villageClearBtn');
    const surveyInput = document.getElementById('surveyInput');
    const surveyClearBtn = document.getElementById('surveyClearBtn');
    const villageSuggestions = document.getElementById('villageSuggestions');
    const surveySuggestions = document.getElementById('surveySuggestions');

    if (villageClearBtn && villageInput) {
        villageClearBtn.addEventListener('click', () => {
            villageInput.value = '';
            if (villageSuggestions) villageSuggestions.classList.remove('active');
            updateClearButtons();
            villageInput.focus();
        });
    }

    if (surveyClearBtn && surveyInput) {
        surveyClearBtn.addEventListener('click', () => {
            surveyInput.value = '';
            if (surveySuggestions) surveySuggestions.classList.remove('active');
            updateClearButtons();
            surveyInput.focus();
        });
    }
}

function updateClearButtons() {
    const villageInput = document.getElementById('villageInput');
    const villageClearBtn = document.getElementById('villageClearBtn');
    const surveyInput = document.getElementById('surveyInput');
    const surveyClearBtn = document.getElementById('surveyClearBtn');

    if (villageClearBtn && villageInput) {
        villageClearBtn.style.display = villageInput.value ? 'flex' : 'none';
    }
    if (surveyClearBtn && surveyInput) {
        surveyClearBtn.style.display = surveyInput.value ? 'flex' : 'none';
    }
}

function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navDrawer = document.getElementById('mobileNavDrawer');
    if (!menuToggle || !navDrawer) return;

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navDrawer.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navDrawer.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#mobileNavDrawer') && !e.target.closest('#mobileMenuToggle')) {
            navDrawer.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

function initActionsBar() {
    const pdfBtn = document.getElementById('pdfBtn');
    const shareBtn = document.getElementById('shareBtn');
    const copyAiBtn = document.getElementById('copyAiAnalysisBtn');
    const formulaToggle = document.getElementById('riskFormulaToggle');
    const formulaBox = document.getElementById('riskFormulaDetails');

    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            window.print();
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (!activeRecord) return;
            const loc = activeRecord.location || {};
            const risk = activeRecord.risk || {};
            const owner = activeRecord.parcel && activeRecord.parcel.owner ? activeRecord.parcel.owner : {};
            const courtCount = (activeRecord.courtCases || []).length;
            const encCount = (activeRecord.encumbrances || []).length;

            const abstractText = [
                `LANDGUARD STATUTORY DUE DILIGENCE ABSTRACT`,
                `-------------------------------------------`,
                `Location: Survey No. ${loc.surveyNumber}, ${loc.village}, ${loc.taluk}, ${loc.district}`,
                `Titleholder: ${owner.name || 'N/A'} (Reg: ${owner.registration_date || 'N/A'})`,
                `Litigation Risk: ${risk.level ? risk.level.toUpperCase() : 'N/A'} (${risk.score || 0}/100)`,
                `Active Court Proceedings: ${courtCount} recorded`,
                `Registered Encumbrances: ${encCount} recorded`,
                `Classification: ${activeRecord.is_demo ? 'DEMO RECORD' : 'VERIFIED STATUTORY AUDIT'}`,
                `Date: ${new Date().toLocaleDateString('en-IN')}`,
                `-------------------------------------------`,
                `Generated via LandGuard Tamil Nadu Land Due Diligence Platform`
            ].join('\n');

            copyToClipboard(abstractText, t('toast_copied'));
        });
    }

    if (copyAiBtn) {
        copyAiBtn.addEventListener('click', () => {
            const textToCopy = latestAiAnalysisText || (document.getElementById('aiAnalystDetails') ? document.getElementById('aiAnalystDetails').innerText : '');
            if (textToCopy) {
                copyToClipboard(textToCopy, t('toast_copied'));
            }
        });
    }

    if (formulaToggle && formulaBox) {
        formulaToggle.addEventListener('click', () => {
            const isVisible = formulaBox.style.display !== 'none';
            formulaBox.style.display = isVisible ? 'none' : 'block';
            formulaToggle.setAttribute('aria-expanded', isVisible ? 'false' : 'true');
        });
    }
}

function initFilterTabs() {
    const courtFilterTabs = document.getElementById('courtFilterTabs');
    const encFilterTabs = document.getElementById('encFilterTabs');
    const btnStreet = document.getElementById('btnStreetLayer');
    const btnSatellite = document.getElementById('btnSatelliteLayer');

    if (courtFilterTabs) {
        courtFilterTabs.querySelectorAll('.tab-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                courtFilterTabs.querySelectorAll('.tab-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentCourtFilter = chip.getAttribute('data-filter') || 'all';
                if (activeRecord) renderCourtCases(activeRecord.courtCases);
            });
        });
    }

    if (encFilterTabs) {
        encFilterTabs.querySelectorAll('.tab-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                encFilterTabs.querySelectorAll('.tab-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentEncFilter = chip.getAttribute('data-filter') || 'all';
                if (activeRecord) renderEncumbrances(activeRecord.encumbrances);
            });
        });
    }

    if (btnStreet) {
        btnStreet.addEventListener('click', () => {
            setMapTileLayer('street');
        });
    }

    if (btnSatellite) {
        btnSatellite.addEventListener('click', () => {
            setMapTileLayer('satellite');
        });
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

function copyToClipboard(text, successMsg) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMsg || t('toast_copied'), 'success');
        }).catch(() => {
            fallbackCopy(text, successMsg);
        });
    } else {
        fallbackCopy(text, successMsg);
    }
}

function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast(successMsg || t('toast_copied'), 'success');
    } catch (err) {
        showToast('Unable to copy to clipboard', 'info');
    }
    document.body.removeChild(ta);
}

function formatMarkdown(rawText) {
    if (!rawText) return '';
    const safe = escapeHtml(rawText);

    const lines = safe.split(/\r?\n/);
    let html = '';
    let inList = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            return;
        }

        if (/^###\s+(.+)$/.test(trimmed)) {
            if (inList) { html += '</ul>'; inList = false; }
            const headerText = trimmed.replace(/^###\s+/, '');
            html += `<h5 style="margin: 8px 0 4px 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">${formatInline(headerText)}</h5>`;
            return;
        }

        if (/^[*-]\s+(.+)$/.test(trimmed)) {
            if (!inList) {
                html += '<ul style="margin: 4px 0 8px 18px; padding: 0;">';
                inList = true;
            }
            const itemText = trimmed.replace(/^[*-]\s+/, '');
            html += `<li style="margin-bottom: 4px;">${formatInline(itemText)}</li>`;
            return;
        }

        if (/^\d+\.\s+(.+)$/.test(trimmed)) {
            if (inList) { html += '</ul>'; inList = false; }
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            html += `<div style="margin-bottom: 4px;"><span class="mono" style="font-weight: 600; margin-right: 4px;">&bull;</span>${formatInline(itemText)}</div>`;
            return;
        }

        if (inList) {
            html += '</ul>';
            inList = false;
        }

        html += `<p style="margin: 0 0 6px 0;">${formatInline(trimmed)}</p>`;
    });

    if (inList) {
        html += '</ul>';
    }

    return html;
}

function formatInline(str) {
    return str
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="font-family: var(--font-mono); font-size: 11px; padding: 1px 4px; background: var(--ground); border: 1px solid var(--border); border-radius: 3px;">$1</code>');
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
