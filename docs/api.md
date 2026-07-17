# API Documentation Spec
## Alternative Credit Assessment Platform (v1.0)

This document provides a detailed specification of all REST APIs exposed by the Gateway API server. All requests must have `Content-Type: application/json` unless specified otherwise. Protected routes require a JWT token in the `Authorization: Bearer <TOKEN>` header.

---

## 1. Authentication Service

### 1.1 User Registration
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "rajesh@patelstore.com",
  "password": "Password123!",
  "fullName": "Rajesh Patel",
  "phoneNumber": "+919876543210",
  "role": "BORROWER",
  "panNumber": "ABCDE1234F"
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "e4b6c310-928d-4ba6-8f3e-78cb9d501234",
    "email": "rajesh@patelstore.com",
    "role": "BORROWER"
  }
}
```

### 1.2 User Login
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "rajesh@patelstore.com",
  "password": "Password123!"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "userId": "e4b6c310-928d-4ba6-8f3e-78cb9d501234",
    "fullName": "Rajesh Patel",
    "email": "rajesh@patelstore.com",
    "role": "BORROWER"
  }
}
```

---

## 2. Document & Upload Management

### 2.1 File Upload (Bank Statements)
* **Endpoint**: `POST /api/documents/upload`
* **Access**: Private (Borrower)
* **Request Headers**: `Content-Type: multipart/form-data`
* **Request Body**:
  * `file`: (Binary PDF/CSV/Excel statement file)
  * `fileType`: "PDF" | "CSV" | "EXCEL"
* **Response (202 Accepted)**:
```json
{
  "success": true,
  "message": "Document accepted for processing",
  "document": {
    "documentId": "a82df978-2c20-410d-83b6-1cf2a30b5678",
    "fileName": "icici_mar26.pdf",
    "status": "PROCESSING",
    "uploadedAt": "2026-07-17T11:27:00.000Z"
  }
}
```

### 2.2 Get Document Processing Status
* **Endpoint**: `GET /api/documents/:id`
* **Access**: Private (Owner/Lender/Admin)
* **Response (200 OK)**:
```json
{
  "success": true,
  "document": {
    "documentId": "a82df978-2c20-410d-83b6-1cf2a30b5678",
    "status": "COMPLETED",
    "fileType": "PDF",
    "transactionsParsed": 142,
    "uploadedAt": "2026-07-17T11:27:00.000Z"
  }
}
```

---

## 3. Transactions Ledger

### 3.1 List Parsed Transactions
* **Endpoint**: `GET /api/transactions`
* **Access**: Private (Owner/Lender/Admin)
* **Query Parameters**:
  * `page` (optional, default: 1)
  * `limit` (optional, default: 20)
  * `category` (optional, filter by transaction category)
  * `type` (optional, "CREDIT" | "DEBIT")
* **Response (200 OK)**:
```json
{
  "success": true,
  "count": 142,
  "pages": 8,
  "data": [
    {
      "transactionId": "50e41981-b582-4f33-92a0-4e3146dcd012",
      "date": "2026-03-15T00:00:00.000Z",
      "description": "UPI-ZOMATO-PAYMENT@okaxis",
      "category": "FOOD",
      "type": "DEBIT",
      "amount": 280.00,
      "isRecurring": false
    }
  ]
}
```

---

## 4. Credit Scoring & Explainable AI

### 4.1 Get Latest Alternative Credit Score
* **Endpoint**: `GET /api/credit-score/latest`
* **Access**: Private (Owner/Lender/Admin)
* **Response (200 OK)**:
```json
{
  "success": true,
  "creditScore": {
    "score": 745,
    "grade": "EXCELLENT",
    "metrics": {
      "incomeStability": 85,
      "cashFlowScore": 90,
      "businessHealth": 78,
      "riskScore": 12,
      "debtBurden": 18.5,
      "repaymentProbability": 0.94,
      "fraudProbability": 0.02
    },
    "explainableAi": [
      "Monthly operating margins are solid, averaging 32% positive variance.",
      "Average daily bank balance maintains a buffer equivalent to 1.8 months of operational spend.",
      "High density of repeat business UPI credits detects stable customer traction.",
      "Utility bills are paid consistently within 3 days of generation."
    ],
    "generatedAt": "2026-07-17T11:29:45.000Z"
  }
}
```

---

## 5. Loan Recommendations & Simulation

### 5.1 Fetch Pre-Approved Loan Matches
* **Endpoint**: `GET /api/recommendations/loans`
* **Access**: Private (Owner/Lender)
* **Response (200 OK)**:
```json
{
  "success": true,
  "recommendedAmount": 150000.00,
  "safeEmi": 13800.00,
  "offers": [
    {
      "offerId": "loan-offer-992",
      "lenderName": "Progressive Micro Finance NBFC",
      "interestRate": 12.5,
      "maxAmount": 150000.00,
      "tenureMonths": 12,
      "estimatedEmi": 13360.00,
      "approvalProbability": 92.5
    }
  ]
}
```

### 5.2 Apply for Loan
* **Endpoint**: `POST /api/recommendations/apply`
* **Access**: Private (Borrower)
* **Request Body**:
```json
{
  "offerId": "loan-offer-992",
  "requestedAmount": 120000.00,
  "requestedTenure": 12
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Loan application submitted successfully",
  "applicationId": "app-771d-8f92-990a"
}
```

---

## 6. AI Chatbot

### 6.1 Chat Query
* **Endpoint**: `POST /api/chatbot/query`
* **Access**: Private (Borrower)
* **Request Body**:
```json
{
  "message": "Explain why my credit score is 745. How can I reach 800?"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "reply": "Your credit score is 745 (Excellent) primarily due to: 1. A clean repayment record of your recent EMIs, and 2. Consistent business cash inflow via UPI. To reach 800: 1. Maintain an average monthly balance above ₹50,000, 2. Keep your utility bills payment dates on time, and 3. Avoid new short-term micro-loans that increase your debt-burden above 30%."
}
```

---

## 7. Admin & Underwriter Interface

### 7.1 View Pending Applications Queue
* **Endpoint**: `GET /api/admin/applications`
* **Access**: Private (Lender/Admin)
* **Response (200 OK)**:
```json
{
  "success": true,
  "applications": [
    {
      "applicationId": "app-771d-8f92-990a",
      "applicantName": "Rajesh Patel",
      "requestedAmount": 120000.00,
      "creditScore": 745,
      "riskBand": "LOW_RISK",
      "fraudAlert": false,
      "submittedAt": "2026-07-17T11:30:00.000Z"
    }
  ]
}
```

### 7.2 Underwriter Credit Decision
* **Endpoint**: `POST /api/admin/loans/:id/decision`
* **Access**: Private (Lender/Admin)
* **Request Body**:
```json
{
  "decision": "APPROVED",
  "approvedAmount": 120000.00,
  "interestRate": 12.0,
  "underwriterNotes": "Validated UPI statements with low volatility. Low fraud risk verified."
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Application decision recorded successfully",
  "status": "APPROVED"
}
```
