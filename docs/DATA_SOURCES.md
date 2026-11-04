# LandGuard — Official Legal & Land Data Sources Documentation

This document outlines the official, public, and statutory sources of land ownership, registration, and litigation records in Tamil Nadu, India, detailing their legal accessibility, technical interfaces, and operational constraints.

---

## 1. Statutory Registries & Portals

### 1.1 eCourts Integrated Mission Mode Project (National Judicial Data Grid - NJDG)
- **Source**: e-Committee, Supreme Court of India & Ministry of Law and Justice
- **URL**: [https://ecourts.gov.in](https://ecourts.gov.in) / [https://njdg.ecourts.gov.in](https://njdg.ecourts.gov.in)
- **Type of Data**: Court case status, Case Number Record (CNR), filing date, parties, court hearing history, interim orders, stay orders, final decrees across District, Taluk, and High Courts.
- **Access Method**: Web portal search by CNR, Case Number, Party Name, or Advocate.
- **Update Frequency**: Real-time / Daily as court clerks upload cause lists and proceedings.
- **Technical & Legal Limitations**:
  - Protected by dynamic image CAPTCHA to prevent automated bot scraping.
  - Terms of service strictly prohibit automated mass harvesting, scraping, or scraping scripts.
  - Case metadata is not indexed by land survey number in legacy district court registries; searches require party names, CNR, or case numbers.
- **API Availability**:
  - Open API for institutional stakeholders (e-Filing, Department of Justice, registered financial institutions).
  - No public unauthenticated REST API exists for general queries.
- **LandGuard Integration Strategy**:
  - Modular `LegalDataAdapter` interface is designed to ingest verified eCourts data through authorized institutional API endpoints when licensed credentials are provided.

---

### 1.2 Anywhere Any Time e-Services (Tamil Nadu Revenue Department)
- **Source**: Department of Survey and Settlement, Government of Tamil Nadu
- **URL**: [https://eservices.tn.gov.in](https://eservices.tn.gov.in)
- **Type of Data**:
  - **Patta / Chitta**: Record of Right (RoR), patta number, ownership names, land classification (Dry/Wet/Nanjai/Punjai/Poramboke), total extent.
  - **FMB (Field Measurement Book)**: Survey boundary sketches and sub-division maps.
  - **TSLR Extracts**: Town Survey Land Register entries for municipal and urban areas.
  - **A-Register Extract**: Historical revenue records classification.
- **Access Method**: Web-based form selecting District &rarr; Taluk &rarr; Village &rarr; Survey Number & Sub-division.
- **Update Frequency**: Periodically synced with Tamil Nilam revenue database.
- **Technical & Legal Limitations**:
  - Protected by session-based dynamic alphanumeric CAPTCHA.
  - Automated queries violate the portal's Acceptable Use Policy.
  - Land records are occasionally locked during ongoing mutation or sub-division appeals.
- **API Availability**:
  - G2G (Government to Government) integration exists with TNREGINET for automatic registration verification.
  - No public open API for third-party commercial applications without prior government MoU/approval.

---

### 1.3 TNREGINET (Tamil Nadu Registration Department)
- **Source**: Inspector General of Registration (IGR), Tamil Nadu
- **URL**: [https://tnreginet.gov.in](https://tnreginet.gov.in)
- **Type of Data**:
  - **Encumbrance Certificate (EC)**: Registered sale deeds, mortgages, lease agreements, partition deeds, gift deeds, court attachment notices.
  - **Certified Copies (CC)**: Registered title deeds and registered documents.
  - **Guideline Value**: Government circle rates by survey number and street.
- **Access Method**: User registration, OTP authentication, and survey-based EC search.
- **Update Frequency**: Daily as documents are registered at Sub-Registrar Offices (SRO).
- **Technical & Legal Limitations**:
  - Requires authenticated user session and CAPTCHA validation.
  - Online EC reflects only registered transactions at SROs. Unregistered agreements, oral family partitions, or pending court cases without registered attachments do not appear on an EC.
- **API Availability**:
  - Restricted to licensed state departments and designated financial institutions. Public API is not openly accessible.

---

### 1.4 Tamil Nadu High Court Judgments & Cause Lists (Madras High Court)
- **Source**: Madras High Court Principal Bench (Chennai) & Madurai Bench
- **URL**: [https://hcmadras.tn.gov.in](https://hcmadras.tn.gov.in)
- **Type of Data**: Writ petitions, civil revision petitions, first appeals, stay orders on land acquisition or revenue officer orders.
- **Access Method**: Web portal search by party, case number, or judge.
- **Update Frequency**: Daily cause lists and judgment PDF uploads.
- **API Availability**: RSS feeds for cause lists; judgment repository accessible through Indian Kanoon / e-SCR.

---

### 1.5 Local Revenue & Taluk Administrative Hierarchy Dataset
- **Source**: Local Government Directory (LGD), Ministry of Panchayati Raj, Government of India & `vlist.in`
- **URL**: [https://lgdirectory.gov.in](https://lgdirectory.gov.in)
- **Type of Data**: Official statutory codes, 38 administrative districts, 215+ taluks, and 13,900+ revenue villages of Tamil Nadu.
- **Access Method**: Open government data and public gazettes.
- **Update Frequency**: Updated upon state government district reorganization notifications.
- **API Availability**: LGD open data downloads and SQLite pre-compiled relational tables.

---

## 2. Ethical & Legal Compliance Policy

1. **No CAPTCHA Bypassing**: LandGuard strictly adheres to ethical web practices and never implements CAPTCHA bypassers, OCR circumvention, or unauthorized robotic scraping against government portals.
2. **No Fabrication of Records**: In the absence of a live government API connection, LandGuard never invents fake case numbers, fictitious parties, or random risk metrics. If no verified entry exists, the platform returns a clear `"No verified record found"` notice and instructs the user on obtaining certified copies.
3. **Transparent Demo Data**: Any sample records provided for developer testing or UI verification are permanently stored with `is_demo: 1` and rendered with a prominent **`[DEMO DATA - FOR ILLUSTRATION ONLY]`** warning badge.
4. **Legal Advice Disclaimer**: LandGuard provides technical tooling for preliminary due diligence and does not substitute for professional legal verification or title opinion issued by an enrolled advocate.

---

## 3. Data Adapter Architecture

LandGuard employs a pluggable `DataSourceAdapter` pattern:
```
           +----------------------------------+
           |        LegalDataService          |
           +----------------------------------+
                            |
         +------------------+------------------+
         |                                     |
+---------------------+             +---------------------+
|   DatabaseAdapter   |             |   ExternalApiAdapter|
| (Local SQLite DB)   |             | (Authorized eCourts |
| - Verified Records  |             |  / TNREGINET Gateway|
| - Demo Records      |             | - Live queries)     |
+---------------------+             +---------------------+
```

When an institutional key for eCourts or state land APIs is configured in `.env`, `ExternalApiAdapter` activates automatically, preserving full backward compatibility.
