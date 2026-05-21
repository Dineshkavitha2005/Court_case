const mockCasesDatabase = {
    'coimbatore-123/A': [
        {
            id: 1,
            caseNumber: 'CIL-2024-001',
            type: 'Property Boundary Dispute',
            parties: 'Ramesh Kumar vs. Suresh Singh',
            status: 'Active',
            filedDate: '2024-01-15',
            nextHearing: '2026-04-10'
        },
        {
            id: 2,
            caseNumber: 'CIL-2023-045',
            type: 'Land Ownership Claim',
            parties: 'Vijay Exports Ltd vs. Village Authority',
            status: 'Active',
            filedDate: '2023-06-20',
            nextHearing: '2026-03-25'
        }
    ],
    'salem-456/B': [
        {
            id: 3,
            caseNumber: 'CIL-2022-089',
            type: 'Encroachment Case',
            parties: 'Govt. Authority vs. Private Individual',
            status: 'Closed',
            filedDate: '2022-03-10',
            closedDate: '2025-11-30'
        }
    ],
    'erode-789/C': [
        {
            id: 4,
            caseNumber: 'CIL-2024-112',
            type: 'Inheritance Dispute',
            parties: 'Multiple Heirs vs. Second Party',
            status: 'Active',
            filedDate: '2024-02-01',
            nextHearing: '2026-04-05'
        },
        {
            id: 5,
            caseNumber: 'CIL-2024-113',
            type: 'Tax Dispute',
            parties: 'Property Owner vs. Tax Authority',
            status: 'Active',
            filedDate: '2024-02-15',
            nextHearing: '2026-03-30'
        },
        {
            id: 6,
            caseNumber: 'CIL-2024-114',
            type: 'Mortgage Claim',
            parties: 'Bank vs. Property Owner',
            status: 'Active',
            filedDate: '2024-03-01',
            nextHearing: '2026-04-15'
        }
    ]
};
let searchHistory = [];
let searchCount = 0;
let savedCount = 0;
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        navigateToSection(sectionId);
    });
});

// Search form submission
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch();
});

// Voice search button
document.getElementById('voiceBtn').addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.onstart = () => {
            alert('🎤 Voice search started. Please speak the village name and survey number.');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('village').value = transcript.split(' ')[0] || '';
            alert(`Recognized: ${transcript}`);
        };
        
        recognition.start();
    } else {
        alert('Voice search not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
});

// Perform search
function performSearch() {
    const village = document.getElementById('village').value.toLowerCase();
    const survey = document.getElementById('survey').value.toLowerCase();
    const district = document.getElementById('district').value.toLowerCase();
    
    const searchKey = `${village}-${survey}`;
    
    // Add to history
    const historyEntry = {
        village: village,
        survey: survey,
        timestamp: new Date().toLocaleString(),
        caseCount: mockCasesDatabase[searchKey]?.length || 0
    };
    searchHistory.unshift(historyEntry);
    searchCount++;
    
    // Get cases
    const cases = mockCasesDatabase[searchKey] || [];
    
    // Display results
    displayResults(village, survey, cases);
}
function displayResults(village, survey, cases) {
    document.getElementById('resultVillage').textContent = village;
    document.getElementById('resultSurvey').textContent = survey;
    
    // Calculate risk
    let riskLevel = 'Low';
    let riskPercentage = 0;
    let riskColor = '#10b981';
    
    if (cases.length === 0) {
        riskLevel = 'Low';
        riskPercentage = 10;
        riskColor = '#10b981';
    } else if (cases.length <= 2) {
        riskLevel = 'Medium';
        riskPercentage = 50;
        riskColor = '#f59e0b';
    } else {
        riskLevel = 'High';
        riskPercentage = 85;
        riskColor = '#ef4444';
    }
    
    // Update risk bar
    const riskBar = document.getElementById('riskBar');
    riskBar.style.width = riskPercentage + '%';
    riskBar.style.backgroundColor = riskColor;
    
    const activeCases = cases.filter(c => c.status === 'Active').length;
    const closedCases = cases.filter(c => c.status === 'Closed').length;
    
    document.getElementById('riskText').innerHTML = `
        <span style="color: ${riskColor};">⚠️ ${riskLevel} Risk</span> - 
        ${activeCases} active case(s), ${closedCases} closed case(s)
    `;
    
    // Display cases
    const casesList = document.getElementById('casesList');
    if (cases.length === 0) {
        casesList.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 2rem;">✓ No cases found. This property appears to be clear of litigation.</p>';
    } else {
        casesList.innerHTML = cases.map(caseItem => `
            <div class="case-card" onclick="showCaseDetails(${JSON.stringify(caseItem).replace(/"/g, '&quot;')})">
                <div class="case-card-header">
                    <h4 class="case-card-title">${caseItem.caseNumber}</h4>
                    <span class="case-status ${caseItem.status === 'Active' ? 'status-active' : 'status-closed'}">
                        ${caseItem.status}
                    </span>
                </div>
                <div class="case-details">
                    <p><strong>Type:</strong> ${caseItem.type}</p>
                    <p><strong>Parties:</strong> ${caseItem.parties}</p>
                    <p><strong>Filed:</strong> ${caseItem.filedDate}</p>
                    ${caseItem.nextHearing ? `<p><strong>Next Hearing:</strong> ${caseItem.nextHearing}</p>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    // Show results section
    hideAllSections();
    document.getElementById('results').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show case details in modal
function showCaseDetails(caseItem) {
    const modal = document.getElementById('caseModal');
    const caseDetails = document.getElementById('caseDetails');
    
    caseDetails.innerHTML = `
        <h2>${caseItem.caseNumber}</h2>
        <div style="margin-top: 1.5rem;">
            <p><strong>Case Type:</strong> ${caseItem.type}</p>
            <p><strong>Parties Involved:</strong> ${caseItem.parties}</p>
            <p><strong>Status:</strong> <span style="color: ${caseItem.status === 'Active' ? '#ef4444' : '#10b981'}">${caseItem.status}</span></p>
            <p><strong>Filed Date:</strong> ${caseItem.filedDate}</p>
            ${caseItem.nextHearing ? `<p><strong>Next Hearing:</strong> ${caseItem.nextHearing}</p>` : ''}
            ${caseItem.closedDate ? `<p><strong>Closed Date:</strong> ${caseItem.closedDate}</p>` : ''}
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 2px solid var(--border);">
                <p style="color: var(--gray); font-size: 0.9rem;">⚠️ For detailed case information, visit the nearest court office or eCourts Portal.</p>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('caseModal').classList.add('hidden');
}

// Go back to search
function goBack() {
    hideAllSections();
    document.getElementById('search').classList.remove('hidden');
    document.getElementById('searchForm').reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigate to sections
function navigateToSection(sectionId) {
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
        
        // Load section data
        if (sectionId === 'history') {
            loadHistory();
        } else if (sectionId === 'profile') {
            loadProfile();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Hide all sections except header and footer
function hideAllSections() {
    document.getElementById('search').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('history').classList.add('hidden');
    document.getElementById('help').classList.add('hidden');
    document.getElementById('profile').classList.add('hidden');
}

// Load search history
function loadHistory() {
    const historyList = document.getElementById('historyList');
    if (searchHistory.length === 0) {
        historyList.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 2rem;">No search history yet. Start by searching for a property.</p>';
    } else {
        historyList.innerHTML = searchHistory.map((item, index) => `
            <div class="history-item" onclick="restoreSearch('${item.village}', '${item.survey}')">
                <div class="history-item-title">${item.village.toUpperCase()} - ${item.survey.toUpperCase()}</div>
                <div class="history-item-time">${item.timestamp} (${item.caseCount} case${item.caseCount !== 1 ? 's' : ''})</div>
            </div>
        `).join('');
    }
}

// Restore search from history
function restoreSearch(village, survey) {
    document.getElementById('village').value = village;
    document.getElementById('survey').value = survey;
    navigateToSection('search');
    document.getElementById('searchForm').scrollIntoView({ behavior: 'smooth' });
}

// Load profile
function loadProfile() {
    document.getElementById('searchCount').textContent = searchCount;
    document.getElementById('savedCount').textContent = savedCount;
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('caseModal');
    if (e.target === modal) {
        closeModal();
    }
});

console.log('TRIVORA Land Litigation Search Portal Loaded');
