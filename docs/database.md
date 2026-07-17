# Database Design Document
## Alternative Credit Assessment Platform (v1.0)

This document outlines the database architecture, entity relationships, constraints, and the Prisma ORM schema code. We use PostgreSQL as the primary transactional database.

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o{ Document : "uploads"
    User ||--o{ BankAccount : "has"
    User ||--o{ CreditScore : "receives"
    User ||--o{ Loan : "applies_for (Borrower) / approves (Lender)"
    User ||--o{ AuditLog : "triggers"
    User ||--o{ AIPrediction : "analyzed_by"
    
    BankAccount ||--o{ Transaction : "contains"
    Document ||--o{ Transaction : "source_of"
    
    CreditScore ||--|| RiskAnalysis : "detailed_by"
    
    User {
        string id PK
        string email UNIQUE
        string passwordHash
        string phoneNumber UNIQUE
        string fullName
        enum Role role
        string panNumber
        string aadhaarHash
        datetime createdAt
        datetime updatedAt
    }

    Document {
        string id PK
        string userId FK
        string fileName
        string fileUrl
        enum DocumentType fileType
        enum ProcessingStatus status
        string fileHash
        datetime uploadedAt
    }

    BankAccount {
        string id PK
        string userId FK
        string bankName
        string accountNumber
        string accountHolderName
        string ifscCode
        decimal currentBalance
        decimal averageBalance
        datetime createdAt
    }

    Transaction {
        string id PK
        string bankAccountId FK
        string documentId FK
        datetime transactionDate
        string description
        enum TransactionCategory category
        enum TransactionType type
        decimal amount
        string referenceNumber
        boolean isRecurring
        boolean isFlagged
        datetime createdAt
    }

    CreditScore {
        string id PK
        string userId FK
        int score
        int incomeStabilityScore
        int cashFlowScore
        int businessHealthScore
        int riskScore
        decimal debtBurden
        decimal repaymentProbability
        decimal fraudProbability
        json explanations
        datetime generatedAt
    }

    RiskAnalysis {
        string id PK
        string creditScoreId FK UNIQUE
        decimal totalMonthlyIncome
        decimal totalMonthlyExpense
        decimal debtToIncomeRatio
        int overdraftCount
        int upiCount
        decimal upiVolume
        json categoryBreakdown
        datetime createdAt
    }

    Loan {
        string id PK
        string borrowerId FK
        string lenderId FK
        decimal amount
        int tenureMonths
        decimal interestRate
        decimal safeEmi
        decimal approvalProbability
        string category
        enum LoanStatus status
        datetime createdAt
        datetime updatedAt
    }

    AIPrediction {
        string id PK
        string userId FK
        string modelName
        string predictionType
        json inputFeatures
        json outputProbabilities
        json explainabilityData
        datetime createdAt
    }

    AuditLog {
        string id PK
        string userId FK
        string action
        string ipAddress
        string userAgent
        json details
        datetime timestamp
    }
```

---

## 2. Table Specifications & Indexes

1. **User Table**:
   * **Indexes**: Unique index on `email` and `phoneNumber`.
   * **Security**: `passwordHash` contains bcrypt-hashed passwords. `aadhaarHash` is salt-hashed for anonymity.
2. **Transaction Table**:
   * **Indexes**: Composite index on `(bankAccountId, transactionDate)` to optimize ledger rendering. Index on `category` for fast charts.
   * **Relations**: Linked to `BankAccount` (for ledger mapping) and `Document` (to trace the source of truth).
3. **CreditScore Table**:
   * **Indexes**: Index on `(userId, generatedAt)` to query credit progression charts.

---

## 3. Prisma Schema File

This schema is optimized for PostgreSQL and is ready to be used with Prisma ORM.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  BORROWER
  LENDER
  ADMIN
}

enum DocumentType {
  PDF
  CSV
  EXCEL
  IMAGE
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum TransactionType {
  CREDIT
  DEBIT
}

enum TransactionCategory {
  SALARY
  BUSINESS_INCOME
  RENT
  UTILITIES
  SHOPPING
  EMIS
  INSURANCE
  SUBSCRIPTIONS
  FOOD
  MEDICAL
  TRAVEL
  INVESTMENT
  TRANSFER
  CASH_WITHDRAWAL
  OTHER
}

enum LoanStatus {
  PENDING
  APPROVED
  DISBURSED
  REJECTED
  PAID
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  phoneNumber  String        @unique
  fullName     String
  role         Role          @default(BORROWER)
  panNumber    String?
  aadhaarHash  String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  documents    Document[]
  bankAccounts BankAccount[]
  creditScores CreditScore[]
  
  // Relations for Loans: A user can be a borrower or a lender
  borrowedLoans Loan[]       @relation("BorrowerRelation")
  approvedLoans Loan[]       @relation("LenderRelation")
  
  auditLogs    AuditLog[]
  aiPredictions AIPrediction[]
}

model Document {
  id           String           @id @default(uuid())
  userId       String
  fileName     String
  fileUrl      String
  fileType     DocumentType
  status       ProcessingStatus @default(PENDING)
  fileHash     String?          // For file integrity check
  uploadedAt   DateTime         @default(now())
  
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@index([userId])
}

model BankAccount {
  id                 String   @id @default(uuid())
  userId             String
  bankName           String
  accountNumber      String
  accountHolderName  String
  ifscCode           String
  currentBalance     Decimal  @db.Decimal(12, 2)
  averageBalance     Decimal  @db.Decimal(12, 2)
  createdAt          DateTime @default(now())
  
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions       Transaction[]
  
  @@index([userId])
}

model Transaction {
  id               String              @id @default(uuid())
  bankAccountId    String
  documentId       String?
  transactionDate  DateTime
  description      String
  category         TransactionCategory @default(OTHER)
  type             TransactionType
  amount           Decimal             @db.Decimal(12, 2)
  referenceNumber  String?
  isRecurring      Boolean             @default(false)
  isFlagged        Boolean             @default(false)
  createdAt        DateTime            @default(now())
  
  bankAccount      BankAccount         @relation(fields: [bankAccountId], references: [id], onDelete: Cascade)
  document         Document?           @relation(fields: [documentId], references: [id], onDelete: SetNull)
  
  @@index([bankAccountId])
  @@index([category])
  @@index([transactionDate])
}

model CreditScore {
  id                     String        @id @default(uuid())
  userId                 String
  score                  Int
  incomeStabilityScore   Int
  cashFlowScore          Int
  businessHealthScore    Int
  riskScore              Int
  debtBurden             Decimal       @db.Decimal(5, 2) // percentage
  repaymentProbability   Decimal       @db.Decimal(5, 2) // probability 0.0 to 1.0
  fraudProbability       Decimal       @db.Decimal(5, 2) // probability 0.0 to 1.0
  explanations           Json          // Array of strings or detail key-value pairs
  generatedAt            DateTime      @default(now())
  
  user                   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  riskAnalysis           RiskAnalysis?
  
  @@index([userId, generatedAt])
}

model RiskAnalysis {
  id                 String      @id @default(uuid())
  creditScoreId      String      @unique
  totalMonthlyIncome  Decimal     @db.Decimal(12, 2)
  totalMonthlyExpense Decimal     @db.Decimal(12, 2)
  debtToIncomeRatio  Decimal     @db.Decimal(5, 2) // percentage
  overdraftCount     Int         @default(0)
  upiCount           Int         @default(0)
  upiVolume          Decimal     @db.Decimal(12, 2)
  categoryBreakdown  Json        // Category percentages/totals
  createdAt          DateTime    @default(now())
  
  creditScore        CreditScore @relation(fields: [creditScoreId], references: [id], onDelete: Cascade)
}

model Loan {
  id                  String     @id @default(uuid())
  borrowerId          String
  lenderId            String?
  amount              Decimal    @db.Decimal(12, 2)
  tenureMonths        Int
  interestRate        Decimal    @db.Decimal(5, 2) // APR percentage
  safeEmi             Decimal    @db.Decimal(12, 2)
  approvalProbability Decimal    @db.Decimal(5, 2) // percentage 0.00 to 1.00
  category            String
  status              LoanStatus @default(PENDING)
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
  
  borrower            User       @relation("BorrowerRelation", fields: [borrowerId], references: [id], onDelete: Cascade)
  lender              User?      @relation("LenderRelation", fields: [lenderId], references: [id], onDelete: SetNull)
  
  @@index([borrowerId])
  @@index([lenderId])
}

model AIPrediction {
  id                   String   @id @default(uuid())
  userId               String
  modelName            String
  predictionType       String   // e.g. "DEFAULT_PROBABILITY", "CASHFLOW_FORECAST"
  inputFeatures        Json
  outputProbabilities  Json
  explainabilityData   Json     // SHAP / relative feature weight data
  createdAt            DateTime @default(now())
  
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  ipAddress String?
  userAgent String?
  details   Json?
  timestamp DateTime @default(now())
  
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([timestamp])
}
