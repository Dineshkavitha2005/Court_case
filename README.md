# LandGuard — Tamil Nadu Land Litigation Due Diligence Platform

LandGuard is a secure, reliable web application designed to facilitate preliminary land due diligence and litigation risk assessment across Tamil Nadu, India. By organizing statutory administrative hierarchies (District &rarr; Taluk &rarr; Village &rarr; Survey Number) and querying verified legal and revenue datasets, LandGuard helps property buyers, advocates, and financial institutions identify recorded litigation risks before entering property transactions.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Client Web Application    |
                      |   (Vanilla JS, Leaflet GIS, |
                      |    Web Speech API ta/en)    |
                      +--------------+--------------+
                                     | HTTP / JSON
                                     v
                      +-----------------------------+
                      |     Node.js HTTP Server     |
                      | (Security Headers, Traversal|
                      |  Shield, IP Rate Limiter)   |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
+-----------------------------+             +-----------------------------+
|    Land & Risk Controller   |             |     AI Analyst Controller   |
|  - Hierarchical Location    |             |  - Strict Context Binding   |
|  - Deterministic Risk Engine|             |  - Gemini API (.env key)    |
|  - Legal Data Adapter       |             |  - Deterministic Fallback   |
+--------------+--------------+             +-----------------------------+
               |
               v
+----------------------------------------------------------+
|            SQLite Relational Database (landguard.db)      |
|  - districts (38 TN Districts)                           |
|  - taluks (215+ Taluks)                                  |
|  - villages (13,900+ Revenue Villages)                   |
|  - land_parcels, court_cases, case_history, encumbrances |
+----------------------------------------------------------+
```

---

## Key Features

1. **Zero Fabricated Data**: Completely eliminates synthetic legal record generators. In the absence of a verified registry record, LandGuard returns a genuine `"No verified record found"` response with instructions on obtaining certified copies.
2. **Tamil Nadu 4-Tier Location Hierarchy**: Seamless selection across all 38 districts, 215+ taluks, and 13,900+ villages, with survey number pattern validation.
3. **Deterministic Rules-Based Risk Engine**: Evaluates risk points transparently based on active litigation (+35), multiple disputes (+55), interim injunctions (+30), and recorded encumbrances (+20). Never uses randomized scores.
4. **Bilingual Interface & Voice Search**: Full English and Tamil (`ta-IN`, `en-IN`) voice speech recognition and interface localization.
5. **Context-Bound AI Analyst**: Powered by Google Gemini via secure backend environment variables, or a local deterministic legal terminology engine when no API key is provided. Never hallucinates or invents legal outcomes.
6. **Hardened Security**: Dedicated `public/` webroot, strict path-traversal prevention, HTTP security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`), and centralized error handling.
7. **Transparent Cadastral Map**: Leaflet map displaying approximate location with clear disclaimers that statutory cadastral boundaries require official FMB extracts.

---

## Project Structure

The codebase is organized into cleanly separated domains:

```
Court_case/
│
├── frontend/                     # Client application (HTML, CSS, JS, Assets)
│   ├── app.js                   # Client logic, UI controllers, bilingual translations
│   ├── index.html               # Main single-page interface
│   ├── styles.css               # Responsive design system & glassmorphism theme
│   ├── favicon.ico              # Web application icon
│   └── land_verification_dashboard.png # Architecture & dashboard preview
│
├── backend/                      # Server, API routing, middleware, and business services
│   ├── server.js                # Core HTTP server & route handler
│   ├── middleware/              # Security and traffic control
│   │   ├── rateLimiter.js       # Sliding-window IP rate limiter
│   │   └── security.js          # CSP headers, traversal sanitization
│   └── services/                # Backend domain services
│       ├── aiService.js         # Context-bound AI legal analyst (Gemini API)
│       ├── dataSourceStatus.js  # Statutory registry statuses & classifications
│       ├── legalDataService.js  # SQLite data access & queries
│       └── riskEngine.js        # Deterministic litigation risk calculation
│
├── database/                     # Database schemas, compiler & seed data
│   ├── init_db.js               # Database compiler & benchmark seeder
│   ├── schema.sql               # Relational SQL schema
│   ├── landguard.db             # Primary compiled SQLite database
│   └── data/                    # Raw village, subdistrict & survey data
│       ├── all_subdistricts.json
│       ├── survey_numbers.json
│       ├── tamilnadu_synthetic_survey_numbers_10000.csv
│       ├── villages.db
│       ├── villages.json
│       ├── village_database.db
│       └── village_database.json
│
├── scripts/                      # Data ingestion, web scraping & migration scripts
│   ├── batch_scrape.py
│   ├── build_village_db.py
│   ├── check_all_sources.py
│   ├── check_db.py
│   ├── check_status.py
│   ├── consolidate_villages.py
│   ├── create_simple_village_db.py
│   ├── export_simple_json.py
│   ├── fast_scrape.py
│   ├── final_merge.py
│   ├── fix_district_names.py
│   ├── generate_tn_database.py
│   ├── load_survey_numbers.py
│   ├── populate_all_villages.py
│   ├── retry_empty.py
│   ├── retry_failed.py
│   ├── scrape_all_tn_villages.py
│   └── _merge_villages.py
│
├── docs/                         # Documentation, design specs, and audit reports
│   ├── AUDIT_REPORT.md          # Comprehensive audit and verification report
│   ├── DATA_SOURCES.md          # Official statutory registries documentation
│   ├── DESIGN.md                # System design & architecture specification
│   └── TODO.md                  # Development tasks & run notes
│
├── tests/                        # Automated unit and E2E test suites
│   ├── e2e/
│   │   └── landguard.spec.js    # Playwright browser end-to-end tests
│   └── unit/
│       ├── api.test.js          # API route tests
│       ├── legalDataVerification.test.js # Legal data verification tests
│       ├── riskEngine.test.js   # Risk calculation engine tests
│       └── security.test.js     # Path traversal & HTTP security tests
│
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore file
├── package.json                  # NPM project metadata & dependencies
├── package-lock.json             # NPM lockfile
├── playwright.config.js          # Playwright test runner configuration
├── README.md                     # Project overview and documentation
└── server.js                     # Root entry point alias (convenient root launch)
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node.js v24 LTS)
- **npm**: v9.0.0 or higher
- **Modern Web Browser**: Chrome, Edge, Safari, or Firefox with Web Speech API support

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "court case/Court_case"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` as required:
   ```ini
   PORT=8765
   HOST=127.0.0.1
   NODE_ENV=development
   
   # Optional: Google Gemini API key for AI Legal Analyst
   GEMINI_API_KEY=your_gemini_api_key_here
   
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=60
   ```

4. **Initialize Database**:
   Compile the 38-district Tamil Nadu hierarchy and reference datasets:
   ```bash
   npm run init:db
   ```

5. **Start the Application**:
   ```bash
   npm start
   ```
   Access the application at [http://127.0.0.1:8765](http://127.0.0.1:8765).

---

## Development Commands

| Command | Description |
| :--- | :--- |
| `npm start` | Runs the server in production mode |
| `npm run dev` | Runs the server with automatic reload on file changes (`node --watch`) |
| `npm run init:db` | Seeds and verifies the SQLite database (`database/init_db.js`) |
| `npm test` | Runs the full test suite (backend unit tests + Playwright E2E) |
| `npm run test:unit` | Runs backend unit and API security tests (`node:test`) |
| `npm run test:e2e` | Runs Playwright browser end-to-end tests |

---

## API Endpoints

### 1. `GET /api/districts`
Returns all 38 Tamil Nadu districts.

### 2. `GET /api/taluks?district={districtName}`
Returns taluks belonging to the specified district.

### 3. `GET /api/villages?district={district}&taluk={taluk}&q={searchQuery}`
Returns matching revenue villages within the selected taluk.

### 4. `GET /api/surveynumbers?village={villageName}`
Returns available survey numbers for suggestions.

### 5. `POST /api/land/search`
**Payload**:
```json
{
  "district": "Coimbatore",
  "taluk": "Coimbatore South",
  "village": "Alanthurai (TP)",
  "surveyNumber": "142/1"
}
```
**Responses**:
- `status: "verified_record"`: Genuine verified record found with documented source.
- `status: "demo_record"`: Sample reference record, visibly flagged with `is_demo: 1`.
- `status: "no_record"`: No verified record found in registries.
- `status: "unavailable_source"`: Live external API not configured.
- `status: "error"`: Validation or database error.

### 6. `POST /api/ai/chat`
Context-bound legal query analysis using verified record facts.

---

## Limitations & Legal Notice

1. **Preliminary Due Diligence Only**: LandGuard is designed solely for informational research and preliminary due diligence. It does **not** constitute legal advice, title insurance, or a formal legal opinion.
2. **Absence of Record**: Absence of a recorded court case does not guarantee that a property is free from unregistered mortgages, pending notices, family partition claims, or oral agreements.
3. **Official Verification**: Always obtain a signed 30-year Encumbrance Certificate (EC) from [TNREGINET](https://tnreginet.gov.in), verified Patta/Chitta and FMB sketches from [eservices.tn.gov.in](https://eservices.tn.gov.in), and consult a certified advocate enrolled with the Bar Council of Tamil Nadu.

---

## Deployment Instructions

1. **Production Process Manager (PM2)**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "landguard" --env production
   ```
2. **Reverse Proxy (Nginx)**:
   Forward incoming traffic on port 80/443 to `http://127.0.0.1:8765`, enabling SSL/TLS with Let's Encrypt Certbot.
3. **File System Permissions**:
   Ensure `landguard.db` has write permissions only for the executing service account and static assets in `public/` are read-only.
