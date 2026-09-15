import { extractProfileSlots, generateConversationalReply } from './llmService.js';
import { findCandidateSchemes } from '../retrieval/schemeRetriever.js';
import { evaluateMultipleSchemes } from '../rules/ruleEngine.js';
import { isValueMissing } from '../rules/conditionEvaluator.js';

// Question templates with contextual quick-reply chips
const QUESTION_TEMPLATES = {
  specificScheme: {
    questionEn: 'Which government scheme would you like to evaluate?',
    questionHi: 'आप किस सरकारी योजना के लिए अपनी पात्रता जांचना चाहते हैं?',
    quickReplies: [
      'Stand-Up India Scheme',
      'PMEGP Loan & Subsidy',
      'PM MUDRA Yojana',
      'New Swarnima (Women)',
      'PM Vishwakarma Scheme',
      'NSFDC Term Loan'
    ]
  },
  purpose: {
    questionEn: 'What kind of support are you looking for?',
    questionHi: 'आप किस प्रकार की सहायता या योजना खोज रहे हैं?',
    quickReplies: ['Business Loan', 'Start New Business', 'Women Entrepreneur Support', 'Self Employment', 'Agriculture']
  },
  businessType: {
    questionEn: 'What type of business or trade are you planning or currently running?',
    questionHi: 'आप किस प्रकार का व्यवसाय या व्यापार शुरू करने या चलाने की योजना बना रहे हैं?',
    quickReplies: ['Tailoring / Boutique', 'Kirana / Grocery', 'Dairy / Milk', 'Handicraft / Artisan', 'Tech Startup', 'Other']
  },
  category: {
    questionEn: 'What is your social category?',
    questionHi: 'आपकी सामाजिक श्रेणी (Category) क्या है?',
    quickReplies: ['OBC', 'SC', 'ST', 'General']
  },
  gender: {
    questionEn: 'What is your gender?',
    questionHi: 'आपका लिंग (Gender) क्या है?',
    quickReplies: ['Female (महिला)', 'Male (पुरुष)', 'Transgender']
  },
  projectCost: {
    questionEn: 'What is the estimated total project cost or loan amount required?',
    questionHi: 'परियोजना की अनुमानित कुल लागत या आवश्यक ऋण राशि कितनी है?',
    quickReplies: ['Up to ₹50,000', '₹1 - ₹2 Lakh', '₹5 - ₹10 Lakh', '₹25 Lakh - ₹1 Crore']
  },
  familyIncome: {
    questionEn: 'What is your approximate annual family income?',
    questionHi: 'आपकी वार्षिक पारिवारिक आय (Annual Family Income) कितनी है?',
    quickReplies: ['Below ₹1.5 Lakh', '₹2.5 Lakh', '₹3 Lakh', '₹5 Lakh', 'Above ₹5 Lakh']
  },
  age: {
    questionEn: 'What is your age in years?',
    questionHi: 'आपकी आयु (Age) कितने वर्ष है?',
    quickReplies: ['18 - 25 Years', '26 - 35 Years', '36 - 50 Years', 'Above 50 Years']
  },
  udyamRegistered: {
    questionEn: 'Do you have an MSME / Udyam Registration certificate?',
    questionHi: 'क्या आपके पास एमएसएमई / उद्यम पंजीकरण (Udyam Registration) है?',
    quickReplies: ['Yes (हाँ)', 'No (नहीं)', 'Applying Soon']
  }
};

/**
 * Computes the optimal next question to ask using an Elimination/Frequency Heuristic.
 * Prioritizes the missing field that will resolve or eliminate the largest number of candidate schemes.
 */
export const selectNextFieldToQuery = (candidateSchemes = [], profile = {}) => {
  // 1. Initial trade / purpose if missing
  if (isValueMissing(profile.purpose) && isValueMissing(profile.businessType)) {
    return 'purpose';
  }
  if (isValueMissing(profile.businessType)) {
    return 'businessType';
  }

  // 2. Count missing required fields across all candidate schemes
  const missingFieldFrequency = {};

  if (candidateSchemes && candidateSchemes.length > 0) {
    for (const scheme of candidateSchemes) {
      const required = scheme.requiredFields || [];
      for (const field of required) {
        if (isValueMissing(profile[field])) {
          missingFieldFrequency[field] = (missingFieldFrequency[field] || 0) + 1;
        }
      }
    }
  } else {
    // If no candidate schemes loaded yet, check core demographic parameters
    const coreFields = ['category', 'gender', 'projectCost', 'familyIncome', 'age'];
    for (const field of coreFields) {
      if (isValueMissing(profile[field])) {
        missingFieldFrequency[field] = 1;
      }
    }
  }

  // Sort missing fields by frequency (descending)
  const sortedMissingFields = Object.entries(missingFieldFrequency)
    .sort((a, b) => b[1] - a[1]);

  if (sortedMissingFields.length === 0) {
    return null; // All required fields collected!
  }

  return sortedMissingFields[0][0];
};

/**
 * Processes incoming user message, updates conversation state, and generates next bot action.
 */
export const processUserMessage = async ({ message, conversation = {}, profile = {} }) => {
  const expectedField = conversation.nextQueryField || conversation.currentQueryField || null;

  // 1. Extract NLU slots from user message with expectedField context
  const nluResult = await extractProfileSlots(message, profile, expectedField);
  const updatedProfile = {
    ...profile,
    ...nluResult.extractedFields
  };

  let selectedSchemeId = conversation.selectedSchemeId || null;
  let journey = conversation.journey || (nluResult.intent === 'SPECIFIC_SCHEME' ? 'SPECIFIC_SCHEME' : (nluResult.intent === 'FIND_SCHEMES' ? 'FIND_SCHEMES' : null));

  // 2. Resolve Scheme Name if mentioned or if answering specificScheme question
  const schemeSearchTerm = nluResult.knownSchemeName || (expectedField === 'specificScheme' ? message : null);
  if (schemeSearchTerm) {
    const directCandidates = await findCandidateSchemes({}, { specificSchemeId: null });
    const normalizedTerm = schemeSearchTerm.toLowerCase().trim();
    const matched = directCandidates.find(s => 
      s.name.toLowerCase().includes(normalizedTerm) ||
      (normalizedTerm.includes('stand') && s.name.toLowerCase().includes('stand-up')) ||
      (normalizedTerm.includes('pmegp') && s.name.toLowerCase().includes('pmegp')) ||
      (normalizedTerm.includes('mudra') && s.name.toLowerCase().includes('mudra')) ||
      (normalizedTerm.includes('swarnima') && s.name.toLowerCase().includes('swarnima')) ||
      (normalizedTerm.includes('vishwakarma') && s.name.toLowerCase().includes('vishwakarma')) ||
      (normalizedTerm.includes('term loan') && s.name.toLowerCase().includes('term loan')) ||
      (normalizedTerm.includes('nsfdc') && s.name.toLowerCase().includes('nsfdc'))
    );
    if (matched) {
      selectedSchemeId = matched.schemeId;
      journey = 'SPECIFIC_SCHEME';
    }
  }

  // 3. Journey A Branch: User wants a specific scheme, but hasn't picked one yet
  if ((journey === 'SPECIFIC_SCHEME' || nluResult.intent === 'SPECIFIC_SCHEME') && !selectedSchemeId) {
    const questionConfig = QUESTION_TEMPLATES.specificScheme;

    const reply = await generateConversationalReply({
      userMessage: message,
      profile: updatedProfile,
      nextField: 'specificScheme',
      isConfirmation: false,
      contextPrompt: 'The user wants to check a specific scheme they know. Politely ask them to name the scheme or select from the options.',
      defaultEn: questionConfig.questionEn,
      defaultHi: questionConfig.questionHi
    });

    return {
      conversationStatus: 'WAITING_INFO',
      journey: 'SPECIFIC_SCHEME',
      selectedSchemeId: null,
      candidateSchemeIds: [],
      profile: updatedProfile,
      nextQueryField: 'specificScheme',
      botMessage: {
        role: 'assistant',
        contentEn: reply.contentEn,
        contentHi: reply.contentHi,
        quickReplies: questionConfig.quickReplies,
        showProfileConfirmation: false
      }
    };
  }

  // 4. Retrieve Candidate Schemes (filtered by selectedSchemeId if in Journey A)
  const candidateSchemes = await findCandidateSchemes(updatedProfile, { 
    specificSchemeId: selectedSchemeId,
    limit: 15 
  });

  // 5. Determine Next Action or Question
  const nextField = selectNextFieldToQuery(candidateSchemes, updatedProfile);

  // If all required fields are filled -> Transition to Profile Confirmation
  if (!nextField) {
    const defaultEn = 'Thank you! I have recorded your details. Please review and confirm your profile before we run the official eligibility evaluation.';
    const defaultHi = 'धन्यवाद! मैंने आपका विवरण दर्ज कर लिया है। आधिकारिक पात्रता मूल्यांकन चलाने से पहले कृपया अपनी प्रोफ़ाइल की पुष्टि करें।';

    const reply = await generateConversationalReply({
      userMessage: message,
      profile: updatedProfile,
      nextField: null,
      isConfirmation: true,
      contextPrompt: 'All necessary information has been collected. Warmly invite the user to review and confirm their profile to see their official eligibility.',
      defaultEn,
      defaultHi
    });

    return {
      conversationStatus: 'CONFIRMATION',
      journey,
      selectedSchemeId,
      candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
      profile: updatedProfile,
      botMessage: {
        role: 'assistant',
        contentEn: reply.contentEn,
        contentHi: reply.contentHi,
        quickReplies: ['Confirm & Check Eligibility (पुष्टि करें)', 'Edit Details (संशोधित करें)'],
        showProfileConfirmation: true
      }
    };
  }

  // 6. Otherwise, ask for the next missing field
  const questionConfig = QUESTION_TEMPLATES[nextField] || {
    questionEn: `Please provide your ${nextField}.`,
    questionHi: `कृपया अपना ${nextField} बताएं।`,
    quickReplies: []
  };

  // Generate dynamic conversational reply from Gemini
  const selectedSchemeObj = candidateSchemes.find(s => s.schemeId === selectedSchemeId);
  const schemeContext = selectedSchemeObj ? `Evaluating specific scheme: "${selectedSchemeObj.name}".` : 'Finding best matching government schemes.';

  const reply = await generateConversationalReply({
    userMessage: message,
    profile: updatedProfile,
    nextField,
    isConfirmation: false,
    contextPrompt: `${schemeContext} Acknowledge the user's latest input empathetically and naturally ask for their ${nextField}.`,
    defaultEn: questionConfig.questionEn,
    defaultHi: questionConfig.questionHi
  });

  return {
    conversationStatus: 'WAITING_INFO',
    journey,
    selectedSchemeId,
    candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
    profile: updatedProfile,
    nextQueryField: nextField,
    botMessage: {
      role: 'assistant',
      contentEn: reply.contentEn,
      contentHi: reply.contentHi,
      quickReplies: questionConfig.quickReplies,
      showProfileConfirmation: false
    }
  };
};
