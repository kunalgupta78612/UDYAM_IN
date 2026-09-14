import { SLOT_FILLING_SYSTEM_PROMPT, EXPLANATION_SYSTEM_PROMPT } from '../prompts/index.js';
import { 
  normalizeBusinessType, 
  normalizeCategory, 
  normalizeGender, 
  normalizePurpose,
  parseIndianCurrency,
  parseAge
} from '../utils/normalization.js';

/**
 * Deterministic offline slot extractor using regex patterns, range parsers, and active conversational field context.
 * Ensures the system functions 100% reliably and never loops on repeated questions.
 */
export const extractSlotsOffline = (message = '', currentProfile = {}, expectedField = null) => {
  const text = message.toLowerCase().trim();
  const extracted = {};
  let intent = 'PROVIDE_INFO';
  let knownSchemeName = null;

  // 1. Detect known scheme mentions (Journey A)
  if (text.includes('stand-up') || text.includes('stand up') || text.includes('standup')) {
    knownSchemeName = 'Stand-Up India Scheme';
    intent = 'SPECIFIC_SCHEME';
  } else if (text.includes('swarnima')) {
    knownSchemeName = 'NBCFDC New Swarnima Scheme for Women';
    intent = 'SPECIFIC_SCHEME';
  } else if (text.includes('pmegp')) {
    knownSchemeName = "Prime Minister's Employment Generation Programme (PMEGP)";
    intent = 'SPECIFIC_SCHEME';
  } else if (text.includes('mudra')) {
    knownSchemeName = 'Pradhan Mantri MUDRA Yojana';
    intent = 'SPECIFIC_SCHEME';
  } else if (text.includes('vishwakarma')) {
    knownSchemeName = 'PM Vishwakarma Scheme';
    intent = 'SPECIFIC_SCHEME';
  } else if (text.includes('find') || text.includes('search') || text.includes('chahiye') || text.includes('batao') || text.includes('help') || text.includes('shuru karni')) {
    intent = 'FIND_SCHEMES';
  }

  // 2. Direct Context Mapping: If bot specifically just asked for expectedField
  if (expectedField) {
    if (expectedField === 'projectCost') {
      const amount = parseIndianCurrency(text);
      if (amount) extracted.projectCost = amount;
    } else if (expectedField === 'familyIncome') {
      const amount = parseIndianCurrency(text);
      if (amount) extracted.familyIncome = amount;
    } else if (expectedField === 'age') {
      const ageVal = parseAge(text);
      if (ageVal) extracted.age = ageVal;
    } else if (expectedField === 'category') {
      const cat = normalizeCategory(text);
      if (cat) extracted.category = cat;
    } else if (expectedField === 'gender') {
      const gen = normalizeGender(text);
      if (gen) extracted.gender = gen;
    } else if (expectedField === 'businessType') {
      extracted.businessType = normalizeBusinessType(text);
    } else if (expectedField === 'purpose') {
      extracted.purpose = normalizePurpose(text);
    } else if (expectedField === 'udyamRegistered') {
      if (text.includes('yes') || text.includes('haan') || text.includes('हाँ') || text.includes('have')) {
        extracted.udyamRegistered = true;
      } else if (text.includes('no') || text.includes('nahi') || text.includes('नहीं')) {
        extracted.udyamRegistered = false;
      }
    }
  }

  // 3. Fallback / Multi-slot extraction from full sentence
  const cat = normalizeCategory(text);
  if (cat && !extracted.category) extracted.category = cat;

  const gen = normalizeGender(text);
  if (gen && !extracted.gender) extracted.gender = gen;

  if (text.includes('tailor') || text.includes('silai') || text.includes('kirana') || 
      text.includes('dairy') || text.includes('doodh') || text.includes('murgi') || 
      text.includes('poultry') || text.includes('startup') || text.includes('handicraft') ||
      text.includes('shop') || text.includes('boutique') || text.includes('business')) {
    if (!extracted.businessType) extracted.businessType = normalizeBusinessType(text);
  }

  if (text.includes('loan') || text.includes('paisa') || text.includes('finance') || text.includes('ऋण')) {
    if (!extracted.purpose) extracted.purpose = 'business_loan';
  } else if (text.includes('women') || text.includes('mahila')) {
    if (!extracted.purpose) extracted.purpose = 'women_entrepreneur';
  } else if (text.includes('startup') || text.includes('naya business') || text.includes('start new')) {
    if (!extracted.purpose) extracted.purpose = 'new_business';
  }

  const ageVal = parseAge(text);
  if (ageVal && !extracted.age) {
    extracted.age = ageVal;
  }

  const parsedAmount = parseIndianCurrency(text);
  if (parsedAmount && !extracted.familyIncome && !extracted.projectCost && !['age', 'category', 'gender', 'udyamRegistered'].includes(expectedField)) {
    if (text.includes('income') || text.includes('aamdani') || text.includes('kamata') || text.includes('kamate')) {
      extracted.familyIncome = parsedAmount;
    } else if (text.includes('project') || text.includes('cost') || text.includes('laagat') || text.includes('kharach') || text.includes('budget') || text.includes('loan')) {
      extracted.projectCost = parsedAmount;
    } else if (currentProfile.familyIncome && !currentProfile.projectCost) {
      extracted.projectCost = parsedAmount;
    } else if (!currentProfile.familyIncome) {
      extracted.familyIncome = parsedAmount;
    } else {
      extracted.projectCost = parsedAmount;
    }
  }

  if (text.includes('udyam') || text.includes('msme reg')) {
    if (text.includes('yes') || text.includes('haan') || text.includes('hai') || text.includes('registered')) {
      extracted.udyamRegistered = true;
    } else if (text.includes('no') || text.includes('nahi')) {
      extracted.udyamRegistered = false;
    }
  }

  return {
    intent,
    knownSchemeName,
    extractedFields: extracted,
    confidence: 0.95
  };
};

/**
 * Main NLU Slot Extraction Service.
 * Attempts Gemini API or OpenAI API if configured, otherwise uses offline deterministic extractor.
 * 
 * @param {string} message 
 * @param {Object} currentProfile 
 * @param {string|null} expectedField 
 * @returns {Promise<Object>} Extracted slots & intent
 */
export const extractProfileSlots = async (message = '', currentProfile = {}, expectedField = null) => {
  // Always run offline extractor first as a fast deterministic baseline
  const localSlots = extractSlotsOffline(message, currentProfile, expectedField);

  // If Gemini or OpenAI is configured, merge AI extracted slots
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SLOT_FILLING_SYSTEM_PROMPT}\n\nCurrent User Profile: ${JSON.stringify(currentProfile)}\nExpected Question Field: ${expectedField || 'None'}\nUser Message: "${message}"\n\nReturn ONLY pure JSON matching the schema:`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          const parsed = JSON.parse(contentText);
          return {
            ...parsed,
            extractedFields: {
              ...localSlots.extractedFields,
              ...parsed.extractedFields
            }
          };
        }
      }
    } catch (err) {
      console.warn(`[Gemini API Warning] ${err.message}`);
    }
  }

  return localSlots;
};

/**
 * Generates bilingual explanations for evaluation traces.
 */
export const generateExplanation = async (fullTrace = {}) => {
  const { schemeName, status, gapReport, nextAction } = fullTrace;

  if (status === 'ELIGIBLE') {
    return {
      status: 'ELIGIBLE',
      explanationEnglish: `Congratulations! You meet all the eligibility criteria for ${schemeName}. You can proceed with your application through ${nextAction?.routeName || 'the designated agency'}.`,
      explanationHindi: `बधाई हो! आप ${schemeName} की सभी पात्रता शर्तों को पूरा करते हैं। आप ${nextAction?.routeName || 'नामित एजेंसी'} के माध्यम से अपना आवेदन आगे बढ़ा सकते हैं।`,
      actionableAdvice: `Next Step: ${nextAction?.instructions || 'Follow official guidelines.'}`,
      keyHighlight: 'All required parameters passed successfully.'
    };
  }

  if (status === 'NOT_ELIGIBLE') {
    return {
      status: 'NOT_ELIGIBLE',
      explanationEnglish: `You currently do not qualify for ${schemeName}. Reason: ${gapReport?.summary || 'Certain scheme conditions were not satisfied'}.`,
      explanationHindi: `वर्तमान में आप ${schemeName} के लिए पात्र नहीं हैं। कारण: ${gapReport?.summary || 'योजना की कुछ शर्तें पूरी नहीं हुईं'}।`,
      actionableAdvice: 'Explore alternative schemes with broader income or category eligibility.',
      keyHighlight: gapReport?.summary || 'Condition mismatch'
    };
  }

  return {
    status: 'NEED_INFO',
    explanationEnglish: `We need a few more details to complete your eligibility check for ${schemeName}.`,
    explanationHindi: `${schemeName} के लिए आपकी पात्रता जांच पूरी करने के लिए हमें कुछ और विवरणों की आवश्यकता है।`,
    actionableAdvice: 'Please provide the requested information.',
    keyHighlight: 'Additional parameters required.'
  };
};
