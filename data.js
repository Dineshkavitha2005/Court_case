// ============================================
// MOCK DATA — Land Records Database
// ============================================

const LAND_DATABASE = {
    // ---- KONDAPUR ----
    "kondapur": {
        "45/A": {
            risk: 25,
            riskLevel: "low",
            owner: {
                name: "Ramesh Babu Reddy",
                fatherName: "Venkat Reddy",
                aadhaar: "XXXX-XXXX-4523",
                phone: "+91 9XXXXX7890",
                address: "H.No. 12-5-34, Kondapur Village, Serilingampally Mandal, Rangareddy District",
                registrationDate: "15-03-2018"
            },
            land: {
                surveyNo: "45/A",
                village: "Kondapur",
                mandal: "Serilingampally",
                district: "Rangareddy",
                state: "Telangana",
                extent: "2 Acres 20 Guntas",
                classification: "Agricultural Land",
                marketValue: "₹4.5 Crore",
                passbook: "TS/RR/SLG/2018/00456"
            },
            courtCases: [],
            encumbrance: {
                status: "Clear",
                lastChecked: "10-01-2026",
                mortgages: "None",
                liens: "None"
            },
            riskFactors: [
                { label: "Court Cases", value: "No active cases", color: "green" },
                { label: "Title Dispute", value: "Clear title", color: "green" },
                { label: "Encumbrance", value: "No encumbrances", color: "green" },
                { label: "Government Acquisition", value: "Not under acquisition", color: "green" }
            ],
            timeline: [
                { date: "Mar 2018", title: "Property Purchased", desc: "Ramesh Babu Reddy purchased from previous owner Suresh Kumar", dot: "success" },
                { date: "Apr 2018", title: "Mutation Completed", desc: "Revenue records updated with new ownership", dot: "success" },
                { date: "Jan 2026", title: "EC Verification", desc: "Encumbrance certificate verified - clear", dot: "success" }
            ]
        },
        "123/B": {
            risk: 72,
            riskLevel: "high",
            owner: {
                name: "Suresh Goud (Disputed)",
                fatherName: "Mallesh Goud",
                aadhaar: "XXXX-XXXX-8901",
                phone: "+91 9XXXXX1234",
                address: "H.No. 8-2-120, Kondapur Village, Serilingampally Mandal, Rangareddy District",
                registrationDate: "22-07-2015"
            },
            land: {
                surveyNo: "123/B",
                village: "Kondapur",
                mandal: "Serilingampally",
                district: "Rangareddy",
                state: "Telangana",
                extent: "5 Acres 10 Guntas",
                classification: "Non-Agricultural (Converted)",
                marketValue: "₹12 Crore",
                passbook: "TS/RR/SLG/2015/01234"
            },
            courtCases: [
                {
                    caseNo: "OS No. 1456/2021",
                    court: "District Court, Rangareddy",
                    type: "Title Dispute",
                    parties: "Nagaiah vs. Suresh Goud",
                    status: "active",
                    filedDate: "18-06-2021",
                    nextHearing: "25-07-2026",
                    description: "Plaintiff Nagaiah claims ancestral ownership of the property. Disputes the sale deed executed in 2015."
                },
                {
                    caseNo: "WP No. 8923/2023",
                    court: "High Court, Hyderabad",
                    type: "Government Acquisition Challenge",
                    parties: "Suresh Goud vs. State of Telangana",
                    status: "pending",
                    filedDate: "05-03-2023",
                    nextHearing: "15-08-2026",
                    description: "Challenge against proposed road widening acquisition of 0.5 acres from the survey."
                }
            ],
            encumbrance: {
                status: "Encumbered",
                lastChecked: "05-06-2026",
                mortgages: "SBI Home Loan — ₹45 Lakhs (Outstanding)",
                liens: "Revenue Department Lien — Pending Tax"
            },
            riskFactors: [
                { label: "Court Cases", value: "2 active cases", color: "red" },
                { label: "Title Dispute", value: "Disputed ownership", color: "red" },
                { label: "Encumbrance", value: "Mortgage + Tax Lien", color: "amber" },
                { label: "Government Acquisition", value: "Partial acquisition proposed", color: "amber" }
            ],
            timeline: [
                { date: "Jul 2015", title: "Property Registered", desc: "Sale deed registered by Suresh Goud from Pochaiah", dot: "success" },
                { date: "Aug 2015", title: "Mutation Applied", desc: "Mutation application submitted to Tahsildar office", dot: "success" },
                { date: "Jun 2021", title: "Title Dispute Filed", desc: "Nagaiah filed title dispute claiming ancestral rights", dot: "danger" },
                { date: "Sep 2022", title: "SBI Mortgage Registered", desc: "Property mortgaged for home loan of ₹45 Lakhs", dot: "warning" },
                { date: "Mar 2023", title: "Govt Acquisition Notice", desc: "Partial acquisition proposed for road widening project", dot: "danger" },
                { date: "Mar 2023", title: "High Court Challenge", desc: "Writ petition filed against acquisition", dot: "warning" }
            ]
        },
        "78/C": {
            risk: 48,
            riskLevel: "medium",
            owner: {
                name: "Lakshmi Devi",
                fatherName: "Late Srinivas Rao",
                aadhaar: "XXXX-XXXX-6721",
                phone: "+91 9XXXXX5678",
                address: "H.No. 3-8-67, Kondapur Village, Serilingampally Mandal, Rangareddy District",
                registrationDate: "10-11-2020"
            },
            land: {
                surveyNo: "78/C",
                village: "Kondapur",
                mandal: "Serilingampally",
                district: "Rangareddy",
                state: "Telangana",
                extent: "1 Acre 30 Guntas",
                classification: "Agricultural Land",
                marketValue: "₹2.8 Crore",
                passbook: "TS/RR/SLG/2020/00789"
            },
            courtCases: [
                {
                    caseNo: "OS No. 342/2024",
                    court: "Civil Court, Serilingampally",
                    type: "Inheritance Dispute",
                    parties: "Krishna Rao vs. Lakshmi Devi",
                    status: "pending",
                    filedDate: "14-02-2024",
                    nextHearing: "10-09-2026",
                    description: "Brother Krishna Rao claims equal share in inherited property. Settlement talks underway."
                }
            ],
            encumbrance: {
                status: "Minor Encumbrance",
                lastChecked: "20-04-2026",
                mortgages: "None",
                liens: "Revenue tax pending — ₹12,000"
            },
            riskFactors: [
                { label: "Court Cases", value: "1 inheritance dispute", color: "amber" },
                { label: "Title Dispute", value: "Family dispute — settleable", color: "amber" },
                { label: "Encumbrance", value: "Minor tax pending", color: "green" },
                { label: "Government Acquisition", value: "Not under acquisition", color: "green" }
            ],
            timeline: [
                { date: "Nov 2020", title: "Inheritance Transfer", desc: "Property transferred to Lakshmi Devi after father's demise", dot: "success" },
                { date: "Dec 2020", title: "Mutation Completed", desc: "Revenue records updated via succession certificate", dot: "success" },
                { date: "Feb 2024", title: "Inheritance Case Filed", desc: "Brother filed for equal partition of inherited land", dot: "warning" },
                { date: "May 2024", title: "Mediation Attempted", desc: "Court-ordered mediation session — inconclusive", dot: "warning" }
            ]
        }
    },
    // ---- GACHIBOWLI ----
    "gachibowli": {
        "210/A": {
            risk: 15,
            riskLevel: "low",
            owner: {
                name: "Priya Sharma",
                fatherName: "Rajendra Sharma",
                aadhaar: "XXXX-XXXX-3345",
                phone: "+91 9XXXXX4567",
                address: "Plot No. 45, Gachibowli Village, Serilingampally Mandal, Rangareddy District",
                registrationDate: "05-08-2019"
            },
            land: {
                surveyNo: "210/A",
                village: "Gachibowli",
                mandal: "Serilingampally",
                district: "Rangareddy",
                state: "Telangana",
                extent: "3 Acres",
                classification: "Residential Zone",
                marketValue: "₹9 Crore",
                passbook: "TS/RR/SLG/2019/02100"
            },
            courtCases: [],
            encumbrance: {
                status: "Clear",
                lastChecked: "15-05-2026",
                mortgages: "None",
                liens: "None"
            },
            riskFactors: [
                { label: "Court Cases", value: "No cases found", color: "green" },
                { label: "Title Dispute", value: "Clear chain of ownership", color: "green" },
                { label: "Encumbrance", value: "Clear certificate", color: "green" },
                { label: "Government Acquisition", value: "No acquisition", color: "green" }
            ],
            timeline: [
                { date: "Aug 2019", title: "Property Purchased", desc: "Purchased from M/s. Emerald Developers Pvt. Ltd.", dot: "success" },
                { date: "Sep 2019", title: "Registration & Mutation", desc: "Sale deed registered and mutation completed", dot: "success" },
                { date: "May 2026", title: "EC Verified", desc: "Latest EC shows clear title with no encumbrances", dot: "success" }
            ]
        },
        "56/D": {
            risk: 85,
            riskLevel: "high",
            owner: {
                name: "Venkateshwarlu (Under Dispute)",
                fatherName: "Hanumanthu",
                aadhaar: "XXXX-XXXX-1122",
                phone: "+91 9XXXXX9012",
                address: "H.No. 6-3-45, Gachibowli Village, Serilingampally Mandal, Rangareddy District",
                registrationDate: "12-04-2012"
            },
            land: {
                surveyNo: "56/D",
                village: "Gachibowli",
                mandal: "Serilingampally",
                district: "Rangareddy",
                state: "Telangana",
                extent: "8 Acres",
                classification: "Mixed Use (Disputed)",
                marketValue: "₹24 Crore (Subject to litigation)",
                passbook: "TS/RR/SLG/2012/00560"
            },
            courtCases: [
                {
                    caseNo: "OS No. 2890/2019",
                    court: "District Court, Rangareddy",
                    type: "Fraud & Title Dispute",
                    parties: "Mallaiah & Others vs. Venkateshwarlu",
                    status: "active",
                    filedDate: "10-09-2019",
                    nextHearing: "20-06-2026",
                    description: "Multiple claimants alleging forged sale deed and fraudulent transfer of government land."
                },
                {
                    caseNo: "CR No. 456/2020",
                    court: "Criminal Court, Cyberabad",
                    type: "Criminal Case — Forgery",
                    parties: "State vs. Venkateshwarlu",
                    status: "active",
                    filedDate: "15-01-2020",
                    nextHearing: "05-07-2026",
                    description: "FIR registered for alleged forgery of revenue records and land documents."
                },
                {
                    caseNo: "WP No. 12045/2020",
                    court: "High Court, Hyderabad",
                    type: "Government Land Reclamation",
                    parties: "State of Telangana vs. Venkateshwarlu",
                    status: "active",
                    filedDate: "22-05-2020",
                    nextHearing: "12-08-2026",
                    description: "Government claims the land is classified as government poramboke land and seeks reclamation."
                }
            ],
            encumbrance: {
                status: "Heavily Encumbered",
                lastChecked: "01-06-2026",
                mortgages: "HDFC Bank — ₹1.2 Crore (Frozen by Court Order)",
                liens: "Government Lien — Land Revenue Dept., Court-ordered attachment"
            },
            riskFactors: [
                { label: "Court Cases", value: "3 active cases (incl. criminal)", color: "red" },
                { label: "Title Dispute", value: "Alleged forged documents", color: "red" },
                { label: "Encumbrance", value: "Court-ordered freeze + Govt lien", color: "red" },
                { label: "Government Acquisition", value: "Govt land reclamation pending", color: "red" }
            ],
            timeline: [
                { date: "Apr 2012", title: "Sale Deed Registered", desc: "Property registered in the name of Venkateshwarlu", dot: "warning" },
                { date: "Sep 2019", title: "Title Dispute Filed", desc: "Multiple claimants filed civil suit alleging fraud", dot: "danger" },
                { date: "Jan 2020", title: "Criminal FIR Registered", desc: "Forgery case registered by Cyberabad Police", dot: "danger" },
                { date: "May 2020", title: "Govt Reclamation Suit", desc: "State filed petition for land reclamation", dot: "danger" },
                { date: "Aug 2020", title: "Court-Ordered Freeze", desc: "All transactions on the property frozen by court order", dot: "danger" }
            ]
        }
    },
    // ---- MADHAPUR ----
    "madhapur": {
        "92/E": {
            risk: 35,
            riskLevel: "medium",
            owner: {
                name: "Anjali Kumari",
                fatherName: "Ravi Kumar",
                aadhaar: "XXXX-XXXX-5567",
                phone: "+91 9XXXXX3456",
                address: "H.No. 11-4-56, Madhapur Village, Serilingampally Mandal, Rangareddy District",
                registrationDate: "28-12-2021"
            },
            land: {
                surveyNo: "92/E",
                village: "Madhapur",
                mandal: "Serilingampally",
                district: "Rangareddy",
                state: "Telangana",
                extent: "1 Acre 15 Guntas",
                classification: "Residential",
                marketValue: "₹6.2 Crore",
                passbook: "TS/RR/SLG/2021/00920"
            },
            courtCases: [
                {
                    caseNo: "OS No. 567/2025",
                    court: "Civil Court, Serilingampally",
                    type: "Boundary Dispute",
                    parties: "Mohan Rao vs. Anjali Kumari",
                    status: "pending",
                    filedDate: "08-01-2025",
                    nextHearing: "15-10-2026",
                    description: "Neighboring landowner Mohan Rao disputes the boundary demarcation claiming encroachment of 5 guntas."
                }
            ],
            encumbrance: {
                status: "Minor Encumbrance",
                lastChecked: "12-03-2026",
                mortgages: "ICICI Bank — ₹20 Lakhs (Active)",
                liens: "None"
            },
            riskFactors: [
                { label: "Court Cases", value: "1 boundary dispute", color: "amber" },
                { label: "Title Dispute", value: "Boundary under dispute", color: "amber" },
                { label: "Encumbrance", value: "Active mortgage — manageable", color: "green" },
                { label: "Government Acquisition", value: "No acquisition orders", color: "green" }
            ],
            timeline: [
                { date: "Dec 2021", title: "Property Purchased", desc: "Purchased from Sri Sai Developers through registered sale deed", dot: "success" },
                { date: "Jan 2022", title: "Mutation Completed", desc: "Revenue records updated successfully", dot: "success" },
                { date: "Jun 2022", title: "Bank Mortgage", desc: "ICICI Bank mortgage registered for ₹20 Lakhs", dot: "warning" },
                { date: "Jan 2025", title: "Boundary Dispute Filed", desc: "Neighbor filed suit claiming boundary encroachment", dot: "warning" }
            ]
        }
    },
    // ---- MIYAPUR ----
    "miyapur": {
        "301/F": {
            risk: 10,
            riskLevel: "low",
            owner: {
                name: "Srinivasa Rao Pothireddy",
                fatherName: "Narasimha Rao Pothireddy",
                aadhaar: "XXXX-XXXX-9988",
                phone: "+91 9XXXXX7812",
                address: "H.No. 5-9-102, Miyapur Village, Miyapur Mandal, Rangareddy District",
                registrationDate: "03-06-2017"
            },
            land: {
                surveyNo: "301/F",
                village: "Miyapur",
                mandal: "Miyapur",
                district: "Rangareddy",
                state: "Telangana",
                extent: "4 Acres",
                classification: "Agricultural Land",
                marketValue: "₹3.2 Crore",
                passbook: "TS/RR/MYP/2017/03010"
            },
            courtCases: [],
            encumbrance: {
                status: "Clear",
                lastChecked: "20-05-2026",
                mortgages: "None",
                liens: "None"
            },
            riskFactors: [
                { label: "Court Cases", value: "No disputes", color: "green" },
                { label: "Title Dispute", value: "Clean chain of title", color: "green" },
                { label: "Encumbrance", value: "Fully clear", color: "green" },
                { label: "Government Acquisition", value: "No issues", color: "green" }
            ],
            timeline: [
                { date: "Jun 2017", title: "Property Purchased", desc: "Registered sale deed from previous owner Yellaiah", dot: "success" },
                { date: "Jul 2017", title: "Mutation Completed", desc: "All revenue records updated", dot: "success" },
                { date: "May 2026", title: "EC Verified Clean", desc: "Encumbrance certificate shows no issues for 30 years", dot: "success" }
            ]
        }
    },
    // ---- KUKATPALLY ----
    "kukatpally": {
        "67/G": {
            risk: 62,
            riskLevel: "high",
            owner: {
                name: "Mohammed Ismail",
                fatherName: "Mohammed Ibrahim",
                aadhaar: "XXXX-XXXX-7734",
                phone: "+91 9XXXXX2345",
                address: "H.No. 18-7-89, Kukatpally Village, Kukatpally Mandal, Rangareddy District",
                registrationDate: "19-09-2016"
            },
            land: {
                surveyNo: "67/G",
                village: "Kukatpally",
                mandal: "Kukatpally",
                district: "Rangareddy",
                state: "Telangana",
                extent: "3 Acres 25 Guntas",
                classification: "Commercial Zone",
                marketValue: "₹15 Crore",
                passbook: "TS/RR/KKP/2016/00670"
            },
            courtCases: [
                {
                    caseNo: "OS No. 789/2022",
                    court: "District Court, Rangareddy",
                    type: "Partnership Dispute",
                    parties: "Ahmed Khan vs. Mohammed Ismail",
                    status: "active",
                    filedDate: "12-08-2022",
                    nextHearing: "30-06-2026",
                    description: "Former business partner claims 50% ownership based on oral agreement and partial payment receipts."
                },
                {
                    caseNo: "SA No. 234/2024",
                    court: "Revenue Court, Kukatpally",
                    type: "Revenue Dispute",
                    parties: "Revenue Department vs. Mohammed Ismail",
                    status: "pending",
                    filedDate: "05-05-2024",
                    nextHearing: "20-09-2026",
                    description: "Revenue department questioning the land classification conversion from agricultural to commercial."
                }
            ],
            encumbrance: {
                status: "Encumbered",
                lastChecked: "15-04-2026",
                mortgages: "Axis Bank — ₹80 Lakhs (Active)",
                liens: "Revenue Court Stay Order"
            },
            riskFactors: [
                { label: "Court Cases", value: "2 active disputes", color: "red" },
                { label: "Title Dispute", value: "Partnership claim exists", color: "red" },
                { label: "Encumbrance", value: "Active mortgage + Stay order", color: "amber" },
                { label: "Government Acquisition", value: "Classification under review", color: "amber" }
            ],
            timeline: [
                { date: "Sep 2016", title: "Property Purchased", desc: "Joint purchase by Mohammed Ismail (alleged sole)", dot: "warning" },
                { date: "Oct 2016", title: "Mutation Completed", desc: "Revenue records show single ownership", dot: "success" },
                { date: "Mar 2020", title: "Land Conversion Applied", desc: "Application for agricultural to commercial conversion", dot: "success" },
                { date: "Aug 2022", title: "Partnership Dispute Filed", desc: "Ahmed Khan claimed 50% ownership in court", dot: "danger" },
                { date: "May 2024", title: "Revenue Dispute", desc: "Department questioned conversion validity", dot: "danger" }
            ]
        }
    },
    // ---- SHAMSHABAD ----
    "shamshabad": {
        "150/H": {
            risk: 55,
            riskLevel: "medium",
            owner: {
                name: "Bharathi & Raju (Joint)",
                fatherName: "N/A (Joint Ownership)",
                aadhaar: "XXXX-XXXX-4411 / XXXX-XXXX-5522",
                phone: "+91 9XXXXX8901 / +91 9XXXXX6789",
                address: "H.No. 2-1-34, Shamshabad Village, Shamshabad Mandal, Rangareddy District",
                registrationDate: "25-01-2014"
            },
            land: {
                surveyNo: "150/H",
                village: "Shamshabad",
                mandal: "Shamshabad",
                district: "Rangareddy",
                state: "Telangana",
                extent: "6 Acres",
                classification: "Agricultural (Near Airport Zone)",
                marketValue: "₹18 Crore",
                passbook: "TS/RR/SMB/2014/01500"
            },
            courtCases: [
                {
                    caseNo: "LA No. 112/2023",
                    court: "Land Acquisition Tribunal, Rangareddy",
                    type: "Land Acquisition Compensation",
                    parties: "Bharathi & Raju vs. GHMC",
                    status: "pending",
                    filedDate: "20-07-2023",
                    nextHearing: "05-11-2026",
                    description: "Dispute over compensation amount for 2 acres acquired for airport expansion. Owners demanding market rate."
                }
            ],
            encumbrance: {
                status: "Partial Encumbrance",
                lastChecked: "08-05-2026",
                mortgages: "None",
                liens: "Government Acquisition Notice on 2 Acres"
            },
            riskFactors: [
                { label: "Court Cases", value: "1 acquisition dispute", color: "amber" },
                { label: "Title Dispute", value: "No title dispute", color: "green" },
                { label: "Encumbrance", value: "Govt notice on partial land", color: "amber" },
                { label: "Government Acquisition", value: "2 acres under acquisition", color: "red" }
            ],
            timeline: [
                { date: "Jan 2014", title: "Property Purchased", desc: "Joint purchase by Bharathi and Raju", dot: "success" },
                { date: "Feb 2014", title: "Mutation Completed", desc: "Joint names entered in revenue records", dot: "success" },
                { date: "Jan 2023", title: "Acquisition Notice", desc: "GHMC issued notice for 2 acres for airport expansion", dot: "danger" },
                { date: "Jul 2023", title: "Compensation Dispute Filed", desc: "Owners challenged the compensation amount in tribunal", dot: "warning" }
            ]
        }
    },
    // ---- BANJARA HILLS ----
    "banjara hills": {
        "12/X": {
            risk: 20,
            riskLevel: "low",
            owner: {
                name: "Anand Kumar",
                fatherName: "Siva Kumar",
                aadhaar: "XXXX-XXXX-1212",
                phone: "+91 9XXXXX0001",
                address: "Plot 12, Road No 10, Banjara Hills, Hyderabad",
                registrationDate: "12-10-2015"
            },
            land: {
                surveyNo: "12/X",
                village: "Banjara Hills",
                mandal: "Khairatabad",
                district: "Hyderabad",
                state: "Telangana",
                extent: "1000 Sq Yards",
                classification: "Residential",
                marketValue: "₹25 Crore",
                passbook: "TS/HYD/KHA/2015/00120"
            },
            courtCases: [],
            encumbrance: {
                status: "Clear",
                lastChecked: "12-06-2026",
                mortgages: "None",
                liens: "None"
            },
            riskFactors: [
                { label: "Court Cases", value: "No active cases", color: "green" },
                { label: "Title Dispute", value: "Clear title", color: "green" },
                { label: "Encumbrance", value: "No encumbrances", color: "green" },
                { label: "Government Acquisition", value: "Not under acquisition", color: "green" }
            ],
            timeline: [
                { date: "Oct 2015", title: "Property Purchased", desc: "Anand Kumar purchased from DLF Builders", dot: "success" },
                { date: "Nov 2015", title: "Mutation Completed", desc: "Revenue records updated", dot: "success" },
                { date: "Jun 2026", title: "EC Verification", desc: "Clear certificate generated", dot: "success" }
            ]
        }
    },
    // ---- JUBILEE HILLS ----
    "jubilee hills": {
        "88/Y": {
            risk: 88,
            riskLevel: "high",
            owner: {
                name: "Vijayender Reddy (Disputed)",
                fatherName: "Pratap Reddy",
                aadhaar: "XXXX-XXXX-9999",
                phone: "+91 9XXXXX8888",
                address: "Plot 88, Road No 36, Jubilee Hills, Hyderabad",
                registrationDate: "05-05-2010"
            },
            land: {
                surveyNo: "88/Y",
                village: "Jubilee Hills",
                mandal: "Shaikpet",
                district: "Hyderabad",
                state: "Telangana",
                extent: "2500 Sq Yards",
                classification: "Commercial",
                marketValue: "₹85 Crore",
                passbook: "TS/HYD/SHK/2010/00880"
            },
            courtCases: [
                {
                    caseNo: "OS No. 120/2018",
                    court: "City Civil Court, Hyderabad",
                    type: "Title & Boundary Dispute",
                    parties: "State Govt vs. Vijayender Reddy",
                    status: "active",
                    filedDate: "15-02-2018",
                    nextHearing: "10-07-2026",
                    description: "Government claims encroachment on adjacent park land."
                }
            ],
            encumbrance: {
                status: "Encumbered",
                lastChecked: "01-06-2026",
                mortgages: "SBI Loan — ₹10 Crore",
                liens: "Court Stay Order Active"
            },
            riskFactors: [
                { label: "Court Cases", value: "1 active case (Govt dispute)", color: "red" },
                { label: "Title Dispute", value: "Encroachment alleged", color: "red" },
                { label: "Encumbrance", value: "Heavy Mortgage + Stay", color: "red" },
                { label: "Government Acquisition", value: "Disputed area under threat", color: "red" }
            ],
            timeline: [
                { date: "May 2010", title: "Property Registered", desc: "Sale deed registered", dot: "success" },
                { date: "Feb 2018", title: "Govt Dispute Filed", desc: "State Govt claims encroachment", dot: "danger" },
                { date: "Mar 2018", title: "Stay Order Issued", desc: "Construction halted by court", dot: "danger" }
            ]
        }
    },
    // ---- NARSINGI ----
    "narsingi": {
        "102/Z": {
            risk: 45,
            riskLevel: "medium",
            owner: {
                name: "Swapna G",
                fatherName: "Kishore G",
                aadhaar: "XXXX-XXXX-4545",
                phone: "+91 9XXXXX7777",
                address: "Villa 15, Narsingi, Gandipet Mandal",
                registrationDate: "20-08-2022"
            },
            land: {
                surveyNo: "102/Z",
                village: "Narsingi",
                mandal: "Gandipet",
                district: "Rangareddy",
                state: "Telangana",
                extent: "500 Sq Yards",
                classification: "Residential",
                marketValue: "₹4 Crore",
                passbook: "TS/RR/GND/2022/01020"
            },
            courtCases: [],
            encumbrance: {
                status: "Minor Encumbrance",
                lastChecked: "15-05-2026",
                mortgages: "HDFC Home Loan - Active",
                liens: "None"
            },
            riskFactors: [
                { label: "Court Cases", value: "No active cases", color: "green" },
                { label: "Title Dispute", value: "Clear title", color: "green" },
                { label: "Encumbrance", value: "Active home loan", color: "amber" },
                { label: "Government Acquisition", value: "None", color: "green" }
            ],
            timeline: [
                { date: "Aug 2022", title: "Property Purchased", desc: "Registered from developer", dot: "success" },
                { date: "Sep 2022", title: "Home Loan Approved", desc: "HDFC mortgage registered", dot: "warning" }
            ]
        }
    },
    // ---- SHOLINGANALLUR (TAMIL NADU) ----
    "sholinganallur": {
        "24/1A": {
            risk: 15,
            riskLevel: "low",
            owner: {
                name: "Karthik Subramanian",
                fatherName: "Subramanian V",
                aadhaar: "XXXX-XXXX-8822",
                phone: "+91 9XXXXX3344",
                address: "Flat 4B, OMR Road, Sholinganallur, Chennai",
                registrationDate: "14-02-2019"
            },
            land: {
                surveyNo: "24/1A",
                village: "Sholinganallur",
                mandal: "Tambaram",
                district: "Chennai",
                state: "Tamil Nadu",
                extent: "2400 Sq Ft",
                classification: "Residential",
                marketValue: "₹1.5 Crore",
                passbook: "TN/CHN/SHL/2019/0241"
            },
            courtCases: [],
            encumbrance: {
                status: "Clear",
                lastChecked: "22-05-2026",
                mortgages: "None",
                liens: "None"
            },
            riskFactors: [
                { label: "Court Cases", value: "No disputes", color: "green" },
                { label: "Title Dispute", value: "Clear title", color: "green" },
                { label: "Encumbrance", value: "Fully clear", color: "green" },
                { label: "Government Acquisition", value: "None", color: "green" }
            ],
            timeline: [
                { date: "Feb 2019", title: "Property Purchased", desc: "Registered at Tambaram Sub-Registrar", dot: "success" },
                { date: "Mar 2019", title: "Patta Transferred", desc: "Patta name transfer completed", dot: "success" }
            ]
        }
    },
    // ---- THIRUMANGALAM (TAMIL NADU) ----
    "thirumangalam": {
        "112/3B": {
            risk: 65,
            riskLevel: "high",
            owner: {
                name: "Muthukumar (Disputed)",
                fatherName: "Palanisamy",
                aadhaar: "XXXX-XXXX-5566",
                phone: "+91 9XXXXX1122",
                address: "12, South Street, Thirumangalam, Madurai",
                registrationDate: "10-08-2012"
            },
            land: {
                surveyNo: "112/3B",
                village: "Thirumangalam",
                mandal: "Thirumangalam",
                district: "Madurai",
                state: "Tamil Nadu",
                extent: "3 Acres",
                classification: "Agricultural",
                marketValue: "₹2.2 Crore",
                passbook: "TN/MDU/THI/2012/1123"
            },
            courtCases: [
                {
                    caseNo: "OS 45/2021",
                    court: "District Court, Madurai",
                    type: "Partition Suit",
                    parties: "Ramasamy vs Muthukumar",
                    status: "active",
                    filedDate: "15-03-2021",
                    nextHearing: "20-08-2026",
                    description: "Brother filed a partition suit claiming equal share in ancestral property."
                }
            ],
            encumbrance: {
                status: "Encumbered",
                lastChecked: "10-06-2026",
                mortgages: "Indian Bank Agri Loan - Active",
                liens: "Pending Court Case"
            },
            riskFactors: [
                { label: "Court Cases", value: "1 Active Partition Suit", color: "red" },
                { label: "Title Dispute", value: "Ancestral property dispute", color: "red" },
                { label: "Encumbrance", value: "Agri Loan Active", color: "amber" },
                { label: "Government Acquisition", value: "None", color: "green" }
            ],
            timeline: [
                { date: "Aug 2012", title: "Patta Registered", desc: "Patta registered under Muthukumar", dot: "warning" },
                { date: "Mar 2021", title: "Partition Suit Filed", desc: "Ramasamy claimed share in property", dot: "danger" }
            ]
        }
    },
    // ---- SRIPERUMBUDUR (TAMIL NADU) ----
    "sriperumbudur": {
        "55/2": {
            risk: 35,
            riskLevel: "medium",
            owner: {
                name: "Lakshmi Narayanan",
                fatherName: "Venkatraman",
                aadhaar: "XXXX-XXXX-9900",
                phone: "+91 9XXXXX5544",
                address: "Plot 45, SIPCOT area, Sriperumbudur, Kanchipuram",
                registrationDate: "05-11-2020"
            },
            land: {
                surveyNo: "55/2",
                village: "Sriperumbudur",
                mandal: "Sriperumbudur",
                district: "Kanchipuram",
                state: "Tamil Nadu",
                extent: "5 Acres",
                classification: "Industrial",
                marketValue: "₹12 Crore",
                passbook: "TN/KAN/SRP/2020/0055"
            },
            courtCases: [],
            encumbrance: {
                status: "Minor Encumbrance",
                lastChecked: "01-04-2026",
                mortgages: "None",
                liens: "Proposed SIPCOT Expansion Phase 3"
            },
            riskFactors: [
                { label: "Court Cases", value: "None", color: "green" },
                { label: "Title Dispute", value: "Clear Title", color: "green" },
                { label: "Encumbrance", value: "No Mortgages", color: "green" },
                { label: "Government Acquisition", value: "Possible future acquisition", color: "amber" }
            ],
            timeline: [
                { date: "Nov 2020", title: "Property Purchased", desc: "Registered as Industrial Land", dot: "success" },
                { date: "Jan 2025", title: "Govt Notification", desc: "Area marked for potential SIPCOT expansion", dot: "warning" }
            ]
        }
    }
};

// Get all village names for autocomplete
const HARDCODED_VILLAGES = Object.keys(LAND_DATABASE).map(v => v.charAt(0).toUpperCase() + v.slice(1));

const TN_VILLAGES = [
    "Adyar", "Alandur", "Alanganallur", "Ambasamudram", "Ambattur", "Ambur", "Arakkonam", "Arani", "Aranthangi", "Aravakurichi", "Ariyalur", "Aruppukkottai", "Attur", "Avanashi",
    "Bhavani", "Bodinayakanur",
    "Chengalpattu", "Chennai", "Cheyyar", "Chidambaram", "Coimbatore", "Coonoor", "Cuddalore", "Cumbum",
    "Dharapuram", "Dharmapuri", "Dindigul",
    "Erode", "Gingee", "Gobichettipalayam", "Gudalur", "Gudiyatham", "Guindy",
    "Hosur", "Jayankondam", "Kallakurichi", "Kanchipuram", "Kangeyam", "Kanyakumari", "Karaikudi", "Karur", "Kodaikanal", "Kovilpatti", "Koyambedu", "Krishnagiri", "Kumbakonam",
    "Lalgudi", "Madipakkam", "Madurai", "Mannargudi", "Mayiladuthurai", "Medavakkam", "Mettupalayam", "Mettur", "Mylapore",
    "Nagapattinam", "Nagercoil", "Namakkal", "Neyveli", "Nilgiris",
    "Oddanchatram", "Ooty", "Palani", "Palladam", "Pallikaranai", "Panruti", "Paramakudi", "Pattukkottai", "Perambalur", "Pollachi", "Porur", "Pudukkottai", "Puliyangudi", "Punamallee",
    "Rajapalayam", "Ramanathapuram", "Ranipet", "Rasipuram",
    "Salem", "Sankarankovil", "Sankari", "Sathyamangalam", "Sattur", "Sivaganga", "Sivakasi", "Sriperumbudur", "Srivilliputhur",
    "Tambaram", "Taramani", "Tenkasi", "Thanjavur", "Theni", "Thirumangalam", "Thiruvallur", "Thiruvarur", "Thoothukudi", "Tindivanam", "Tiruchendur", "Tiruchengode", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruttani", "Tiruvannamalai",
    "Udhagamandalam", "Udumalaipettai", "Ulundurpettai", "Usilampatti", "Uthamapalayam",
    "Vaniyambadi", "Vedaranyam", "Velachery", "Vellore", "Viluppuram", "Virudhachalam", "Virudhunagar"
];

const VILLAGE_NAMES = [...new Set([...HARDCODED_VILLAGES, ...TN_VILLAGES])].sort();

// Simple Seeded PRNG for consistent mock generation
function seededRandom(seedStr) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        const char = seedStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit int
    }
    // Return a function that produces a random number between 0 and 1
    return function() {
        let t = hash += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Generate consistent mock data for ANY village and survey number
function generateDynamicRecord(village, surveyNo) {
    const seed = (village.toLowerCase() + surveyNo.toLowerCase()).replace(/\s+/g, '');
    const rng = seededRandom(seed);
    
    // Determine Risk Level (60% Low, 25% Medium, 15% High)
    const riskRoll = rng();
    let riskLevel = "low";
    let risk = Math.floor(rng() * 30); // 0-30
    
    if (riskRoll > 0.85) {
        riskLevel = "high";
        risk = Math.floor(rng() * 30) + 70; // 70-100
    } else if (riskRoll > 0.60) {
        riskLevel = "medium";
        risk = Math.floor(rng() * 40) + 30; // 30-70
    }

    const firstNames = ["Arun", "Bala", "Chandran", "Dinesh", "Ganesh", "Hari", "Karthik", "Lakshmi", "Muthu", "Natarajan", "Prabhu", "Ravi", "Suresh", "Vijay", "Meena", "Priya"];
    const lastNames = ["Kumar", "Pillai", "Iyer", "Chettiar", "Gounder", "Nadar", "Naidu", "Reddy", "Rao", "Swamy", "Raj"];
    const name = firstNames[Math.floor(rng() * firstNames.length)] + " " + lastNames[Math.floor(rng() * lastNames.length)];
    const fname = firstNames[Math.floor(rng() * firstNames.length)] + " " + lastNames[Math.floor(rng() * lastNames.length)];
    
    const districts = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Kanchipuram", "Thanjavur"];
    const district = districts[Math.floor(rng() * districts.length)];

    const year = 2000 + Math.floor(rng() * 24);
    const acreage = (rng() * 5 + 0.5).toFixed(2);
    const value = (rng() * 10 + 0.5).toFixed(1);

    const record = {
        risk: risk,
        riskLevel: riskLevel,
        owner: {
            name: name,
            fatherName: fname,
            aadhaar: "XXXX-XXXX-" + Math.floor(1000 + rng() * 9000),
            phone: "+91 9" + Math.floor(100000000 + rng() * 900000000),
            address: `Main Street, ${village.charAt(0).toUpperCase() + village.slice(1)}, ${district}`,
            registrationDate: `15-05-${year}`
        },
        land: {
            surveyNo: surveyNo.toUpperCase(),
            village: village.charAt(0).toUpperCase() + village.slice(1),
            mandal: "Taluk HQ",
            district: district,
            state: "Tamil Nadu",
            extent: `${acreage} Acres`,
            classification: rng() > 0.5 ? "Agricultural" : "Residential",
            marketValue: `₹${value} Crore`,
            passbook: `TN/${district.substring(0,3).toUpperCase()}/${year}/${Math.floor(1000 + rng() * 9000)}`
        },
        courtCases: [],
        encumbrance: {
            status: "Clear",
            lastChecked: "12-06-2026",
            mortgages: "None",
            liens: "None"
        },
        riskFactors: [
            { label: "Court Cases", value: "No active cases", color: "green" },
            { label: "Title Dispute", value: "Clear title", color: "green" },
            { label: "Encumbrance", value: "No encumbrances", color: "green" },
            { label: "Government Acquisition", value: "Not under acquisition", color: "green" }
        ],
        timeline: [
            { date: `May ${year}`, title: "Property Registered", desc: "Sale deed registered successfully", dot: "success" }
        ]
    };

    if (riskLevel === "high") {
        record.courtCases.push({
            caseNo: `OS No. ${Math.floor(100 + rng() * 900)}/${year + 2}`,
            court: `District Court, ${district}`,
            type: "Title Dispute",
            parties: `Govt vs. ${name}`,
            status: "active",
            filedDate: `10-08-${year + 2}`,
            nextHearing: "25-09-2026",
            description: "Dispute over alleged encroachment on government poramboke land."
        });
        record.encumbrance.status = "Encumbered";
        record.encumbrance.liens = "Court Stay Order";
        record.riskFactors[0] = { label: "Court Cases", value: "1 Active Dispute", color: "red" };
        record.riskFactors[1] = { label: "Title Dispute", value: "Encroachment alleged", color: "red" };
        record.timeline.push({ date: `Aug ${year + 2}`, title: "Dispute Filed", desc: "Government filed encroachment suit", dot: "danger" });
    } else if (riskLevel === "medium") {
        record.encumbrance.status = "Minor Encumbrance";
        record.encumbrance.mortgages = "Active Bank Loan (SBI)";
        record.riskFactors[2] = { label: "Encumbrance", value: "Active Mortgage", color: "amber" };
        record.timeline.push({ date: `Sep ${year + 1}`, title: "Mortgage Registered", desc: "Bank loan acquired against property", dot: "warning" });
    }

    return record;
}

// Helper function to resolve Tamil or English village name to English canonical name
function getEnglishVillageName(village) {
    if (!village) return "";
    const cleanInput = village.trim().toLowerCase();
    
    // 1. Direct match with hardcoded keys (case-insensitive)
    const dbKey = Object.keys(LAND_DATABASE).find(k => k.toLowerCase() === cleanInput);
    if (dbKey) {
        return dbKey.charAt(0).toUpperCase() + dbKey.slice(1);
    }
    
    // 2. Direct match with VILLAGE_NAMES (case-insensitive)
    const nameMatch = VILLAGE_NAMES.find(v => v.toLowerCase() === cleanInput);
    if (nameMatch) {
        return nameMatch;
    }
    
    // 3. Reverse lookup in TRANSLATIONS_TA (if defined)
    if (typeof TRANSLATIONS_TA !== 'undefined') {
        for (const [english, tamil] of Object.entries(TRANSLATIONS_TA)) {
            if (tamil.toLowerCase() === cleanInput) {
                const villageMatch = VILLAGE_NAMES.find(v => v.toLowerCase() === english.toLowerCase());
                if (villageMatch) {
                    return villageMatch;
                }
            }
        }
    }
    
    return "";
}

// Helper function to look up data
function lookupLandRecord(village, surveyNo) {
    const englishVillage = getEnglishVillageName(village);
    if (!englishVillage) {
        return null;
    }

    const villageKey = englishVillage.toLowerCase();
    const surveyKey = surveyNo.trim().toUpperCase();

    // Check hardcoded database first
    if (LAND_DATABASE[villageKey]) {
        for (const [key, value] of Object.entries(LAND_DATABASE[villageKey])) {
            if (key.toUpperCase() === surveyKey) {
                return value;
            }
        }
    }
    
    // If not found in hardcoded DB, dynamically generate it!
    return generateDynamicRecord(englishVillage, surveyKey);
}

// Get available survey numbers for a village
function getSurveyNumbers(village) {
    const englishVillage = getEnglishVillageName(village);
    if (englishVillage) {
        const villageKey = englishVillage.toLowerCase();
        if (LAND_DATABASE[villageKey]) {
            return Object.keys(LAND_DATABASE[villageKey]);
        }
    }
    return [];
}
