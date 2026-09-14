# SchemeSaathi (UDYAM_IN)
> **AI-Driven Government Scheme Matching & Actionable Advisory System**  
> *Developed for the Smart India Hackathon (SIH)*

---

## 🌟 Core Architecture & Innovation

1. **Deterministic Rule Engine (Zero AI Hallucination):** The LLM never decides eligibility. The LLM only handles NLU and explanations; verified government guidelines and arithmetic operators (`<=`, `>=`, `IN`) determine eligibility.
2. **2-Stage Fast Retrieval Pipeline:** Filters 5,000+ schemes down to candidate subsets in <5ms using indexed metadata.
3. **Triaged 3-Bucket Status:** `ELIGIBLE`, `NOT_ELIGIBLE`, and `NEED_INFO`.
4. **Legal Provenance Audit Traces:** Every checkmark links directly to official government gazettes, clauses, and ministry circulars.
5. **Rejection Gap Analysis:** Explains exact quantitative deficiencies (e.g., *"Income exceeds limit by ₹1,00,000"*).
6. **Funding Stacks (Scheme Convergence):** Recommends complementary combinations (e.g., PMEGP Capital Subsidy + MUDRA Term Loan).
7. **Bilingual Voice & Text Interface:** Supports Hindi, English, and Hinglish with Web Speech API integration.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend App (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in Google Chrome.

### 3. Run Automated Tests
```bash
cd backend
npm test
```
*All 29 automated test suites pass with 100% test coverage.*

---

## 🎭 3-Minute SIH Jury Demo Personas

On the Chat page, click any of the 1-Click Demo Personas:
1. 👩 **Savitri Bai (OBC Woman Artisan / Tailor):**
   * *Income:* ₹2,50,000 | *Age:* 28 | *Cost:* ₹1,50,000
   * *Output:* 🟢 Matches **NBCFDC New Swarnima**, **PM Vishwakarma**, **PMEGP**.
2. 👨 **Ramesh Kumar (SC Tech / Startup Promoter):**
   * *Income:* ₹2,80,000 | *Age:* 25 | *Cost:* ₹25,00,000
   * *Output:* 🟢 Matches **NSFDC Term Loan**, **ASIIM Incubation Mission**, **Stand-Up India**.
3. 🧑 **Vikas Sharma (General Small Vendor):**
   * *Income:* ₹4,50,000 | *Age:* 32 | *Cost:* ₹40,000
   * *Output:* 🟢 Matches **MUDRA Shishu** (Collateral-free micro loan); provides clean Gap Reports for reserved schemes.
