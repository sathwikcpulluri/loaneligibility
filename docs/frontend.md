# Frontend Layout & Component Design Spec
## Alternative Credit Assessment Platform (v1.0)

This document provides visual layout specifications, design components, chart details, and responsiveness plans for the frontend web application.

---

## 1. Design System Configuration

We enforce a modern dark theme with emerald green and indigo highlights, giving a trustworthy yet technical impression.

### 1.1 Tailwind CSS Configuration Variables
```css
@layer base {
  :root {
    --background: 222.2 84% 4.9%;    /* Sleek Slate Black #090d16 */
    --foreground: 210 40% 98%;      /* Soft Off-White */
    --card: 222.2 84% 7%;
    --card-foreground: 210 40% 98%;
    
    --primary: 142.1 76.2% 36.3%;   /* Emerald Green #10b981 */
    --primary-foreground: 355.7 100% 97.3%;
    
    --secondary: 243.4 75.4% 58.6%; /* Tech Indigo #6366f1 */
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --accent: 142.1 76.2% 10%;
    --accent-foreground: 142.1 76.2% 80%;
    
    --destructive: 0 84.2% 60.2%;   /* Crimson Red */
    --warning: 38 92% 50%;          /* Amber Warning */
  }
}
```

---

## 2. Page-by-Page Layout Specs

### 2.1 Landing Page
* **Visual Theme**: Smooth gradients merging deep slate to indigo, featuring glassmorphism cards.
* **Component Sections**:
  1. **Navbar**: Fixed header with backdrop-blur. Contains logo, Features, Pricing, FAQs, and a glowing CTA "Launch App".
  2. **Hero Section**: Huge headline: *"Unlock Formal Credit without a traditional Credit History"*. Secondary line focusing on India's gig workers and MSMEs. Dual CTAs: "Upload Statement" (Green) and "Partner with Us" (Outline). Includes a mock dashboard mockup with floating credit score dial.
  3. **Features Grid**: Three columns with hover micro-animations (Framer Motion scale-up):
     * *Secured File Processing*: Bank statement PDF OCR.
     * *Explainable Credit Metric*: AI scores with bullet-points.
     * *Automated Loan Matches*: Connecting borrowers with partner NBFCs.
  4. **Pricing Tier Cards**: Three options (Free/Borrower, Professional/MFI, Enterprise/Bank) showing API request limits.
  5. **FAQ Accordion**: Modern chevron-collapse panels answering queries on data privacy, DPDP compliance, and scoring metrics.

### 2.2 Login & Signup Pages
* **Visual Theme**: Left side features a clean vector graphic describing financial inclusion. Right side contains a centered card with auth options.
* **Component Sections**:
  1. **Social Login Hooks**: Google and Aadhaar/DigiLocker login buttons.
  2. **Email Form**: Input elements with standard feedback validations.
  3. **Mobile OTP Toggle**: Option to input a 10-digit Indian phone number and receive a 6-digit verification code. Includes an active 60-second cooldown timer.

### 2.3 Borrower Dashboard
* **Visual Theme**: Two-column layout on desktop. Left column contains widgets; right column contains the main summary meters.
* **Component Sections**:
  1. **Alternative Credit Score Widget**:
     * Large radial gauge (`recharts` RadialBarChart) centered on the alternative score (e.g. `745 / 1000`).
     * Score class label ("Excellent") colored emerald.
     * Explainable AI box displaying positive and negative score drivers.
  2. **Financial Health KPI Cards**:
     * *Income Stability*: High/Medium/Low badge, plus total recurring income.
     * *Debt Burden Ratio*: Percentage gauge (red if > 40%).
     * *Savings Trend*: Small green area chart showing quarterly savings accumulation.
  3. **Categorized Spending Bar Chart**:
     * Recharts BarChart representing Monthly spending category breakdown (Salary vs Rent, Utilities, EMIs, Dining).
  4. **Recent Action Center center**:
     * Drag-and-drop quick-upload document portal.
     * Current active loan requests status indicator.

### 2.4 Document Upload & Status Tracker
* **Visual Theme**: Centered glass panel enclosing a secure dashboard.
* **Component Sections**:
  1. **Drag-and-Drop Area**: Dotted borders with cloud icon. Triggers local file selection or statement file drag.
  2. **File Processing Stepper**: Visible after submission:
     * *Step 1: Uploading* (Progress bar)
     * *Step 2: Performing OCR Parsing* (Spinner)
     * *Step 3: Document Validation & Integrity checks* (Verification badge)
     * *Step 4: Credit Analysis Complete* (Success Checkmark)
  3. **Uploaded Statement Registry**: Simple table displaying historical statements, status (COMPLETED/FAILED), and dates.

### 2.5 Loan Recommendations & Simulators
* **Visual Theme**: Sleek finance sliders coupled with real-time responsive cards.
* **Component Sections**:
  1. **Real-time Simulator Slider**: Dual range selectors for *Requested Amount* (₹10K to ₹5 Lakhs) and *Tenure* (3 to 24 months).
  2. **Safe EMI Calculator Meter**: Dynamic gauge reflecting how the selected repayment amount fits the user's analyzed monthly cash flow:
     * *Safe (Green)*: EMI <= 20% of net monthly income.
     * *Warning (Yellow)*: EMI 20-40% of net monthly income.
     * *Critical (Red)*: EMI > 40% of net monthly income.
  3. **Pre-Approved Lenders List**: Grid of loan option cards from partner NBFCs, showing APR, processing fee, approval probability percentage, and an "Apply Now" CTA.

### 2.6 AI Chatbot Interface
* **Visual Theme**: Sidebar widget or pop-up drawer.
* **Component Sections**:
  1. **Message Stream**: Alternating message blocks (Borrower messages right/indigo; AI Assistant messages left/dark gray with green border).
  2. **Quick-Query Suggestion Chips**: Horizontal scroll of tags, e.g., *"How can I improve my score?"*, *"What is my safe EMI threshold?"*, *"Examine utility payments status"*.
  3. **Input Controller**: Text box with standard keyboard triggers.

### 2.7 Admin / Underwriter Dashboard
* **Visual Theme**: Split ledger view optimized for high data density.
* **Component Sections**:
  1. **Applications Ledger Table**: List of pending credit reviews. Displays Applicant Name, Alt Score, Income Stability Score, Risk Classification, Fraud Probability, and a "Review File" link.
  2. **Audit & Anomaly Center**: Highlights suspicious accounts (e.g. metadata creation-date discrepancy or duplicate IFSC/PAN accounts).
  3. **Underwriter Control Form**: Slide-out drawer displaying detailed cash-flow analytics, bank statement downloads, and a form to submit final underwriting decisions (Approve/Reject) with text notes.
