import { extractProfileSlots } from './llmService.js';
import { findCandidateSchemes } from '../retrieval/schemeRetriever.js';
import { evaluateMultipleSchemes } from '../rules/ruleEngine.js';
import { isValueMissing } from '../rules/conditionEvaluator.js';

// Question templates with contextual quick-reply chips
const QUESTION_TEMPLATES = {
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
  projectCost: {
    questionEn: 'What is the estimated total project cost or loan amount required?',
    questionHi: 'परियोजना की अनुमानित कुल लागत या आवश्यक ऋण राशि कितनी है?',
    quickReplies: ['Up to ₹50,000', '₹1 - ₹2 Lakh', '₹5 - ₹10 Lakh', '₹25 Lakh - ₹1 Crore']
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
 * 
 * @param {Array<Object>} candidateSchemes 
 * @param {Object} profile 
 * @returns {string|null} Field name of the next question, or null if complete
 */
export const selectNextFieldToQuery = (candidateSchemes = [], profile = {}) => {
  const missingFieldFrequency = {};

  // Standard high-priority intent fields if completely uninitialized
  if (isValueMissing(profile.purpose) && isValueMissing(profile.businessType)) {
    return 'purpose';
  }

  // Count missing required fields across all candidate schemes
  for (const scheme of candidateSchemes) {
    const required = scheme.requiredFields || [];
    for (const field of required) {
      if (isValueMissing(profile[field])) {
        missingFieldFrequency[field] = (missingFieldFrequency[field] || 0) + 1;
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
 * 
 * @param {Object} params - { message, conversation, profile }
 * @returns {Promise<Object>} Updated state and bot response
 */
export const processUserMessage = async ({ message, conversation = {}, profile = {} }) => {
  // 1. Extract NLU slots from user message with expectedField context
  const expectedField = conversation.nextQueryField || conversation.currentQueryField || null;
  const nluResult = await extractProfileSlots(message, profile, expectedField);
  const updatedProfile = {
    ...profile,
    ...nluResult.extractedFields
  };

  // 2. Journey A Detection (User asked for a specific scheme)
  let selectedSchemeId = conversation.selectedSchemeId || null;
  if (nluResult.knownSchemeName) {
    // Look up scheme by name
    const directCandidates = await findCandidateSchemes({}, { specificSchemeId: null });
    const matched = directCandidates.find(s => 
      s.name.toLowerCase().includes(nluResult.knownSchemeName.toLowerCase())
    );
    if (matched) {
      selectedSchemeId = matched.schemeId;
    }
  }

  // 3. Retrieve/Refresh Candidate Schemes
  const candidateSchemes = await findCandidateSchemes(updatedProfile, { 
    specificSchemeId: selectedSchemeId,
    limit: 15 
  });

  // 4. Determine Next Action or Question
  const nextField = selectNextFieldToQuery(candidateSchemes, updatedProfile);

  // If all fields are ready -> Transition to Profile Confirmation
  if (!nextField) {
    return {
      conversationStatus: 'CONFIRMATION',
      selectedSchemeId,
      candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
      profile: updatedProfile,
      botMessage: {
        role: 'assistant',
        contentEn: 'Thank you! I have recorded your details. Please review and confirm your profile before we run the official eligibility evaluation.',
        contentHi: 'धन्यवाद! मैंने आपका विवरण दर्ज कर लिया है। आधिकारिक पात्रता मूल्यांकन चलाने से पहले कृपया अपनी प्रोफ़ाइल की पुष्टि करें।',
        quickReplies: ['Confirm & Check Eligibility (पुष्टि करें)', 'Edit Details (संशोधित करें)'],
        showProfileConfirmation: true
      }
    };
  }

  // Otherwise, ask for the next missing field
  const questionConfig = QUESTION_TEMPLATES[nextField] || {
    questionEn: `Please provide your ${nextField}.`,
    questionHi: `कृपया अपना ${nextField} बताएं।`,
    quickReplies: []
  };

  return {
    conversationStatus: 'WAITING_INFO',
    selectedSchemeId,
    candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
    profile: updatedProfile,
    nextQueryField: nextField,
    botMessage: {
      role: 'assistant',
      contentEn: questionConfig.questionEn,
      contentHi: questionConfig.questionHi,
      quickReplies: questionConfig.quickReplies,
      showProfileConfirmation: false
    }
  };
};
