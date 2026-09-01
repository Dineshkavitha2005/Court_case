// ============================================
// LandGuard — Main Application Logic
// ============================================

let mapInstance = null;
let activeRecord = null;
let currentLanguage = localStorage.getItem('landguard-language') || 'en';
let currentTheme = localStorage.getItem('landguard-theme') || 'dark';
const originalTextNodes = new WeakMap();

const TRANSLATIONS_TA = {
    "Home": "முகப்பு",
    "Search": "தேடல்",
    "Features": "அம்சங்கள்",
    "About": "பற்றி",
    "Trusted Land Verification Platform": "நம்பகமான நில சரிபார்ப்பு தளம்",
    "Verify Land": "நிலத்தை சரிபார்த்து",
    "Litigation Risk": "வழக்கு அபாயம்",
    "Before You Invest": "முதலீடு செய்வதற்கு முன்",
    "Search any land by village name and survey number to uncover ownership details, pending court cases, and legal risks — all in one place.": "கிராமப் பெயர் மற்றும் சர்வே எண்ணை வைத்து உரிமை விவரங்கள், நிலுவை நீதிமன்ற வழக்குகள், சட்ட அபாயங்கள் அனைத்தையும் ஒரே இடத்தில் அறியுங்கள்.",
    "Start Searching": "தேடலை தொடங்கவும்",
    "Records Verified": "சரிபார்க்கப்பட்ட பதிவுகள்",
    "Villages Covered": "உள்ளடக்கப்பட்ட கிராமங்கள்",
    "% Accuracy": "% துல்லியம்",
    "Clear Title": "தெளிவான உரிமை",
    "No disputes found": "தகராறு இல்லை",
    "Medium Risk": "நடுத்தர அபாயம்",
    "1 pending case": "1 நிலுவை வழக்கு",
    "High Risk": "அதிக அபாயம்",
    "Active litigation": "செயலில் உள்ள வழக்கு",
    "Search Land Records": "நில பதிவுகளை தேடுங்கள்",
    "Enter the village name and survey number to check litigation risks": "வழக்கு அபாயத்தை பார்க்க கிராமப் பெயர் மற்றும் சர்வே எண்ணை உள்ளிடவும்",
    "Village Name": "கிராமப் பெயர்",
    "Survey Number": "சர்வே எண்",
    "Check Litigation Risk": "வழக்கு அபாயத்தை சரிபார்க்கவும்",
    "Analyzing Land Records": "நில பதிவுகள் ஆய்வு செய்யப்படுகின்றன",
    "Searching government databases...": "அரசு தரவுத்தளங்களில் தேடப்படுகிறது...",
    "Verifying revenue records...": "வருவாய் பதிவுகள் சரிபார்க்கப்படுகின்றன...",
    "Checking court case databases...": "நீதிமன்ற வழக்கு பதிவுகள் பார்க்கப்படுகின்றன...",
    "Analyzing encumbrance certificates...": "வில்லங்கச் சான்றுகள் ஆய்வு செய்யப்படுகின்றன...",
    "Calculating risk score...": "அபாய மதிப்பெண் கணக்கிடப்படுகிறது...",
    "Generating report...": "அறிக்கை உருவாக்கப்படுகிறது...",
    "Land Verification Report": "நில சரிபார்ப்பு அறிக்கை",
    "Download PDF": "PDF பதிவிறக்கவும்",
    "New Search": "புதிய தேடல்",
    "Calculating...": "கணக்கிடப்படுகிறது...",
    "Owner Details": "உரிமையாளர் விவரங்கள்",
    "Land Details": "நில விவரங்கள்",
    "Interactive GIS Map (Cadastral)": "இணைய GIS வரைபடம் (கடாஸ்ட்ரல்)",
    "Checking Bounds...": "எல்லைகள் சரிபார்க்கப்படுகின்றன...",
    "Court Cases": "நீதிமன்ற வழக்குகள்",
    "Encumbrance Details": "வில்லங்க விவரங்கள்",
    "AI Legal Analyst Insights": "AI சட்ட ஆய்வாளர் குறிப்புகள்",
    "Powered by LandGuard AI": "LandGuard AI மூலம் இயக்கப்படுகிறது",
    "Ownership & Legal Timeline": "உரிமை மற்றும் சட்ட காலவரிசை",
    "Disclaimer:": "மறுப்பு:",
    "This report is generated from available public records and is for informational purposes only. It does not constitute legal advice. Always consult a qualified legal professional before making property decisions.": "இந்த அறிக்கை கிடைக்கக்கூடிய பொது பதிவுகளின் அடிப்படையில் உருவாக்கப்பட்டது; இது தகவல் நோக்கத்திற்காக மட்டுமே. இது சட்ட ஆலோசனை அல்ல. சொத்து முடிவுகள் எடுக்கும் முன் தகுதியான சட்ட நிபுணரை அணுகவும்.",
    "Why Choose LandGuard?": "ஏன் LandGuard?",
    "Comprehensive land verification at your fingertips": "முழுமையான நில சரிபார்ப்பு உங்கள் கையில்",
    "Court Case Tracking": "நீதிமன்ற வழக்கு கண்காணிப்பு",
    "Real-time monitoring of all pending and resolved court cases associated with any land parcel across multiple courts.": "பல நீதிமன்றங்களில் எந்த நிலத்துடன் தொடர்புடைய நிலுவை மற்றும் தீர்ந்த வழக்குகளையும் உடனுக்குடன் கண்காணிக்கலாம்.",
    "Ownership History": "உரிமை வரலாறு",
    "Complete chain of ownership from historical records, including mutations, transfers, and inheritance documentation.": "பட்டா மாற்றம், பரிமாற்றம், வாரிசு ஆவணங்கள் உட்பட வரலாற்று பதிவுகளிலிருந்து முழுமையான உரிமை தொடர்.",
    "Risk Assessment": "அபாய மதிப்பீடு",
    "AI-powered risk scoring based on multiple parameters including legal disputes, encumbrances, and government acquisitions.": "சட்ட தகராறுகள், வில்லங்கங்கள், அரசு கையகப்படுத்தல் போன்ற பல காரணிகளின் அடிப்படையில் AI அபாய மதிப்பீடு.",
    "Encumbrance Check": "வில்லங்கச் சோதனை",
    "Detailed encumbrance certificate analysis including mortgages, liens, and any registered claims on the property.": "அடமானம், பற்று உரிமை, பதிவு செய்யப்பட்ட கோரிக்கைகள் உள்ளிட்ட விரிவான வில்லங்கச் சான்று ஆய்வு.",
    "Detailed Reports": "விரிவான அறிக்கைகள்",
    "Generate comprehensive verification reports with all findings, suitable for legal review and due diligence processes.": "சட்ட ஆய்வு மற்றும் உரிய கவனிப்பு செயல்முறைக்கு ஏற்ற அனைத்து கண்டுபிடிப்புகளுடனும் விரிவான சரிபார்ப்பு அறிக்கைகள்.",
    "Instant Results": "உடனடி முடிவுகள்",
    "Get results in seconds with our optimized search across multiple government databases and court record systems.": "பல அரசு தரவுத்தளங்கள் மற்றும் நீதிமன்ற பதிவுகள் வழியாக விரைவான தேடலில் சில விநாடிகளில் முடிவுகள்.",
    "About LandGuard": "LandGuard பற்றி",
    "LandGuard is a comprehensive land litigation risk checker designed to protect buyers, investors, and legal professionals from fraudulent or disputed land transactions.": "LandGuard என்பது வாங்குபவர்கள், முதலீட்டாளர்கள், சட்ட நிபுணர்கள் ஆகியோரை போலி அல்லது தகராறு உள்ள நில பரிவர்த்தனைகளிலிருந்து பாதுகாக்க உருவாக்கப்பட்ட முழுமையான நில வழக்கு அபாய சரிபார்ப்பு தளம்.",
    "Our platform aggregates data from multiple government sources, court records, and revenue departments to provide a holistic view of any land parcel's legal standing.": "எங்கள் தளம் பல அரசு ஆதாரங்கள், நீதிமன்ற பதிவுகள், வருவாய் துறைகளிலிருந்து தரவுகளை ஒருங்கிணைத்து எந்த நிலத்தின் சட்ட நிலைமையையும் தெளிவாக காட்டுகிறது.",
    "Government Verified": "அரசு சரிபார்ப்பு",
    "Data Secured": "தரவு பாதுகாப்பு",
    "Real-time Updates": "நேரடி புதுப்பிப்புகள்",
    "Protecting your land investments with comprehensive litigation risk analysis.": "முழுமையான வழக்கு அபாய ஆய்வின் மூலம் உங்கள் நில முதலீடுகளை பாதுகாக்கிறது.",
    "Product": "தயாரிப்பு",
    "Pricing": "விலை",
    "Company": "நிறுவனம்",
    "Contact": "தொடர்பு",
    "Careers": "வேலைவாய்ப்புகள்",
    "Legal": "சட்டம்",
    "Privacy Policy": "தனியுரிமைக் கொள்கை",
    "Terms of Service": "சேவை விதிமுறைகள்",
    "Disclaimer": "மறுப்பு",
    "© 2026 LandGuard. All rights reserved. Data sourced from public government records.": "© 2026 LandGuard. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. தரவு பொது அரசு பதிவுகளிலிருந்து பெறப்பட்டது.",
    "AI Legal Analyst": "AI சட்ட ஆய்வாளர்",
    "Online": "ஆன்லைன்",
    "Hello! I am your LandGuard AI Assistant. Enter a village name and survey number above, and I can answer specific legal, ownership, or risk questions about the report.": "வணக்கம்! நான் உங்கள் LandGuard AI உதவியாளர். மேலே கிராமப் பெயர் மற்றும் சர்வே எண்ணை உள்ளிடுங்கள்; அறிக்கையின் சட்டம், உரிமை அல்லது அபாயம் குறித்த கேள்விகளுக்கு பதில் தருவேன்.",
    "Owner Name": "உரிமையாளர் பெயர்",
    "Father's Name": "தந்தை பெயர்",
    "Aadhaar": "ஆதார்",
    "Contact": "தொடர்பு",
    "Address": "முகவரி",
    "Registration Date": "பதிவு தேதி",
    "Village": "கிராமம்",
    "Mandal": "மண்டலம்",
    "District / State": "மாவட்டம் / மாநிலம்",
    "Extent": "பரப்பளவு",
    "Classification": "வகைப்பாடு",
    "Market Value": "சந்தை மதிப்பு",
    "Passbook No.": "பாஸ்புக் எண்",
    "Status": "நிலை",
    "Last Checked": "கடைசியாக சரிபார்த்தது",
    "Mortgages": "அடமானங்கள்",
    "Liens/Claims": "பற்று/கோரிக்கைகள்",
    "Court:": "நீதிமன்றம்:",
    "Type:": "வகை:",
    "Parties:": "தரப்புகள்:",
    "Filed:": "தாக்கல்:",
    "Next Hearing:": "அடுத்த விசாரணை:",
    "No Court Cases Found": "நீதிமன்ற வழக்குகள் இல்லை",
    "No pending or resolved court cases are associated with this land parcel.": "இந்த நிலப்பகுதிக்கு நிலுவை அல்லது தீர்ந்த நீதிமன்ற வழக்குகள் இல்லை.",
    "LOW RISK": "குறைந்த அபாயம்",
    "MEDIUM RISK": "நடுத்தர அபாயம்",
    "HIGH RISK": "அதிக அபாயம்",
    "This land has a clean legal standing with no significant risks detected.": "இந்த நிலத்தின் சட்ட நிலை தெளிவாக உள்ளது; குறிப்பிடத்தக்க அபாயம் இல்லை.",
    "Some legal concerns detected. Proceed with caution and consult a lawyer.": "சில சட்ட கவலைகள் கண்டறியப்பட்டுள்ளன. கவனமாக செயல்பட்டு வழக்கறிஞரை அணுகவும்.",
    "Significant legal risks found. Strongly recommended to avoid this property.": "குறிப்பிடத்தக்க சட்ட அபாயங்கள் உள்ளன. இந்த சொத்தை தவிர்ப்பது மிக பரிந்துரைக்கப்படுகிறது.",
    "No Records Found": "பதிவுகள் இல்லை",
    "No data available": "தரவு இல்லை",
    "Available villages:": "கிடைக்கும் கிராமங்கள்:",
    "Court Cases": "நீதிமன்ற வழக்குகள்",
    "Title Dispute": "உரிமை தகராறு",
    "Encumbrance": "வில்லங்கம்",
    "Government Acquisition": "அரசு கையகப்படுத்தல்",
    "No active cases": "செயலில் உள்ள வழக்குகள் இல்லை",
    "No cases found": "வழக்குகள் இல்லை",
    "No disputes": "தகராறுகள் இல்லை",
    "Clear title": "தெளிவான உரிமை",
    "Clear Title": "தெளிவான உரிமை",
    "No encumbrances": "வில்லங்கங்கள் இல்லை",
    "Not under acquisition": "கையகப்படுத்தலில் இல்லை",
    "None": "இல்லை",
    "Clear": "தெளிவு",
    "Encumbered": "வில்லங்கம் உள்ளது",
    "Minor Encumbrance": "சிறிய வில்லங்கம்",
    "Partial Encumbrance": "பகுதி வில்லங்கம்",
    "Heavily Encumbered": "கடுமையான வில்லங்கம்",
    "Active": "செயலில்",
    "Pending": "நிலுவை",
    "Resolved": "தீர்ந்தது",
    "Clear Title & Low Litigation Risk": "தெளிவான உரிமை மற்றும் குறைந்த வழக்கு அபாயம்",
    "Critical Title Dispute Risk Detected": "கடுமையான உரிமை தகராறு அபாயம் கண்டறியப்பட்டது",
    "Financial Lien & Encumbrance Notice": "நிதி பற்று மற்றும் வில்லங்க அறிவிப்பு",
    "Revenue Mutation Status": "வருவாய் பட்டா மாற்ற நிலை",
    "Recommended Legal Due-Diligence Checklist": "பரிந்துரைக்கப்பட்ட சட்ட சரிபார்ப்பு பட்டியல்",
    "To guarantee safe transaction closure, complete the following actions:": "பாதுகாப்பான பரிவர்த்தனைக்கு பின்வரும் செயல்களை முடிக்கவும்:",
    "Suggested Questions": "பரிந்துரைக்கப்பட்ட கேள்விகள்",
    "Explain the active court dispute": "செயலில் உள்ள நீதிமன்ற தகராறை விளக்கவும்",
    "Is it safe to buy this land?": "இந்த நிலத்தை வாங்குவது பாதுகாப்பானதா?",
    "Who is suing whom?": "யார் யாருக்கு எதிராக வழக்கு தொடுத்துள்ளனர்?",
    "Explain the active bank loan": "செயலில் உள்ள வங்கி கடனை விளக்கவும்",
    "What are the buying recommendations?": "வாங்கும் பரிந்துரைகள் என்ன?",
    "Are there any court stays?": "நீதிமன்ற தடை உத்தரவு உள்ளதா?",
    "Check ownership authenticity": "உரிமை உண்மைத்தன்மையை சரிபார்க்கவும்",
    "Are there any risks at all?": "ஏதேனும் அபாயங்கள் உள்ளனவா?",
    "What are the next steps?": "அடுத்த படிகள் என்ன?",
    "Map library could not be loaded": "வரைபட நூலகம் ஏற்றப்படவில்லை",
    "Live map could not be initialized": "நேரடி வரைபடம் தொடங்கப்படவில்லை",
    "Survey No": "சர்வே எண்",
    "District": "மாவட்டம்",
    "Survey Number": "சர்வே எண்",

    // --- Database-specific Mappings ---
    // Villages, Mandals, Districts, States
    "Adyar": "அடையாறு",
    "Alandur": "ஆலந்தூர்",
    "Alanganallur": "அலங்காநல்லூர்",
    "Ambasamudram": "அம்பாசமுத்திரம்",
    "Ambattur": "அம்பத்தூர்",
    "Ambur": "ஆம்பூர்",
    "Arakkonam": "அரக்கோணம்",
    "Arani": "ஆரணி",
    "Aranthangi": "அறந்தாங்கி",
    "Aravakurichi": "அரவக்குறிச்சி",
    "Ariyalur": "அரியலூர்",
    "Aruppukkottai": "அருப்புக்கோட்டை",
    "Attur": "ஆத்தூர்",
    "Avanashi": "அவினாசி",
    "Bhavani": "பவானி",
    "Bodinayakanur": "போடிநாயக்கனூர்",
    "Chengalpattu": "செங்கல்பட்டு",
    "Chennai": "சென்னை",
    "Cheyyar": "செய்யாறு",
    "Chidambaram": "சிதம்பரம்",
    "Coimbatore": "கோயம்புத்தூர்",
    "Coonoor": "குன்னூர்",
    "Cuddalore": "கடலூர்",
    "Cumbum": "கம்பம்",
    "Dharapuram": "தாராபுரம்",
    "Dharmapuri": "தர்மபுரி",
    "Dindigul": "திண்டுக்கல்",
    "Erode": "ஈரோடு",
    "Gingee": "செஞ்சி",
    "Gobichettipalayam": "கோபிசெட்டிபாளையம்",
    "Gudalur": "கூடலூர்",
    "Gudiyatham": "குடியாத்தம்",
    "Guindy": "கிண்டி",
    "Hosur": "ஓசூர்",
    "Jayankondam": "ஜெயங்கொண்டம்",
    "Kallakurichi": "கள்ளக்குறிச்சி",
    "Kanchipuram": "காஞ்சிபுரம்",
    "Kangeyam": "காங்கேயம்",
    "Kanyakumari": "கன்னியாகுமரி",
    "Karaikudi": "காரைக்குடி",
    "Karur": "கரூர்",
    "Kodaikanal": "கொடைக்கானல்",
    "Kovilpatti": "கோவில்பட்டி",
    "Koyambedu": "கோயம்பேடு",
    "Krishnagiri": "கிருஷ்ணகிரி",
    "Kumbakonam": "கும்பகோணம்",
    "Lalgudi": "லால்குடி",
    "Madipakkam": "மடிப்பாக்கம்",
    "Madurai": "மதுரை",
    "Mannargudi": "மன்னார்குடி",
    "Mayiladuthurai": "மயிலாடுதுறை",
    "Medavakkam": "மேடவாக்கம்",
    "Mettupalayam": "மேட்டுப்பாளையம்",
    "Mettur": "மேட்டூர்",
    "Mylapore": "மயிலாப்பூர்",
    "Nagapattinam": "நாகப்பட்டினம்",
    "Nagercoil": "நாகர்கோவில்",
    "Namakkal": "நாமக்கல்",
    "Neyveli": "நெய்வேலி",
    "Nilgiris": "நீலகிரி",
    "Oddanchatram": "ஒட்டன்சத்திரம்",
    "Ooty": "ஊட்டி",
    "Palani": "பழனி",
    "Palladam": "பல்லடம்",
    "Pallikaranai": "பள்ளிக்கரணை",
    "Panruti": "பண்ருட்டி",
    "Paramakudi": "பரமக்குடி",
    "Pattukkottai": "பட்டுக்கோட்டை",
    "Perambalur": "பெரம்பலூர்",
    "Pollachi": "பொள்ளாச்சி",
    "Porur": "போரூர்",
    "Pudukkottai": "புதுக்கோட்டை",
    "Puliyangudi": "புளியங்குடி",
    "Punamallee": "பூந்தமல்லி",
    "Poonamallee": "பூந்தமல்லி",
    "Rajapalayam": "ராஜபாளையம்",
    "Ramanathapuram": "ராமநாதபுரம்",
    "Ranipet": "ராணிப்பேட்டை",
    "Rasipuram": "ராசிபுரம்",
    "Salem": "சேலம்",
    "Sankarankovil": "சங்கரன்கோவில்",
    "Sankari": "சங்ககிரி",
    "Sathyamangalam": "சத்தியமங்கலம்",
    "Sattur": "சாத்தூர்",
    "Sivaganga": "சிவகங்கை",
    "Sivakasi": "சிவகாசி",
    "Sriperumbudur": "ஸ்ரீபெரும்புதூர்",
    "Srivilliputhur": "திருவில்லிபுத்தூர்",
    "Tambaram": "தாம்பரம்",
    "Taramani": "தரமணி",
    "Tenkasi": "தென்காசி",
    "Thanjavur": "தஞ்சாவூர்",
    "Theni": "தேனி",
    "Thirumangalam": "திருமங்கலம்",
    "Thiruvallur": "திருவள்ளூர்",
    "Thiruvarur": "திருவாரூர்",
    "Thoothukudi": "தூத்துக்குடி",
    "Tindivanam": "திண்டிவனம்",
    "Tiruchendur": "திருச்செந்தூர்",
    "Tiruchengode": "திருச்செங்கோடு",
    "Tiruchirappalli": "திருச்சிராப்பள்ளி",
    "Tirunelveli": "திருநெல்வேலி",
    "Tirupathur": "திருப்பத்தூர்",
    "Tiruppur": "திருப்பூர்",
    "Tiruttani": "திருத்தணி",
    "Tiruvannamalai": "திருவண்ணாமலை",
    "Udhagamandalam": "உதகமண்டலம்",
    "Udumalaipettai": "உடுமலைப்பேட்டை",
    "Ulundurpettai": "உளுந்தூர்பேட்டை",
    "Usilampatti": "உசிலம்பட்டி",
    "Uthamapalayam": "உத்தமபாளையம்",
    "Vaniyambadi": "வாணியம்பாடி",
    "Vedaranyam": "வேதாரண்யம்",
    "Velachery": "வேளச்சேரி",
    "Vellore": "வேலூர்",
    "Viluppuram": "விழுப்புரம்",
    "Virudhachalam": "விருத்தாசலம்",
    "Virudhunagar": "விருதுநகர்",
    "Kondapur": "கொண்டாப்பூர்",
    "Serilingampally": "சேரிலிங்கம்பள்ளி",
    "Rangareddy": "ரங்காரெட்டி",
    "Telangana": "தெலுங்கானா",
    "Gachibowli": "கச்சிபௌலி",
    "Madhapur": "மாதாப்பூர்",
    "Miyapur": "மியாப்பூர்",
    "Kukatpally": "குகட்பள்ளி",
    "Shamshabad": "சம்சாபாத்",
    "Banjara Hills": "பஞ்சாரா ஹில்ஸ்",
    "Khairatabad": "கைரதாபாத்",
    "Hyderabad": "ஹைதராபாத்",
    "Jubilee Hills": "ஜூபிலி ஹில்ஸ்",
    "Shaikpet": "ஷேக் பேட்",
    "Narsingi": "நர்சிங்கி",
    "Gandipet": "கந்திப்பேட்டை",
    "Sholinganallur": "சோழிங்கநல்லூர்",
    "Tamil Nadu": "தமிழ்நாடு",
    "Taluk HQ": "தாலுகா தலைமையகம்",

    // Names & Party Names
    "Ramesh Babu Reddy": "ரமேஷ் பாபு ரெட்டி",
    "Venkat Reddy": "வெங்கட் ரெட்டி",
    "Suresh Goud (Disputed)": "சுரேஷ் கவுட் (தகராறில் உள்ளது)",
    "Suresh Goud": "சுரேஷ் கவுட்",
    "Mallesh Goud": "மல்லேஷ் கவுட்",
    "Lakshmi Devi": "லட்சுமி தேவி",
    "Late Srinivas Rao": "காலஞ்சென்ற ஸ்ரீனிவாஸ் ராவ்",
    "Priya Sharma": "பிரியா சர்மா",
    "Rajendra Sharma": "ராஜேந்திர சர்மா",
    "Venkateshwarlu (Under Dispute)": "வெங்கடேஸ்வரலு (தகராறில் உள்ளது)",
    "Venkateshwarlu": "வெங்கடேஸ்வரலு",
    "Hanumanthu": "அனுமந்து",
    "Anjali Kumari": "அஞ்சலி குமாரி",
    "Ravi Kumar": "ரவி குமார்",
    "Srinivasa Rao Pothireddy": "சீனிவாச ராவ் போதிரெட்டி",
    "Narasimha Rao Pothireddy": "நரசிம்ம ராவ் போதிரெட்டி",
    "Mohammed Ismail": "முகமது இஸ்மாயில்",
    "Mohammed Ibrahim": "முகமது இப்ராகிம்",
    "Ahmed Khan": "அகமது கான்",
    "Krishna Rao": "கிருஷ்ண ராவ்",
    "Nagaiah": "நாகையா",
    "Mohan Rao": "மோகன் ராவ்",
    "Ramasamy": "ராமசாமி",
    "Bharathi & Raju (Joint)": "பாரதி & ராஜு (கூட்டு)",
    "Bharathi & Raju": "பாரதி & ராஜு",
    "Anand Kumar": "ஆனந்த் குமார்",
    "Siva Kumar": "சிவா குமார்",
    "Vijayender Reddy (Disputed)": "விஜயேந்தர் ரெட்டி (தகராறில் உள்ளது)",
    "Vijayender Reddy": "விஜயேந்தர் ரெட்டி",
    "Pratap Reddy": "பிரதாப் ரெட்டி",
    "Swapna G": "ஸ்வப்னா ஜி",
    "Kishore G": "கிஷோர் ஜி",
    "Karthik Subramanian": "கார்த்திக் சுப்பிரமணியன்",
    "Subramanian V": "சுப்பிரமணியன் வி",
    "Muthukumar (Disputed)": "முத்துக்குமார் (தகராறில் உள்ளது)",
    "Muthukumar": "முத்துக்குமார்",
    "Palanisamy": "பழனிச்சாமி",
    "Lakshmi Narayanan": "லட்சுமி நாராயணன்",
    "Venkatraman": "வெங்கட்ராமன்",
    "Suresh Kumar": "சுரேஷ் குமார்",
    "Pochaiah": "போசையா",
    "M/s. Emerald Developers Pvt. Ltd.": "எம்/எஸ். எமரால்டு டெவலப்பர்ஸ் பிரைவேட் லிமிடெட்",
    "Sri Sai Developers": "ஸ்ரீ சாய் டெவலப்பர்ஸ்",
    "DLF Builders": "டிஎல்எஃப் பில்டர்ஸ்",

    // Classifications
    "Agricultural Land": "விவசாய நிலம்",
    "Non-Agricultural (Converted)": "விவசாயம் அல்லாத நிலம் (மாற்றப்பட்டது)",
    "Residential Zone": "குடியிருப்பு மண்டலம்",
    "Mixed Use (Disputed)": "கலப்பு பயன்பாடு (தகராறில் உள்ளது)",
    "Residential": "குடியிருப்பு",
    "Commercial Zone": "வணிக மண்டலம்",
    "Commercial": "வணிகம்",
    "Agricultural (Near Airport Zone)": "விவசாய நிலம் (விமான நிலைய பகுதி அருகில்)",
    "Agricultural": "விவசாய நிலம்",
    "Industrial": "தொழில்துறை",

    // Encumbrance details
    "Clear": "தெளிவு",
    "Encumbered": "வில்லங்கம் உள்ளது",
    "Minor Encumbrance": "சிறிய வில்லங்கம்",
    "Partial Encumbrance": "பகுதி வில்லங்கம்",
    "Heavily Encumbered": "கடுமையான வில்லங்கம்",
    "SBI Home Loan — ₹45 Lakhs (Outstanding)": "எஸ்பிஐ வீட்டுக்கடன் — ₹45 லட்சம் (நிலுவையில் உள்ளது)",
    "Revenue Department Lien — Pending Tax": "வருவாய்த்துறை பற்று — நிலுவை வரி",
    "Axis Bank — ₹80 Lakhs (Active)": "ஆக்சிஸ் வங்கி — ₹80 லட்சம் (செயல்பாட்டில் உள்ளது)",
    "Revenue Court Stay Order": "வருவாய் நீதிமன்ற தடை உத்தரவு",
    "Government Acquisition Notice on 2 Acres": "2 ஏக்கரில் அரசு கையகப்படுத்தும் அறிவிப்பு",
    "Proposed SIPCOT Expansion Phase 3": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம் கட்டம் 3",
    "Indian Bank Agri Loan - Active": "இந்தியன் வங்கி விவசாயக் கடன் - செயல்பாட்டில் உள்ளது",
    "Proposed SIPCOT Expansion": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம்",
    "SIPCOT Expansion": "சிப்காட் விரிவாக்கம்",
    "SIPCOT expansion": "சிப்காட் விரிவாக்கம்",
    "Proposed road widening acquisition of 0.5 acres from the survey": "இந்த சர்வேயிலிருந்து 0.5 ஏக்கர் சாலை விரிவாக்கத்திற்காக கையகப்படுத்த முன்மொழியப்பட்டது",
    "Revenue tax pending — ₹12,000": "நிலுவையில் உள்ள வருவாய் வரி — ₹12,000",
    "Revenue tax pending": "நிலுவையில் உள்ள வருவாய் வரி",
    "Challenge against proposed road widening acquisition of 0.5 acres from the survey.": "இந்த சர்வேயிலிருந்து 0.5 ஏக்கர் சாலை விரிவாக்கத்திற்காக கையகப்படுத்த முன்மொழியப்பட்டதற்கு எதிரான சவால்.",
    "Neighboring landowner Mohan Rao disputes the boundary demarcation claiming encroachment of 5 guntas.": "பக்கத்து நில உரிமையாளர் மோகன் ராவ் 5 குண்டா ஆக்கிரமிப்பு செய்துள்ளதாக எல்லையை பிரிக்கக் கோரி தகராறு செய்கிறார்.",
    "Neighbor filed suit claiming boundary encroachment": "எல்லையை ஆக்கிரமித்ததாக பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Neighbor filed suit": "பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "neighbor filed suit": "பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Ahmed Khan vs. Mohammed Ismail": "அகமது கான் எதிர் முகமது இஸ்மாயில்",
    "Former business partner claims 50% ownership based on oral agreement and partial payment receipts.": "வாய்மொழி ஒப்பந்தம் மற்றும் பகுதி கட்டண ரசீதுகளின் அடிப்படையில் முன்னாள் வணிக கூட்டாளி 50% உரிமையைக் கோருகிறார்.",
    "Joint purchase by Mohammed Ismail (alleged sole)": "முகமது இஸ்மாயில் கூட்டு வாங்குதல் (தனி நபர் என்று கூறப்படும்)",
    "Revenue records show single ownership": "வருவாய் பதிவுகள் ஒற்றை உரிமையைக் காட்டுகின்றன",
    "Application for agricultural to commercial conversion": "விவசாய நிலத்திலிருந்து வணிக நிலமாக மாற்ற விண்ணப்பம்",
    "Ahmed Khan claimed 50% ownership in court": "அகமது கான் நீதிமன்றத்தில் 50% உரிமையைக் கோரினார்",
    "Department questioned conversion validity": "நில வகைப்பாடு மாற்றத்தின் செல்லுபடியாகும் தன்மையை துறை கேள்வி எழுப்பியது",
    "Joint purchase by Bharathi and Raju": "பாரதி மற்றும் ராஜு ஆகியோரின் கூட்டு வாங்குதல்",
    "GHMC issued notice for 2 acres for airport expansion": "விமான நிலைய விரிவாக்கத்திற்காக 2 ஏக்கர் நிலத்திற்கு ஜிஎச்சிடி அறிவிப்பு வெளியிட்டது",
    "Owners challenged the compensation amount in tribunal": "உரிமையாளர்கள் தீர்ப்பாயத்தில் இழப்பீட்டுத் தொகையை எதிர்த்து வழக்கு தொடர்ந்தனர்",
    "Anand Kumar purchased from DLF Builders": "ஆனந்த் குமார் டிஎல்எஃப் பில்டர்ஸிடமிருந்து வாங்கினார்",
    "Government claims encroachment on adjacent park land.": "அருகில் உள்ள பூங்கா நிலத்தை ஆக்கிரமித்துள்ளதாக அரசு கூறுகிறது.",
    "Construction halted by court order": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Construction halted by court": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "Registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "HDFC mortgage registered": "ஹெச்டிஎப்சி அடமானம் பதிவு செய்யப்பட்டது",
    "flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "Flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "Registered at Tambaram Sub-Registrar": "தாம்பரம் சார்பதிவாளர் அலுவலகத்தில் பதிவு செய்யப்பட்டது",
    "Patta name transfer completed": "பட்டா பெயர் மாற்றம் நிறைவடைந்தது",
    "Brother filed a partition suit claiming equal share in ancestral property.": "பூர்வீக சொத்தில் சம பங்கு கோரி சகோதரர் பாகப்பிரிவினை வழக்கு தொடர்ந்தார்.",
    "Ramasamy claimed share in property": "ராமசாமி சொத்தில் பங்கு கோரினார்",
    "Registered as Industrial Land": "தொழில்துறை நிலமாக பதிவு செய்யப்பட்டது",
    "Area marked for potential SIPCOT expansion": "சாத்தியமான சிப்காட் விரிவாக்கத்திற்காக பகுதி குறிக்கப்பட்டுள்ளது",
    "proposed SIPCOT expansion": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம்",
    "SBI Loan — ₹10 Crore": "எஸ்பிஐ கடன் — ₹10 கோடி",
    "Court Stay Order Active": "நீதிமன்ற தடை உத்தரவு செயலில் உள்ளது",
    "SBI Home Loan — ₹45 Lakhs (Outstanding)": "எஸ்பிஐ வீட்டுக்கடன் — ₹45 லட்சம் (நிலுவையில் உள்ளது)",
    "Revenue Department Lien — Pending Tax": "வருவாய்த்துறை பற்று — நிலுவை வரி",
    "Axis Bank — ₹80 Lakhs (Active)": "ஆக்சிஸ் வங்கி — ₹80 லட்சம் (செயல்பாட்டில் உள்ளது)",
    "Revenue Court Stay Order": "வருவாய் நீதிமன்ற தடை உத்தரவு",
    "Government Acquisition Notice on 2 Acres": "2 ஏக்கரில் அரசு கையகப்படுத்தும் அறிவிப்பு",
    "Proposed SIPCOT Expansion Phase 3": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம் கட்டம் 3",
    "Indian Bank Agri Loan - Active": "இந்தியன் வங்கி விவசாயக் கடன் - செயல்பாட்டில் உள்ளது",

    // Address
    "H.No. 12-5-34, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 12-5-34, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 8-2-120, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 8-2-120, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 3-8-67, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 3-8-67, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "Plot No. 45, Gachibowli Village, Serilingampally Mandal, Rangareddy District": "மனை எண் 45, கச்சிபௌலி கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 6-3-45, Gachibowli Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 6-3-45, கச்சிபௌலி கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 11-4-56, Madhapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 11-4-56, மாதாப்பூர் கிராமம், மாதாப்பூர் மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 5-9-102, Miyapur Village, Miyapur Mandal, Rangareddy District": "கதவு எண் 5-9-102, மியாப்பூர் கிராமம், மியாப்பூர் மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 18-7-89, Kukatpally Village, Kukatpally Mandal, Rangareddy District": "கதவு எண் 18-7-89, குகட்பள்ளி கிராமம், குகட்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 2-1-34, Shamshabad Village, Shamshabad Mandal, Rangareddy District": "கதவு எண் 2-1-34, சம்சாபாத் கிராமம், சம்சாபாத் மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "Plot 12, Road No 10, Banjara Hills, Hyderabad": "மனை எண் 12, சாலை எண் 10, பஞ்சாரா ஹில்ஸ், ஹைதராபாத்",
    "Plot 88, Road No 36, Jubilee Hills, Hyderabad": "மனை எண் 88, சாலை எண் 36, ஜூபிலி ஹில்ஸ், ஹைதராபாத்",
    "Villa 15, Narsingi, Gandipet Mandal": "வில்லா 15, நர்சிங்கி, கந்திப்பேட்டை மண்டலம்",
    "Flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "12, South Street, Thirumangalam, Madurai": "12, தெற்கு தெரு, திருமங்கலம், மதுரை",
    "Plot 45, SIPCOT area, Sriperumbudur, Kanchipuram": "மனை எண் 45, சிப்காட் பகுதி, ஸ்ரீபெரும்புதூர், காஞ்சிபுரம்",

    // Timeline titles
    "Property Purchased": "சொத்து வாங்கப்பட்டது",
    "Mutation Completed": "பட்டா மாற்றம் செய்யப்பட்டது",
    "EC Verification": "வில்லங்கச் சான்று சரிபார்ப்பு",
    "Property Registered": "சொத்து பதிவு செய்யப்பட்டது",
    "Mutation Applied": "பட்டா மாற்றத்திற்கு விண்ணப்பிக்கப்பட்டது",
    "Title Dispute Filed": "உரிமை தகராறு வழக்கு தாக்கல் செய்யப்பட்டது",
    "SBI Mortgage Registered": "எஸ்பிஐ அடமானம் பதிவு செய்யப்பட்டது",
    "Govt Acquisition Notice": "அரசு கையகப்படுத்துதல் அறிவிப்பு",
    "High Court Challenge": "உயர் நீதிமன்ற சவால்",
    "Inheritance Transfer": "வாரிசு உரிமை மாற்றம்",
    "Inheritance Case Filed": "வாரிசு வழக்கு தாக்கல் செய்யப்பட்டது",
    "Mediation Attempted": "சமரசம் முயற்சிக்கப்பட்டது",
    "Mutation & Registration": "பதிவு மற்றும் பட்டா மாற்றம்",
    "Court-ordered Freeze": "நீதிமன்ற உத்தரவுப்படி முடக்கம்",
    "Axis Bank Mortgage": "ஆக்சிஸ் வங்கி அடமானம்",

    // Timeline descriptions
    "Ramesh Babu Reddy purchased from previous owner Suresh Kumar": "ரமேஷ் பாபு ரெட்டி முந்தைய உரிமையாளர் சுரேஷ் குமாரிடமிருந்து வாங்கினார்",
    "Revenue records updated with new ownership": "வருவாய் ஆவணங்கள் புதிய உரிமையாளருடன் புதுப்பிக்கப்பட்டன",
    "Encumbrance certificate verified - clear": "வில்லங்கச் சான்று சரிபார்க்கப்பட்டது - தெளிவு",
    "Sale deed registered by Suresh Goud from Pochaiah": "சுரேஷ் கவுட் போசையாவிடமிருந்து விற்பனைப் பத்திரத்தை பதிவு செய்தார்",
    "Mutation application submitted to Tahsildar office": "பட்டா மாற்ற விண்ணப்பம் வட்டாட்சியர் அலுவலகத்தில் சமர்ப்பிக்கப்பட்டது",
    "Nagaiah filed title dispute claiming ancestral rights": "நாகையா பாரம்பரிய உரிமைகளைக் கோரி உரிமை தகராறு வழக்கைத் தாக்கல் செய்தார்",
    "Property mortgaged for home loan of ₹45 Lakhs": "₹45 லட்சம் வீட்டுக்கடனுக்காக சொத்து அடமானம் வைக்கப்பட்டது",
    "Partial acquisition proposed for road widening project": "சாலை விரிவாக்க திட்டத்திற்காக பகுதி கையகப்படுத்தல் முன்மொழியப்பட்டது",
    "Writ petition filed against acquisition": "கையகப்படுத்துதலுக்கு எதிராக பேராணை மனு தாக்கல் செய்யப்பட்டது",
    "Property transferred to Lakshmi Devi after father's demise": "தந்தை மறைவுக்குப் பிறகு லட்சுமி தேவிக்கு சொத்து மாற்றப்பட்டது",
    "Revenue records updated via succession certificate": "வாரிசு சான்றிதழ் மூலம் வருவாய் ஆவணங்கள் புதுப்பிக்கப்பட்டன",
    "Brother filed for equal partition of inherited land": "வாரிசு நிலத்தில் சம பங்கு கோரி சகோதரர் வழக்கு தாக்கல் செய்தார்",
    "Court-ordered mediation session — inconclusive": "நீதிமன்ற உத்தரவுப்படி சமரச அமர்வு - முடிவடையவில்லை",
    "Purchased from M/s. Emerald Developers Pvt. Ltd.": "எம்/எஸ். எமரால்டு டெவலப்பர்ஸ் பிரைவேட் லிமிடெட்டிடமிருந்து வாங்கப்பட்டது",
    "Sale deed registered and mutation completed": "விற்பனை பத்திரம் பதிவு செய்யப்பட்டு பட்டா மாற்றம் நிறைவடைந்தது",
    "Latest EC shows clear title with no encumbrances": "சமீபத்திய வில்லங்கச் சான்று எந்த வில்லங்கமும் இல்லாத தெளிவான உரிமையைக் காட்டுகிறது",
    "Sale deed registered in the name of Venkateshwarlu": "விற்பனை பத்திரம் வெங்கடேஸ்வரலு பெயரில் பதிவு செய்யப்பட்டது",
    "Multiple claimants filed civil suit alleging fraud": "போலி ஆவணங்கள் மூலம் உரிமை மாற்றம் செய்யப்பட்டதாகப் பல கோரிக்கையாளர்கள் உரிமையியல் வழக்கு தொடர்ந்தனர்",
    "Forgery case registered by Cyberabad Police": "சைபராபாத் காவல்துறையால் ஆவண மோசடி வழக்கு பதிவு செய்யப்பட்டது",
    "State filed petition for land reclamation": "மாநில அரசு நில மீட்பு மனு தாக்கல் செய்தது",
    "All transactions on the property frozen by court order": "சொத்து மீதான அனைத்து பரிவர்த்தனைகளும் நீதிமன்ற உத்தரவால் முடக்கப்பட்டன",
    "Purchased from Sri Sai Developers through registered sale deed": "ஸ்ரீ சாய் டெவலப்பர்ஸிடமிருந்து பதிவு செய்யப்பட்ட விற்பனை பத்திரம் மூலம் வாங்கப்பட்டது",
    "ICICI Bank mortgage registered for ₹20 Lakhs": "₹20 லட்சம் ஐசிஐசிஐ வங்கி அடமானம் பதிவு செய்யப்பட்டது",
    "Neighbor filed suit claiming boundary encroachment": "எல்லையை ஆக்கிரமித்ததாக பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Registered sale deed from previous owner Yellaiah": "முந்தைய உரிமையாளர் எல்லையாவிடமிருந்து பதிவு செய்யப்பட்ட விற்பனை பத்திரம்",
    "All revenue records updated": "அனைத்து வருவாய் ஆவணங்களும் புதுப்பிக்கப்பட்டன",
    "Encumbrance certificate shows no issues for 30 years": "வில்லங்கச் சான்று 30 ஆண்டுகளாக எந்தப் பிரச்சினையும் இல்லாததைக் காட்டுகிறது",
    "Joint purchase by Mohammed Ismail (alleged sole)": "முகமது இஸ்மாயில் கூட்டு வாங்குதல் (தனி நபர் என்று கூறப்படும்)",
    "Revenue records show single ownership": "வருவாய் பதிவுகள் ஒற்றை உரிமையைக் காட்டுகின்றன",
    "Application for agricultural to commercial conversion": "விவசாய நிலத்திலிருந்து வணிக நிலமாக மாற்ற விண்ணப்பம்",
    "Ahmed Khan claimed 50% ownership in court": "அகமது கான் நீதிமன்றத்தில் 50% உரிமையைக் கோரினார்",
    "Department questioned conversion validity": "நில வகைப்பாடு மாற்றத்தின் செல்லுபடியாகும் தன்மையை துறை கேள்வி எழுப்பியது",
    "Joint purchase by Bharathi and Raju": "பாரதி மற்றும் ராஜு ஆகியோரின் கூட்டு வாங்குதல்",
    "Joint names entered in revenue records": "வருவாய் ஆவணங்களில் கூட்டுப் பெயர்கள் சேர்க்கப்பட்டன",
    "GHMC issued notice for 2 acres for airport expansion": "விமான நிலைய விரிவாக்கத்திற்காக 2 ஏக்கர் நிலத்திற்கு ஜிஎச்சிடி அறிவிப்பு வெளியிட்டது",
    "Owners challenged the compensation amount in tribunal": "உரிமையாளர்கள் தீர்ப்பாயத்தில் இழப்பீட்டுத் தொகையை எதிர்த்து வழக்கு தொடர்ந்தனர்",
    "Anand Kumar purchased from DLF Builders": "ஆனந்த் குமார் டிஎல்எஃப் பில்டர்ஸிடமிருந்து வாங்கினார்",
    "Clear certificate generated": "தெளிவான சான்றிதழ் உருவாக்கப்பட்டது",
    "Sale deed registered": "விற்பனை பத்திரம் பதிவு செய்யப்பட்டது",
    "Government claims encroachment": "அரசு ஆக்கிரமிப்பு என்று கூறுகிறது",
    "Government claims encroachment on adjacent park land.": "அருகில் உள்ள பூங்கா நிலத்தை ஆக்கிரமித்துள்ளதாக அரசு கூறுகிறது.",
    "Construction halted by court": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Construction halted by court order": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "HDFC mortgage registered": "ஹெச்டிஎப்சி அடமானம் பதிவு செய்யப்பட்டது",
    "Registered at Tambaram Sub-Registrar": "தாம்பரம் சார்பதிவாளர் அலுவலகத்தில் பதிவு செய்யப்பட்டது",
    "Patta name transfer completed": "பட்டா பெயர் மாற்றம் நிறைவடைந்தது",
    "Ramasamy claimed share in property": "ராமசாமி சொத்தில் பங்கு கோரினார்",
    "Registered as Industrial Land": "தொழில்துறை நிலமாக பதிவு செய்யப்பட்டது",
    "Area marked for potential SIPCOT expansion": "சாத்தியமான சிப்காட் விரிவாக்கத்திற்காக பகுதி குறிக்கப்பட்டுள்ளது",

    // Extra case properties
    "Title Dispute": "உரிமை தகராறு",
    "Government Acquisition Challenge": "அரசு நிலம் கையகப்படுத்துதல் சவால்",
    "Inheritance Dispute": "வாரிசு உரிமை தகராறு",
    "Boundary Dispute": "எல்லை தகராறு",
    "Partnership Dispute": "கூட்டாண்மை தகராறு",
    "Revenue Dispute": "வருவாய் தகராறு",
    "Land Acquisition Compensation": "நிலம் கையகப்படுத்துதல் இழப்பீடு",
    "Title & Boundary Dispute": "உரிமை மற்றும் எல்லை தகராறு",
    "Partition Suit": "பாகப்பிரிவினை வழக்கு",
    "Fraud & Title Dispute": "மோசடி மற்றும் உரிமை தகராறு",
    "Criminal Case — Forgery": "குற்றவியல் வழக்கு — ஆவண மோசடி",
    "Government Land Reclamation": "அரசு நில மீட்பு",

    // Extra case details
    "District Court, Rangareddy": "மாவட்ட நீதிமன்றம், ரங்காரெட்டி",
    "High Court, Hyderabad": "உயர் நீதிமன்றம், ஹைதராபாத்",
    "Civil Court, Serilingampally": "உரிமையியல் நீதிமன்றம், சேரிலிங்கம்பள்ளி",
    "Revenue Court, Kukatpally": "வருவாய் நீதிமன்றம், குகட்பள்ளி",
    "Land Acquisition Tribunal, Rangareddy": "நிலம் கையகப்படுத்துதல் தீர்ப்பாயம், ரங்காரெட்டி",
    "City Civil Court, Hyderabad": "மாநகர உரிமையியல் நீதிமன்றம், ஹைதராபாத்",
    "District Court, Madurai": "மாவட்ட நீதிமன்றம், மதுரை",
    "Civil Court, Serilingampally": "உரிமையியல் நீதிமன்றம், சேரிலிங்கம்பள்ளி",
    "District Court, Madurai": "மாவட்ட நீதிமன்றம், மதுரை",
    "District Court, Rangareddy": "மாவட்ட நீதிமன்றம், ரங்காரெட்டி",
    "WP No. 8923/2023": "WP எண் 8923/2023",
    "OS No. 1456/2021": "OS எண் 1456/2021",
    "OS No. 342/2024": "OS எண் 342/2024",
    "OS No. 2890/2019": "OS எண் 2890/2019",
    "CR No. 456/2020": "CR எண் 456/2020",
    "WP No. 12045/2020": "WP எண் 12045/2020",
    "OS No. 567/2025": "OS எண் 567/2025",
    "OS No. 789/2022": "OS எண் 789/2022",
    "SA No. 234/2024": "SA எண் 234/2024",
    "LA No. 112/2023": "LA எண் 112/2023",
    "OS No. 120/2018": "OS எண் 120/2018",
    "OS 45/2021": "OS 45/2021",
    "Active Bank Loan (SBI)": "செயலில் உள்ள வங்கி கடன் (எஸ்பிஐ)",
    "Active Mortgage": "செயலில் உள்ள அடமானம்",
    "Court Stay Order": "நீதிமன்ற தடை உத்தரவு",
    "1 Active Dispute": "1 செயலில் உள்ள வழக்கு",
    "Encroachment alleged": "ஆக்கிரமிப்பு செய்யப்பட்டுள்ளதாகக் கூறப்படுகிறது",

    // --- Missing court case descriptions ---
    "Plaintiff Nagaiah claims ancestral ownership of the property. Disputes the sale deed executed in 2015.": "வாதி நாகையா சொத்தின் பாரம்பரிய உரிமையைக் கோருகிறார். 2015-ல் செயல்படுத்தப்பட்ட விற்பனை பத்திரத்தை மறுக்கிறார்.",
    "Brother Krishna Rao claims equal share in inherited property. Settlement talks underway.": "சகோதரர் கிருஷ்ண ராவ் வாரிசு சொத்தில் சம பங்கு கோருகிறார். சமரச பேச்சுகள் நடைபெறுகின்றன.",
    "Multiple claimants alleging forged sale deed and fraudulent transfer of government land.": "போலி விற்பனை பத்திரம் மற்றும் அரசு நில மோசடி மாற்றம் என பல கோரிக்கையாளர்கள் குற்றம் சாட்டுகின்றனர்.",
    "FIR registered for alleged forgery of revenue records and land documents.": "வருவாய் பதிவுகள் மற்றும் நில ஆவணங்கள் போலியானவை என்ற குற்றசாட்டில் எஃப்ஐஆர் பதிவு செய்யப்பட்டது.",
    "Government claims the land is classified as government poramboke land and seeks reclamation.": "நிலம் அரசு பொரம்போக்கு நிலமாக வகைப்படுத்தப்பட்டுள்ளதாக அரசு கூறி மீட்பை கோருகிறது.",
    "Revenue department questioning the land classification conversion from agricultural to commercial.": "விவசாயத்திலிருந்து வணிகமாக மாற்றப்பட்ட நில வகைப்பாட்டை வருவாய் துறை கேள்வி எழுப்புகிறது.",
    "Dispute over compensation amount for 2 acres acquired for airport expansion. Owners demanding market rate.": "விமான நிலைய விரிவாக்கத்திற்காக கையகப்படுத்தப்பட்ட 2 ஏக்கருக்கான இழப்பீட்டுத் தொகை குறித்து தகராறு. உரிமையாளர்கள் சந்தை விலையை கோருகின்றனர்.",
    "Dispute over alleged encroachment on government poramboke land.": "அரசு பொரம்போக்கு நிலத்தில் ஆக்கிரமிப்பு என்ற குற்றசாட்டு குறித்து தகராறு.",

    // --- Missing risk factor values ---
    "2 active cases": "2 செயலில் உள்ள வழக்குகள்",
    "2 active cases (incl. criminal)": "2 செயலில் உள்ள வழக்குகள் (குற்றவியல் உட்பட)",
    "3 active cases (incl. criminal)": "3 செயலில் உள்ள வழக்குகள் (குற்றவியல் உட்பட)",
    "Disputed ownership": "தகராறில் உள்ள உரிமை",
    "Mortgage + Tax Lien": "அடமானம் + வரி பற்று",
    "Partial acquisition proposed": "பகுதி கையகப்படுத்தல் முன்மொழியப்பட்டது",
    "1 inheritance dispute": "1 வாரிசு உரிமை தகராறு",
    "Family dispute — settleable": "குடும்ப தகராறு — சமரசம் செய்யக்கூடியது",
    "Minor tax pending": "சிறிய வரி நிலுவையில் உள்ளது",
    "Clear chain of ownership": "தெளிவான உரிமை தொடர்",
    "Clear certificate": "தெளிவான சான்றிதழ்",
    "No acquisition": "கையகப்படுத்தல் இல்லை",
    "1 boundary dispute": "1 எல்லை தகராறு",
    "Boundary under dispute": "எல்லை தகராறில் உள்ளது",
    "Active mortgage — manageable": "செயலில் உள்ள அடமானம் — கட்டுப்படுத்தக்கூடியது",
    "No acquisition orders": "கையகப்படுத்தல் உத்தரவுகள் இல்லை",
    "Clean chain of title": "தெளிவான உரிமை வரிசை",
    "Fully clear": "முழுவதும் தெளிவு",
    "No issues": "பிரச்சினைகள் இல்லை",
    "2 active disputes": "2 செயலில் உள்ள தகராறுகள்",
    "Partnership claim exists": "கூட்டாண்மை கோரிக்கை உள்ளது",
    "Active mortgage + Stay order": "செயலில் உள்ள அடமானம் + தடை உத்தரவு",
    "Classification under review": "வகைப்பாடு மதிப்பாய்வில் உள்ளது",
    "1 acquisition dispute": "1 கையகப்படுத்தல் தகராறு",
    "No title dispute": "உரிமை தகராறு இல்லை",
    "Govt notice on partial land": "பகுதி நிலத்தில் அரசு அறிவிப்பு",
    "2 acres under acquisition": "2 ஏக்கர் கையகப்படுத்துதலில் உள்ளது",
    "1 active case (Govt dispute)": "1 செயலில் உள்ள வழக்கு (அரசு தகராறு)",
    "Heavy Mortgage + Stay": "கனமான அடமானம் + தடை",
    "Disputed area under threat": "தகராறில் உள்ள பகுதிக்கு அச்சுறுத்தல்",
    "Active home loan": "செயலில் உள்ள வீட்டுக்கடன்",
    "1 Active Partition Suit": "1 செயலில் உள்ள பாகப்பிரிவினை வழக்கு",
    "Ancestral property dispute": "பூர்வீக சொத்து தகராறு",
    "Agri Loan Active": "விவசாயக் கடன் செயலில் உள்ளது",
    "Possible future acquisition": "எதிர்கால கையகப்படுத்தல் சாத்தியமுள்ளது",
    "No Mortgages": "அடமானங்கள் இல்லை",
    "Alleged forged documents": "போலி ஆவணங்கள் என்று குற்றஞ்சாட்டப்பட்டது",
    "Court-ordered freeze + Govt lien": "நீதிமன்ற முடக்கம் + அரசு பற்று",
    "Govt land reclamation pending": "அரசு நில மீட்பு நிலுவையில் உள்ளது",

    // --- Missing encumbrance / mortgage strings ---
    "HDFC Bank — ₹1.2 Crore (Frozen by Court Order)": "ஹெச்டிஎப்சி வங்கி — ₹1.2 கோடி (நீதிமன்ற உத்தரவால் முடக்கப்பட்டது)",
    "Government Lien — Land Revenue Dept., Court-ordered attachment": "அரசு பற்று — நில வருவாய் துறை, நீதிமன்றம் உத்தரவிட்ட இணைப்பு",
    "Pending Court Case": "நிலுவையில் உள்ள நீதிமன்ற வழக்கு",
    "HDFC Home Loan - Active": "ஹெச்டிஎப்சி வீட்டுக்கடன் - செயல்பாட்டில் உள்ளது",
    "ICICI Bank — ₹20 Lakhs (Active)": "ஐசிஐசிஐ வங்கி — ₹20 லட்சம் (செயல்பாட்டில் உள்ளது)",
    "None": "இல்லை",

    // --- Missing timeline titles/descriptions ---
    "Sale Deed Registered": "விற்பனை பத்திரம் பதிவு செய்யப்பட்டது",
    "Criminal FIR Registered": "குற்றவியல் எஃப்ஐஆர் பதிவு செய்யப்பட்டது",
    "Govt Reclamation Suit": "அரசு நில மீட்பு வழக்கு",
    "Stay Order Issued": "தடை உத்தரவு பிறப்பிக்கப்பட்டது",
    "Govt Dispute Filed": "அரசு தகராறு தாக்கல் செய்யப்பட்டது",
    "Bank Mortgage": "வங்கி அடமானம்",
    "Boundary Dispute Filed": "எல்லை தகராறு தாக்கல் செய்யப்பட்டது",
    "Land Conversion Applied": "நில மாற்றத்திற்கு விண்ணப்பிக்கப்பட்டது",
    "Partnership Dispute Filed": "கூட்டாண்மை தகராறு தாக்கல் செய்யப்பட்டது",
    "Revenue Dispute": "வருவாய் தகராறு",
    "Acquisition Notice": "கையகப்படுத்தல் அறிவிப்பு",
    "Compensation Dispute Filed": "இழப்பீட்டு தகராறு தாக்கல் செய்யப்பட்டது",
    "EC Verified": "வில்லங்கச் சான்று சரிபார்க்கப்பட்டது",
    "EC Verified Clean": "வில்லங்கச் சான்று தெளிவாக சரிபார்க்கப்பட்டது",
    "Patta Registered": "பட்டா பதிவு செய்யப்பட்டது",
    "Partition Suit Filed": "பாகப்பிரிவினை வழக்கு தாக்கல் செய்யப்பட்டது",
    "Govt Notification": "அரசு அறிவிப்பு",
    "Home Loan Approved": "வீட்டுக்கடன் ஒப்புதல் பெறப்பட்டது",
    "Registration & Mutation": "பதிவு மற்றும் பட்டா மாற்றம்",
    "Patta Transferred": "பட்டா மாற்றப்பட்டது",
    "Dispute Filed": "தகராறு தாக்கல் செய்யப்பட்டது",
    "Mortgage Registered": "அடமானம் பதிவு செய்யப்பட்டது",

    // --- Missing timeline descriptions ---
    "Property registered in the name of Venkateshwarlu": "விற்பனை பத்திரம் வெங்கடேஸ்வரலு பெயரில் பதிவு செய்யப்பட்டது",
    "Revenue records updated": "வருவாய் ஆவணங்கள் புதுப்பிக்கப்பட்டன",
    "Revenue records updated successfully": "வருவாய் ஆவணங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன",
    "Clear certificate generated": "தெளிவான சான்றிதழ் உருவாக்கப்பட்டது",
    "State Govt claims encroachment": "மாநில அரசு ஆக்கிரமிப்பு என்று கூறுகிறது",
    "Patta registered under Muthukumar": "பட்டா முத்துக்குமார் பெயரில் பதிவு செய்யப்பட்டது",
    "Bank loan acquired against property": "சொத்துக்கு எதிராக வங்கி கடன் பெறப்பட்டது",
    "Government filed encroachment suit": "அரசு ஆக்கிரமிப்பு வழக்கு தாக்கல் செய்தது",

    // --- Dynamic record / generated data strings ---
    "N/A (Joint Ownership)": "பொருந்தாது (கூட்டு உரிமை)",
    "Criminal Court, Cyberabad": "குற்றவியல் நீதிமன்றம், சைபராபாத்",
    "State vs. Venkateshwarlu": "மாநிலம் எதிர் வெங்கடேஸ்வரலு",
    "State of Telangana vs. Venkateshwarlu": "தெலுங்கானா மாநிலம் எதிர் வெங்கடேஸ்வரலு",
    "Mallaiah & Others vs. Venkateshwarlu": "மல்லையா & மற்றவர்கள் எதிர் வெங்கடேஸ்வரலு",
    "Suresh Goud vs. State of Telangana": "சுரேஷ் கவுட் எதிர் தெலுங்கானா மாநிலம்",
    "Nagaiah vs. Suresh Goud": "நாகையா எதிர் சுரேஷ் கவுட்",
    "Krishna Rao vs. Lakshmi Devi": "கிருஷ்ண ராவ் எதிர் லட்சுமி தேவி",
    "Mohan Rao vs. Anjali Kumari": "மோகன் ராவ் எதிர் அஞ்சலி குமாரி",
    "Revenue Department vs. Mohammed Ismail": "வருவாய் துறை எதிர் முகமது இஸ்மாயில்",
    "Bharathi & Raju vs. GHMC": "பாரதி & ராஜு எதிர் ஜிஎச்எம்சி",
    "State Govt vs. Vijayender Reddy": "மாநில அரசு எதிர் விஜயேந்தர் ரெட்டி",
    "Ramasamy vs Muthukumar": "ராமசாமி எதிர் முத்துக்குமார்",

    // --- Misc strings that appear in the UI ---
    "LOW RISK": "குறைந்த அபாயம்",
    "MEDIUM RISK": "நடுத்தர அபாயம்",
    "HIGH RISK": "அதிக அபாயம்",

    // --- Database-specific Mappings ---
    // Villages, Mandals, Districts, States
    "Kondapur": "கொண்டாப்பூர்",
    "Serilingampally": "சேரிலிங்கம்பள்ளி",
    "Rangareddy": "ரங்காரெட்டி",
    "Telangana": "தெலுங்கானா",
    "Gachibowli": "கச்சிபௌலி",
    "Madhapur": "மாதாப்பூர்",
    "Miyapur": "மியாப்பூர்",
    "Kukatpally": "குகட்பள்ளி",
    "Shamshabad": "சம்சாபாத்",
    "Banjara Hills": "பஞ்சாரா ஹில்ஸ்",
    "Khairatabad": "கைரதாபாத்",
    "Hyderabad": "ஹைதராபாத்",
    "Jubilee Hills": "ஜூபிலி ஹில்ஸ்",
    "Shaikpet": "ஷேக் பேட்",
    "Narsingi": "நர்சிங்கி",
    "Gandipet": "கந்திப்பேட்டை",
    "Sholinganallur": "சோழிங்கநல்லூர்",
    "Tambaram": "தாம்பரம்",
    "Chennai": "சென்னை",
    "Tamil Nadu": "தமிழ்நாடு",
    "Thirumangalam": "திருமங்கலம்",
    "Madurai": "மதுரை",
    "Sriperumbudur": "ஸ்ரீபெரும்புதூர்",
    "Kanchipuram": "காஞ்சிபுரம்",
    "Taluk HQ": "தாலுகா தலைமையகம்",

    // Names & Party Names
    "Ramesh Babu Reddy": "ரமேஷ் பாபு ரெட்டி",
    "Venkat Reddy": "வெங்கட் ரெட்டி",
    "Suresh Goud (Disputed)": "சுரேஷ் கவுட் (தகராறில் உள்ளது)",
    "Suresh Goud": "சுரேஷ் கவுட்",
    "Mallesh Goud": "மல்லேஷ் கவுட்",
    "Lakshmi Devi": "லட்சுமி தேவி",
    "Late Srinivas Rao": "காலஞ்சென்ற ஸ்ரீனிவாஸ் ராவ்",
    "Priya Sharma": "பிரியா சர்மா",
    "Rajendra Sharma": "ராஜேந்திர சர்மா",
    "Venkateshwarlu (Under Dispute)": "வெங்கடேஸ்வரலு (தகராறில் உள்ளது)",
    "Venkateshwarlu": "வெங்கடேஸ்வரலு",
    "Hanumanthu": "அனுமந்து",
    "Anjali Kumari": "அஞ்சலி குமாரி",
    "Ravi Kumar": "ரவி குமார்",
    "Srinivasa Rao Pothireddy": "சீனிவாச ராவ் போதிரெட்டி",
    "Narasimha Rao Pothireddy": "நரசிம்ம ராவ் போதிரெட்டி",
    "Mohammed Ismail": "முகமது இஸ்மாயில்",
    "Mohammed Ibrahim": "முகமது இப்ராகிம்",
    "Ahmed Khan": "அகமது கான்",
    "Krishna Rao": "கிருஷ்ண ராவ்",
    "Nagaiah": "நாகையா",
    "Mohan Rao": "மோகன் ராவ்",
    "Ramasamy": "ராமசாமி",
    "Bharathi & Raju (Joint)": "பாரதி & ராஜு (கூட்டு)",
    "Bharathi & Raju": "பாரதி & ராஜு",
    "Anand Kumar": "ஆனந்த் குமார்",
    "Siva Kumar": "சிவா குமார்",
    "Vijayender Reddy (Disputed)": "விஜயேந்தர் ரெட்டி (தகராறில் உள்ளது)",
    "Vijayender Reddy": "விஜயேந்தர் ரெட்டி",
    "Pratap Reddy": "பிரதாப் ரெட்டி",
    "Swapna G": "ஸ்வப்னா ஜி",
    "Kishore G": "கிஷோர் ஜி",
    "Karthik Subramanian": "கார்த்திக் சுப்பிரமணியன்",
    "Subramanian V": "சுப்பிரமணியன் வி",
    "Muthukumar (Disputed)": "முத்துக்குமார் (தகராறில் உள்ளது)",
    "Muthukumar": "முத்துக்குமார்",
    "Palanisamy": "பழனிச்சாமி",
    "Lakshmi Narayanan": "லட்சுமி நாராயணன்",
    "Venkatraman": "வெங்கட்ராமன்",
    "Suresh Kumar": "சுரேஷ் குமார்",
    "Pochaiah": "போசையா",
    "M/s. Emerald Developers Pvt. Ltd.": "எம்/எஸ். எமரால்டு டெவலப்பர்ஸ் பிரைவேட் லிமிடெட்",
    "Sri Sai Developers": "ஸ்ரீ சாய் டெவலப்பர்ஸ்",
    "DLF Builders": "டிஎல்எஃப் பில்டர்ஸ்",

    // Classifications
    "Agricultural Land": "விவசாய நிலம்",
    "Non-Agricultural (Converted)": "விவசாயம் அல்லாத நிலம் (மாற்றப்பட்டது)",
    "Residential Zone": "குடியிருப்பு மண்டலம்",
    "Mixed Use (Disputed)": "கலப்பு பயன்பாடு (தகராறில் உள்ளது)",
    "Residential": "குடியிருப்பு",
    "Commercial Zone": "வணிக மண்டலம்",
    "Commercial": "வணிகம்",
    "Agricultural (Near Airport Zone)": "விவசாய நிலம் (விமான நிலைய பகுதி அருகில்)",
    "Agricultural": "விவசாய நிலம்",
    "Industrial": "தொழில்துறை",

    // Encumbrance details
    "Clear": "தெளிவு",
    "Encumbered": "வில்லங்கம் உள்ளது",
    "Minor Encumbrance": "சிறிய வில்லங்கம்",
    "Partial Encumbrance": "பகுதி வில்லங்கம்",
    "Heavily Encumbered": "கடுமையான வில்லங்கம்",
    "SBI Home Loan — ₹45 Lakhs (Outstanding)": "எஸ்பிஐ வீட்டுக்கடன் — ₹45 லட்சம் (நிலுவையில் உள்ளது)",
    "Revenue Department Lien — Pending Tax": "வருவாய்த்துறை பற்று — நிலுவை வரி",
    "Axis Bank — ₹80 Lakhs (Active)": "ஆக்சிஸ் வங்கி — ₹80 லட்சம் (செயல்பாட்டில் உள்ளது)",
    "Revenue Court Stay Order": "வருவாய் நீதிமன்ற தடை உத்தரவு",
    "Government Acquisition Notice on 2 Acres": "2 ஏக்கரில் அரசு கையகப்படுத்தும் அறிவிப்பு",
    "Proposed SIPCOT Expansion Phase 3": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம் கட்டம் 3",
    "Indian Bank Agri Loan - Active": "இந்தியன் வங்கி விவசாயக் கடன் - செயல்பாட்டில் உள்ளது",
    "Proposed SIPCOT Expansion": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம்",
    "SIPCOT Expansion": "சிப்காட் விரிவாக்கம்",
    "SIPCOT expansion": "சிப்காட் விரிவாக்கம்",
    "Proposed road widening acquisition of 0.5 acres from the survey": "இந்த சர்வேயிலிருந்து 0.5 ஏக்கர் சாலை விரிவாக்கத்திற்காக கையகப்படுத்த முன்மொழியப்பட்டது",
    "Revenue tax pending — ₹12,000": "நிலுவையில் உள்ள வருவாய் வரி — ₹12,000",
    "Revenue tax pending": "நிலுவையில் உள்ள வருவாய் வரி",
    "Challenge against proposed road widening acquisition of 0.5 acres from the survey.": "இந்த சர்வேயிலிருந்து 0.5 ஏக்கர் சாலை விரிவாக்கத்திற்காக கையகப்படுத்த முன்மொழியப்பட்டதற்கு எதிரான சவால்.",
    "Neighboring landowner Mohan Rao disputes the boundary demarcation claiming encroachment of 5 guntas.": "பக்கத்து நில உரிமையாளர் மோகன் ராவ் 5 குண்டா ஆக்கிரமிப்பு செய்துள்ளதாக எல்லையை பிரிக்கக் கோரி தகராறு செய்கிறார்.",
    "Neighbor filed suit claiming boundary encroachment": "எல்லையை ஆக்கிரமித்ததாக பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Neighbor filed suit": "பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "neighbor filed suit": "பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Ahmed Khan vs. Mohammed Ismail": "அகமது கான் எதிர் முகமது இஸ்மாயில்",
    "Former business partner claims 50% ownership based on oral agreement and partial payment receipts.": "வாய்மொழி ஒப்பந்தம் மற்றும் பகுதி கட்டண ரசீதுகளின் அடிப்படையில் முன்னாள் வணிக கூட்டாளி 50% உரிமையைக் கோருகிறார்.",
    "Joint purchase by Mohammed Ismail (alleged sole)": "முகமது இஸ்மாயில் கூட்டு வாங்குதல் (தனி நபர் என்று கூறப்படும்)",
    "Revenue records show single ownership": "வருவாய் பதிவுகள் ஒற்றை உரிமையைக் காட்டுகின்றன",
    "Application for agricultural to commercial conversion": "விவசாய நிலத்திலிருந்து வணிக நிலமாக மாற்ற விண்ணப்பம்",
    "Ahmed Khan claimed 50% ownership in court": "அகமது கான் நீதிமன்றத்தில் 50% உரிமையைக் கோரினார்",
    "Department questioned conversion validity": "நில வகைப்பாடு மாற்றத்தின் செல்லுபடியாகும் தன்மையை துறை கேள்வி எழுப்பியது",
    "Joint purchase by Bharathi and Raju": "பாரதி மற்றும் ராஜு ஆகியோரின் கூட்டு வாங்குதல்",
    "GHMC issued notice for 2 acres for airport expansion": "விமான நிலைய விரிவாக்கத்திற்காக 2 ஏக்கர் நிலத்திற்கு ஜிஎச்சிடி அறிவிப்பு வெளியிட்டது",
    "Owners challenged the compensation amount in tribunal": "உரிமையாளர்கள் தீர்ப்பாயத்தில் இழப்பீட்டுத் தொகையை எதிர்த்து வழக்கு தொடர்ந்தனர்",
    "Anand Kumar purchased from DLF Builders": "ஆனந்த் குமார் டிஎல்எஃப் பில்டர்ஸிடமிருந்து வாங்கினார்",
    "Government claims encroachment on adjacent park land.": "அருகில் உள்ள பூங்கா நிலத்தை ஆக்கிரமித்துள்ளதாக அரசு கூறுகிறது.",
    "Construction halted by court order": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Construction halted by court": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "Registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "HDFC mortgage registered": "ஹெச்டிஎப்சி அடமானம் பதிவு செய்யப்பட்டது",
    "flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "Flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "Registered at Tambaram Sub-Registrar": "தாம்பரம் சார்பதிவாளர் அலுவலகத்தில் பதிவு செய்யப்பட்டது",
    "Patta name transfer completed": "பட்டா பெயர் மாற்றம் நிறைவடைந்தது",
    "Brother filed a partition suit claiming equal share in ancestral property.": "பூர்வீக சொத்தில் சம பங்கு கோரி சகோதரர் பாகப்பிரிவினை வழக்கு தொடர்ந்தார்.",
    "Ramasamy claimed share in property": "ராமசாமி சொத்தில் பங்கு கோரினார்",
    "Registered as Industrial Land": "தொழில்துறை நிலமாக பதிவு செய்யப்பட்டது",
    "Area marked for potential SIPCOT expansion": "சாத்தியமான சிப்காட் விரிவாக்கத்திற்காக பகுதி குறிக்கப்பட்டுள்ளது",
    "proposed SIPCOT expansion": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம்",
    "SBI Loan — ₹10 Crore": "எஸ்பிஐ கடன் — ₹10 கோடி",
    "Court Stay Order Active": "நீதிமன்ற தடை உத்தரவு செயலில் உள்ளது",
    "SBI Home Loan — ₹45 Lakhs (Outstanding)": "எஸ்பிஐ வீட்டுக்கடன் — ₹45 லட்சம் (நிலுவையில் உள்ளது)",
    "Revenue Department Lien — Pending Tax": "வருவாய்த்துறை பற்று — நிலுவை வரி",
    "Axis Bank — ₹80 Lakhs (Active)": "ஆக்சிஸ் வங்கி — ₹80 லட்சம் (செயல்பாட்டில் உள்ளது)",
    "Revenue Court Stay Order": "வருவாய் நீதிமன்ற தடை உத்தரவு",
    "Government Acquisition Notice on 2 Acres": "2 ஏக்கரில் அரசு கையகப்படுத்தும் அறிவிப்பு",
    "Proposed SIPCOT Expansion Phase 3": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம் கட்டம் 3",
    "Indian Bank Agri Loan - Active": "இந்தியன் வங்கி விவசாயக் கடன் - செயல்பாட்டில் உள்ளது",

    // Address
    "H.No. 12-5-34, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 12-5-34, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 8-2-120, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 8-2-120, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 3-8-67, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 3-8-67, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "Plot No. 45, Gachibowli Village, Serilingampally Mandal, Rangareddy District": "மனை எண் 45, கச்சிபௌலி கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 6-3-45, Gachibowli Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 6-3-45, கச்சிபௌலி கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 11-4-56, Madhapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 11-4-56, மாதாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 5-9-102, Miyapur Village, Miyapur Mandal, Rangareddy District": "கதவு எண் 5-9-102, மியாப்பூர் கிராமம், மியாப்பூர் மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 18-7-89, Kukatpally Village, Kukatpally Mandal, Rangareddy District": "கதவு எண் 18-7-89, குகட்பள்ளி கிராமம், குகட்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 2-1-34, Shamshabad Village, Shamshabad Mandal, Rangareddy District": "கதவு எண் 2-1-34, சம்சாபாத் கிராமம், சம்சாபாத் மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "Plot 12, Road No 10, Banjara Hills, Hyderabad": "மனை எண் 12, சாலை எண் 10, பஞ்சாரா ஹில்ஸ், ஹைதராபாத்",
    "Plot 88, Road No 36, Jubilee Hills, Hyderabad": "மனை எண் 88, சாலை எண் 36, ஜூபிலி ஹில்ஸ், ஹைதராபாத்",
    "Villa 15, Narsingi, Gandipet Mandal": "வில்லா 15, நர்சிங்கி, கந்திப்பேட்டை மண்டலம்",
    "Flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "12, South Street, Thirumangalam, Madurai": "12, தெற்கு தெரு, திருமங்கலம், மதுரை",
    "Plot 45, SIPCOT area, Sriperumbudur, Kanchipuram": "மனை எண் 45, சிப்காட் பகுதி, ஸ்ரீபெரும்புதூர், காஞ்சிபுரம்",

    // Timeline titles
    "Property Purchased": "சொத்து வாங்கப்பட்டது",
    "Mutation Completed": "பட்டா மாற்றம் செய்யப்பட்டது",
    "EC Verification": "வில்லங்கச் சான்று சரிபார்ப்பு",
    "Property Registered": "சொத்து பதிவு செய்யப்பட்டது",
    "Mutation Applied": "பட்டா மாற்றத்திற்கு விண்ணப்பிக்கப்பட்டது",
    "Title Dispute Filed": "உரிமை தகராறு வழக்கு தாக்கல் செய்யப்பட்டது",
    "SBI Mortgage Registered": "எஸ்பிஐ அடமானம் பதிவு செய்யப்பட்டது",
    "Govt Acquisition Notice": "அரசு கையகப்படுத்துதல் அறிவிப்பு",
    "High Court Challenge": "உயர் நீதிமன்ற சவால்",
    "Inheritance Transfer": "வாரிசு உரிமை மாற்றம்",
    "Inheritance Case Filed": "வாரிசு வழக்கு தாக்கல் செய்யப்பட்டது",
    "Mediation Attempted": "சமரசம் முயற்சிக்கப்பட்டது",
    "Mutation & Registration": "பதிவு மற்றும் பட்டா மாற்றம்",
    "Court-ordered Freeze": "நீதிமன்ற உத்தரவுப்படி முடக்கம்",
    "Axis Bank Mortgage": "ஆக்சிஸ் வங்கி அடமானம்",

    // Timeline descriptions
    "Ramesh Babu Reddy purchased from previous owner Suresh Kumar": "ரமேஷ் பாபு ரெட்டி முந்தைய உரிமையாளர் சுரேஷ் குமாரிடமிருந்து வாங்கினார்",
    "Revenue records updated with new ownership": "வருவாய் ஆவணங்கள் புதிய உரிமையாளருடன் புதுப்பிக்கப்பட்டன",
    "Encumbrance certificate verified - clear": "வில்லங்கச் சான்று சரிபார்க்கப்பட்டது - தெளிவு",
    "Sale deed registered by Suresh Goud from Pochaiah": "சுரேஷ் கவுட் போசையாவிடமிருந்து விற்பனைப் பத்திரத்தை பதிவு செய்தார்",
    "Mutation application submitted to Tahsildar office": "பட்டா மாற்ற விண்ணப்பம் வட்டாட்சியர் அலுவலகத்தில் சமர்ப்பிக்கப்பட்டது",
    "Nagaiah filed title dispute claiming ancestral rights": "நாகையா பாரம்பரிய உரிமைகளைக் கோரி உரிமை தகராறு வழக்கைத் தாக்கல் செய்தார்",
    "Property mortgaged for home loan of ₹45 Lakhs": "₹45 லட்சம் வீட்டுக்கடனுக்காக சொத்து அடமானம் வைக்கப்பட்டது",
    "Partial acquisition proposed for road widening project": "சாலை விரிவாக்க திட்டத்திற்காக பகுதி கையகப்படுத்தல் முன்மொழியப்பட்டது",
    "Writ petition filed against acquisition": "கையகப்படுத்துதலுக்கு எதிராக பேராணை மனு தாக்கல் செய்யப்பட்டது",
    "Property transferred to Lakshmi Devi after father's demise": "தந்தை மறைவுக்குப் பிறகு லட்சுமி தேவிக்கு சொத்து மாற்றப்பட்டது",
    "Revenue records updated via succession certificate": "வாரிசு சான்றிதழ் மூலம் வருவாய் ஆவணங்கள் புதுப்பிக்கப்பட்டன",
    "Brother filed for equal partition of inherited land": "வாரிசு நிலத்தில் சம பங்கு கோரி சகோதரர் வழக்கு தாக்கல் செய்தார்",
    "Court-ordered mediation session — inconclusive": "நீதிமன்ற உத்தரவுப்படி சமரச அமர்வு - முடிவடையவில்லை",
    "Purchased from M/s. Emerald Developers Pvt. Ltd.": "எம்/எஸ். எமரால்டு டெவலப்பர்ஸ் பிரைவேட் லிமிடெட்டிடமிருந்து வாங்கப்பட்டது",
    "Sale deed registered and mutation completed": "விற்பனை பத்திரம் பதிவு செய்யப்பட்டு பட்டா மாற்றம் நிறைவடைந்தது",
    "Latest EC shows clear title with no encumbrances": "சமீபத்திய வில்லங்கச் சான்று எந்த வில்லங்கமும் இல்லாத தெளிவான உரிமையைக் காட்டுகிறது",
    "Sale deed registered in the name of Venkateshwarlu": "விற்பனை பத்திரம் வெங்கடேஸ்வரலு பெயரில் பதிவு செய்யப்பட்டது",
    "Multiple claimants filed civil suit alleging fraud": "போலி ஆவணங்கள் மூலம் உரிமை மாற்றம் செய்யப்பட்டதாகப் பல கோரிக்கையாளர்கள் உரிமையியல் வழக்கு தொடர்ந்தனர்",
    "Forgery case registered by Cyberabad Police": "சைபராபாத் காவல்துறையால் ஆவண மோசடி வழக்கு பதிவு செய்யப்பட்டது",
    "State filed petition for land reclamation": "மாநில அரசு நில மீட்பு மனு தாக்கல் செய்தது",
    "All transactions on the property frozen by court order": "சொத்து மீதான அனைத்து பரிவர்த்தனைகளும் நீதிமன்ற உத்தரவால் முடக்கப்பட்டன",
    "Purchased from Sri Sai Developers through registered sale deed": "ஸ்ரீ சாய் டெவலப்பர்ஸிடமிருந்து பதிவு செய்யப்பட்ட விற்பனை பத்திரம் மூலம் வாங்கப்பட்டது",
    "ICICI Bank mortgage registered for ₹20 Lakhs": "₹20 லட்சம் ஐசிஐசிஐ வங்கி அடமானம் பதிவு செய்யப்பட்டது",
    "Neighbor filed suit claiming boundary encroachment": "எல்லையை ஆக்கிரமித்ததாக பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Registered sale deed from previous owner Yellaiah": "முந்தைய உரிமையாளர் எல்லையாவிடமிருந்து பதிவு செய்யப்பட்ட விற்பனை பத்திரம்",
    "All revenue records updated": "அனைத்து வருவாய் ஆவணங்களும் புதுப்பிக்கப்பட்டன",
    "Encumbrance certificate shows no issues for 30 years": "வில்லங்கச் சான்று 30 ஆண்டுகளாக எந்தப் பிரச்சினையும் இல்லாததைக் காட்டுகிறது",
    "Joint purchase by Mohammed Ismail (alleged sole)": "முகமது இஸ்மாயில் கூட்டு வாங்குதல் (தனி நபர் என்று கூறப்படும்)",
    "Revenue records show single ownership": "வருவாய் பதிவுகள் ஒற்றை உரிமையைக் காட்டுகின்றன",
    "Application for agricultural to commercial conversion": "விவசாய நிலத்திலிருந்து வணிக நிலமாக மாற்ற விண்ணப்பம்",
    "Ahmed Khan claimed 50% ownership in court": "அகமது கான் நீதிமன்றத்தில் 50% உரிமையைக் கோரினார்",
    "Department questioned conversion validity": "நில வகைப்பாடு மாற்றத்தின் செல்லுபடியாகும் தன்மையை துறை கேள்வி எழுப்பியது",
    "Joint purchase by Bharathi and Raju": "பாரதி மற்றும் ராஜு ஆகியோரின் கூட்டு வாங்குதல்",
    "Joint names entered in revenue records": "வருவாய் ஆவணங்களில் கூட்டுப் பெயர்கள் சேர்க்கப்பட்டன",
    "GHMC issued notice for 2 acres for airport expansion": "விமான நிலைய விரிவாக்கத்திற்காக 2 ஏக்கர் நிலத்திற்கு ஜிஎச்சிடி அறிவிப்பு வெளியிட்டது",
    "Owners challenged the compensation amount in tribunal": "உரிமையாளர்கள் தீர்ப்பாயத்தில் இழப்பீட்டுத் தொகையை எதிர்த்து வழக்கு தொடர்ந்தனர்",
    "Anand Kumar purchased from DLF Builders": "ஆனந்த் குமார் டிஎல்எஃப் பில்டர்ஸிடமிருந்து வாங்கினார்",
    "Clear certificate generated": "தெளிவான சான்றிதழ் உருவாக்கப்பட்டது",
    "Sale deed registered": "விற்பனை பத்திரம் பதிவு செய்யப்பட்டது",
    "Government claims encroachment": "அரசு ஆக்கிரமிப்பு என்று கூறுகிறது",
    "Government claims encroachment on adjacent park land.": "அருகில் உள்ள பூங்கா நிலத்தை ஆக்கிரமித்துள்ளதாக அரசு கூறுகிறது.",
    "Construction halted by court": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Construction halted by court order": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "HDFC mortgage registered": "ஹெச்டிஎப்சி அடமானம் பதிவு செய்யப்பட்டது",
    "Registered at Tambaram Sub-Registrar": "தாம்பரம் சார்பதிவாளர் அலுவலகத்தில் பதிவு செய்யப்பட்டது",
    "Patta name transfer completed": "பட்டா பெயர் மாற்றம் நிறைவடைந்தது",
    "Ramasamy claimed share in property": "ராமசாமி சொத்தில் பங்கு கோரினார்",
    "Registered as Industrial Land": "தொழில்துறை நிலமாக பதிவு செய்யப்பட்டது",
    "Area marked for potential SIPCOT expansion": "சாத்தியமான சிப்காட் விரிவாக்கத்திற்காக பகுதி குறிக்கப்பட்டுள்ளது",

    // Extra case properties
    "Title Dispute": "உரிமை தகராறு",
    "Government Acquisition Challenge": "அரசு நிலம் கையகப்படுத்துதல் சவால்",
    "Inheritance Dispute": "வாரிசு உரிமை தகராறு",
    "Boundary Dispute": "எல்லை தகராறு",
    "Partnership Dispute": "கூட்டாண்மை தகராறு",
    "Revenue Dispute": "வருவாய் தகராறு",
    "Land Acquisition Compensation": "நிலம் கையகப்படுத்துதல் இழப்பீடு",
    "Title & Boundary Dispute": "உரிமை மற்றும் எல்லை தகராறு",
    "Partition Suit": "பாகப்பிரிவினை வழக்கு",
    "Fraud & Title Dispute": "மோசடி மற்றும் உரிமை தகராறு",
    "Criminal Case — Forgery": "குற்றவியல் வழக்கு — ஆவண மோசடி",
    "Government Land Reclamation": "அரசு நில மீட்பு",

    // Extra case details
    "District Court, Rangareddy": "மாவட்ட நீதிமன்றம், ரங்காரெட்டி",
    "High Court, Hyderabad": "உயர் நீதிமன்றம், ஹைதராபாத்",
    "Civil Court, Serilingampally": "உரிமையியல் நீதிமன்றம், சேரிலிங்கம்பள்ளி",
    "Revenue Court, Kukatpally": "வருவாய் நீதிமன்றம், குகட்பள்ளி",
    "Land Acquisition Tribunal, Rangareddy": "நிலம் கையகப்படுத்துதல் தீர்ப்பாயம், ரங்காரெட்டி",
    "City Civil Court, Hyderabad": "மாநகர உரிமையியல் நீதிமன்றம், ஹைதராபாத்",
    "District Court, Madurai": "மாவட்ட நீதிமன்றம், மதுரை",
    "Civil Court, Serilingampally": "உரிமையியல் நீதிமன்றம், சேரிலிங்கம்பள்ளி",
    "District Court, Madurai": "மாவட்ட நீதிமன்றம், மதுரை",
    "District Court, Rangareddy": "மாவட்ட நீதிமன்றம், ரங்காரெட்டி",
    "WP No. 8923/2023": "WP எண் 8923/2023",
    "OS No. 1456/2021": "OS எண் 1456/2021",
    "OS No. 342/2024": "OS எண் 342/2024",
    "OS No. 2890/2019": "OS எண் 2890/2019",
    "CR No. 456/2020": "CR எண் 456/2020",
    "WP No. 12045/2020": "WP எண் 12045/2020",
    "OS No. 567/2025": "OS எண் 567/2025",
    "OS No. 789/2022": "OS எண் 789/2022",
    "SA No. 234/2024": "SA எண் 234/2024",
    "LA No. 112/2023": "LA எண் 112/2023",
    "OS No. 120/2018": "OS எண் 120/2018",
    "OS 45/2021": "OS 45/2021",
    "Active Bank Loan (SBI)": "செயலில் உள்ள வங்கி கடன் (எஸ்பிஐ)",
    "Active Mortgage": "செயலில் உள்ள அடமானம்",
    "Court Stay Order": "நீதிமன்ற தடை உத்தரவு",
    "1 Active Dispute": "1 செயலில் உள்ள வழக்கு",
    "Encroachment alleged": "ஆக்கிரமிப்பு செய்யப்பட்டுள்ளதாகக் கூறப்படுகிறது",

    // --- Database-specific Mappings ---
    // Villages, Mandals, Districts, States
    "Kondapur": "கொண்டாப்பூர்",
    "Serilingampally": "சேரிலிங்கம்பள்ளி",
    "Rangareddy": "ரங்காரெட்டி",
    "Telangana": "தெலுங்கானா",
    "Gachibowli": "கச்சிபௌலி",
    "Madhapur": "மாதாப்பூர்",
    "Miyapur": "மியாப்பூர்",
    "Kukatpally": "குகட்பள்ளி",
    "Shamshabad": "சம்சாபாத்",
    "Banjara Hills": "பஞ்சாரா ஹில்ஸ்",
    "Khairatabad": "கைரதாபாத்",
    "Hyderabad": "ஹைதராபாத்",
    "Jubilee Hills": "ஜூபிலி ஹில்ஸ்",
    "Shaikpet": "ஷேக் பேட்",
    "Narsingi": "நர்சிங்கி",
    "Gandipet": "கந்திப்பேட்டை",
    "Sholinganallur": "சோழிங்கநல்லூர்",
    "Tambaram": "தாம்பரம்",
    "Chennai": "சென்னை",
    "Tamil Nadu": "தமிழ்நாடு",
    "Thirumangalam": "திருமங்கலம்",
    "Madurai": "மதுரை",
    "Sriperumbudur": "ஸ்ரீபெரும்புதூர்",
    "Kanchipuram": "காஞ்சிபுரம்",
    "Taluk HQ": "தாலுகா தலைமையகம்",

    // Names & Party Names
    "Ramesh Babu Reddy": "ரமேஷ் பாபு ரெட்டி",
    "Venkat Reddy": "வெங்கட் ரெட்டி",
    "Suresh Goud (Disputed)": "சுரேஷ் கவுட் (தகராறில் உள்ளது)",
    "Suresh Goud": "சுரேஷ் கவுட்",
    "Mallesh Goud": "மல்லேஷ் கவுட்",
    "Lakshmi Devi": "லட்சுமி தேவி",
    "Late Srinivas Rao": "காலஞ்சென்ற ஸ்ரீனிவாஸ் ராவ்",
    "Priya Sharma": "பிரியா சர்மா",
    "Rajendra Sharma": "ராஜேந்திர சர்மா",
    "Venkateshwarlu (Under Dispute)": "வெங்கடேஸ்வரலு (தகராறில் உள்ளது)",
    "Venkateshwarlu": "வெங்கடேஸ்வரலு",
    "Hanumanthu": "அனுமந்து",
    "Anjali Kumari": "அஞ்சலி குமாரி",
    "Ravi Kumar": "ரவி குமார்",
    "Srinivasa Rao Pothireddy": "சீனிவாச ராவ் போதிரெட்டி",
    "Narasimha Rao Pothireddy": "நரசிம்ம ராவ் போதிரெட்டி",
    "Mohammed Ismail": "முகமது இஸ்மாயில்",
    "Mohammed Ibrahim": "முகமது இப்ராகிம்",
    "Ahmed Khan": "அகமது கான்",
    "Krishna Rao": "கிருஷ்ண ராவ்",
    "Nagaiah": "நாகையா",
    "Mohan Rao": "மோகன் ராவ்",
    "Ramasamy": "ராமசாமி",
    "Bharathi & Raju (Joint)": "பாரதி & ராஜு (கூட்டு)",
    "Bharathi & Raju": "பாரதி & ராஜு",
    "Anand Kumar": "ஆனந்த் குமார்",
    "Siva Kumar": "சிவா குமார்",
    "Vijayender Reddy (Disputed)": "விஜயேந்தர் ரெட்டி (தகராறில் உள்ளது)",
    "Vijayender Reddy": "விஜயேந்தர் ரெட்டி",
    "Pratap Reddy": "பிரதாப் ரெட்டி",
    "Swapna G": "ஸ்வப்னா ஜி",
    "Kishore G": "கிஷோர் ஜி",
    "Karthik Subramanian": "கார்த்திக் சுப்பிரமணியன்",
    "Subramanian V": "சுப்பிரமணியன் வி",
    "Muthukumar (Disputed)": "முத்துக்குமார் (தகராறில் உள்ளது)",
    "Muthukumar": "முத்துக்குமார்",
    "Palanisamy": "பழனிச்சாமி",
    "Lakshmi Narayanan": "லட்சுமி நாராயணன்",
    "Venkatraman": "வெங்கட்ராமன்",
    "Suresh Kumar": "சுரேஷ் குமார்",
    "Pochaiah": "போசையா",
    "M/s. Emerald Developers Pvt. Ltd.": "எம்/எஸ். எமரால்டு டெவலப்பர்ஸ் பிரைவேட் லிமிடெட்",
    "Sri Sai Developers": "ஸ்ரீ சாய் டெவலப்பர்ஸ்",
    "DLF Builders": "டிஎல்எஃப் பில்டர்ஸ்",

    // Classifications
    "Agricultural Land": "விவசாய நிலம்",
    "Non-Agricultural (Converted)": "விவசாயம் அல்லாத நிலம் (மாற்றப்பட்டது)",
    "Residential Zone": "குடியிருப்பு மண்டலம்",
    "Mixed Use (Disputed)": "கலப்பு பயன்பாடு (தகராறில் உள்ளது)",
    "Residential": "குடியிருப்பு",
    "Commercial Zone": "வணிக மண்டலம்",
    "Commercial": "வணிகம்",
    "Agricultural (Near Airport Zone)": "விவசாய நிலம் (விமான நிலைய பகுதி அருகில்)",
    "Agricultural": "விவசாய நிலம்",
    "Industrial": "தொழில்துறை",

    // Encumbrance details
    "Clear": "தெளிவு",
    "Encumbered": "வில்லங்கம் உள்ளது",
    "Minor Encumbrance": "சிறிய வில்லங்கம்",
    "Partial Encumbrance": "பகுதி வில்லங்கம்",
    "Heavily Encumbered": "கடுமையான வில்லங்கம்",
    "SBI Home Loan — ₹45 Lakhs (Outstanding)": "எஸ்பிஐ வீட்டுக்கடன் — ₹45 லட்சம் (நிலுவையில் உள்ளது)",
    "Revenue Department Lien — Pending Tax": "வருவாய்த்துறை பற்று — நிலுவை வரி",
    "Axis Bank — ₹80 Lakhs (Active)": "ஆக்சிஸ் வங்கி — ₹80 லட்சம் (செயல்பாட்டில் உள்ளது)",
    "Revenue Court Stay Order": "வருவாய் நீதிமன்ற தடை உத்தரவு",
    "Government Acquisition Notice on 2 Acres": "2 ஏக்கரில் அரசு கையகப்படுத்தும் அறிவிப்பு",
    "Proposed SIPCOT Expansion Phase 3": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம் கட்டம் 3",
    "Indian Bank Agri Loan - Active": "இந்தியன் வங்கி விவசாயக் கடன் - செயல்பாட்டில் உள்ளது",
    "Proposed SIPCOT Expansion": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம்",
    "SIPCOT Expansion": "சிப்காட் விரிவாக்கம்",
    "SIPCOT expansion": "சிப்காட் விரிவாக்கம்",
    "Proposed road widening acquisition of 0.5 acres from the survey": "இந்த சர்வேயிலிருந்து 0.5 ஏக்கர் சாலை விரிவாக்கத்திற்காக கையகப்படுத்த முன்மொழியப்பட்டது",
    "Revenue tax pending — ₹12,000": "நிலுவையில் உள்ள வருவாய் வரி — ₹12,000",
    "Revenue tax pending": "நிலுவையில் உள்ள வருவாய் வரி",
    "Challenge against proposed road widening acquisition of 0.5 acres from the survey.": "இந்த சர்வேயிலிருந்து 0.5 ஏக்கர் சாலை விரிவாக்கத்திற்காக கையகப்படுத்த முன்மொழியப்பட்டதற்கு எதிரான சவால்.",
    "Neighboring landowner Mohan Rao disputes the boundary demarcation claiming encroachment of 5 guntas.": "பக்கத்து நில உரிமையாளர் Mohan Rao 5 குண்டா ஆக்கிரமிப்பு செய்துள்ளதாக எல்லையை பிரிக்கக் கோரி தகராறு செய்கிறார்.",
    "Neighbor filed suit claiming boundary encroachment": "எல்லையை ஆக்கிரமித்ததாக பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Neighbor filed suit": "பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "neighbor filed suit": "பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Ahmed Khan vs. Mohammed Ismail": "அகமது கான் எதிர் முகமது இஸ்மாயில்",
    "Former business partner claims 50% ownership based on oral agreement and partial payment receipts.": "வாய்மொழி ஒப்பந்தம் மற்றும் பகுதி கட்டண ரசீதுகளின் அடிப்படையில் முன்னாள் வணிக கூட்டாளி 50% உரிமையைக் கோருகிறார்.",
    "Joint purchase by Mohammed Ismail (alleged sole)": "முகமது இஸ்மாயில் கூட்டு வாங்குதல் (தனி நபர் என்று கூறப்படும்)",
    "Revenue records show single ownership": "வருவாய் பதிவுகள் ஒற்றை உரிமையைக் காட்டுகின்றன",
    "Application for agricultural to commercial conversion": "விவசாய நிலத்திலிருந்து வணிக நிலமாக மாற்ற விண்ணப்பம்",
    "Ahmed Khan claimed 50% ownership in court": "அகமது கான் நீதிமன்றத்தில் 50% உரிமையைக் கோரினார்",
    "Department questioned conversion validity": "நில வகைப்பாடு மாற்றத்தின் செல்லுபடியாகும் தன்மையை துறை கேள்வி எழுப்பியது",
    "Joint purchase by Bharathi and Raju": "பாரதி மற்றும் ராஜு ஆகியோரின் கூட்டு வாங்குதல்",
    "GHMC issued notice for 2 acres for airport expansion": "விமான நிலைய விரிவாக்கத்திற்காக 2 ஏக்கர் நிலத்திற்கு ஜிஎச்சிடி அறிவிப்பு வெளியிட்டது",
    "Owners challenged the compensation amount in tribunal": "உரிமையாளர்கள் தீர்ப்பாயத்தில் இழப்பீட்டுத் தொகையை எதிர்த்து வழக்கு தொடர்ந்தனர்",
    "Anand Kumar purchased from DLF Builders": "ஆனந்த் குமார் டிஎல்எஃப் பில்டர்ஸிடமிருந்து வாங்கினார்",
    "Government claims encroachment on adjacent park land.": "அருகில் உள்ள பூங்கா நிலத்தை ஆக்கிரமித்துள்ளதாக அரசு கூறுகிறது.",
    "Construction halted by court order": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Construction halted by court": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "Registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "HDFC mortgage registered": "ஹெச்டிஎப்சி அடமானம் பதிவு செய்யப்பட்டது",
    "flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "Flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "Registered at Tambaram Sub-Registrar": "தாம்பரம் சார்பதிவாளர் அலுவலகத்தில் பதிவு செய்யப்பட்டது",
    "Patta name transfer completed": "பட்டா பெயர் மாற்றம் நிறைவடைந்தது",
    "Brother filed a partition suit claiming equal share in ancestral property.": "பூர்வீக சொத்தில் சம பங்கு கோரி சகோதரர் பாகப்பிரிவினை வழக்கு தொடர்ந்தார்.",
    "Ramasamy claimed share in property": "ராமசாமி சொத்தில் பங்கு கோரினார்",
    "Registered as Industrial Land": "தொழில்துறை நிலமாக பதிவு செய்யப்பட்டது",
    "Area marked for potential SIPCOT expansion": "சாத்தியமான சிப்காட் விரிவாக்கத்திற்காக பகுதி குறிக்கப்பட்டுள்ளது",
    "proposed SIPCOT expansion": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம்",
    "SBI Loan — ₹10 Crore": "எஸ்பிஐ கடன் — ₹10 கோடி",
    "Court Stay Order Active": "நீதிமன்ற தடை உத்தரவு செயலில் உள்ளது",
    "SBI Home Loan — ₹45 Lakhs (Outstanding)": "எஸ்பிஐ வீட்டுக்கடன் — ₹45 லட்சம் (நிலுவையில் உள்ளது)",
    "Revenue Department Lien — Pending Tax": "வருவாய்த்துறை பற்று — நிலுவை வரி",
    "Axis Bank — ₹80 Lakhs (Active)": "ஆக்சிஸ் வங்கி — ₹80 லட்சம் (செயல்பாட்டில் உள்ளது)",
    "Revenue Court Stay Order": "வருவாய் நீதிமன்ற தடை உத்தரவு",
    "Government Acquisition Notice on 2 Acres": "2 ஏக்கரில் அரசு கையகப்படுத்தும் அறிவிப்பு",
    "Proposed SIPCOT Expansion Phase 3": "முன்மொழியப்பட்ட சிப்காட் விரிவாக்கம் கட்டம் 3",
    "Indian Bank Agri Loan - Active": "இந்தியன் வங்கி விவசாயக் கடன் - செயல்பாட்டில் உள்ளது",

    // Address
    "H.No. 12-5-34, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 12-5-34, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 8-2-120, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 8-2-120, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 3-8-67, Kondapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 3-8-67, கொண்டாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "Plot No. 45, Gachibowli Village, Serilingampally Mandal, Rangareddy District": "மனை எண் 45, கச்சிபௌலி கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 6-3-45, Gachibowli Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 6-3-45, கச்சிபௌலி கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 11-4-56, Madhapur Village, Serilingampally Mandal, Rangareddy District": "கதவு எண் 11-4-56, மாதாப்பூர் கிராமம், சேரிலிங்கம்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 5-9-102, Miyapur Village, Miyapur Mandal, Rangareddy District": "கதவு எண் 5-9-102, மியாப்பூர் கிராமம், மியாப்பூர் மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 18-7-89, Kukatpally Village, Kukatpally Mandal, Rangareddy District": "கதவு எண் 18-7-89, குகட்பள்ளி கிராமம், குகட்பள்ளி மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "H.No. 2-1-34, Shamshabad Village, Shamshabad Mandal, Rangareddy District": "கதவு எண் 2-1-34, சம்சாபாத் கிராமம், சம்சாபாத் மண்டலம், ரங்காரெட்டி மாவட்டம்",
    "Plot 12, Road No 10, Banjara Hills, Hyderabad": "மனை எண் 12, சாலை எண் 10, பஞ்சாரா ஹில்ஸ், ஹைதராபாத்",
    "Plot 88, Road No 36, Jubilee Hills, Hyderabad": "மனை எண் 88, சாலை எண் 36, ஜூபிலி ஹில்ஸ், ஹைதராபாத்",
    "Villa 15, Narsingi, Gandipet Mandal": "வில்லா 15, நர்சிங்கி, கந்திப்பேட்டை மண்டலம்",
    "Flat 4B, OMR Road, Sholinganallur, Chennai": "பிளாட் 4பி, ஓஎம்ஆர் சாலை, சோழிங்கநல்லூர், சென்னை",
    "12, South Street, Thirumangalam, Madurai": "12, தெற்கு தெரு, திருமங்கலம், மதுரை",
    "Plot 45, SIPCOT area, Sriperumbudur, Kanchipuram": "மனை எண் 45, சிப்காட் பகுதி, ஸ்ரீபெரும்புதூர், காஞ்சிபுரம்",

    // Timeline titles
    "Property Purchased": "சொத்து வாங்கப்பட்டது",
    "Mutation Completed": "பட்டா மாற்றம் செய்யப்பட்டது",
    "EC Verification": "வில்லங்கச் சான்று சரிபார்ப்பு",
    "Property Registered": "சொத்து பதிவு செய்யப்பட்டது",
    "Mutation Applied": "பட்டா மாற்றத்திற்கு விண்ணப்பிக்கப்பட்டது",
    "Title Dispute Filed": "உரிமை தகராறு வழக்கு தாக்கல் செய்யப்பட்டது",
    "SBI Mortgage Registered": "எஸ்பிஐ அடமானம் பதிவு செய்யப்பட்டது",
    "Govt Acquisition Notice": "அரசு கையகப்படுத்துதல் அறிவிப்பு",
    "High Court Challenge": "உயர் நீதிமன்ற சவால்",
    "Inheritance Transfer": "வாரிசு உரிமை மாற்றம்",
    "Inheritance Case Filed": "வாரிசு வழக்கு தாக்கல் செய்யப்பட்டது",
    "Mediation Attempted": "சமரசம் முயற்சிக்கப்பட்டது",
    "Mutation & Registration": "பதிவு மற்றும் பட்டா மாற்றம்",
    "Court-ordered Freeze": "நீதிமன்ற உத்தரவுப்படி முடக்கம்",
    "Axis Bank Mortgage": "ஆக்சிஸ் வங்கி அடமானம்",

    // Timeline descriptions
    "Ramesh Babu Reddy purchased from previous owner Suresh Kumar": "ரமேஷ் பாபு ரெட்டி முந்தைய உரிமையாளர் சுரேஷ் குமாரிடமிருந்து வாங்கினார்",
    "Revenue records updated with new ownership": "வருவாய் ஆவணங்கள் புதிய உரிமையாளருடன் புதுப்பிக்கப்பட்டன",
    "Encumbrance certificate verified - clear": "வில்லங்கச் சான்று சரிபார்க்கப்பட்டது - தெளிவு",
    "Sale deed registered by Suresh Goud from Pochaiah": "சுரேஷ் கவுட் போசையாவிடமிருந்து விற்பனைப் பத்திரத்தை பதிவு செய்தார்",
    "Mutation application submitted to Tahsildar office": "பட்டா மாற்ற விண்ணப்பம் வட்டாட்சியர் அலுவலகத்தில் சமர்ப்பிக்கப்பட்டது",
    "Nagaiah filed title dispute claiming ancestral rights": "நாகையா பாரம்பரிய உரிமைகளைக் கோரி உரிமை தகராறு வழக்கைத் தாக்கல் செய்தார்",
    "Property mortgaged for home loan of ₹45 Lakhs": "₹45 லட்சம் வீட்டுக்கடனுக்காக சொத்து அடமானம் வைக்கப்பட்டது",
    "Partial acquisition proposed for road widening project": "சாலை விரிவாக்க திட்டத்திற்காக பகுதி கையகப்படுத்தல் முன்மொழியப்பட்டது",
    "Writ petition filed against acquisition": "கையகப்படுத்துதலுக்கு எதிராக பேராணை மனு தாக்கல் செய்யப்பட்டது",
    "Property transferred to Lakshmi Devi after father's demise": "தந்தை மறைவுக்குப் பிறகு லட்சுமி தேவிக்கு சொத்து மாற்றப்பட்டது",
    "Revenue records updated via succession certificate": "வாரிசு சான்றிதழ் மூலம் வருவாய் ஆவணங்கள் புதுப்பிக்கப்பட்டன",
    "Brother filed for equal partition of inherited land": "வாரிசு நிலத்தில் சம பங்கு கோரி சகோதரர் வழக்கு தாக்கல் செய்தார்",
    "Court-ordered mediation session — inconclusive": "நீதிமன்ற உத்தரவுப்படி சமரச அமர்வு - முடிவடையவில்லை",
    "Purchased from M/s. Emerald Developers Pvt. Ltd.": "எம்/எஸ். எமரால்டு டெவலப்பர்ஸ் பிரைவேட் லிமிடெட்டிடமிருந்து வாங்கப்பட்டது",
    "Sale deed registered and mutation completed": "விற்பனை பத்திரம் பதிவு செய்யப்பட்டு பட்டா மாற்றம் நிறைவடைந்தது",
    "Latest EC shows clear title with no encumbrances": "சமீபத்திய வில்லங்கச் சான்று எந்த வில்லங்கமும் இல்லாத தெளிவான உரிமையைக் காட்டுகிறது",
    "Sale deed registered in the name of Venkateshwarlu": "விற்பனை பத்திரம் வெங்கடேஸ்வரலு பெயரில் பதிவு செய்யப்பட்டது",
    "Multiple claimants filed civil suit alleging fraud": "போலி ஆவணங்கள் மூலம் உரிமை மாற்றம் செய்யப்பட்டதாகப் பல கோரிக்கையாளர்கள் உரிமையியல் வழக்கு தொடர்ந்தனர்",
    "Forgery case registered by Cyberabad Police": "சைபராபாத் காவல்துறையால் ஆவண மோசடி வழக்கு பதிவு செய்யப்பட்டது",
    "State filed petition for land reclamation": "மாநில அரசு நில மீட்பு மனு தாக்கல் செய்தது",
    "All transactions on the property frozen by court order": "சொத்து மீதான அனைத்து பரிவர்த்தனைகளும் நீதிமன்ற உத்தரவால் முடக்கப்பட்டன",
    "Purchased from Sri Sai Developers through registered sale deed": "ஸ்ரீ சாய் டெவலப்பர்ஸிடமிருந்து பதிவு செய்யப்பட்ட விற்பனை பத்திரம் மூலம் வாங்கப்பட்டது",
    "ICICI Bank mortgage registered for ₹20 Lakhs": "₹20 லட்சம் ஐசிஐசிஐ வங்கி அடமானம் பதிவு செய்யப்பட்டது",
    "Neighbor filed suit claiming boundary encroachment": "எல்லையை ஆக்கிரமித்ததாக பக்கத்து நில உரிமையாளர் வழக்கு தொடர்ந்தார்",
    "Registered sale deed from previous owner Yellaiah": "முந்தைய உரிமையாளர் எல்லையாவிடமிருந்து பதிவு செய்யப்பட்ட விற்பனை பத்திரம்",
    "All revenue records updated": "அனைத்து வருவாய் ஆவணங்களும் புதுப்பிக்கப்பட்டன",
    "Encumbrance certificate shows no issues for 30 years": "வில்லங்கச் சான்று 30 ஆண்டுகளாக எந்தப் பிரச்சினையும் இல்லாததைக் காட்டுகிறது",
    "Joint purchase by Mohammed Ismail (alleged sole)": "முகமது இஸ்மாயில் கூட்டு வாங்குதல் (தனி நபர் என்று கூறப்படும்)",
    "Revenue records show single ownership": "வருவாய் பதிவுகள் ஒற்றை உரிமையைக் காட்டுகின்றன",
    "Application for agricultural to commercial conversion": "விவசாய நிலத்திலிருந்து வணிக நிலமாக மாற்ற விண்ணப்பம்",
    "Ahmed Khan claimed 50% ownership in court": "அகமது கான் நீதிமன்றத்தில் 50% உரிமையைக் கோரினார்",
    "Department questioned conversion validity": "நில வகைப்பாடு மாற்றத்தின் செல்லுபடியாகும் தன்மையை துறை கேள்வி எழுப்பியது",
    "Joint purchase by Bharathi and Raju": "பாரதி மற்றும் ராஜு ஆகியோரின் கூட்டு வாங்குதல்",
    "Joint names entered in revenue records": "வருவாய் ஆவணங்களில் கூட்டுப் பெயர்கள் சேர்க்கப்பட்டன",
    "GHMC issued notice for 2 acres for airport expansion": "விமான நிலைய விரிவாக்கத்திற்காக 2 ஏக்கர் நிலத்திற்கு ஜிஎச்சிடி அறிவிப்பு வெளியிட்டது",
    "Owners challenged the compensation amount in tribunal": "உரிமையாளர்கள் தீர்ப்பாயத்தில் இழப்பீட்டுத் தொகையை எதிர்த்து வழக்கு தொடர்ந்தனர்",
    "Anand Kumar purchased from DLF Builders": "ஆனந்த் குமார் டிஎல்எஃப் பில்டர்ஸிடமிருந்து வாங்கினார்",
    "Clear certificate generated": "தெளிவான சான்றிதழ் உருவாக்கப்பட்டது",
    "Sale deed registered": "விற்பனை பத்திரம் பதிவு செய்யப்பட்டது",
    "Government claims encroachment": "அரசு ஆக்கிரமிப்பு என்று கூறுகிறது",
    "Government claims encroachment on adjacent park land.": "அருகில் உள்ள பூங்கா நிலத்தை ஆக்கிரமித்துள்ளதாக அரசு கூறுகிறது.",
    "Construction halted by court": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Construction halted by court order": "கட்டுமானப் பணி நீதிமன்ற உத்தரவால் நிறுத்தப்பட்டது",
    "Registered from developer": "டெவலப்பரிடமிருந்து பதிவு செய்யப்பட்டது",
    "HDFC mortgage registered": "ஹெச்டிஎப்சி அடமானம் பதிவு செய்யப்பட்டது",
    "Registered at Tambaram Sub-Registrar": "தாம்பரம் சார்பதிவாளர் அலுவலகத்தில் பதிவு செய்யப்பட்டது",
    "Patta name transfer completed": "பட்டா பெயர் மாற்றம் நிறைவடைந்தது",
    "Ramasamy claimed share in property": "ராமசாமி சொத்தில் பங்கு கோரினார்",
    "Registered as Industrial Land": "தொழில்துறை நிலமாக பதிவு செய்யப்பட்டது",
    "Area marked for potential SIPCOT expansion": "சாத்தியமான சிப்காட் விரிவாக்கத்திற்காக பகுதி குறிக்கப்பட்டுள்ளது",

    // Extra case properties
    "Title Dispute": "உரிமை தகராறு",
    "Government Acquisition Challenge": "அரசு நிலம் கையகப்படுத்துதல் சவால்",
    "Inheritance Dispute": "வாரிசு உரிமை தகராறு",
    "Boundary Dispute": "எல்லை தகராறு",
    "Partnership Dispute": "கூட்டாண்மை தகராறு",
    "Revenue Dispute": "வருவாய் தகராறு",
    "Land Acquisition Compensation": "நிலம் கையகப்படுத்துதல் இழப்பீடு",
    "Title & Boundary Dispute": "உரிமை மற்றும் எல்லை தகராறு",
    "Partition Suit": "பாகப்பிரிவினை வழக்கு",
    "Fraud & Title Dispute": "மோசடி மற்றும் உரிமை தகராறு",
    "Criminal Case — Forgery": "குற்றவியல் வழக்கு — ஆவண மோசடி",
    "Government Land Reclamation": "அரசு நில மீட்பு",

    // Extra case details
    "District Court, Rangareddy": "மாவட்ட நீதிமன்றம், ரங்காரெட்டி",
    "High Court, Hyderabad": "உயர் நீதிமன்றம், ஹைதராபாத்",
    "Civil Court, Serilingampally": "உரிமையியல் நீதிமன்றம், சேரிலிங்கம்பள்ளி",
    "Revenue Court, Kukatpally": "வருவாய் நீதிமன்றம், குகட்பள்ளி",
    "Land Acquisition Tribunal, Rangareddy": "நிலம் கையகப்படுத்துதல் தீர்ப்பாயம், ரங்காரெட்டி",
    "City Civil Court, Hyderabad": "மாநகர உரிமையியல் நீதிமன்றம், ஹைதராபாத்",
    "District Court, Madurai": "மாவட்ட நீதிமன்றம், மதுரை",
    "Civil Court, Serilingampally": "உரிமையியல் நீதிமன்றம், சேரிலிங்கம்பள்ளி",
    "District Court, Madurai": "மாவட்ட நீதிமன்றம், மதுரை",
    "District Court, Rangareddy": "மாவட்ட நீதிமன்றம், ரங்காரெட்டி",
    "WP No. 8923/2023": "WP எண் 8923/2023",
    "OS No. 1456/2021": "OS எண் 1456/2021",
    "OS No. 342/2024": "OS எண் 342/2024",
    "OS No. 2890/2019": "OS எண் 2890/2019",
    "CR No. 456/2020": "CR எண் 456/2020",
    "WP No. 12045/2020": "WP எண் 12045/2020",
    "OS No. 567/2025": "OS எண் 567/2025",
    "OS No. 789/2022": "OS எண் 789/2022",
    "SA No. 234/2024": "SA எண் 234/2024",
    "LA No. 112/2023": "LA எண் 112/2023",
    "OS No. 120/2018": "OS எண் 120/2018",
    "OS 45/2021": "OS 45/2021",
    "Active Bank Loan (SBI)": "செயலில் உள்ள வங்கி கடன் (எஸ்பிஐ)",
    "Active Mortgage": "செயலில் உள்ள அடமானம்",
    "Court Stay Order": "நீதிமன்ற தடை உத்தரவு",
    "1 Active Dispute": "1 செயலில் உள்ள வழக்கு",
    "Encroachment alleged": "ஆக்கிரமிப்பு செய்யப்பட்டுள்ளதாகக் கூறப்படுகிறது",
    "Light": "வெளிச்சம்",
    "Dark": "இருள்"
};

const ATTRIBUTE_TRANSLATIONS_TA = {
    "e.g., Kondapur, Gachibowli...": "எ.கா., Kondapur, Gachibowli...",
    "e.g., 45/A, 123/B...": "எ.கா., 45/A, 123/B...",
    "Ask about this land...": "இந்த நிலம் பற்றி கேளுங்கள்...",
    "Search land records to activate AI...": "AI-ஐ செயல்படுத்த நில பதிவுகளை தேடுங்கள்...",
    "Open AI Assistant": "AI உதவியாளரைத் திறக்கவும்",
    "Close Chat": "உரையாடலை மூடவும்",
    "Send Message": "செய்தி அனுப்பவும்",
    "Switch language to Tamil": "தமிழுக்கு மாற்றவும்",
    "Switch language to English": "ஆங்கிலத்திற்கு மாற்றவும்",
    "Switch to light mode": "வெளிச்ச பயன்முறைக்கு மாறவும்",
    "Switch to dark mode": "இருள் பயன்முறைக்கு மாறவும்",
    "Toggle Theme": "பயன்முறையை மாற்றவும்"
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initParticles();
    initNavbar();
    initCounters();
    initSearch();
    initSmoothScroll();
    initChatBot();
    applyLanguage();
});

function initTheme() {
    applyTheme(currentTheme);

    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('landguard-theme', currentTheme);
        applyTheme(currentTheme);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('themeLabel');

    if (!toggle) return;

    const targetThemeLabel = theme === 'dark' ? 'Light' : 'Dark';
    const ariaText = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

    if (label) {
        label.textContent = currentLanguage === 'ta' ? (TRANSLATIONS_TA[targetThemeLabel] || targetThemeLabel) : targetThemeLabel;
    }

    toggle.setAttribute(
        'aria-label',
        currentLanguage === 'ta' ? (ATTRIBUTE_TRANSLATIONS_TA[ariaText] || ariaText) : ariaText
    );
}

function initLanguage() {
    const toggle = document.getElementById('languageToggle');
    document.documentElement.lang = currentLanguage === 'ta' ? 'ta' : 'en';
    document.body.classList.toggle('lang-ta', currentLanguage === 'ta');

    if (!toggle) return;

    toggle.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'ta' ? 'en' : 'ta';
        localStorage.setItem('landguard-language', currentLanguage);

        if (activeRecord) {
            refreshLocalizedReport(activeRecord);
        } else {
            applyLanguage();
            disableChatbotState();
        }
    });
}

function t(text) {
    if (currentLanguage !== 'ta') return text;
    return translateString(text);
}

function translateString(text) {
    const original = String(text);
    const trimmed = original.trim();
    if (!trimmed) return original;

    const exact = TRANSLATIONS_TA[trimmed];
    if (exact) {
        return original.replace(trimmed, exact);
    }

    const riskWords = {
        LOW: 'குறைந்த',
        MEDIUM: 'நடுத்தர',
        HIGH: 'அதிக'
    };

    // 1. Month-Year Date Translation (e.g., "May 2024", "Sep 2023", "Aug 2012")
    const monthNamesTa = {
        "jan": "ஜனவரி", "feb": "பிப்ரவரி", "mar": "மார்ச்", "apr": "ஏப்ரல்", "may": "மே", "jun": "ஜூன்",
        "jul": "ஜூலை", "aug": "ஆகஸ்ட்", "sep": "செப்டம்பர்", "oct": "அக்டோபர்", "nov": "நவம்பர்", "dec": "டிசம்பர்"
    };
    let matchDate = trimmed.match(/^([a-zA-Z]{3,9})\s*([0-9]{4})$/);
    if (matchDate) {
        const mKey = matchDate[1].substring(0, 3).toLowerCase();
        if (monthNamesTa[mKey]) {
            return `${monthNamesTa[mKey]} ${matchDate[2]}`;
        }
    }

    // 2. Extent Translation (e.g., "2 Acres 20 Guntas", "3 Acres", "2400 Sq Ft", "1000 Sq Yards")
    let matchExtent2 = trimmed.match(/^([0-9\.]+)\s*Acres?\s*([0-9\.]+)\s*Guntas?$/i);
    if (matchExtent2) {
        return `${matchExtent2[1]} ஏக்கர் ${matchExtent2[2]} குண்டா`;
    }
    let matchExtent1 = trimmed.match(/^([0-9\.]+)\s*Acres?$/i);
    if (matchExtent1) {
        return `${matchExtent1[1]} ஏக்கர்`;
    }
    let matchSqFt = trimmed.match(/^([0-9\.]+)\s*Sq\s*Ft$/i);
    if (matchSqFt) {
        return `${matchSqFt[1]} சதுர அடி`;
    }
    let matchSqYards = trimmed.match(/^([0-9\.]+)\s*Sq\s*Yards?$/i);
    if (matchSqYards) {
        return `${matchSqYards[1]} சதுர கெஜம்`;
    }

    // 3. Market Value Translation (e.g., "₹4.5 Crore", "₹24 Crore (Subject to litigation)")
    let matchValLit = trimmed.match(/^₹([0-9\.]+)\s*Crore\s*\(Subject to litigation\)$/i);
    if (matchValLit) {
        return `₹${matchValLit[1]} கோடி (வழக்குக்கு உட்பட்டது)`;
    }
    let matchVal = trimmed.match(/^₹([0-9\.]+)\s*Crore$/i);
    if (matchVal) {
        return `₹${matchVal[1]} கோடி`;
    }

    // 4. Comma-separated Address / Location Translation (e.g., "Main Street, Salem, Erode", "Erode, Tamil Nadu")
    if (trimmed.includes(',')) {
        const parts = trimmed.split(',').map(p => p.trim());
        const translatedParts = parts.map(part => {
            if (part.toLowerCase() === 'main street') return 'மெயின் ரோடு';
            return TRANSLATIONS_TA[part] || part;
        });
        const hasTranslation = translatedParts.some((p, idx) => p !== parts[idx]);
        if (hasTranslation) {
            return translatedParts.join(', ');
        }
    }

    // 5. Dynamic Name Translation (e.g., "Arun Kumar", "Bala Nadar", "Lakshmi Gounder")
    const words = trimmed.split(/\s+/);
    if (words.length >= 2) {
        const nameDict = {
            "Arun": "அருண்", "Bala": "பாலா", "Chandran": "சந்திரன்", "Dinesh": "தினேஷ்", "Ganesh": "கணேஷ்",
            "Hari": "ஹரி", "Karthik": "கார்திக்", "Lakshmi": "லட்சுமி", "Muthu": "முத்து", "Natarajan": "நடராஜன்",
            "Prabhu": "பிரபு", "Ravi": "ரவி", "Suresh": "சுரேஷ்", "Vijay": "விஜய்", "Meena": "மீனா", "Priya": "பிரியா",
            "Kumar": "குமார்", "Pillai": "பிள்ளை", "Iyer": "ஐயர்", "Chettiar": "செட்டியார்", "Gounder": "கவுண்டர்",
            "Nadar": "நாடார்", "Naidu": "நாயுடு", "Reddy": "ரெட்டி", "Rao": "ராவ்", "Swamy": "சுவாமி", "Raj": "ராஜ்",
            "(Disputed)": "(தகராறில் உள்ளது)", "(Joint)": "(கூட்டு)", "(Under Dispute)": "(தகராறில் உள்ளது)",
            "G": "ஜி", "V": "வி"
        };
        const transWords = words.map(w => nameDict[w] || TRANSLATIONS_TA[w] || w);
        const hasTranslation = transWords.some((w, idx) => w !== words[idx]);
        if (hasTranslation) {
            return transWords.join(' ');
        }
    }

    // 6. Parties Translation (e.g., "Ahmed Khan vs. Mohammed Ismail")
    let matchParties = trimmed.match(/^([a-zA-Z\s\&\(\)\.\,]+)\s+vs\.?\s+([a-zA-Z\s\&\(\)\.\,]+)$/i);
    if (matchParties) {
        const p1 = translateString(matchParties[1]);
        const p2 = translateString(matchParties[2]);
        return `${p1} எதிர் ${p2}`;
    }

    let match = trimmed.match(/^Village: (.+) \| Survey No: (.+) \| District: (.+) \| Report generated on (.+)$/);
    if (match) {
        const vTrans = TRANSLATIONS_TA[match[1].trim()] || match[1];
        const dTrans = TRANSLATIONS_TA[match[3].trim()] || match[3];
        return `கிராமம்: ${vTrans} | சர்வே எண்: ${match[2]} | மாவட்டம்: ${dTrans} | அறிக்கை தேதி: ${match[4]}`;
    }

    match = trimmed.match(/^No records found for Village: (.+), Survey No: (.+)$/);
    if (match) {
        const vTrans = TRANSLATIONS_TA[match[1].trim()] || match[1];
        return `கிராமம்: ${vTrans}, சர்வே எண்: ${match[2]} என்பதற்கு பதிவுகள் இல்லை`;
    }

    match = trimmed.match(/^Survey (.+) - (LOW|MEDIUM|HIGH) Risk \((.+)\)$/);
    if (match) {
        return `சர்வே ${match[1]} - ${riskWords[match[2]]} அபாயம் (${match[3]})`;
    }

    match = trimmed.match(/^Survey Plot (.+)$/);
    if (match) {
        return `சர்வே நிலப்பகுதி ${match[1]}`;
    }

    match = trimmed.match(/^Ask about (.+)\.\.\.$/);
    if (match) {
        return `${match[1]} பற்றி கேளுங்கள்...`;
    }

    return original;
}

function translateTextNodes(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'DEFS'].includes(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        if (!originalTextNodes.has(node)) {
            originalTextNodes.set(node, node.nodeValue);
        }
        const original = originalTextNodes.get(node);
        node.nodeValue = currentLanguage === 'ta' ? translateString(original) : original;
    });
}

function translateAttributes(root = document.body) {
    const elements = root.querySelectorAll('[placeholder], [aria-label], [title]');
    elements.forEach(el => {
        ['placeholder', 'aria-label', 'title'].forEach(attr => {
            if (!el.hasAttribute(attr)) return;
            const storeAttr = `data-original-${attr}`;
            if (!el.hasAttribute(storeAttr)) {
                el.setAttribute(storeAttr, el.getAttribute(attr));
            }
            const original = el.getAttribute(storeAttr);
            const translated = currentLanguage === 'ta'
                ? (ATTRIBUTE_TRANSLATIONS_TA[original] || translateString(original))
                : original;
            el.setAttribute(attr, translated);
        });
    });
}

function updateLanguageToggle() {
    const toggle = document.getElementById('languageToggle');
    document.documentElement.lang = currentLanguage === 'ta' ? 'ta' : 'en';
    document.body.classList.toggle('lang-ta', currentLanguage === 'ta');

    if (!toggle) return;
    toggle.textContent = currentLanguage === 'ta' ? 'English' : 'தமிழ்';
    toggle.setAttribute(
        'aria-label',
        currentLanguage === 'ta'
            ? ATTRIBUTE_TRANSLATIONS_TA["Switch language to English"]
            : "Switch language to Tamil"
    );
}

function applyLanguage(root = document.body) {
    updateLanguageToggle();
    applyTheme(currentTheme);
    translateTextNodes(root);
    translateAttributes(root);
}

// ============================================
// Background Particles
// ============================================
function initParticles() {
    const container = document.getElementById('bgParticles');
    const count = 40;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (8 + Math.random() * 12) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particle.style.opacity = 0.1 + Math.random() * 0.4;
        const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#3b82f6'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(particle);
    }
}

// ============================================
// Navbar Scroll Effect
// ============================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            // Ignore hidden sections (which have offsetTop of 0 and mess up the calculation)
            if (section.offsetHeight > 0) {
                const sectionTop = section.offsetTop - 100;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// Animated Counters
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeProgress * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target.toLocaleString() + (target < 100 ? '%' : '+');
        }
    }
    requestAnimationFrame(update);
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // If results page is visible, restore other sections first
            const resultsSection = document.getElementById('resultsSection');
            if (resultsSection && resultsSection.style.display !== 'none') {
                resultsSection.style.display = 'none';
                document.getElementById('home').style.display = '';
                document.querySelector('.search-section').style.display = '';
                document.querySelector('.features-section').style.display = '';
                document.querySelector('.about-section').style.display = '';

                // Clear state
                activeRecord = null;
                disableChatbotState();
                document.getElementById('villageName').value = '';
                document.getElementById('surveyNumber').value = '';
            }

            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// Search Functionality
// ============================================
function initSearch() {
    const form = document.getElementById('searchForm');
    const villageInput = document.getElementById('villageName');
    const surveyInput = document.getElementById('surveyNumber');
    const suggestionsDropdown = document.getElementById('villageSuggestions');
    const newSearchBtn = document.getElementById('newSearchBtn');

    let currentFocusIndex = -1;

    function updateHighlight(items) {
        items.forEach((item, idx) => {
            if (idx === currentFocusIndex) {
                item.classList.add('highlighted');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    function selectSuggestion(item) {
        if (!item) return;
        const name = item.getAttribute('data-name') || item.textContent;
        villageInput.value = name;
        suggestionsDropdown.classList.remove('active');
        currentFocusIndex = -1;
        surveyInput.focus();
    }

    // Village autocomplete
    villageInput.addEventListener('input', () => {
        const value = villageInput.value.toLowerCase().trim();
        suggestionsDropdown.innerHTML = '';
        currentFocusIndex = -1;

        if (value.length < 1) {
            suggestionsDropdown.classList.remove('active');
            return;
        }

        const matches = VILLAGE_NAMES.filter(v => {
            const engMatch = v.toLowerCase().includes(value);
            if (engMatch) return true;
            if (currentLanguage === 'ta') {
                const tam = translateString(v);
                return tam.toLowerCase().includes(value);
            }
            return false;
        });

        if (matches.length === 0) {
            suggestionsDropdown.classList.remove('active');
            return;
        }

        matches.forEach((village, idx) => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            const displayName = currentLanguage === 'ta' ? translateString(village) : village;
            item.setAttribute('data-name', displayName);
            const regex = new RegExp(`(${escapeRegex(value)})`, 'gi');
            item.innerHTML = displayName.replace(regex, '<strong>$1</strong>');

            const surveys = getSurveyNumbers(village);
            if (surveys.length > 0) {
                item.innerHTML += ` <span style="color: var(--text-muted); font-size: 0.8rem;">(${surveys.join(', ')})</span>`;
            }

            item.addEventListener('mouseenter', () => {
                currentFocusIndex = idx;
                const items = suggestionsDropdown.querySelectorAll('.suggestion-item');
                updateHighlight(items);
            });

            item.addEventListener('click', () => {
                selectSuggestion(item);
            });
            suggestionsDropdown.appendChild(item);
        });

        suggestionsDropdown.classList.add('active');
    });

    // Keyboard navigation (Up / Down Arrow, Enter, Escape, Tab)
    villageInput.addEventListener('keydown', (e) => {
        const items = suggestionsDropdown.querySelectorAll('.suggestion-item');
        if (!suggestionsDropdown.classList.contains('active') || items.length === 0) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentFocusIndex < items.length - 1) {
                currentFocusIndex++;
            } else {
                currentFocusIndex = 0; // Wrap around to top
            }
            updateHighlight(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentFocusIndex > 0) {
                currentFocusIndex--;
            } else {
                currentFocusIndex = items.length - 1; // Wrap around to bottom
            }
            updateHighlight(items);
        } else if (e.key === 'Enter') {
            if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
                e.preventDefault();
                selectSuggestion(items[currentFocusIndex]);
            }
        } else if (e.key === 'Escape') {
            suggestionsDropdown.classList.remove('active');
            currentFocusIndex = -1;
        } else if (e.key === 'Tab') {
            if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
                selectSuggestion(items[currentFocusIndex]);
            } else {
                suggestionsDropdown.classList.remove('active');
                currentFocusIndex = -1;
            }
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group')) {
            suggestionsDropdown.classList.remove('active');
            currentFocusIndex = -1;
        }
    });

    // Survey Number Autocomplete (using 10,000 synthetic dataset)
    const surveySuggestionsDropdown = document.getElementById('surveySuggestions');
    if (surveySuggestionsDropdown) {
        let surveyFocusIndex = -1;

        function updateSurveyHighlight(items) {
            items.forEach((item, idx) => {
                if (idx === surveyFocusIndex) {
                    item.classList.add('highlighted');
                    item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                } else {
                    item.classList.remove('highlighted');
                }
            });
        }

        function selectSurveySuggestion(item) {
            if (!item) return;
            const sn = item.getAttribute('data-name') || item.textContent;
            surveyInput.value = sn;
            surveySuggestionsDropdown.classList.remove('active');
            surveyFocusIndex = -1;
        }

        surveyInput.addEventListener('input', async () => {
            const val = surveyInput.value.trim();
            surveySuggestionsDropdown.innerHTML = '';
            surveyFocusIndex = -1;

            if (val.length < 1) {
                surveySuggestionsDropdown.classList.remove('active');
                return;
            }

            try {
                const res = await fetch(`/api/surveynumbers?q=${encodeURIComponent(val)}`);
                if (!res.ok) return;
                const data = await res.json();
                const matches = data.results || [];

                if (matches.length === 0) {
                    surveySuggestionsDropdown.classList.remove('active');
                    return;
                }

                matches.slice(0, 15).forEach((sn, idx) => {
                    const item = document.createElement('div');
                    item.classList.add('suggestion-item');
                    const regex = new RegExp(`(${escapeRegex(val)})`, 'gi');
                    item.innerHTML = sn.replace(regex, '<strong>$1</strong>');
                    item.setAttribute('data-name', sn);

                    item.addEventListener('mouseenter', () => {
                        surveyFocusIndex = idx;
                        const items = surveySuggestionsDropdown.querySelectorAll('.suggestion-item');
                        updateSurveyHighlight(items);
                    });

                    item.addEventListener('click', () => {
                        selectSurveySuggestion(item);
                    });
                    surveySuggestionsDropdown.appendChild(item);
                });

                surveySuggestionsDropdown.classList.add('active');
            } catch (err) {
                console.error("Error fetching survey numbers:", err);
            }
        });

        // Keyboard navigation for survey number input (Down Arrow, Up Arrow, Enter, Escape, Tab)
        surveyInput.addEventListener('keydown', (e) => {
            const items = surveySuggestionsDropdown.querySelectorAll('.suggestion-item');
            if (!surveySuggestionsDropdown.classList.contains('active') || items.length === 0) {
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (surveyFocusIndex < items.length - 1) {
                    surveyFocusIndex++;
                } else {
                    surveyFocusIndex = 0; // Wrap around to top
                }
                updateSurveyHighlight(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (surveyFocusIndex > 0) {
                    surveyFocusIndex--;
                } else {
                    surveyFocusIndex = items.length - 1; // Wrap around to bottom
                }
                updateSurveyHighlight(items);
            } else if (e.key === 'Enter') {
                if (surveyFocusIndex >= 0 && items[surveyFocusIndex]) {
                    e.preventDefault();
                    selectSurveySuggestion(items[surveyFocusIndex]);
                }
            } else if (e.key === 'Escape') {
                surveySuggestionsDropdown.classList.remove('active');
                surveyFocusIndex = -1;
            } else if (e.key === 'Tab') {
                if (surveyFocusIndex >= 0 && items[surveyFocusIndex]) {
                    selectSurveySuggestion(items[surveyFocusIndex]);
                } else {
                    surveySuggestionsDropdown.classList.remove('active');
                    surveyFocusIndex = -1;
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#surveyNumber') && !e.target.closest('#surveySuggestions')) {
                surveySuggestionsDropdown.classList.remove('active');
                surveyFocusIndex = -1;
            }
        });
    }

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const village = villageInput.value.trim();
        const survey = surveyInput.value.trim();

        if (!village || !survey) return;

        performSearch(village, survey);
    });

    // New Search button
    newSearchBtn.addEventListener('click', () => {
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('home').style.display = '';
        document.querySelector('.search-section').style.display = '';
        document.querySelector('.features-section').style.display = '';
        document.querySelector('.about-section').style.display = '';
        villageInput.value = '';
        surveyInput.value = '';
        window.scrollTo({ top: document.getElementById('search-section').offsetTop - 80, behavior: 'smooth' });
    });

    // PDF Export button
    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// Perform Search with Loading Animation
// ============================================
function performSearch(village, survey) {
    const overlay = document.getElementById('loadingOverlay');
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');
    const messages = [
        t('Searching government databases...'),
        t('Verifying revenue records...'),
        t('Checking court case databases...'),
        t('Analyzing encumbrance certificates...'),
        t('Calculating risk score...'),
        t('Generating report...')
    ];

    overlay.classList.add('active');
    progressBar.style.width = '0%';
    loadingText.textContent = messages[0];

    let step = 0;
    const interval = setInterval(() => {
        step++;
        progressBar.style.width = (step * 16.67) + '%';
        if (step < messages.length) {
            loadingText.textContent = messages[step];
        }
        if (step >= 6) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.classList.remove('active');
                showResults(village, survey);
            }, 400);
        }
    }, 500);
}

// ============================================
// Show Results
// ============================================
function showResults(village, survey) {
    const record = lookupLandRecord(village, survey);

    if (!record) {
        showNoResults(village, survey);
        return;
    }

    // Store globally
    activeRecord = record;

    // Hide other sections and show results
    document.getElementById('home').style.display = 'none';
    document.querySelector('.search-section').style.display = 'none';
    document.querySelector('.features-section').style.display = 'none';
    document.querySelector('.about-section').style.display = 'none';

    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Result Meta
    document.getElementById('resultMeta').textContent =
        `${t('Village')}: ${t(record.land.village)} | ${t('Survey No')}: ${record.land.surveyNo} | ${t('District')}: ${t(record.land.district)} | ${currentLanguage === 'ta' ? 'அறிக்கை தேதி' : 'Report generated on'}: ${new Date().toLocaleDateString('en-IN')}`;

    // Risk Card
    renderRiskCard(record);

    // Owner Details
    renderOwnerDetails(record.owner);

    // Land Details
    renderLandDetails(record.land);

    // Court Cases
    renderCourtCases(record.courtCases);

    // Encumbrance Details
    renderEncumbrance(record.encumbrance);

    // Timeline
    renderTimeline(record.timeline);

    // Render GIS Map
    renderMap(record);

    // Render AI Insights
    renderAIAnalyst(record);

    // Enable Chatbot
    updateChatbotState(record);
    applyLanguage(resultsSection);
}

function refreshLocalizedReport(record) {
    const resultsSection = document.getElementById('resultsSection');
    const isResultsVisible = resultsSection && resultsSection.style.display !== 'none';

    applyLanguage();
    if (!isResultsVisible) return;

    document.getElementById('resultMeta').textContent =
        `${t('Village')}: ${t(record.land.village)} | ${t('Survey No')}: ${record.land.surveyNo} | ${t('District')}: ${t(record.land.district)} | ${currentLanguage === 'ta' ? 'அறிக்கை தேதி' : 'Report generated on'}: ${new Date().toLocaleDateString('en-IN')}`;

    renderRiskCard(record);
    renderOwnerDetails(record.owner);
    renderLandDetails(record.land);
    renderCourtCases(record.courtCases);
    renderEncumbrance(record.encumbrance);
    renderTimeline(record.timeline);
    renderMap(record);
    renderAIAnalyst(record);
    updateChatbotState(record);
    applyLanguage(resultsSection);
}

function showNoResults(village, survey) {
    activeRecord = null;

    // Hide other sections
    document.getElementById('home').style.display = 'none';
    document.querySelector('.search-section').style.display = 'none';
    document.querySelector('.features-section').style.display = 'none';
    document.querySelector('.about-section').style.display = 'none';

    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('resultMeta').textContent = `No records found for Village: ${village}, Survey No: ${survey}`;

    // Reset sections with a "no data" message
    const riskCard = document.getElementById('riskCard');
    riskCard.className = 'risk-card medium';
    riskCard.querySelector('.risk-card-inner').innerHTML = `
        <div class="risk-gauge-area" style="grid-column: 1 / -1; padding: 40px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64" style="color: var(--warning); margin-bottom: 16px;">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div class="risk-level" style="color: var(--warning);">No Records Found</div>
            <div class="risk-description">
                We could not find any land records matching your search. Please verify the village name and survey number and try again.
                <br><br>
                <strong>Available villages:</strong> ${VILLAGE_NAMES.join(', ')}
            </div>
        </div>
    `;

    // Clear other cards
    document.getElementById('ownerDetails').innerHTML = '<p style="color: var(--text-muted);">No data available</p>';
    document.getElementById('landDetails').innerHTML = '<p style="color: var(--text-muted);">No data available</p>';
    document.getElementById('courtCases').innerHTML = '<p style="color: var(--text-muted);">No data available</p>';
    document.getElementById('encDetails').innerHTML = '<p style="color: var(--text-muted);">No data available</p>';
    document.getElementById('timeline').innerHTML = '<p style="color: var(--text-muted);">No data available</p>';
    document.getElementById('aiAnalystDetails').innerHTML = '<p style="color: var(--text-muted);">No data available</p>';

    // Clear Map
    if (mapInstance) {
        if (mapInstance._resizeObserver) {
            mapInstance._resizeObserver.disconnect();
        }
        mapInstance.remove();
        mapInstance = null;
    }

    // Disable Chatbot
    disableChatbotState();
    applyLanguage(resultsSection);
}

// ============================================
// Render Functions
// ============================================

function renderRiskCard(record) {
    const riskCard = document.getElementById('riskCard');
    const gaugeArc = document.getElementById('gaugeArc');
    const gaugeValue = document.getElementById('gaugeValue');
    const riskLevel = document.getElementById('riskLevel');
    const riskDescription = document.getElementById('riskDescription');
    const riskFactorsContainer = document.getElementById('riskFactors');

    // Set risk level class
    riskCard.className = `risk-card ${record.riskLevel}`;

    // Reset the card inner to the standard layout
    riskCard.querySelector('.risk-card-inner').innerHTML = `
        <div class="risk-gauge-area">
            <div class="risk-gauge" id="riskGauge">
                <svg viewBox="0 0 200 120" class="gauge-svg">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="14" stroke-linecap="round"/>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" stroke-width="14" stroke-linecap="round" id="gaugeArc" stroke-dasharray="251.2" stroke-dashoffset="251.2"/>
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" style="stop-color:#10b981"/>
                            <stop offset="50%" style="stop-color:#f59e0b"/>
                            <stop offset="100%" style="stop-color:#ef4444"/>
                        </linearGradient>
                    </defs>
                </svg>
                <div class="gauge-label">
                    <span class="gauge-value" id="gaugeValue">0</span>
                    <span class="gauge-unit">/100</span>
                </div>
            </div>
            <div class="risk-level" id="riskLevel">Calculating...</div>
            <div class="risk-description" id="riskDescription"></div>
        </div>
        <div class="risk-factors" id="riskFactors"></div>
    `;

    // Re-fetch references after innerHTML rebuild
    const newGaugeArc = document.getElementById('gaugeArc');
    const newGaugeValue = document.getElementById('gaugeValue');
    const newRiskLevel = document.getElementById('riskLevel');
    const newRiskDescription = document.getElementById('riskDescription');
    const newRiskFactors = document.getElementById('riskFactors');

    // Animate gauge
    const totalLength = 251.2;
    const targetOffset = totalLength - (record.risk / 100) * totalLength;

    setTimeout(() => {
        newGaugeArc.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        newGaugeArc.style.strokeDashoffset = targetOffset;
    }, 200);

    // Animate counter
    animateValue(newGaugeValue, 0, record.risk, 1500);

    // Set risk level text
    const levelTexts = {
        low: { text: 'LOW RISK', color: 'var(--success)', desc: 'This land has a clean legal standing with no significant risks detected.' },
        medium: { text: 'MEDIUM RISK', color: 'var(--warning)', desc: 'Some legal concerns detected. Proceed with caution and consult a lawyer.' },
        high: { text: 'HIGH RISK', color: 'var(--danger)', desc: 'Significant legal risks found. Strongly recommended to avoid this property.' }
    };

    const levelInfo = levelTexts[record.riskLevel];
    setTimeout(() => {
        newRiskLevel.textContent = t(levelInfo.text);
        newRiskLevel.style.color = levelInfo.color;
        newRiskDescription.textContent = t(levelInfo.desc);
    }, 800);

    // Risk factors
    newRiskFactors.innerHTML = record.riskFactors.map(f => `
        <div class="risk-factor">
            <div class="rf-indicator ${f.color}"></div>
            <div class="rf-text">
                <span class="rf-label">${f.label}</span>
                <span class="rf-value">${f.value}</span>
            </div>
        </div>
    `).join('');
}

function animateValue(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(easeProgress * (end - start) + start);
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function renderOwnerDetails(owner) {
    const container = document.getElementById('ownerDetails');
    container.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Owner Name</span>
            <span class="detail-value">${owner.name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Father's Name</span>
            <span class="detail-value">${owner.fatherName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Aadhaar</span>
            <span class="detail-value">${owner.aadhaar}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Contact</span>
            <span class="detail-value">${owner.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Address</span>
            <span class="detail-value" style="max-width: 250px;">${owner.address}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Registration Date</span>
            <span class="detail-value">${owner.registrationDate}</span>
        </div>
    `;
}

function renderLandDetails(land) {
    const container = document.getElementById('landDetails');
    container.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Survey Number</span>
            <span class="detail-value">${land.surveyNo}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Village</span>
            <span class="detail-value">${land.village}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Mandal</span>
            <span class="detail-value">${land.mandal}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">District / State</span>
            <span class="detail-value">${land.district}, ${land.state}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Extent</span>
            <span class="detail-value">${land.extent}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Classification</span>
            <span class="detail-value">${land.classification}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Market Value</span>
            <span class="detail-value" style="color: var(--accent-primary); font-weight: 700;">${land.marketValue}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Passbook No.</span>
            <span class="detail-value">${land.passbook}</span>
        </div>
    `;
}

function renderCourtCases(cases) {
    const container = document.getElementById('courtCases');

    if (cases.length === 0) {
        container.innerHTML = `
            <div class="no-cases">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h4 style="color: var(--success);">No Court Cases Found</h4>
                <p>No pending or resolved court cases are associated with this land parcel.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = cases.map(c => `
        <div class="court-case-item">
            <div class="case-header">
                <span class="case-number">${c.caseNo}</span>
                <span class="status-badge ${c.status}">${getCaseStatusText(c.status)}</span>
            </div>
            <div class="case-details">
                <div class="case-detail">
                    <span class="case-detail-label">Court:</span>
                    <span>${c.court}</span>
                </div>
                <div class="case-detail">
                    <span class="case-detail-label">Type:</span>
                    <span>${c.type}</span>
                </div>
                <div class="case-detail">
                    <span class="case-detail-label">Parties:</span>
                    <span>${c.parties}</span>
                </div>
                <div class="case-detail">
                    <span class="case-detail-label">Filed:</span>
                    <span>${c.filedDate}</span>
                </div>
                <div class="case-detail">
                    <span class="case-detail-label">Next Hearing:</span>
                    <span style="color: var(--warning); font-weight: 600;">${c.nextHearing}</span>
                </div>
                <div class="case-detail" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-glass);">
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">${c.description}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getCaseStatusText(status) {
    const labels = {
        active: currentLanguage === 'ta' ? 'செயலில்' : 'Active',
        pending: currentLanguage === 'ta' ? 'நிலுவை' : 'Pending',
        resolved: currentLanguage === 'ta' ? 'தீர்ந்தது' : 'Resolved'
    };
    return labels[status] || status;
}

function renderEncumbrance(enc) {
    const container = document.getElementById('encDetails');
    const statusClass = enc.status === 'Clear' ? 'clear' :
        enc.status.includes('Minor') ? 'pending' : 'active';

    container.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="status-badge ${statusClass}">${enc.status}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Last Checked</span>
            <span class="detail-value">${enc.lastChecked}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Mortgages</span>
            <span class="detail-value" style="max-width: 250px;">${enc.mortgages}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Liens/Claims</span>
            <span class="detail-value" style="max-width: 250px;">${enc.liens}</span>
        </div>
    `;
}

function renderTimeline(events) {
    const container = document.getElementById('timeline');
    container.innerHTML = events.map((e, i) => `
        <div class="timeline-item" style="animation-delay: ${0.6 + i * 0.15}s;">
            <div class="timeline-dot ${e.dot}"></div>
            <div class="timeline-date">${e.date}</div>
            <div class="timeline-title">${e.title}</div>
            <div class="timeline-desc">${e.desc}</div>
        </div>
    `).join('');
}

// ============================================
// Leaflet GIS Map Rendering
// ============================================
function renderMap(record) {
    const mapContainer = document.getElementById('gisMap');
    if (!mapContainer) return;

    // Clear old map instance
    if (mapInstance) {
        if (mapInstance._resizeObserver) {
            mapInstance._resizeObserver.disconnect();
        }
        mapInstance.remove();
        mapInstance = null;
    }
    mapContainer.innerHTML = '';

    if (typeof L === 'undefined') {
        renderMapFallback(record, 'Map library could not be loaded');
        return;
    }

    // Generate a seeded coordinate based on village and survey
    const seed = (record.land.village.toLowerCase() + record.land.surveyNo.toLowerCase()).replace(/\s+/g, '');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
    }

    // TN bounds approx: Lat 8.5 to 13.5, Lng 76.2 to 80.3
    const seedVal1 = Math.abs(Math.sin(hash)) % 1;
    const seedVal2 = Math.abs(Math.cos(hash)) % 1;

    // Center lat/lng
    const lat = 9.5 + seedVal1 * 3.0; // range ~9.5 to 12.5
    const lng = 77.0 + seedVal2 * 3.0; // range ~77.0 to 80.0

    try {
        // Initialize Leaflet map (disable scroll wheel zoom to protect page scroll)
        mapInstance = L.map('gisMap', {
            center: [lat, lng],
            zoom: 16,
            maxZoom: 18,
            scrollWheelZoom: false
        });

        // Use a reliable street-map base layer to avoid missing satellite tiles/black gaps.
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abc',
            maxZoom: 19
        }).addTo(mapInstance);

        // Generate an irregular polygon representing the survey boundary
        const offset = 0.0006;

        const p1 = [lat - offset * (0.8 + seedVal1 * 0.4), lng - offset * (0.8 + seedVal2 * 0.4)];
        const p2 = [lat + offset * (0.9 + seedVal2 * 0.3), lng - offset * (0.7 + seedVal1 * 0.5)];
        const p3 = [lat + offset * (0.8 + seedVal1 * 0.4), lng + offset * (0.9 + seedVal2 * 0.3)];
        const p4 = [lat - offset * (0.7 + seedVal2 * 0.5), lng + offset * (0.8 + seedVal1 * 0.4)];

        const polygonCoords = [p1, p2, p3, p4];
        const color = getRiskColor(record.riskLevel);

        // Add polygon to map
        const polygon = L.polygon(polygonCoords, {
            color: color,
            fillColor: color,
            fillOpacity: 0.25,
            weight: 3,
            dashArray: '4, 4'
        }).addTo(mapInstance);

        // Add popup with land information
        polygon.bindPopup(`
            <div style="font-family: var(--font-body); color: #000; font-size: 0.85rem; padding: 4px;">
                <strong style="font-size: 0.95rem; color: #111;">Survey Plot ${record.land.surveyNo}</strong><br>
                <span style="color: #666;">Village:</span> ${record.land.village}<br>
                <span style="color: #666;">Owner:</span> ${record.owner.name}<br>
                <span style="color: #666;">Classification:</span> ${record.land.classification}<br>
                <span style="color: #666;">Litigation Risk:</span> <strong style="color: ${color};">${record.riskLevel.toUpperCase()}</strong>
            </div>
        `);

        // Auto center map initially
        if (mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
            mapInstance.fitBounds(polygon.getBounds(), { padding: [24, 24], maxZoom: 16 });
        }

        // Setup ResizeObserver to handle map container resize/visibility changes
        const resizeObserver = new ResizeObserver(() => {
            if (!mapInstance) return;
            if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) return;
            try {
                mapInstance.invalidateSize(true);
                mapInstance.fitBounds(polygon.getBounds(), { padding: [24, 24], maxZoom: 16 });
            } catch (_) {
                // no-op
            }
        });
        resizeObserver.observe(mapContainer);
        mapInstance._resizeObserver = resizeObserver;

        // Re-calculate size and re-center after CSS/visibility changes.
        setTimeout(() => {
            if (!mapInstance) return;
            if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) return;
            try {
                mapInstance.invalidateSize(true);
                mapInstance.fitBounds(polygon.getBounds(), { padding: [24, 24], maxZoom: 16 });
            } catch (_) {
                // no-op
            }
        }, 600);

        updateMapLegend(record, color);
    } catch (error) {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }
        renderMapFallback(record, 'Live map could not be initialized');
    }
}

function getRiskColor(riskLevel) {
    if (riskLevel === 'high') return '#ef4444';
    if (riskLevel === 'medium') return '#f59e0b';
    return '#10b981';
}

function updateMapLegend(record, color) {
    const legendDot = document.getElementById('legendDot');
    const legendText = document.getElementById('legendText');
    if (legendDot && legendText) {
        legendDot.style.background = color;
        legendDot.style.boxShadow = `0 0 8px ${color}`;
        legendText.textContent = `Survey ${record.land.surveyNo} - ${record.riskLevel.toUpperCase()} Risk (${record.risk}/100)`;
    }
}

function renderMapFallback(record, message) {
    const mapContainer = document.getElementById('gisMap');
    if (!mapContainer) return;

    const color = getRiskColor(record.riskLevel);
    mapContainer.innerHTML = `
        <div class="map-fallback">
            <svg class="map-fallback-grid" viewBox="0 0 400 240" aria-hidden="true">
                <defs>
                    <pattern id="mapGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148, 163, 184, 0.18)" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="400" height="240" fill="url(#mapGrid)"/>
                <path d="M96 154 L171 68 L292 88 L332 168 L208 205 Z" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="4" stroke-dasharray="8 8"/>
                <circle cx="208" cy="139" r="7" fill="${color}"/>
            </svg>
            <div class="map-fallback-content">
                <span class="map-fallback-kicker">${message}</span>
                <strong>Survey Plot ${record.land.surveyNo}</strong>
                <span>${record.land.village}, ${record.land.district}</span>
            </div>
        </div>
    `;
    updateMapLegend(record, color);
}

// ============================================
// AI Legal Analyst Insights Rendering
// ============================================
function renderAIAnalyst(record) {
    const container = document.getElementById('aiAnalystDetails');
    if (!container) return;

    if (currentLanguage === 'ta') {
        renderTamilAIAnalyst(record, container);
        return;
    }

    let sections = [];

    // SECTION 1: Legal Risk Summary
    if (record.riskLevel === 'high') {
        sections.push(`
            <div class="ai-insight-section">
                <div class="ai-insight-header danger">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span>Critical Title Dispute Risk Detected</span>
                </div>
                <div class="ai-insight-desc">
                    This parcel exhibits extreme legal risks. There is an active title dispute filed under <strong>${record.courtCases[0]?.caseNo || 'Active OS Case'}</strong> in the <strong>${record.courtCases[0]?.court || 'District Court'}</strong>. The litigation directly disputes ownership. A court injunction is likely active, which legally prevents any transfer or registration of title.
                </div>
            </div>
        `);
    } else if (record.riskLevel === 'medium') {
        sections.push(`
            <div class="ai-insight-section">
                <div class="ai-insight-header warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Financial Lien & Encumbrance Notice</span>
                </div>
                <div class="ai-insight-desc">
                    No active court litigations are detected on this survey number. However, the land has an active financial encumbrance: <strong>${record.encumbrance.mortgages}</strong>. This indicates the property is collateralized. Before purchasing, the outstanding liability must be fully settled with the lending bank to obtain a "No Objection Certificate" (NOC).
                </div>
            </div>
        `);
    } else {
        sections.push(`
            <div class="ai-insight-section">
                <div class="ai-insight-header success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>Clear Title & Low Litigation Risk</span>
                </div>
                <div class="ai-insight-desc">
                    The title shows positive indicators. AI analysis found no pending litigation, active court stays, government acquisitions, or registered bank liens on this parcel. The title is clear, and the registered mutation date of <strong>${record.owner.registrationDate}</strong> aligns with municipal revenue databases.
                </div>
            </div>
        `);
    }

    // SECTION 2: Revenue Mutation Review
    sections.push(`
        <div class="ai-insight-section">
            <div class="ai-insight-header info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>Revenue Mutation Status</span>
            </div>
            <div class="ai-insight-desc">
                Verified against municipal Patta databases: The land is listed under the name of <strong>${record.owner.name}</strong>, matching the Patta passbook number <strong>${record.land.passbook}</strong>. Extent is verified at <strong>${record.land.extent}</strong>. 
                ${record.riskLevel === 'high' ? 'Warning: Ownership transfer is frozen due to pending dispute.' : 'Ownership details are consistent with the registration department records.'}
            </div>
        </div>
    `);

    // SECTION 3: Action Plan / Recommendations
    let recs = [];
    if (record.riskLevel === 'high') {
        recs = [
            "Do NOT proceed with purchasing or signing a sale agreement for this property.",
            "Demand a certified copy of the court stay order or status quo decree from the seller.",
            "Request legal counsel to examine the plaint copy of case " + (record.courtCases[0]?.caseNo || "the active litigation") + " to assess legal heir claims.",
            "Verify if other survey subdivision numbers (if any) are also impacted by the civil stay."
        ];
    } else if (record.riskLevel === 'medium') {
        recs = [
            "Request a fresh 30-year Encumbrance Certificate (EC) from the sub-registrar office.",
            "Verify the loan closure status with the lending bank (" + record.encumbrance.mortgages.split('—')[0].trim() + ").",
            "Ensure the seller clears any outstanding municipal tax liens before drafting the sale deed.",
            "Ensure the bank releases the original title deeds directly to the sub-registrar during transaction registration."
        ];
    } else {
        recs = [
            "Confirm that the physical boundary fences match the coordinates indicated in the Field Measurement Book (FMB).",
            "Obtain a signed No-Objection Certificate (NOC) from all surrounding land partition holders.",
            "Draft a standard Sale Agreement with clear indemnity clauses protecting against future legal claims.",
            "Complete registration at the sub-registrar office within the statutory agreement period."
        ];
    }

    sections.push(`
        <div class="ai-insight-section">
            <div class="ai-insight-header info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span>Recommended Legal Due-Diligence Checklist</span>
            </div>
            <div class="ai-insight-desc">
                To guarantee safe transaction closure, complete the following actions:
                <ul class="ai-insight-list">
                    ${recs.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        </div>
    `);

    container.innerHTML = sections.join('');
}

function renderTamilAIAnalyst(record, container) {
    let sections = [];

    if (record.riskLevel === 'high') {
        sections.push(`
            <div class="ai-insight-section">
                <div class="ai-insight-header danger">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span>கடுமையான உரிமை தகராறு அபாயம் கண்டறியப்பட்டது</span>
                </div>
                <div class="ai-insight-desc">
                    இந்த நிலத்தில் கடுமையான சட்ட அபாயம் உள்ளது. <strong>${record.courtCases[0]?.caseNo || 'செயலில் உள்ள வழக்கு'}</strong> வழக்கு <strong>${record.courtCases[0]?.court || 'மாவட்ட நீதிமன்றம்'}</strong> நீதிமன்றத்தில் உள்ளது. உரிமை நேரடியாக தகராறாக இருப்பதால் விற்பனை அல்லது பதிவு நடவடிக்கைகள் அபாயகரமானவை.
                </div>
            </div>
        `);
    } else if (record.riskLevel === 'medium') {
        sections.push(`
            <div class="ai-insight-section">
                <div class="ai-insight-header warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>நிதி பற்று மற்றும் வில்லங்க அறிவிப்பு</span>
                </div>
                <div class="ai-insight-desc">
                    செயலில் உள்ள நீதிமன்ற வழக்கு தெரியவில்லை. ஆனால் இந்த நிலத்தில் நிதி வில்லங்கம் உள்ளது: <strong>${record.encumbrance.mortgages}</strong>. வாங்குவதற்கு முன் நிலுவைத் தொகை முடிக்கப்பட்டு வங்கியிலிருந்து NOC பெறப்பட வேண்டும்.
                </div>
            </div>
        `);
    } else {
        sections.push(`
            <div class="ai-insight-section">
                <div class="ai-insight-header success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>தெளிவான உரிமை மற்றும் குறைந்த வழக்கு அபாயம்</span>
                </div>
                <div class="ai-insight-desc">
                    இந்த நிலத்தின் உரிமை நிலை சாதகமாக உள்ளது. நிலுவை வழக்கு, நீதிமன்ற தடை, அரசு கையகப்படுத்தல் அல்லது பதிவு செய்யப்பட்ட வங்கி பற்று போன்ற முக்கிய அபாயங்கள் கண்டறியப்படவில்லை.
                </div>
            </div>
        `);
    }

    sections.push(`
        <div class="ai-insight-section">
            <div class="ai-insight-header info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>வருவாய் பட்டா மாற்ற நிலை</span>
            </div>
            <div class="ai-insight-desc">
                பட்டா தரவின் படி நிலம் <strong>${record.owner.name}</strong> பெயரில் உள்ளது. பட்டா பாஸ்புக் எண் <strong>${record.land.passbook}</strong>, பரப்பளவு <strong>${record.land.extent}</strong>. ${record.riskLevel === 'high' ? 'நிலுவை வழக்கால் உரிமை மாற்றம் அபாயத்தில் உள்ளது.' : 'உரிமை விவரங்கள் பதிவு துறை பதிவுகளுடன் பொருந்துகின்றன.'}
            </div>
        </div>
    `);

    let recs = [];
    if (record.riskLevel === 'high') {
        recs = [
            "இந்த சொத்துக்கான வாங்குதல் அல்லது விற்பனை ஒப்பந்தத்தை இப்போது தொடர வேண்டாம்.",
            "விற்பவரிடம் நீதிமன்ற தடை உத்தரவு அல்லது வழக்கு நிலை சான்று கேட்கவும்.",
            "செயலில் உள்ள வழக்கின் plaint நகலை வழக்கறிஞர் மூலம் ஆய்வு செய்யவும்.",
            "அதே சர்வே துணை எண்களும் பாதிக்கப்பட்டுள்ளனவா என சரிபார்க்கவும்."
        ];
    } else if (record.riskLevel === 'medium') {
        recs = [
            "சப்-ரெஜிஸ்ட்ரார் அலுவலகத்தில் இருந்து புதிய 30 ஆண்டு EC பெறவும்.",
            "அடமானம்/கடன் முடிப்பு நிலையை நேரடியாக வங்கியில் உறுதி செய்யவும்.",
            "நகராட்சி வரி அல்லது பிற பற்று நிலுவைகள் உள்ளனவா என பார்க்கவும்.",
            "அசல் ஆவணங்கள் பரிவர்த்தனை நேரத்தில் பாதுகாப்பாக விடுவிக்கப்பட வேண்டும்."
        ];
    } else {
        recs = [
            "FMB பதிவுகளுடன் நில எல்லைகள் பொருந்துகிறதா என நில அளவையர் மூலம் சரிபார்க்கவும்.",
            "அருகிலுள்ள நில உரிமையாளர்களிடமிருந்து தேவையான NOC பெறவும்.",
            "எதிர்கால கோரிக்கைகளுக்கு பாதுகாப்பான இழப்பீடு விதிகளை ஒப்பந்தத்தில் சேர்க்கவும்.",
            "சட்ட கால வரம்புக்குள் சப்-ரெஜிஸ்ட்ரார் அலுவலகத்தில் பதிவை முடிக்கவும்."
        ];
    }

    sections.push(`
        <div class="ai-insight-section">
            <div class="ai-insight-header info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <span>பரிந்துரைக்கப்பட்ட சட்ட சரிபார்ப்பு பட்டியல்</span>
            </div>
            <div class="ai-insight-desc">
                பாதுகாப்பான பரிவர்த்தனைக்கு பின்வரும் செயல்களை முடிக்கவும்:
                <ul class="ai-insight-list">
                    ${recs.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        </div>
    `);

    container.innerHTML = sections.join('');
}

// ============================================
// Interactive AI Chat Assistant Logic
// ============================================
function initChatBot() {
    const toggleBtn = document.getElementById('chatToggleBtn');
    const closeBtn = document.getElementById('chatCloseBtn');
    const chatWindow = document.getElementById('chatWindow');
    const form = document.getElementById('chatInputArea');
    const input = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');
    const iconOpen = toggleBtn.querySelector('.chat-icon-open');
    const iconClose = toggleBtn.querySelector('.chat-icon-close');

    // Toggle Chat Window
    toggleBtn.addEventListener('click', () => {
        const isActive = chatWindow.classList.contains('active');
        if (isActive) {
            chatWindow.classList.remove('active');
            iconOpen.style.display = '';
            iconClose.style.display = 'none';
        } else {
            chatWindow.classList.add('active');
            iconOpen.style.display = 'none';
            iconClose.style.display = '';
            // Scroll to bottom
            setTimeout(() => {
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 100);
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
        iconOpen.style.display = '';
        iconClose.style.display = 'none';
    });

    // Send Message
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        appendChatMessage(text, 'user');

        // Show typing indicator
        showTypingIndicator();

        // Simulate AI response
        setTimeout(() => {
            removeTypingIndicator();
            const botResponse = generateAIResponse(text);
            appendChatMessage(botResponse, 'bot');
        }, 1000);
    });
}

function appendChatMessage(text, sender) {
    const chatBody = document.getElementById('chatBody');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender === 'user' ? 'user-msg' : 'bot-msg');
    msgDiv.innerHTML = `
        <div class="msg-bubble">
            ${text}
        </div>
    `;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
    const chatBody = document.getElementById('chatBody');
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('chat-msg', 'bot-msg', 'typing-indicator-msg');
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="msg-bubble" style="display: flex; gap: 4px; padding: 12px 20px; align-items: center;">
            <span class="typing-dot" style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: typing 1s infinite;"></span>
            <span class="typing-dot" style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: typing 1s infinite 0.2s;"></span>
            <span class="typing-dot" style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: typing 1s infinite 0.4s;"></span>
        </div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Add inline keyframes if not present
    if (!document.getElementById('typingStyles')) {
        const style = document.createElement('style');
        style.id = 'typingStyles';
        style.textContent = `
            @keyframes typing {
                0%, 100% { transform: translateY(0); opacity: 0.3; }
                50% { transform: translateY(-4px); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function updateChatbotState(record) {
    const input = document.getElementById('chatInput');
    const btn = document.getElementById('chatSendBtn');
    const suggestions = document.getElementById('chatSuggestions');

    input.disabled = false;
    btn.disabled = false;
    input.removeAttribute('data-original-placeholder');
    input.placeholder = "Ask about " + record.land.surveyNo + "...";

    // Populate suggestions
    suggestions.style.display = 'flex';

    let sugHtml = `<div class="chat-sug-title">${t('Suggested Questions')}</div>`;
    if (record.riskLevel === 'high') {
        sugHtml += `
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('Explain the active court dispute').replace(/'/g, "\\'")}')">${t('Explain the active court dispute')}</button>
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('Is it safe to buy this land?').replace(/'/g, "\\'")}')">${t('Is it safe to buy this land?')}</button>
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('Who is suing whom?').replace(/'/g, "\\'")}')">${t('Who is suing whom?')}</button>
        `;
    } else if (record.riskLevel === 'medium') {
        sugHtml += `
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('Explain the active bank loan').replace(/'/g, "\\'")}')">${t('Explain the active bank loan')}</button>
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('What are the buying recommendations?').replace(/'/g, "\\'")}')">${t('What are the buying recommendations?')}</button>
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('Are there any court stays?').replace(/'/g, "\\'")}')">${t('Are there any court stays?')}</button>
        `;
    } else {
        sugHtml += `
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('Check ownership authenticity').replace(/'/g, "\\'")}')">${t('Check ownership authenticity')}</button>
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('Are there any risks at all?').replace(/'/g, "\\'")}')">${t('Are there any risks at all?')}</button>
            <button class="chat-sug-item" onclick="submitChatSuggestion('${t('What are the next steps?').replace(/'/g, "\\'")}')">${t('What are the next steps?')}</button>
        `;
    }
    suggestions.innerHTML = sugHtml;

    // Reset chat greeting
    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML = `
        <div class="chat-msg bot-msg">
            <div class="msg-bubble">
                ${getChatGreeting(record)}
            </div>
        </div>
    `;
    applyLanguage(document.getElementById('aiChatWidget'));
}

function disableChatbotState() {
    const input = document.getElementById('chatInput');
    const btn = document.getElementById('chatSendBtn');
    const suggestions = document.getElementById('chatSuggestions');

    input.disabled = true;
    btn.disabled = true;
    input.removeAttribute('data-original-placeholder');
    input.placeholder = "Search land records to activate AI...";
    suggestions.style.display = 'none';
    applyLanguage(document.getElementById('aiChatWidget'));
}

function getChatGreeting(record) {
    if (currentLanguage === 'ta') {
        return `<strong>சர்வே எண் ${record.land.surveyNo}</strong>, <strong>${record.land.village}</strong> அறிக்கை ஏற்றப்பட்டது. நீதிமன்ற தடை, கடன் நிலை, உரிமை மாற்ற அபாயம் போன்றவற்றை நான் விளக்க முடியும். என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?`;
    }

    return `I have loaded the report for <strong>Survey No. ${record.land.surveyNo}</strong> in <strong>${record.land.village}</strong>. I can help explain court stay orders, loan statuses, or ownership transfer risks. What would you like to know?`;
}

// Global function to trigger suggestions on click
window.submitChatSuggestion = function (text) {
    const input = document.getElementById('chatInput');
    input.value = text;
    document.getElementById('chatInputArea').dispatchEvent(new Event('submit'));
};

function generateAIResponse(text) {
    const query = text.toLowerCase().trim();
    if (!activeRecord) {
        return currentLanguage === 'ta'
            ? "நில பதிவுகளை கேட்க முதலில் கிராமப் பெயர் மற்றும் சர்வே எண்ணை தேடல் பகுதியில் உள்ளிடுங்கள்."
            : "Please enter a village name and survey number in the search bar first to query land records.";
    }

    const r = activeRecord;

    if (currentLanguage === 'ta') {
        return generateTamilAIResponse(query, r);
    }

    if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
        return `Hello! How can I assist you with the legal status of Survey No. ${r.land.surveyNo} today?`;
    }

    if (query.includes('safe') || query.includes('buy') || query.includes('should i') || query.includes('risk')) {
        if (r.riskLevel === 'high') {
            return `<strong>Critical Warning:</strong> Buying this property is <strong>HIGHLY RISKY</strong>. An active litigation (${r.courtCases[0]?.caseNo}) is pending in court. Any sale agreement signed during litigation is subject to the doctrine of <em>Lis Pendens</em> (Section 52 of the Transfer of Property Act), meaning the court's final ruling will bind the buyer, and the registry can cancel your deed.`;
        } else if (r.riskLevel === 'medium') {
            return `This property has a <strong>MEDIUM RISK</strong>. It is safe to buy <em>only after</em> the owner secures a Debt Release Deed or No Objection Certificate (NOC) from ${r.encumbrance.mortgages.split('—')[0].trim()}. Currently, the property is mortgaged, and the bank holds the original deeds.`;
        } else {
            return `Based on search records, this property is <strong>SAFE</strong> to buy. There are no active court stays, disputes, or mortgages recorded against Survey No. ${r.land.surveyNo}. Ensure you draft a standard sale agreement with solid indemnity terms.`;
        }
    }

    if (query.includes('owner') || query.includes('who') || query.includes('possess') || query.includes('father') || query.includes('authenticity')) {
        return `According to Patta registry ${r.land.passbook}, the land is registered under <strong>${r.owner.name}</strong>, son of <strong>${r.owner.fatherName}</strong>. The registration was completed on <strong>${r.owner.registrationDate}</strong>. ${r.riskLevel === 'high' ? 'However, this ownership is currently disputed in court.' : 'The registry shows clear, undisputed ownership status.'}`;
    }

    if (query.includes('court') || query.includes('case') || query.includes('hearing') || query.includes('litigation') || query.includes('stay') || query.includes('injunction') || query.includes('sue') || query.includes('suing')) {
        if (r.courtCases.length === 0) {
            return `There are <strong>no active court cases or legal stays</strong> registered against Survey No. ${r.land.surveyNo} in any District or High Court database.`;
        } else {
            const c = r.courtCases[0];
            return `Yes, there is an active case: <strong>${c.caseNo}</strong> filed at <strong>${c.court}</strong>. It is a <strong>${c.type}</strong> between <strong>${c.parties}</strong>. Status is <strong>${c.status.toUpperCase()}</strong>. The next hearing is scheduled on <strong>${c.nextHearing}</strong>. ${c.description}`;
        }
    }

    if (query.includes('loan') || query.includes('bank') || query.includes('mortgage') || query.includes('lien') || query.includes('tax') || query.includes('encumbrance')) {
        if (r.encumbrance.status === 'Clear') {
            return `The Encumbrance Certificate (EC) is <strong>CLEAR</strong>. No bank loans, tax liens, mortgages, or government claims have been registered against this survey number in the last checked period (${r.encumbrance.lastChecked}).`;
        } else {
            return `The property is subject to an active encumbrance: <strong>${r.encumbrance.status}</strong>. Specifically, there is an active mortgage: <strong>${r.encumbrance.mortgages}</strong>, and liens/claims: <strong>${r.encumbrance.liens}</strong>. These must be discharged before the title can be cleanly transferred.`;
        }
    }

    if (query.includes('extent') || query.includes('area') || query.includes('acres') || query.includes('value') || query.includes('price')) {
        return `The land extent is <strong>${r.land.extent}</strong> with classification listed as <strong>${r.land.classification}</strong>. The approximate government/market valuation is listed as <strong>${r.land.marketValue}</strong>.`;
    }

    if (query.includes('next') || query.includes('step') || query.includes('recommend')) {
        if (r.riskLevel === 'high') {
            return `<strong>Next Steps:</strong> 1. Retain a local land advocate to search the sub-court registry. 2. Fetch the full plaint copy of case ${r.courtCases[0]?.caseNo}. 3. Do not pay any advance amount to the seller.`;
        } else if (r.riskLevel === 'medium') {
            return `<strong>Next Steps:</strong> 1. Ask the seller for the latest loan statement and proof of outstanding amount. 2. Draft a tripartite agreement if necessary or require bank loan discharge before signing.`;
        } else {
            return `<strong>Next Steps:</strong> 1. Verify physical bounds using municipal surveyor. 2. Verify all parent deeds going back 30 years. 3. Draft and register the sale deed.`;
        }
    }

    // Default Fallback
    return `Regarding Survey No. ${r.land.surveyNo} in ${r.land.village}: The overall litigation risk is <strong>${r.riskLevel.toUpperCase()}</strong> (${r.risk}/100). Owner is listed as ${r.owner.name}. ${r.courtCases.length > 0 ? 'It has active litigations pending.' : 'It has clear judicial standing.'} You can ask me specific questions about the owner, bank loans, or court stays.`;
}

function generateTamilAIResponse(query, r) {
    if (query.includes('hello') || query.includes('hi') || query.includes('வணக்கம்')) {
        return `வணக்கம்! சர்வே எண் <strong>${r.land.surveyNo}</strong> பற்றிய சட்ட நிலையை விளக்க உதவுகிறேன்.`;
    }

    if (query.includes('safe') || query.includes('buy') || query.includes('risk') || query.includes('வாங்க') || query.includes('பாதுகாப்பு') || query.includes('அபாய')) {
        if (r.riskLevel === 'high') {
            return `<strong>முக்கிய எச்சரிக்கை:</strong> இந்த சொத்தை வாங்குவது <strong>மிகவும் அபாயகரமானது</strong>. செயலில் உள்ள வழக்கு (${r.courtCases[0]?.caseNo || 'நிலுவை வழக்கு'}) உள்ளது. வழக்கு நிலுவையில் இருக்கும்போது ஒப்பந்தம் செய்தால், நீதிமன்ற தீர்ப்பு வாங்குபவரையும் கட்டுப்படுத்தலாம்.`;
        }
        if (r.riskLevel === 'medium') {
            return `இந்த சொத்துக்கு <strong>நடுத்தர அபாயம்</strong> உள்ளது. உரிமையாளர் கடன் முடிப்பு சான்று அல்லது NOC பெற்ற பிறகே வாங்குவது பாதுகாப்பானது. தற்போது வில்லங்கம்/அடமானம் பதிவு செய்யப்பட்டிருக்கலாம்.`;
        }
        return `கிடைத்த பதிவுகளின் அடிப்படையில் இந்த சொத்து <strong>குறைந்த அபாயம்</strong> கொண்டது. செயலில் உள்ள வழக்கு, தடை, அடமானம் போன்ற முக்கிய பிரச்சினைகள் தெரியவில்லை. இருந்தாலும் இறுதி முடிவுக்கு முன் வழக்கறிஞர் மூலம் ஆவணங்களை சரிபார்க்கவும்.`;
    }

    if (query.includes('owner') || query.includes('who') || query.includes('father') || query.includes('உரிமை') || query.includes('யார்') || query.includes('தந்தை')) {
        return `பட்டா பதிவு <strong>${r.land.passbook}</strong> படி நிலம் <strong>${r.owner.name}</strong>, தந்தை <strong>${r.owner.fatherName}</strong> பெயரில் உள்ளது. பதிவு தேதி <strong>${r.owner.registrationDate}</strong>. ${r.riskLevel === 'high' ? 'ஆனால் இந்த உரிமை தற்போது நீதிமன்றத்தில் தகராறாக உள்ளது.' : 'பதிவுகளில் உரிமை நிலை தெளிவாக உள்ளது.'}`;
    }

    if (query.includes('court') || query.includes('case') || query.includes('hearing') || query.includes('litigation') || query.includes('stay') || query.includes('நீதிமன்ற') || query.includes('வழக்கு') || query.includes('தடை')) {
        if (r.courtCases.length === 0) {
            return `சர்வே எண் <strong>${r.land.surveyNo}</strong> மீது செயலில் உள்ள நீதிமன்ற வழக்கு அல்லது தடை உத்தரவு பதிவாகவில்லை.`;
        }
        const c = r.courtCases[0];
        return `ஆம். <strong>${c.caseNo}</strong> என்ற வழக்கு <strong>${c.court}</strong> நீதிமன்றத்தில் உள்ளது. வகை: <strong>${c.type}</strong>. தரப்புகள்: <strong>${c.parties}</strong>. அடுத்த விசாரணை: <strong>${c.nextHearing}</strong>.`;
    }

    if (query.includes('loan') || query.includes('bank') || query.includes('mortgage') || query.includes('lien') || query.includes('encumbrance') || query.includes('கடன்') || query.includes('வங்கி') || query.includes('அடமான') || query.includes('வில்லங்க')) {
        if (r.encumbrance.status === 'Clear') {
            return `வில்லங்கச் சான்று நிலை <strong>தெளிவு</strong>. கடன், அடமானம், அரசு கோரிக்கை போன்றவை கடைசியாக சரிபார்த்த தேதி (${r.encumbrance.lastChecked}) வரை தெரியவில்லை.`;
        }
        return `இந்த சொத்தில் வில்லங்கம் உள்ளது: <strong>${r.encumbrance.status}</strong>. அடமானம்: <strong>${r.encumbrance.mortgages}</strong>. கோரிக்கைகள்: <strong>${r.encumbrance.liens}</strong>. பரிவர்த்தனைக்கு முன் இவை தீர்க்கப்பட வேண்டும்.`;
    }

    if (query.includes('extent') || query.includes('area') || query.includes('value') || query.includes('பரப்பளவு') || query.includes('மதிப்பு')) {
        return `நிலத்தின் பரப்பளவு <strong>${r.land.extent}</strong>. வகைப்பாடு <strong>${r.land.classification}</strong>. சுமார் சந்தை/அரசு மதிப்பு <strong>${r.land.marketValue}</strong>.`;
    }

    if (query.includes('next') || query.includes('step') || query.includes('recommend') || query.includes('அடுத்த') || query.includes('பரிந்துரை')) {
        if (r.riskLevel === 'high') {
            return `<strong>அடுத்த படிகள்:</strong> 1. விற்பனை ஒப்பந்தத்தில் கையெழுத்திட வேண்டாம். 2. வழக்கு ஆவணங்கள் மற்றும் தடை உத்தரவை வழக்கறிஞர் மூலம் பெறுங்கள். 3. முன்பணம் செலுத்துவதற்கு முன் முழு சட்ட ஆய்வு செய்யுங்கள்.`;
        }
        if (r.riskLevel === 'medium') {
            return `<strong>அடுத்த படிகள்:</strong> 1. புதிய 30 ஆண்டு EC பெறுங்கள். 2. கடன்/NOC நிலையை வங்கியில் உறுதி செய்யுங்கள். 3. விற்பனைப் பத்திரத்திற்கு முன் அனைத்து வில்லங்கங்களும் தீர்க்கப்பட்டிருக்க வேண்டும்.`;
        }
        return `<strong>அடுத்த படிகள்:</strong> 1. எல்லைகளை FMB உடன் பொருத்தி சரிபார்க்கவும். 2. பெற்றோர் ஆவணங்களை 30 ஆண்டுகள் வரை சரிபார்க்கவும். 3. பாதுகாப்பான இழப்பீடு விதிகளுடன் விற்பனை ஒப்பந்தம் தயாரிக்கவும்.`;
    }

    return `சர்வே எண் <strong>${r.land.surveyNo}</strong>, ${r.land.village}: மொத்த வழக்கு அபாயம் <strong>${t(r.riskLevel.toUpperCase() + ' RISK')}</strong> (${r.risk}/100). உரிமையாளர் ${r.owner.name}. ${r.courtCases.length > 0 ? 'செயலில் உள்ள வழக்குகள் உள்ளன.' : 'நீதிமன்ற நிலை தெளிவாக உள்ளது.'} உரிமை, வங்கி கடன், நீதிமன்ற தடை குறித்து தனியாக கேட்கலாம்.`;
}
