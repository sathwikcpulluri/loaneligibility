// Global App State
const state = {
    isAuthenticated: false,
    authRole: 'BORROWER',
    authMethod: 'otp',
    otpSent: false,
    otpTimer: 30,
    otpInterval: null,
    activeRole: 'BORROWER',
    hasUploaded: false,
    currentScore: 350,
    applicantData: {
        name: '',
        fileName: '',
        score: 350,
        incomeStability: 'Low',
        debtBurden: '0%',
        netSavings: '₹0',
        fraudProb: '0%',
        monthlyInflow: 0,
        monthlyOutflow: 0,
        savingsRatio: 0,
        overdraftCount: 0,
        upiCount: 0,
        transactions: []
    },
    // Simulated lender applicants queue
    lenderQueue: [
        { id: 'app-1', name: 'Priya Nair (Freelancer)', score: 820, risk: 'LOW_RISK', fraud: '1%', requested: 250000, status: 'PENDING', filename: 'priya_gst_mar26.csv', inflow: 95000, savings: '45%', bounce: 0, upi: 12 },
        { id: 'app-2', name: 'Amit Kumar (Zomato Rider)', score: 610, risk: 'MEDIUM_RISK', fraud: '5%', requested: 30000, status: 'PENDING', filename: 'amit_wallet_mar26.csv', inflow: 22000, savings: '12%', bounce: 1, upi: 94 }
    ],
    // Audit logs repository
    auditLogs: [
        { time: '2026-07-17 16:32:15', user: 'System (cron)', action: 'Periodic model retraining pipeline completed', ip: '127.0.0.1', check: 'SECURE' },
        { time: '2026-07-17 16:40:48', user: 'Lender: Ramesh Sharma', action: 'Login successful via JWT auth token', ip: '192.168.1.45', check: 'SECURE' },
        { time: '2026-07-17 16:45:10', user: 'System (OCR service)', action: 'Processed file priya_gst_mar26.csv - parsed 89 records', ip: '10.0.4.12', check: 'VERIFIED' }
    ]
};

// Section View Toggler
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // Deactivate all nav links
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => l.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(`sec-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Set header title
    const headerTitle = document.getElementById('header-section-title');
    let displayTitle = sectionId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (sectionId === 'landing') displayTitle = 'Home Portal';
    if (sectionId === 'loans') displayTitle = 'Lenders Loan Simulator';
    headerTitle.innerText = displayTitle;

    // Set matching link active (handling home-pricing link)
    const activeLink = Array.from(document.querySelectorAll('.sidebar .nav-link')).find(l => {
        const onclickAttr = l.getAttribute('onclick');
        return onclickAttr && onclickAttr.includes(`'${sectionId}'`);
    });
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Close mobile sidebar if open
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
    }
}

// Switch between Borrower and Lender roles
function switchRole(role) {
    state.activeRole = role;

    // Toggle menu visibility
    const menuBorrower = document.getElementById('menu-borrower');
    const menuLender = document.getElementById('menu-lender');
    const btnBorrower = document.getElementById('btn-role-borrower');
    const btnLender = document.getElementById('btn-role-lender');

    const profileName = document.getElementById('profile-name');
    const profileSubtitle = document.getElementById('profile-subtitle');
    const userAvatar = document.getElementById('user-avatar');

    if (role === 'BORROWER') {
        menuBorrower.classList.remove('hidden');
        menuLender.classList.add('hidden');
        btnBorrower.classList.add('active');
        btnLender.classList.remove('active');

        // Restore borrower name context
        profileName.innerText = state.hasUploaded ? state.applicantData.name : 'Rajesh Patel';
        profileSubtitle.innerText = state.hasUploaded ? state.applicantData.subtitle : 'General Store (MSME)';
        userAvatar.src = "https://api.dicebear.com/7.x/bottts/svg?seed=Rajesh";

        showSection('landing');
    } else {
        menuBorrower.classList.add('hidden');
        menuLender.classList.remove('hidden');
        btnBorrower.classList.remove('active');
        btnLender.classList.add('active');

        // Set underwriter profile details
        profileName.innerText = 'Ramesh Sharma';
        profileSubtitle.innerText = 'Senior Loan Officer';
        userAvatar.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=Ramesh";

        renderLenderQueue();
        renderAuditLogs();
        showSection('lender-dashboard');
    }
}

// File Dialog trigger helper
function triggerFileInput() {
    document.getElementById('statement-file-input').click();
}

function handleFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
        // Arbitrarily simulate standard Rajesh Patel dataset
        simulateUpload(file.name, 745);
    }
}

// Visual Stepper Processor Simulation
function simulateUpload(filename, scoreTarget) {
    const dropZone = document.getElementById('drop-zone');
    const stepper = document.getElementById('upload-stepper');
    const filenameLabel = document.getElementById('processing-filename');

    // Hide dropzone, show stepper
    dropZone.classList.add('hidden');
    stepper.classList.remove('hidden');
    filenameLabel.innerText = filename;

    // Reset stepper UI lines
    const steps = [1, 2, 3, 4];
    steps.forEach(num => {
        const line = document.getElementById(`step-${num}`);
        line.classList.remove('active', 'completed');
        line.querySelector('.step-status').innerHTML = '<i class="fa-solid fa-clock"></i>';
    });

    // Run async step triggers
    triggerStep(1, () => {
        triggerStep(2, () => {
            triggerStep(3, () => {
                triggerStep(4, () => {
                    // Completion Logic
                    setTimeout(() => {
                        state.hasUploaded = true;
                        populateApplicantState(filename, scoreTarget);
                        
                        // Show active dashboard widgets
                        document.getElementById('dashboard-empty-state').classList.add('hidden');
                        document.getElementById('dashboard-active-grid').classList.remove('hidden');

                        // Navigate to Dashboard
                        showSection('dashboard');
                        animateScoreGauge(scoreTarget);
                        renderDashboardDetails();
                        
                        // Add to registry table
                        addDocumentToRegistry(filename, scoreTarget);

                        // Reset drag-drop area for subsequent uploads
                        dropZone.classList.remove('hidden');
                        stepper.classList.add('hidden');
                    }, 800);
                });
            });
        });
    });
}

function triggerStep(num, next) {
    const line = document.getElementById(`step-${num}`);
    line.classList.add('active');
    line.querySelector('.step-status').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

    setTimeout(() => {
        line.classList.remove('active');
        line.classList.add('completed');
        line.querySelector('.step-status').innerHTML = '<i class="fa-solid fa-circle-check text-green"></i>';
        next();
    }, 1500);
}

// Generate Contextual Data metrics depending on target preset choice
function populateApplicantState(filename, targetScore) {
    state.currentScore = targetScore;
    state.applicantData.fileName = filename;
    state.applicantData.score = targetScore;

    if (filename.includes('Rajesh')) {
        state.applicantData.name = 'Rajesh Patel';
        state.applicantData.subtitle = 'Patel General Store (MSME)';
        state.applicantData.incomeStability = 'High (89/100)';
        state.applicantData.debtBurden = '18.5%';
        state.applicantData.netSavings = '₹21,800';
        state.applicantData.fraudProb = '2%';
        state.applicantData.monthlyInflow = 65000;
        state.applicantData.monthlyOutflow = 43200;
        state.applicantData.overdraftCount = 0;
        state.applicantData.upiCount = 58;

        state.applicantData.explanations = [
            { text: "Monthly operating margin average holds steady at 33.5% balance.", type: 'check' },
            { text: "High frequency of micro UPI credit entries demonstrates stable business demand.", type: 'check' },
            { text: "Zero bank account overdrafts or insufficient funds logs in 180 days.", type: 'check' },
            { text: "Electricity and telecom utilities paid consistently within 3 days.", type: 'check' }
        ];

        // Seeding Ledger transactions
        state.applicantData.transactions = [
            { date: '2026-03-18', desc: 'UPI-RECEIVED-CUSTOMER-AJAY@okaxis', cat: 'BUSINESS_INCOME', type: 'CREDIT', amt: 1250, recur: false },
            { date: '2026-03-17', desc: 'ACH-MSEB-ELECTRICITY-BILL', cat: 'UTILITIES', type: 'DEBIT', amt: 3400, recur: true },
            { date: '2026-03-15', desc: 'UPI-RECEIVED-CUSTOMER-RADHA@ybl', cat: 'BUSINESS_INCOME', type: 'CREDIT', amt: 480, recur: false },
            { date: '2026-03-12', desc: 'LOAN-EMI-MFI-GROWTH', cat: 'EMIS', type: 'DEBIT', amt: 8000, recur: true },
            { date: '2026-03-10', desc: 'CASH-WITHDRAWAL-BANK-ATM', cat: 'OTHER', type: 'DEBIT', amt: 10000, recur: false },
            { date: '2026-03-05', desc: 'WHOLESALE-DISTRIBUTOR-GRAINS', cat: 'SHOPPING', type: 'DEBIT', amt: 21800, recur: true },
            { date: '2026-03-01', desc: 'UPI-RECEIVED-CUSTOMER-OM@okaxis', cat: 'BUSINESS_INCOME', type: 'CREDIT', amt: 3200, recur: false }
        ];
    } else if (filename.includes('Amit')) {
        state.applicantData.name = 'Amit Kumar';
        state.applicantData.subtitle = 'Zomato Delivery Rider (Gig)';
        state.applicantData.incomeStability = 'Medium (62/100)';
        state.applicantData.debtBurden = '28%';
        state.applicantData.netSavings = '₹2,640';
        state.applicantData.fraudProb = '5%';
        state.applicantData.monthlyInflow = 22000;
        state.applicantData.monthlyOutflow = 19360;
        state.applicantData.overdraftCount = 1;
        state.applicantData.upiCount = 94;

        state.applicantData.explanations = [
            { text: "Weekly gig payout patterns are regular, providing stable aggregate inflow.", type: 'check' },
            { text: "Rent and fuel expenses occupy a high proportion of debit volumes.", type: 'warn' },
            { text: "Detected 1 bank balance return transaction due to low funds.", type: 'warn' }
        ];

        state.applicantData.transactions = [
            { date: '2026-03-20', desc: 'ZOMATO-PAYOUT-WEEK-12', cat: 'SALARY', type: 'CREDIT', amt: 5500, recur: true },
            { date: '2026-03-18', desc: 'UPI-FUEL-BPCL-PETROL', cat: 'TRAVEL', type: 'DEBIT', amt: 350, recur: false },
            { date: '2026-03-15', desc: 'UPI-RENT-PAYMENT-LANDLORD', cat: 'RENT', type: 'DEBIT', amt: 6000, recur: true },
            { date: '2026-03-13', desc: 'ZOMATO-PAYOUT-WEEK-11', cat: 'SALARY', type: 'CREDIT', amt: 5200, recur: true },
            { date: '2026-03-08', desc: 'UPI-HOTEL-SWADIST', cat: 'FOOD', type: 'DEBIT', amt: 180, recur: false },
            { date: '2026-03-05', desc: 'FAILED-TXN-NSF-RECOV', cat: 'OTHER', type: 'DEBIT', amt: 250, recur: false }
        ];
    } else {
        // Forged statement
        state.applicantData.name = 'Chetan Sharma';
        state.applicantData.subtitle = 'Street Vendor (Juice Stall)';
        state.applicantData.incomeStability = 'Low (35/100)';
        state.applicantData.debtBurden = '65%';
        state.applicantData.netSavings = '-₹5,000';
        state.applicantData.fraudProb = '78%';
        state.applicantData.monthlyInflow = 15000;
        state.applicantData.monthlyOutflow = 20000;
        state.applicantData.overdraftCount = 5;
        state.applicantData.upiCount = 18;

        state.applicantData.explanations = [
            { text: "CRITICAL: PDF statement metadata indicates alteration in Canva Software.", type: 'warn' },
            { text: "Debit and credit sums do not align with chronological bank balances.", type: 'warn' },
            { text: "High overdraft returns count (5 times) flags immediate insolvency risk.", type: 'warn' }
        ];

        state.applicantData.transactions = [
            { date: '2026-03-19', desc: 'MOCKED-CREDIT-TAMPERED', cat: 'BUSINESS_INCOME', type: 'CREDIT', amt: 50000, recur: false },
            { date: '2026-03-15', desc: 'OVERDRAFT-BOUNCE-CHARGES', cat: 'OTHER', type: 'DEBIT', amt: 750, recur: false },
            { date: '2026-03-10', desc: 'UPI-LENDER-SHARK-EMI', cat: 'EMIS', type: 'DEBIT', amt: 12000, recur: true }
        ];
    }

    // Set Borrower Details in sidebar user context
    document.getElementById('profile-name').innerText = state.applicantData.name;
    document.getElementById('profile-subtitle').innerText = state.applicantData.subtitle;

    // Automatically register application in Lender Queue
    const activeAppIndex = state.lenderQueue.findIndex(a => a.name.includes(state.applicantData.name));
    if (activeAppIndex === -1) {
        state.lenderQueue.push({
            id: `app-${Date.now()}`,
            name: `${state.applicantData.name} (${state.applicantData.subtitle.split(' ')[0]})`,
            score: targetScore,
            risk: targetScore > 700 ? 'LOW_RISK' : (targetScore > 550 ? 'MEDIUM_RISK' : 'HIGH_RISK'),
            fraud: state.applicantData.fraudProb,
            requested: targetScore > 700 ? 150000 : 30000,
            status: 'PENDING',
            filename: filename,
            inflow: state.applicantData.monthlyInflow,
            savings: state.applicantData.netSavings,
            bounce: state.applicantData.overdraftCount,
            upi: state.applicantData.upiCount
        });
    }

    // Register security log item
    state.auditLogs.unshift({
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: state.applicantData.name,
        action: `Uploaded ${filename} for processing. Fraud check score: ${state.applicantData.fraudProb}`,
        ip: '192.168.1.18',
        check: targetScore > 500 ? 'PASS' : 'WARNING'
    });
}

// Animate Dashoffset of the radial gauge dial SVG
function animateScoreGauge(targetScore) {
    const ring = document.getElementById('score-gauge-ring');
    const scoreVal = document.getElementById('dash-score-value');
    const scoreGrade = document.getElementById('dash-score-grade');

    if (!ring) return;

    // Reset gauge first
    ring.style.strokeDashoffset = 534;

    // Map score 0-1000 to offset 534-0
    const offset = 534 - (534 * (targetScore / 1000));

    setTimeout(() => {
        ring.style.strokeDashoffset = offset;
        
        // Counter animation
        let count = 350;
        const interval = setInterval(() => {
            if (count >= targetScore) {
                clearInterval(interval);
                scoreVal.innerText = targetScore;
            } else {
                count += Math.ceil((targetScore - count) / 10) || 1;
                scoreVal.innerText = count;
            }
        }, 30);

        // Grade labeling
        if (targetScore >= 800) {
            scoreGrade.innerText = "Excellent";
            scoreGrade.className = "score-grade text-green";
            ring.style.stroke = "#10B981";
        } else if (targetScore >= 650) {
            scoreGrade.innerText = "Good";
            scoreGrade.className = "score-grade text-indigo";
            ring.style.stroke = "#6366F1";
        } else if (targetScore >= 550) {
            scoreGrade.innerText = "Fair";
            scoreGrade.className = "score-grade text-warning";
            ring.style.stroke = "#F59E0B";
        } else {
            scoreGrade.innerText = "Critical Risk";
            scoreGrade.className = "score-grade text-red";
            ring.style.stroke = "#EF4444";
        }
    }, 150);
}

// Render Dashboard Data widgets
function renderDashboardDetails() {
    // Inject KPI labels
    document.getElementById('dash-income-stability').innerText = state.applicantData.incomeStability;
    document.getElementById('dash-debt-burden').innerText = state.applicantData.debtBurden;
    document.getElementById('dash-net-savings').innerText = state.applicantData.netSavings;
    document.getElementById('dash-fraud-prob').innerText = state.applicantData.fraudProb;

    // Setup Progress bars widths
    const stabilityVal = state.applicantData.incomeStability.includes('High') ? 85 : (state.applicantData.incomeStability.includes('Medium') ? 60 : 35);
    document.getElementById('dash-income-bar').style.width = `${stabilityVal}%`;

    const debtVal = parseFloat(state.applicantData.debtBurden) || 0;
    document.getElementById('dash-debt-bar').style.width = `${debtVal}%`;
    document.getElementById('dash-debt-bar').className = debtVal > 40 ? "kpi-bar bg-red" : "kpi-bar bg-green";

    const savingsRatio = ((state.applicantData.monthlyInflow - state.applicantData.monthlyOutflow) / state.applicantData.monthlyInflow) * 100;
    document.getElementById('dash-savings-bar').style.width = `${Math.max(0, savingsRatio)}%`;

    const fraudVal = parseFloat(state.applicantData.fraudProb) || 0;
    document.getElementById('dash-fraud-bar').style.width = `${fraudVal}%`;
    document.getElementById('dash-fraud-bar').className = fraudVal > 30 ? "kpi-bar bg-red" : "kpi-bar bg-green";

    // Inject Explainable AI bullets
    const xaiContainer = document.getElementById('xai-list-container');
    xaiContainer.innerHTML = '';
    state.applicantData.explanations.forEach(item => {
        const li = document.createElement('li');
        li.className = item.type;
        li.innerText = item.text;
        xaiContainer.appendChild(li);
    });

    // Populate dynamic categories chart
    renderCategoryChart();

    // Populate transaction lists
    renderLedgerTable();

    // Reset simulator slider parameters
    updateLoanSimulation();
}

function renderCategoryChart() {
    const container = document.getElementById('bar-chart-container');
    container.innerHTML = '';

    // Classify amount per category
    const totals = { SALARY: 0, BUSINESS_INCOME: 0, UTILITIES: 0, EMIS: 0, FOOD: 0, TRAVEL: 0, SHOPPING: 0, OTHER: 0 };
    state.applicantData.transactions.forEach(t => {
        if (t.type === 'DEBIT') {
            if (totals[t.cat] !== undefined) totals[t.cat] += t.amt;
            else totals.OTHER += t.amt;
        }
    });

    const maxVal = Math.max(...Object.values(totals), 5000);

    Object.entries(totals).forEach(([cat, val]) => {
        if (cat === 'SALARY' && state.applicantData.monthlyInflow > 0) {
            val = state.applicantData.monthlyInflow; // Represent inflow
        }

        const pct = (val / maxVal) * 100;

        const col = document.createElement('div');
        col.className = 'chart-column';

        const fill = document.createElement('div');
        fill.className = `chart-bar-fill ${cat === 'SALARY' || cat === 'BUSINESS_INCOME' ? 'bar-salary' : ''}`;
        fill.style.height = '0%';
        fill.setAttribute('data-amount', `₹${val.toLocaleString()}`);

        const label = document.createElement('span');
        label.className = 'chart-label';
        label.innerText = cat.slice(0, 4);

        col.appendChild(fill);
        col.appendChild(label);
        container.appendChild(col);

        // Trigger height transition
        setTimeout(() => {
            fill.style.height = `${pct}%`;
        }, 100);
    });
}

// Render historical registry files uploaded
function addDocumentToRegistry(filename, score) {
    const tbody = document.getElementById('registry-tbody');
    if (state.hasUploaded && tbody.innerText.includes('No documents uploaded yet')) {
        tbody.innerHTML = '';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="font-mono text-indigo">doc-${Math.floor(Math.random()*90000+10000)}</td>
        <td><strong>${filename}</strong></td>
        <td>${filename.endsWith('.pdf') ? 'PDF Bank Statement' : 'CSV Transaction log'}</td>
        <td><span class="badge-status completed">COMPLETED</span></td>
        <td>${state.applicantData.transactions.length} items</td>
        <td>Just now</td>
    `;
    tbody.prepend(tr);
}

// Populate Transaction ledger
function renderLedgerTable(data = state.applicantData.transactions) {
    const tbody = document.getElementById('ledger-tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No matching transactions found.</td></tr>`;
        return;
    }

    data.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date}</td>
            <td class="font-mono">${t.desc}</td>
            <td><span class="badge-status ${t.type === 'CREDIT' ? 'completed' : 'processing'}">${t.cat}</span></td>
            <td class="${t.type === 'CREDIT' ? 'text-green' : 'text-red'}"><strong>${t.type}</strong></td>
            <td><strong>₹${t.amt.toLocaleString()}</strong></td>
            <td>${t.recur ? '<i class="fa-solid fa-arrows-spin text-indigo"></i> Yes' : 'No'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterLedger() {
    const searchVal = document.getElementById('ledger-search-input').value.toLowerCase();
    const catFilter = document.getElementById('ledger-filter-category').value;
    const typeFilter = document.getElementById('ledger-filter-type').value;

    const filtered = state.applicantData.transactions.filter(t => {
        const matchesSearch = t.desc.toLowerCase().includes(searchVal);
        const matchesCat = catFilter === 'ALL' || t.cat === catFilter;
        const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
        return matchesSearch && matchesCat && matchesType;
    });

    renderLedgerTable(filtered);
}

// Real-time Loan simulation computations
function updateLoanSimulation() {
    const amountSlider = document.getElementById('slider-loan-amount');
    const tenureSlider = document.getElementById('slider-loan-tenure');

    if (!amountSlider) return;

    const principal = parseFloat(amountSlider.value);
    const months = parseInt(tenureSlider.value);

    // Update Slider text markers
    document.getElementById('val-loan-amount').innerText = `₹${principal.toLocaleString()}`;
    document.getElementById('val-loan-tenure').innerText = `${months} months`;

    // Standard interest rates depending on credit score brackets
    let interestRateAPR = 18.5; // Default bad risk
    if (state.currentScore >= 800) interestRateAPR = 10.5;
    else if (state.currentScore >= 700) interestRateAPR = 12.0;
    else if (state.currentScore >= 600) interestRateAPR = 15.0;

    // Monthly PMT / EMI compound formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
    const monthlyRate = (interestRateAPR / 12) / 100;
    let emiVal = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    if (isNaN(emiVal)) emiVal = principal / months; // Simple division fallback

    // Update EMI results UI elements
    document.getElementById('calc-emi-value').innerText = `₹${Math.ceil(emiVal).toLocaleString()} / mo`;

    // Safe threshold limit: net monthly savings
    const inflow = state.applicantData.monthlyInflow || 50000;
    const outflow = state.applicantData.monthlyOutflow || 30000;
    const netSavings = Math.max(1000, inflow - outflow);
    document.getElementById('calc-safe-limit').innerText = `₹${netSavings.toLocaleString()} / mo`;

    const emiBox = document.getElementById('safe-emi-box');
    const emiBadge = document.getElementById('badge-emi-status');
    const emiAdvice = document.getElementById('calc-emi-advice');

    const emiRatioOfSavings = emiVal / netSavings;

    if (emiRatioOfSavings <= 0.40) {
        emiBox.className = "safe-emi-gauge border-green";
        emiBadge.innerText = "Safe Repayment Option";
        emiBadge.className = "badge bg-green";
        emiAdvice.innerText = "Your monthly EMI is well within your average net savings budget, posing low default risk.";
    } else if (emiRatioOfSavings <= 0.80) {
        emiBox.className = "safe-emi-gauge border-yellow";
        emiBadge.innerText = "Moderate Stress";
        emiBadge.className = "badge bg-yellow";
        emiAdvice.innerText = "EMI consumes a significant portion of monthly net savings. Ensure minimal variable expenses.";
    } else {
        emiBox.className = "safe-emi-gauge border-red";
        emiBadge.innerText = "Critical Stress Warning";
        emiBadge.className = "badge bg-red";
        emiAdvice.innerText = "EMI exceeds your safe savings budget limits. Highly prone to cash flow constraints or default.";
    }

    renderLenderMatches(principal, interestRateAPR, months, emiVal);
}

function renderLenderMatches(principal, baseApr, months, emi) {
    const grid = document.getElementById('lender-grid-container');
    grid.innerHTML = '';

    // Lender templates
    const lenders = [
        { name: 'CredInd Micro-Finance MFI', adjRate: -0.5, probability: state.currentScore > 650 ? 94 : 45 },
        { name: 'Progressive FinTech NBFC', adjRate: 0.5, probability: state.currentScore > 600 ? 88 : 38 },
        { name: 'Apex Cooperatives Bank', adjRate: -1.0, probability: state.currentScore > 740 ? 82 : 20 }
    ];

    lenders.forEach(l => {
        const apr = baseApr + l.adjRate;
        const card = document.createElement('div');
        card.className = 'offer-card glass-card';
        card.innerHTML = `
            <div class="offer-lender-info">
                <span class="lender-name">${l.name}</span>
                <span class="lender-rate"><i class="fa-solid fa-percent"></i> ${apr.toFixed(1)}% APR interest rate</span>
            </div>
            <div class="offer-metric">
                <span class="metric-lbl">Max Disbursal</span>
                <span class="metric-val">₹${principal.toLocaleString()}</span>
            </div>
            <div class="offer-metric">
                <span class="metric-lbl">Approval Probability</span>
                <span class="metric-val ${l.probability > 75 ? 'text-green' : (l.probability > 40 ? 'text-warning' : 'text-red')}">${l.probability}%</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="applyForLoan('${l.name}', ${principal})">Apply Now</button>
        `;
        grid.appendChild(card);
    });
}

function applyForLoan(lenderName, amount) {
    // Show confirmation modal
    document.getElementById('loan-apply-modal').classList.remove('hidden');

    // Register security log item
    state.auditLogs.unshift({
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: state.applicantData.name || 'Anonymous User',
        action: `Submitted loan match application of ₹${amount.toLocaleString()} to ${lenderName}`,
        ip: '192.168.1.18',
        check: 'SECURE'
    });
}

function closeModal() {
    document.getElementById('loan-apply-modal').classList.add('hidden');
}

// 6. AI SCORE CHATBOT LOGIC
function sendUserChat() {
    const input = document.getElementById('chat-text-input');
    const msg = input.value.trim();
    if (msg) {
        submitChat(msg);
        input.value = '';
    }
}

function submitChat(messageText) {
    const container = document.getElementById('chat-messages-container');
    const timeStr = new Date().toTimeString().slice(0, 5);

    // Append User Bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-bubble user-bubble';
    userDiv.innerHTML = `<p>${messageText}</p><span class="bubble-time">${timeStr}</span>`;
    container.appendChild(userDiv);
    container.scrollTop = container.scrollHeight;

    // Trigger loading bot bubble simulation
    setTimeout(() => {
        const botDiv = document.createElement('div');
        botDiv.className = 'chat-bubble bot-bubble';
        
        let responseHTML = '';
        const normText = messageText.toLowerCase();

        if (normText.includes('score')) {
            responseHTML = `<p>Your active alternative credit score is **${state.currentScore} / 1000**. This rating is compiled using parameters:
            1. **Savings margin** (${state.applicantData.netSavings} positive accumulation).
            2. **UPI ledger transaction frequency** (${state.applicantData.upiCount} transactions/month).
            3. **Bounces record** (${state.applicantData.overdraftCount} NSF occurrences).
            Keep your debt burden below 30% to secure low rates.</p>`;
        } else if (normText.includes('stability') || normText.includes('income')) {
            responseHTML = `<p>Your income stability is currently graded as **${state.applicantData.incomeStability}**. The scoring engine checks regularity intervals of salary deposits or business QR collections. To boost: limit gaps between business deposit volumes.</p>`;
        } else if (normText.includes('improve')) {
            responseHTML = `<p>To improve your alternative rating score to 800+:
            1. **Maintain high daily thresholds**: Avoid draining your balance to near-zero.
            2. **Consolidate accounts**: Route your transactions and bill payments through a single primary account.
            3. **Limit NSF returns**: Ensure your account holds sufficient cash buffer before automated EMIs debit.</p>`;
        } else if (normText.includes('emi') || normText.includes('limit')) {
            responseHTML = `<p>Your safe EMI repayment ceiling is estimated at **₹${(state.applicantData.monthlyInflow * 0.25).toLocaleString()} per month**. Borrowing beyond this increases default risk flags on the lender underwriting dashboards.</p>`;
        } else {
            responseHTML = `<p>Based on your audited financial statements, you show a net savings ratio of **${state.applicantData.netSavings}** on an inflow of **₹${state.applicantData.monthlyInflow.toLocaleString()}**. For detailed budget constraints, inspect your categories bar charts.</p>`;
        }

        botDiv.innerHTML = responseHTML + `<span class="bubble-time">${timeStr}</span>`;
        container.appendChild(botDiv);
        container.scrollTop = container.scrollHeight;
    }, 1000);
}

// 7. LENDER MANAGEMENT WORKSPACE
function renderLenderQueue() {
    const tbody = document.getElementById('lender-queue-tbody');
    tbody.innerHTML = '';

    state.lenderQueue.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${app.name}</strong></td>
            <td><strong class="text-indigo">${app.score}</strong></td>
            <td><span class="badge-status ${app.risk === 'LOW_RISK' ? 'completed' : (app.risk === 'MEDIUM_RISK' ? 'processing' : 'failed')}">${app.risk}</span></td>
            <td class="${app.fraud.includes('2%') || app.fraud.includes('1%') || app.fraud.includes('5%') ? 'text-green' : 'text-red'}">
                <strong>${app.fraud}</strong>
            </td>
            <td>₹${app.requested.toLocaleString()}</td>
            <td><a class="queue-action-link" onclick="reviewApplicant('${app.id}')">Review File</a></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('lender-stat-pending').innerText = `${state.lenderQueue.filter(a => a.status === 'PENDING').length} Files`;
    const highFraudCount = state.lenderQueue.filter(a => parseFloat(a.fraud) > 30).length;
    document.getElementById('lender-stat-fraud').innerText = `${highFraudCount} Flag${highFraudCount !== 1 ? 's' : ''}`;
}

let activeReviewId = null;

function reviewApplicant(appId) {
    const app = state.lenderQueue.find(a => a.id === appId);
    if (!app) return;

    activeReviewId = appId;

    // Toggle Details UI blocks
    document.getElementById('lender-review-empty').classList.add('hidden');
    document.getElementById('lender-review-active').classList.remove('hidden');

    // Fill UI fields
    document.getElementById('review-applicant-name').innerText = `Applicant File: ${app.name}`;
    document.getElementById('review-score-val').innerText = app.score;
    document.getElementById('review-fraud-val').innerText = app.fraud;

    const fraudVal = parseFloat(app.fraud) || 0;
    const scoreColorClass = app.score >= 700 ? 'text-green' : (app.score >= 550 ? 'text-warning' : 'text-red');
    const fraudColorClass = fraudVal < 15 ? 'text-green' : (fraudVal < 40 ? 'text-warning' : 'text-red');

    document.getElementById('review-score-val').className = `block-val ${scoreColorClass}`;
    document.getElementById('review-fraud-val').className = `block-val ${fraudColorClass}`;

    // Render alert box instructions
    const alertBox = document.getElementById('review-fraud-alert-box');
    if (fraudVal > 30) {
        alertBox.className = "review-alert-box bg-red";
        alertBox.innerHTML = `<h4><i class="fa-solid fa-circle-exclamation"></i> Tampering Threat Identified</h4>
        <p>This file contains mathematical audit discrepancies. Balance chronological values fail to reconcile. Metadata indicates Canva editing signature templates. Denying this file is recommended.</p>`;
    } else {
        alertBox.className = "review-alert-box bg-green";
        alertBox.innerHTML = `<h4><i class="fa-solid fa-shield-halved"></i> Security Verification Clear</h4>
        <p>No anomalous indicators reported. Statement signature and chronological balance sums correspond correctly. Data integrity check passed.</p>`;
    }

    // Inject aggregates stats
    document.getElementById('review-inflow-val').innerText = `₹${app.inflow.toLocaleString()}`;
    document.getElementById('review-savings-val').innerText = app.savings;
    document.getElementById('review-bounce-val').innerText = `${app.bounce} instance${app.bounce !== 1 ? 's' : ''}`;
    document.getElementById('review-upi-val').innerText = `${app.upi} / mo`;

    // Clear previous underwriting text notes
    document.getElementById('lender-decision-notes').value = '';
}

function submitLenderDecision(decision) {
    if (!activeReviewId) return;

    const notes = document.getElementById('lender-decision-notes').value;
    const app = state.lenderQueue.find(a => a.id === activeReviewId);

    if (app) {
        app.status = decision;
        app.risk = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

        // Add Security activity audit log
        state.auditLogs.unshift({
            time: new Date().toISOString().replace('T', ' ').slice(0, 19),
            user: 'Lender: Ramesh Sharma',
            action: `Underwriting Decision for ${app.name} set to ${decision}. Notes: ${notes || 'No remarks provided'}`,
            ip: '192.168.1.45',
            check: decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED'
        });

        alert(`Loan application file for ${app.name} has been ${decision.toLowerCase()}.`);

        // Reset sidebar review drawers
        document.getElementById('lender-review-empty').classList.remove('hidden');
        document.getElementById('lender-review-active').classList.add('hidden');
        activeReviewId = null;

        renderLenderQueue();
        renderAuditLogs();
    }
}

// 8. AUDIT SECURITY LOGS RENDERER
function renderAuditLogs() {
    const tbody = document.getElementById('audit-logs-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    state.auditLogs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.time}</td>
            <td>${log.user}</td>
            <td class="text-indigo">${log.action}</td>
            <td>${log.ip}</td>
            <td>
                <span class="badge-status ${log.check === 'SECURE' || log.check === 'VERIFIED' || log.check === 'PASS' ? 'completed' : 'failed'}">
                    ${log.check}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// AUTHENTICATION LOGIC & ROUTE GUARDS
// ==========================================================================

function setAuthRole(role) {
    state.authRole = role;
    document.getElementById('tab-role-borrower').classList.toggle('active', role === 'BORROWER');
    document.getElementById('tab-role-lender').classList.toggle('active', role === 'LENDER');
    
    // Auto populate placeholder mobile/email context for ease of testing
    const mobileInput = document.getElementById('login-mobile');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (role === 'BORROWER') {
        mobileInput.value = '9876543210';
        emailInput.value = 'rajesh.patel@gmail.com';
        passwordInput.value = 'password123';
    } else {
        mobileInput.value = '9988776655';
        emailInput.value = 'ramesh.sharma@nbfc.in';
        passwordInput.value = 'lenderpass';
    }
}

function setAuthMethod(method) {
    state.authMethod = method;
    document.getElementById('method-otp').classList.toggle('active', method === 'otp');
    document.getElementById('method-email').classList.toggle('active', method === 'email');
    
    document.getElementById('form-otp').classList.toggle('active', method === 'otp');
    document.getElementById('form-otp').classList.toggle('hidden', method !== 'otp');
    
    document.getElementById('form-email').classList.toggle('active', method === 'email');
    document.getElementById('form-email').classList.toggle('hidden', method !== 'email');
}

function handleOtpSubmit(event) {
    event.preventDefault();
    const mobile = document.getElementById('login-mobile').value;
    const actionBtn = document.getElementById('btn-otp-action');
    const verificationGroup = document.getElementById('otp-verification-group');
    const otpInput = document.getElementById('login-otp');

    if (!state.otpSent) {
        // Send OTP Simulation
        actionBtn.innerText = "Verifying...";
        actionBtn.disabled = true;
        
        setTimeout(() => {
            state.otpSent = true;
            actionBtn.innerText = "Confirm & Login";
            actionBtn.disabled = false;
            verificationGroup.classList.remove('hidden');
            otpInput.required = true;
            otpInput.focus();
            
            // Auto fill simulated OTP for user delight/ease
            otpInput.value = "123456"; 
            
            startOtpTimer();
            
            // Log System action
            state.auditLogs.unshift({
                time: new Date().toISOString().replace('T', ' ').slice(0, 19),
                user: `Guest (${mobile})`,
                action: `Sent simulated authentication OTP to +91 ${mobile}`,
                ip: '192.168.1.99',
                check: 'SECURE'
            });
            renderAuditLogs();
        }, 1000);
    } else {
        // Verify OTP Simulation
        const otp = otpInput.value;
        if (otp === "123456") {
            loginSuccess(state.authRole);
        } else {
            alert("Incorrect OTP. Please enter the simulated code 123456.");
        }
    }
}

function startOtpTimer() {
    clearInterval(state.otpInterval);
    state.otpTimer = 30;
    const timerText = document.getElementById('otp-timer');
    if (timerText) timerText.innerText = state.otpTimer;

    state.otpInterval = setInterval(() => {
        state.otpTimer--;
        const tEl = document.getElementById('otp-timer');
        if (tEl) tEl.innerText = state.otpTimer;

        if (state.otpTimer <= 0) {
            clearInterval(state.otpInterval);
            // Reset state to allow resend
            const otpVerificationGroup = document.getElementById('otp-verification-group');
            if (otpVerificationGroup) otpVerificationGroup.classList.add('hidden');
            const actionBtn = document.getElementById('btn-otp-action');
            if (actionBtn) {
                actionBtn.innerText = "Send OTP";
                actionBtn.disabled = false;
            }
            state.otpSent = false;
            const otpInput = document.getElementById('login-otp');
            if (otpInput) {
                otpInput.required = false;
                otpInput.value = '';
            }
        }
    }, 1000);
}

function handleEmailSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email && password) {
        // Simple login validation logic
        loginSuccess(state.authRole);
    }
}

function handleSocialLogin(provider) {
    // Show a alert loader and then login
    const card = document.querySelector('.auth-card');
    const originalContent = card.innerHTML;
    
    card.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 40px; color: #10B981; margin-bottom: 20px;"></i>
            <h3>Authenticating via ${provider}...</h3>
            <p style="color: #64748B; margin-top: 8px;">Establishing secure Digilocker/Google session</p>
        </div>
    `;

    setTimeout(() => {
        card.innerHTML = originalContent;
        loginSuccess(state.authRole);
    }, 1500);
}

function loginSuccess(role) {
    state.isAuthenticated = true;
    
    // Hide auth screen, show dashboard
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-layout').style.display = 'grid';

    // Synchronize global roles switcher & dashboard profile info
    switchRole(role);

    // Add Security activity audit log
    state.auditLogs.unshift({
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: role === 'BORROWER' ? 'Rajesh Patel' : 'Ramesh Sharma',
        action: `User session started successfully via ${state.authMethod.toUpperCase()} Auth`,
        ip: '192.168.1.18',
        check: 'SECURE'
    });
    renderAuditLogs();
}

function logout() {
    // Clear auth state
    state.isAuthenticated = false;
    state.otpSent = false;
    clearInterval(state.otpInterval);

    // Reset inputs
    document.getElementById('login-mobile').value = '';
    document.getElementById('login-otp').value = '';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('otp-verification-group').classList.add('hidden');
    document.getElementById('btn-otp-action').innerText = "Send OTP";
    document.getElementById('btn-otp-action').disabled = false;

    // Toggle views
    document.getElementById('app-layout').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';

    // Set defaults for login
    setAuthRole('BORROWER');
    setAuthMethod('otp');
}

// Startup Initialization Handler
document.addEventListener("DOMContentLoaded", () => {
    // Set default login forms values
    setAuthRole('BORROWER');
});

// Sidebar Collapsible Toggles
function toggleSidebar() {
    const layout = document.getElementById('app-layout');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    if (layout) {
        layout.classList.toggle('collapsed');
        if (layout.classList.contains('collapsed')) {
            if (toggleIcon) toggleIcon.className = "fa-solid fa-chevron-right";
        } else {
            if (toggleIcon) toggleIcon.className = "fa-solid fa-chevron-left";
        }
    }
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}
