# AI Models & OCR Service Specification
## Alternative Credit Assessment Platform (v1.0)

This document details the Machine Learning modeling pipeline, OCR statement processing architecture, feature engineering formulas, Explainable AI translations, and transaction classification mechanics.

---

## 1. Document OCR & Ingestion Pipeline

To parse bank statements, we implement a hybrid engine handling digital vector PDFs, scanned PDF files, and image files.

```
                  +--------------------------+
                  |  Uploaded Statement File |
                  +--------------------------+
                               |
            +------------------+------------------+
            |                                     |
   [Vector Digital PDF]                  [Scanned Image / PDF]
            |                                     |
      (pdfplumber)                     (Image Pre-processing)
            |                            * Grayscale & Thresholding
            |                            * Deskewing / Alignment
            |                                     |
            |                                (Tesseract OCR)
            +------------------+------------------+
                               |
                               v
                     [Raw Extracted Text]
                               |
                      (Regex Regex Engine)
             * Layout Identification: HDFC/ICICI/SBI
             * Extract Date, Description, Amount, Type
                               |
                               v
                  [Standard Transaction JSON]
```

### Preprocessing & Layout Adapters
* **Image Preprocessing**: Skewed statement photos are adjusted using OpenCV deskew algorithms. Grayscale filters and Otsu's thresholding are applied to maximize Tesseract text extraction accuracy.
* **Layout Identification**: The pipeline scans the header block to determine the source bank (e.g., "HDFC BANK" or "ICICI Bank"). It then uses specific Regex templates matching the bank's transaction table layout to parse fields:
  * Date column format (e.g., `DD/MM/YY`).
  * Unified or split Withdrawal (Debit) and Deposit (Credit) columns.
  * Transaction description cleaning (stripping routing details).

---

## 2. NLP Transaction Classifier

We use a machine learning model to map messy transaction descriptions into 14 financial categories.

### Model Architecture:
* **Feature Vectorizer**: TF-IDF (Term Frequency-Inverse Document Frequency) char-gram analyzer (`ngram_range=(2, 5)`).
* **Classifier Model**: Multinomial Naive Bayes or Logistic Regression for rapid online inference.
* **Target Categories**: `SALARY`, `BUSINESS_INCOME`, `RENT`, `UTILITIES`, `SHOPPING`, `EMIS`, `INSURANCE`, `SUBSCRIPTIONS`, `FOOD`, `MEDICAL`, `TRAVEL`, `INVESTMENT`, `TRANSFER`, `CASH_WITHDRAWAL`.

### Example Mapping Patterns:
* `"UPI-PAYTM-KIRANASTORE@okaxis"` $\rightarrow$ **SHOPPING**
* `"ACH-HDFCBANK-LOAN-EMI"` $\rightarrow$ **EMIS**
* `"INTEREST RECEIVED ACTIVE SAVINGS"` $\rightarrow$ **INVESTMENT**
* `"SALARY CREDIT - TECHCORP LTD"` $\rightarrow$ **SALARY**

---

## 3. Alternative Credit Scoring Engine

The Credit scoring engine translates raw transaction tables into a robust creditworthiness metric.

### 3.1 Feature Store Vector
For each user, we calculate a vector of features $X$ over a rolling 6-month window:

| Feature Name | Description | Formula |
|---|---|---|
| `savings_ratio` | Percentage of income saved. | $\frac{\sum \text{Credits} - \sum \text{Debits}}{\sum \text{Credits}}$ |
| `income_volatility` | Standard deviation of monthly credits. | $\sigma(\text{Monthly Credits})$ |
| `emi_to_income` | Debt burden ratio. | $\frac{\sum \text{Debits(Category=EMI)}}{\sum \text{Credits(Category=Salary/Business)}}$ |
| `overdraft_frequency`| Count of NSF / Balance-insufficient events. | $\sum \text{Transactions(Description contains 'NSF'/'OD')}$ |
| `upi_activity` | Transaction volume ratio over UPI. | $\frac{\sum \text{Count(UPI)}}{\text{Total Transaction Count}}$ |
| `balance_slope` | Linear trend of daily ending balances. | Least-squares slope of daily balances over time |

### 3.2 Scoring Model
We train an **XGBoost Classifier** to predict the Probability of Default ($PD \in [0, 1]$).
The model output is then mapped to the final Credit Score:
$$\text{Credit Score} = (1 - PD) \times 1000$$

* **Low Risk**: $PD < 0.15$ (Score $\ge 850$)
* **Medium Risk**: $0.15 \le PD \le 0.40$ (Score $600 - 850$)
* **High Risk**: $PD > 0.40$ (Score $< 600$)

---

## 4. Explainable AI (XAI) Translator

To avoid the "black box" problem and satisfy regulators, we compute feature impact weights using **SHAP (SHapley Additive exPlanations)**.

```
       +--------------------------------------------------------+
       | Model Prediction Impact (SHAP Values)                  |
       |                                                        |
       |  savings_ratio:       +0.12  [Highly Positive]          |
       |  emi_to_income:        -0.08  [Negative Impact]         |
       |  overdraft_frequency:  0.00   [Neutral]                 |
       |  balance_slope:       +0.05  [Positive]                |
       +--------------------------------------------------------+
                                   |
                                   v
             [XAI Rule-Based Natural Language Engine]
                                   |
                                   v
       +--------------------------------------------------------+
       | Explainable AI Report Bullet-Points:                   |
       |                                                        |
       |  ✔ High monthly savings ratio increases score.         |
       |  ▲ Active EMIs are consuming 22% of monthly earnings.  |
       |  ✔ Consistent upward bank balance slope detected.      |
       +--------------------------------------------------------+
```

---

## 5. Anomaly & Statement Fraud Detection

To protect partner banks from forged PDFs, the system runs active document integrity scans:

1. **Metadata Integrity Check**:
   * Inspect PDF creation metadata. Statements exported directly from banks typically carry specific headers (e.g. `Creator: Oracle Reports` or `Producer: Adobe PDF Library`). If the file has metadata referencing `Canva`, `Adobe Acrobat Edit`, or `LibreOffice`, it is flagged for manual review.
2. **Mathematical Verification Check**:
   * Ensure that the ending balance of each day is mathematically consistent:
     $$\text{Balance}_{t} = \text{Balance}_{t-1} + \text{Credit}_{t} - \text{Debit}_{t}$$
   * If any single transaction amount fails to reconcile with the subsequent balance, the document is flagged as **Tampered / Fraudulent**.
3. **Statistical Outlier Scan**:
   * We train an **Isolation Forest** model on transaction distributions (frequency, amount size, timing). Unusual credits (e.g., a sudden ₹10,00,000 credit in a Kirana shop statement that doesn't correspond to previous transaction behavior) are isolated and flagged for verification.
