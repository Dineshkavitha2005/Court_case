# TRIVORA - Functional Land Litigation Search Portal

A working prototype of TRIVORA's AI-powered land litigation search tool with interactive features and real-time case lookups.
## 🚀 What This Website Does

This is a **functional product website** (not just marketing), featuring:
- **Search Interface** - Enter village name and survey number to find court cases
- **Risk Assessment** - AI-calculated litigation risk indicator  
- **Case Database** - Mock court case data with detailed information
- **Search History** - Track all previous searches
- **Voice Search** - Hands-free searching (Chrome, Edge, Safari)
- **Case Details Modal** - View full case information
- **User Profile** - Track search statistics

## 📁 Files

- `index.html` - Complete application interface
- `styles.css` - Modern, responsive styling
- `script.js` - Search logic, case database, and interactivity
- `README.md` - This file

## 🎯 How to Use

### Open the Website
**Option 1 - Direct:**
Double-click `index.html`

**Option 2 - Local Server:**
```bash
cd "c:\Users\Dinesh A\Downloads\ai land"
python -m http.server 8000
```
Then visit: `http://localhost:8000`

**Option 3 - Live Server in VS Code:**
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Try It Out

**Demo Searches (Have pre-loaded data):**
- Village: `coimbatore`, Survey: `123/A` → 2 cases found
- Village: `salem`, Survey: `456/B` → 1 case found
- Village: `erode`, Survey: `789/C` → 3 cases found

**Try other combinations for "No cases found" results**

## 🎮 Features

### 1. Search
- Enter village name and survey number
- Optional district filter
- Instant case matching

### 2. Risk Indicator
- **Low Risk** (Green) - No active cases
- **Medium Risk** (Orange) - 1-2 active cases
- **High Risk** (Red) - 3+ active cases

### 3. Case Results
- Case ID and type
- Parties involved
- Filing and hearing dates
- Active/Closed status
- Click any case for full details

### 4. Voice Search
- Click 🎤 button to search by voice
- Works in Chrome, Edge, Safari
- Supports English keywords

### 5. Search History
- Automatically saves all searches
- Click to re-run previous search
- Shows case count per search

### 6. Help Section
- How to use TRIVORA
- Risk level legend
- Language support info

### 7. User Profile
- Total searches conducted
- Statistics tracking


## 🎨 User Interface

- **Header** - Navigation and branding
- **Search Card** - Main input form with icons
- **Results Section** - Risk bar, cases list, alerts
- **Modal Popup** - Detailed case view
- **Responsive Design** - Works on desktop, tablet, mobile


## 📱 Mobile Responsive

- Fully responsive design
- Touch-friendly buttons
- Optimized forms for mobile
- Voice search on mobile devices


## 📝 Future Enhancements

- Real government database integration via APIs
- User accounts and saved searches
- Advanced filtering and sorting
- Email and SMS alerts
- PDF report generation
- Lawyer consultation booking
- Property valuation tools
- Transaction history

