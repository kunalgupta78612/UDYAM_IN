AI-Driven Government Scheme Matching System

Full Frontend + Backend Development Plan

1. Product Goal

Build a Hindi/English conversational application that helps marginalized entrepreneurs discover government schemes and understand whether they are eligible.

The application should support two user journeys:

Journey A — User knows the scheme

Example:

«"I want to apply for Stand-Up India."»

The system searches for that specific scheme and then asks only the information required to evaluate it.

Journey B — User does not know the scheme

Example:

«"I want a loan to start a tailoring business."»

The system identifies the user's purpose/category/business type, filters the scheme database, finds relevant schemes, and then asks the information required to determine eligibility.

The final system must return:

- ELIGIBLE
- NOT ELIGIBLE
- NEED INFO

For every eligibility result, show the individual conditions and why each condition passed or failed.

The LLM must NOT make the final eligibility decision. The LLM is used for natural-language understanding, slot filling, and explaining results. The deterministic rule engine makes the actual eligibility decision. This follows the submitted architecture.

---

2. High-Level Architecture

                    USER
                      |
                      v
             React + Vite Frontend
                      |
                      v
              Chat Interface
                      |
          +-----------+-----------+
          |                       |
       Text Input             Voice Input
          |                       |
          |                 Web Speech API
          |                       |
          +-----------+-----------+
                      |
                      v
              Node + Express API
                      |
                      v
              Conversation Manager
                      |
             +--------+--------+
             |                 |
             v                 v
       LLM Service       Scheme Retrieval
             |                 |
             |                 v
             |          MongoDB Schemes
             |                 |
             +--------+--------+
                      |
                      v
               Profile Builder
                      |
                      v
                Rule Engine
                      |
              +-------+-------+
              |       |       |
              v       v       v
           Eligible  Not     Need Info
                    Eligible
              |
              v
        Explanation Generator
              |
              v
          Frontend Result

---

3. Technology Stack

Frontend

- React
- Vite
- JavaScript/TypeScript
- Tailwind CSS
- React Router
- i18next for Hindi/English
- Web Speech API for voice
- PWA support

The proposal specifies React + Vite, Hindi/English i18n and a PWA that can cache the rule corpus for offline matching.

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- LLM API
- Rule evaluation service

The proposal specifies Node.js + Express with a rule evaluator, stack solver and match logging, with MongoDB storing schemes, profiles and match logs.

---

4. Frontend Folder Structure

frontend/
│
├── src/
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── QuickReplies.jsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileCard.jsx
│   │   │   ├── ProfileField.jsx
│   │   │   └── ProfileConfirmation.jsx
│   │   │
│   │   ├── schemes/
│   │   │   ├── SchemeCard.jsx
│   │   │   ├── SchemeList.jsx
│   │   │   ├── EligibilityBadge.jsx
│   │   │   ├── EligibilityTrace.jsx
│   │   │   └── SchemeDetails.jsx
│   │   │
│   │   ├── results/
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── GapReport.jsx
│   │   │   ├── NextAction.jsx
│   │   │   └── FundingStack.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── LanguageToggle.jsx
│   │   │   ├── VoiceButton.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorMessage.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Chat.jsx
│   │   ├── Schemes.jsx
│   │   └── Results.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── chatService.js
│   │   └── voiceService.js
│   │
│   ├── hooks/
│   │   ├── useChat.js
│   │   └── useSpeech.js
│   │
│   ├── context/
│   │   ├── LanguageContext.jsx
│   │   └── ChatContext.jsx
│   │
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── validators.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│   └── icons/
│
├── package.json
└── vite.config.js

---

5. Frontend Screens

Screen 1 — Home

Simple landing page.

-----------------------------------------
        SchemeSaathi
-----------------------------------------

Find the right government scheme
for your business.

[ Start Chat ]

I know my scheme
I don't know my scheme

Hindi | English
-----------------------------------------

Do not make the home page complicated.

---

6. Screen 2 — Chat

This is the main screen.

Example:

┌──────────────────────────────────────┐
│ SchemeSaathi        हिंदी | English │
├──────────────────────────────────────┤
│                                      │
│ 🤖 Hello! I can help you find        │
│ government schemes for your business.│
│                                      │
│ Do you already know the scheme       │
│ you want to apply for?               │
│                                      │
│ [Yes, I know] [No, help me find one] │
│                                      │
├──────────────────────────────────────┤
│ Type your message...       🎤  ➤    │
└──────────────────────────────────────┘

---

7. Conversation Flow

Step 1 — Identify user intent

The chatbot first asks:

«Do you already know the name of the scheme?»

Options:

[ I know the scheme ]

[ Help me find a scheme ]

---

Path A — Known Scheme

User:

«I want Stand-Up India.»

Frontend sends:

{
  "message": "I want Stand-Up India",
  "conversationId": "..."
}

Backend searches the scheme collection.

If found:

🤖 Great! I found Stand-Up India.

I'll ask a few questions to check your eligibility.

Then the system identifies the fields required by that scheme.

---

8. Path B — User Doesn't Know Scheme

User:

«I don't know.»

Chatbot:

What kind of help are you looking for?

[ Start a new business ]
[ Business loan ]
[ Working capital ]
[ Women entrepreneur support ]
[ Education ]
[ Skill/training ]
[ Agriculture ]
[ Other ]

User:

«Business loan.»

Then:

«What type of business are you planning?»

User:

«Tailoring shop.»

Now the system has:

{
  "purpose": "business_loan",
  "businessType": "tailoring"
}

The backend searches the scheme database using metadata.

It does NOT send thousands of schemes to the LLM.

---

9. Scheme Retrieval Strategy

This is extremely important.

Do NOT do:

5000 schemes
    ↓
Send all to LLM
    ↓
Ask LLM to choose

Instead:

5000 schemes
      ↓
Database filters
      ↓
Business-related schemes
      ↓
Loan-related schemes
      ↓
Category/business/gender filters
      ↓
10–30 relevant schemes
      ↓
Detailed eligibility evaluation

MongoDB indexes should be created for frequently searched fields such as:

category
gender
purpose
businessType
state
incomeLimit
schemeType

---

10. Profile Builder

Maintain one structured profile during the conversation.

Example:

{
  "category": "OBC",
  "gender": "female",
  "age": 25,
  "familyIncome": 250000,
  "businessType": "tailoring",
  "projectCost": 600000,
  "udyamRegistered": true,
  "state": "Madhya Pradesh"
}

Every user response updates this profile.

For example:

User:

«"Meri income 2.5 lakh hai."»

LLM extracts:

{
  "familyIncome": 250000
}

The backend stores the structured value.

---

11. Profile Confirmation

Because voice and LLM extraction can make mistakes, ALWAYS show the extracted information before eligibility checking.

Example:

Please confirm your information:

Category       OBC
Gender         Female
Income         ₹2,50,000
Business       Tailoring
Project Cost   ₹6,00,000
Udyam          Yes

[ Confirm ]
[ Edit ]

This is directly aligned with the proposal's strategy of confirming every extracted field before matching.

---

12. Dynamic Question System

Different schemes require different information.

Do NOT create one giant fixed questionnaire.

Instead, every scheme defines its required fields.

Example:

{
  "requiredFields": [
    "category",
    "familyIncome",
    "age",
    "businessType",
    "projectCost"
  ]
}

Another scheme may require:

{
  "requiredFields": [
    "category",
    "gender",
    "familyIncome",
    "businessType"
  ]
}

The conversation manager checks:

Required fields
        -
Known fields
        =
Missing fields

Then asks for the missing information.

Example:

Known:
category
income
businessType

Missing:
age
projectCost
udyamStatus

Chatbot asks:

«What is your age?»

Then:

«What is your estimated project cost?»

Then:

«Do you have Udyam registration?»

---

13. Rule Engine

Create a separate backend module:

backend/
└── src/
    └── rules/
        ├── ruleEngine.js
        ├── operators.js
        ├── conditionEvaluator.js
        └── traceGenerator.js

The rule engine receives:

User Profile
+
Scheme Rules

and returns:

{
  "status": "ELIGIBLE",
  "conditions": [
    {
      "field": "category",
      "result": true,
      "reason": "OBC is an accepted category"
    },
    {
      "field": "familyIncome",
      "result": true,
      "reason": "Income is below the permitted limit"
    }
  ]
}

---

14. Example Scheme JSON

Every scheme should be stored in a structured format.

Example:

{
  "schemeId": "scheme_001",
  "name": "Example Business Loan",
  "version": 2,

  "purpose": [
    "business_loan",
    "new_business"
  ],

  "eligibleCategories": [
    "OBC",
    "SC"
  ],

  "conditions": [
    {
      "field": "familyIncome",
      "operator": "<=",
      "value": 300000,
      "unit": "INR",
      "clause": "Eligibility - Income",
      "sourceUrl": "OFFICIAL_SOURCE_URL"
    },

    {
      "field": "age",
      "operator": ">=",
      "value": 18,
      "clause": "Eligibility - Age",
      "sourceUrl": "OFFICIAL_SOURCE_URL"
    },

    {
      "field": "projectCost",
      "operator": "<=",
      "value": 1000000,
      "clause": "Loan Limit",
      "sourceUrl": "OFFICIAL_SOURCE_URL"
    }
  ],

  "applicationRoute": {
    "type": "SCA",
    "description": "Apply through State Channelizing Agency"
  },

  "verifiedOn": "2026-09-01"
}

The submitted proposal specifically requires each scheme record to contain conditions, source URL, clause reference and verification date.

---

15. Eligibility Trace

Do not simply show:

«Eligible.»

Show WHY.

Example:

Scheme A

Eligibility

Category
OBC
✅ Passed

Income
₹2,50,000
Limit ₹3,00,000
✅ Passed

Age
25
Minimum 18
✅ Passed

Project Cost
₹6,00,000
Maximum ₹10,00,000
✅ Passed

--------------------------------

🟢 ELIGIBLE

For failure:

🔴 NOT ELIGIBLE

Income
Your income: ₹4,50,000
Maximum: ₹3,00,000

❌ Failed

Reason:
Income exceeds the permitted limit.

Clause:
Eligibility - Income

This "rejection reasoning" is one of the core innovations stated in the proposal.

---

16. NEED INFO

If the system cannot determine eligibility:

🟡 NEED MORE INFORMATION

We need:

Age
Project Cost

[ Continue Chat ]

Do not mark the user as NOT ELIGIBLE simply because information is missing.

---

17. Results Page

Show three sections:

Your Results

🟢 Eligible
   3 schemes

🟡 Need More Information
   2 schemes

🔴 Not Eligible
   5 schemes

Each scheme has:

Scheme Name
Short description

Eligibility:
🟢 Eligible

Why?
✓ Category
✓ Income
✓ Age
✓ Project Cost

[ View Details ]
[ How to Apply ]

---

18. Gap Report

For an ineligible scheme, show the gap.

Example:

Scheme B

❌ Not Eligible

Income requirement:
Maximum ₹3,00,000

Your income:
₹4,00,000

Gap:
₹1,00,000 above the limit

This turns a rejection into useful guidance.

---

19. Next Action

Every eligible scheme should tell the user where to go next.

Example:

Next Step

You cannot apply directly to NSFDC.

Application route:
State Channelizing Agency

[ View Application Route ]

The proposal specifically identifies routing applicants to the correct SCA/bank/incubator as part of the actionable output.

---

20. Funding Stack

This should be a Phase 2 feature.

Example:

Possible Funding Combination

Scheme A
₹5 lakh loan

+

Stand-Up India
Margin support

--------------------------------

Potential combined support:
₹X

⚠ Subject to scheme rules and
official approval.

The proposal calls this "funding stacks" and identifies convergence with other Central/State schemes as an innovation.

Do NOT build complicated optimization initially.

First make individual scheme matching reliable.

---

21. Voice

Use the Web Speech API.

Flow:

User presses 🎤
       ↓
Browser listens
       ↓
Speech → Text
       ↓
Text sent to backend
       ↓
LLM extracts fields
       ↓
Chatbot responds

For example:

User speaks:

«"Meri annual income dhai lakh hai."»

Speech recognition produces text.

LLM converts it into:

{
  "familyIncome": 250000
}

Always show the extracted value for confirmation because speech recognition can be imperfect. The proposal explicitly identifies dialect/noisy-environment recognition as a risk.

---

22. Backend Folder Structure

backend/
│
├── src/
│   │
│   ├── controllers/
│   │   ├── chatController.js
│   │   ├── schemeController.js
│   │   ├── profileController.js
│   │   └── matchController.js
│   │
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   ├── schemeRoutes.js
│   │   ├── profileRoutes.js
│   │   └── matchRoutes.js
│   │
│   ├── models/
│   │   ├── Scheme.js
│   │   ├── Profile.js
│   │   ├── Conversation.js
│   │   └── MatchLog.js
│   │
│   ├── services/
│   │   ├── llmService.js
│   │   ├── schemeService.js
│   │   ├── profileService.js
│   │   ├── conversationService.js
│   │   └── matchingService.js
│   │
│   ├── rules/
│   │   ├── ruleEngine.js
│   │   ├── conditionEvaluator.js
│   │   ├── operators.js
│   │   └── traceGenerator.js
│   │
│   ├── retrieval/
│   │   ├── schemeRetriever.js
│   │   ├── filters.js
│   │   └── ranking.js
│   │
│   ├── prompts/
│   │   ├── slotFillingPrompt.js
│   │   └── explanationPrompt.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validation.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── normalization.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── app.js
│   └── server.js
│
├── seed/
│   └── schemes.json
│
├── package.json
└── .env

---

23. MongoDB Collections

schemes

Stores government schemes.

schemes
├── schemeId
├── name
├── description
├── purpose
├── categories
├── gender
├── states
├── conditions[]
├── requiredFields[]
├── applicationRoute
├── source
├── version
└── verifiedOn

---

profiles

Stores the user's structured information.

profiles
├── conversationId
├── category
├── gender
├── age
├── familyIncome
├── businessType
├── projectCost
├── udyamRegistered
└── state

---

conversations

Stores chatbot state.

conversations
├── conversationId
├── messages[]
├── currentIntent
├── currentScheme
├── candidateSchemes[]
├── profile
└── status

---

matchLogs

Stores the evaluation result.

matchLogs
├── conversationId
├── schemeId
├── status
├── conditions[]
├── timestamp
└── ruleVersion

The proposal specifically mentions MongoDB collections for schemes, profiles and match logs.

---

24. API Design

Start conversation

POST /api/chat/start

Response:

{
  "conversationId": "abc123",
  "message": "Hello! Do you already know the scheme?"
}

---

Send message

POST /api/chat/message

Request:

{
  "conversationId": "abc123",
  "message": "I want a business loan"
}

Response:

{
  "message": "What type of business are you planning?",
  "profileUpdates": {
    "purpose": "business_loan"
  }
}

---

Search schemes

POST /api/schemes/search

Request:

{
  "purpose": "business_loan",
  "businessType": "tailoring",
  "category": "OBC"
}

---

Get scheme

GET /api/schemes/:schemeId

---

Match schemes

POST /api/match

Request:

{
  "profileId": "profile123",
  "schemeIds": [
    "scheme1",
    "scheme2"
  ]
}

Response:

{
  "results": [
    {
      "schemeId": "scheme1",
      "status": "ELIGIBLE",
      "trace": []
    },
    {
      "schemeId": "scheme2",
      "status": "NOT_ELIGIBLE",
      "trace": []
    }
  ]
}

---

25. LLM Responsibilities

The LLM should have ONLY these major responsibilities:

1. Understand user language

"Meri income 2.5 lakh hai"

→

familyIncome = 250000

2. Detect intent

"I need a loan for my tailoring business"

→

purpose = business_loan
businessType = tailoring

3. Identify missing conversational information

Based on the current required fields, help formulate the next question.

4. Explain results

Convert technical rule-engine results into simple Hindi/English.

---

26. LLM Must NOT Do

Do NOT allow the LLM to directly decide:

Eligible = true

Instead:

LLM
 ↓
Extract data
 ↓
Rule Engine
 ↓
Eligibility

This is important because the proposal's core design decision is that the LLM stays outside the eligibility decision path.

---

27. Rule Engine Must Do

The rule engine should support basic operators initially:

==
!=
>
>=
<
<=
IN
NOT_IN

Example:

income <= 300000
category IN ["OBC", "SC"]
age >= 18
gender == "female"

Later you can support:

AND
OR
NOT

Example:

(category == "OBC")
AND
(income <= 300000)
AND
(age >= 18)

---

28. Scheme Retrieval Ranking

When many schemes match the basic filters, rank them.

Example scoring:

Exact purpose match      +5
Business type match      +4
Category match           +4
Gender match             +2
State match              +3
Income compatible        +3

Then show the highest-ranked schemes first.

IMPORTANT:

Ranking does not mean eligibility.

Ranking says:

«"This scheme looks relevant."»

The rule engine says:

«"This user satisfies the eligibility conditions."»

---

29. MVP — What to Build First

Do NOT try to build everything immediately.

Phase 1

Build:

React Chat UI
      ↓
Node API
      ↓
LLM slot extraction
      ↓
Profile
      ↓
MongoDB schemes
      ↓
Rule engine
      ↓
Eligibility result

Use around 10–18 verified schemes for the hackathon prototype. The submitted feasibility section specifically proposes 18 verified schemes within the hackathon window.

---

30. Phase 2

Add:

- Hindi/English switching
- Voice input
- Scheme search
- Dynamic questions
- Profile confirmation
- Eligibility trace
- Gap report
- Application routing

---

31. Phase 3

Add:

- Funding stack
- PWA/offline support
- Rule versioning
- Source monitoring
- Admin dashboard
- Match analytics

The proposal includes source verification/versioning and a watcher that flags stale rules.

---

32. Hackathon Demo Flow

The demo should NOT be a long complicated conversation.

Use one strong example.

Demo

User:

«"Hi"»

Bot:

«"Do you know which scheme you want?"»

User:

«"No."»

Bot:

«"What are you looking for?"»

User:

«"I want a loan to start a tailoring business."»

Bot:

«"What is your category?"»

User:

«"OBC."»

Bot:

«"What is your annual family income?"»

User:

«"₹2.5 lakh."»

Bot:

«"What is your project cost?"»

User:

«"₹6 lakh."»

Bot:

«"Do you have Udyam registration?"»

User:

«"Yes."»

Then:

Checking relevant schemes...

Result:

🟢 3 Eligible
🟡 1 Need Information
🔴 4 Not Eligible

Open one eligible scheme:

Scheme A

✓ Category
✓ Income
✓ Project Cost
✓ Udyam

ELIGIBLE

Next Action:
Apply through SCA

Then open one rejected scheme:

Scheme B

✗ Income

Required: ≤ ₹3 lakh
Your income: ₹4 lakh

NOT ELIGIBLE

Reason:
Income exceeds the scheme limit.

This directly demonstrates the project's major differentiator: not just finding schemes, but explaining why the applicant qualifies or doesn't qualify and what to do next.

---

33. Important Development Rule

Build in this order:

1. Database schema
        ↓
2. Scheme JSON format
        ↓
3. Rule engine
        ↓
4. Scheme retrieval
        ↓
5. Profile extraction
        ↓
6. Conversation manager
        ↓
7. API
        ↓
8. Chat UI
        ↓
9. Results UI
        ↓
10. Voice
        ↓
11. Funding stack

Do not start by making the chatbot UI beautiful.

First prove:

Profile
   +
Scheme
   ↓
Correct eligibility result

Once that works, connect the chatbot.

---

34. Final Architecture

The final product should essentially behave like this:

                 👤 USER
                    |
                    v
              💬 CHATBOT
                    |
          Hindi / English / Voice
                    |
                    v
              🤖 LLM
       Understand user's language
                    |
                    v
             USER PROFILE
                    |
                    v
          🔎 SCHEME RETRIEVER
                    |
             5000 schemes
                    |
             Fast filtering
                    |
             10–30 candidates
                    |
                    v
             ⚙️ RULE ENGINE
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
    ELIGIBLE    NOT ELIGIBLE  NEED INFO
        |           |           |
        +-----------+-----------+
                    |
                    v
             📋 EXPLANATION
                    |
                    v
             🎯 NEXT ACTION
              /     |      \
             SCA   Bank   Incubator

Core principle

LLM talks.

Database retrieves.

Rule engine decides.

LLM explains.

That is the architecture Antigravity should implement.