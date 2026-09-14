TASK: Build the Government Scheme Database for Scheme Matching

We are building an AI-driven Government Scheme Matching application.

The purpose of this database is to allow our backend to:

1. Find schemes relevant to what a user wants.
2. Determine whether the user is eligible.
3. Explain exactly which eligibility conditions passed or failed.
4. Show the official source and clause for every important rule.
5. Ask the user for additional information when required.

IMPORTANT:
Do NOT invent, guess, or hallucinate any government scheme eligibility condition.

All eligibility rules must come from an official government source or official scheme document.

---

1. Initial Scope

For the hackathon MVP, create a verified corpus of approximately 18 schemes.

Start with schemes from these sources:

- NSFDC
- NBCFDC
- NSKFDC
- Stand-Up India
- ASIIM / Venture Capital Fund for Scheduled Castes

The project proposal specifically identifies these as the initial data sources.

Do not attempt to scrape thousands of schemes initially.

The architecture must, however, support adding thousands of schemes later without changing the rule engine code.

---

2. Research Process

For every scheme:

1. Find the official government website/document.
2. Read the eligibility section.
3. Read the financial/loan/funding conditions.
4. Read age/category/gender/business requirements where applicable.
5. Read application procedure.
6. Record the official source URL.
7. Record the exact clause/section where the condition was found.
8. Record the date on which the information was verified.
9. If two official government sources disagree, DO NOT silently choose one.
10. Store both sources and mark the conflict.

Priority of sources:

1. Official scheme guidelines/PDF
2. Official ministry/corporation website
3. Official government portal
4. Other sources only for discovery, NOT as the final authority

---

3. Database Schema

Create a MongoDB "schemes" collection.

Each scheme should follow this structure:

{
"schemeId": "unique-id",

"name": "Scheme Name",

"shortDescription": "Simple description",

"organization": {
"name": "NSFDC/NBCFDC/etc",
"ministry": "Ministry name"
},

"version": 1,

"status": "ACTIVE",

"purpose": [
"business_loan",
"new_business",
"working_capital"
],

"targetBeneficiaries": [
"SC",
"OBC",
"women"
],

"applicableGender": [
"female",
"male",
"all"
],

"applicableCategories": [
"SC",
"OBC"
],

"states": [
"ALL"
],

"requiredFields": [
"category",
"familyIncome",
"age",
"businessType",
"projectCost"
],

"conditions": [],

"financialBenefits": {
"loanAmount": null,
"subsidy": null,
"marginMoney": null,
"interestRate": null
},

"applicationRoute": {
"type": "SCA",
"name": "",
"description": ""
},

"documents": [],

"sources": [],

"verifiedOn": "YYYY-MM-DD"
}

---

4. Condition Structure

Every eligibility condition must be represented as a machine-readable rule.

Example:

{
"conditionId": "income_001",

"field": "familyIncome",

"operator": "<=",

"value": 500000,

"unit": "INR",

"description": "Annual family income must not exceed ₹5 lakh",

"clause": "Eligibility - Income",

"sourceId": "source_001",

"required": true
}

Supported operators initially:

- ==
- !=
- «»
- «=»
- <
- <=
- IN
- NOT_IN

Later support:

- AND
- OR
- NOT

---

5. Missing Information

The system must know what information is needed before checking eligibility.

For example:

{
"requiredFields": [
"category",
"familyIncome",
"age",
"businessType",
"projectCost",
"udyamRegistered"
]
}

If the user has provided:

{
"category": "OBC",
"familyIncome": 250000,
"businessType": "tailoring"
}

but age and projectCost are missing, the backend must return:

{
"status": "NEED_INFO",

"missingFields": [
"age",
"projectCost"
]
}

The chatbot can then ask the user those questions.

Do NOT mark a user as NOT_ELIGIBLE just because information is missing.

---

6. Source / Provenance Structure

Every important numerical or eligibility rule MUST have provenance.

Example:

{
"sourceId": "source_001",

"title": "Official Scheme Guidelines",

"organization": "Government Organization",

"url": "OFFICIAL_URL",

"documentType": "official_guideline",

"clause": "Section 3 - Eligibility",

"page": 4,

"verifiedOn": "2026-09-01"
}

If page number is not available, use:

"page": null

Do not fabricate a page number.

---

7. Handling Conflicting Government Sources

This is extremely important.

If:

Official Source A says:

Income limit = ₹3 lakh

and

Official Source B says:

Income limit = another amount

DO NOT average them.

DO NOT choose one silently.

Store:

{
"conflict": true,

"conflictDetails": [
{
"value": 300000,
"sourceId": "source_A"
},
{
"value": 500000,
"sourceId": "source_B"
}
]
}

Add an admin warning:

"Official sources contain conflicting information. Human verification required."

The application should be able to display the conflict.

---

8. Scheme Retrieval Metadata

We need fast filtering before the rule engine.

Add searchable metadata such as:

- purpose
- categories
- gender
- state
- businessType
- schemeType
- organization
- beneficiaryType

Create MongoDB indexes for commonly searched fields.

For example:

db.schemes.createIndex({ purpose: 1 })

db.schemes.createIndex({ applicableCategories: 1 })

db.schemes.createIndex({ applicableGender: 1 })

db.schemes.createIndex({ businessTypes: 1 })

db.schemes.createIndex({ states: 1 })

The purpose is:

5000 schemes
↓
Database filtering
↓
Relevant schemes
↓
Rule engine

We must NOT send thousands of schemes to the LLM.

---

9. Business Type Normalization

Users may use different words for the same business.

Examples:

"silai ki shop"
"tailoring shop"
"tailoring business"
"silai center"

All should map to:

"tailoring"

Create a normalization mapping:

{
"tailoring": [
"tailoring",
"tailor shop",
"silai",
"silai shop",
"silai center",
"stitching business"
]
}

Do the same for common business categories.

The LLM can perform natural-language extraction, but the final stored value should be normalized.

---

10. Purpose Taxonomy

Create a controlled list of purposes.

Initial values:

- business_loan
- new_business
- working_capital
- expansion
- women_entrepreneur
- self_employment
- skill_training
- agriculture
- education
- startup
- manufacturing
- service_business
- other

A scheme can have multiple purposes.

---

11. Example User Flow

User says:

"I want a loan to start a tailoring business."

LLM extracts:

{
"purpose": "business_loan",
"businessType": "tailoring"
}

Database retrieves relevant schemes.

For example:

5000 schemes
↓
business_loan
↓
business/new_business
↓
tailoring-related
↓
category/gender/state filtering
↓
candidate schemes

The rule engine then evaluates those candidate schemes.

---

12. Rule Engine Output

The database must support this output:

{
"schemeId": "scheme_001",

"status": "ELIGIBLE",

"conditions": [
{
"field": "category",
"userValue": "OBC",
"requiredValue": ["OBC", "SC"],
"result": true,
"clause": "Eligibility",
"sourceId": "source_001"
},

{
  "field": "familyIncome",
  "userValue": 250000,
  "requiredValue": 300000,
  "operator": "<=",
  "result": true,
  "clause": "Income Eligibility",
  "sourceId": "source_002"
}

]
}

The frontend can use this to display:

Category       ✅ Passed

Income         ✅ Passed

Age            ✅ Passed

Project Cost   ❌ Failed

---

13. Three Possible Results

The database/rule engine must support exactly these major states:

ELIGIBLE

All required conditions pass.

NOT_ELIGIBLE

At least one mandatory condition definitively fails.

NEED_INFO

The system does not have enough information to evaluate all mandatory conditions.

---

14. Application Route

Store where the applicant actually needs to apply.

Possible values:

- SCA
- BANK
- INCUBATOR
- ONLINE_PORTAL
- OTHER

Example:

{
"applicationRoute": {
"type": "SCA",
"name": "State Channelizing Agency",
"url": "OFFICIAL_URL",
"description": "Applicant must apply through the designated State Channelizing Agency."
}
}

Do not invent application URLs.

Only use official URLs.

---

15. Financial Information

Where applicable, store:

- minimum loan
- maximum loan
- interest rate
- subsidy
- margin money
- repayment period
- moratorium
- beneficiary contribution

Example:

{
"financialBenefits": {
"minimumLoan": 100000,
"maximumLoan": 1000000,
"interestRate": null,
"subsidy": null,
"marginMoney": null
}
}

If the official source does not provide a value:

null

Do NOT guess.

---

16. Documents

Store official required documents where available.

Example:

"documents": [
"Aadhaar",
"Income Certificate",
"Caste Certificate",
"Business Proposal"
]

Again, only add documents explicitly supported by the official source.

---

17. Initial Scheme Seed Data

Start by researching and creating records for the schemes identified in our project proposal.

NSFDC examples:

- Term Loan
- Udyam Nidhi Yojana
- Micro Finance
- Aajeevika

NBCFDC examples:

- New Swarnima
- Mahila Samriddhi
- Saksham
- Shilp Sampada
- Krishi Sampada

Also research appropriate schemes from:

- NSKFDC
- Stand-Up India
- ASIIM

The final number should be approximately 18 verified schemes for the MVP.

Do NOT invent additional schemes just to reach 18.

If fewer than 18 can be verified from official sources, leave the remaining slots empty and report them.

---

18. Seed Files

Create:

backend/
└── seed/
├── schemes.json
├── seedSchemes.js
└── README.md

"schemes.json" should contain the verified scheme records.

"seedSchemes.js" should insert/update them into MongoDB.

The script must support:

npm run seed

It should be safe to run multiple times without creating duplicate schemes.

Use schemeId + version as the uniqueness strategy.

---

19. Validation

Create a scheme schema validator.

Reject a scheme if:

- name is missing
- schemeId is missing
- conditions are malformed
- operator is unsupported
- required source is missing
- official source URL is missing
- verifiedOn is missing
- condition has no provenance

We want the database to fail loudly rather than silently accepting bad eligibility data.

---

20. Admin/Data Quality

Create a simple mechanism to identify:

- expired/stale schemes
- conflicting sources
- missing source
- missing verification date
- incomplete conditions

Example:

{
"dataQuality": {
"verified": true,
"hasConflict": false,
"needsReview": false
}
}

---

21. DO NOT Do These Things

DO NOT:

- Ask the LLM to decide eligibility.
- Put all schemes into an LLM prompt.
- Invent scheme conditions.
- Guess income limits.
- Guess loan amounts.
- Guess application URLs.
- Use random blogs as the final source.
- Automatically merge conflicting government information.
- Mark missing information as NOT_ELIGIBLE.
- Hard-code scheme-specific eligibility logic into JavaScript.

Eligibility must come from the scheme JSON.

---

22. Desired Architecture

The final system should work like:

USER
↓
LLM
↓
Structured Profile
↓
Scheme Retrieval
↓
Candidate Schemes
↓
Rule Engine
↓
ELIGIBLE / NOT_ELIGIBLE / NEED_INFO
↓
LLM Explanation
↓
User

The LLM understands the user's natural language.

MongoDB stores the schemes.

The retrieval layer finds relevant schemes.

The rule engine makes the eligibility decision.

The LLM explains the result.

---

23. Deliverables

Implement:

1. MongoDB Scheme model
2. Scheme JSON schema
3. Condition schema
4. Source/provenance schema
5. Scheme seed data
6. Seed script
7. MongoDB indexes
8. Scheme search/retrieval service
9. Rule engine compatible with the scheme JSON
10. Data validation
11. API endpoint for scheme search
12. API endpoint for scheme details
13. API endpoint for eligibility evaluation
14. README explaining the data model
15. README listing every official source used

Before coding the chatbot, make sure this database + rule engine works independently.

The first successful test should be:

Profile + Scheme JSON
→ Rule Engine
→ Correct ELIGIBLE / NOT_ELIGIBLE / NEED_INFO result
→ Clause-by-clause trace.