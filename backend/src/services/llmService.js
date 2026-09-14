import { SLOT_FILLING_SYSTEM_PROMPT, EXPLANATION_SYSTEM_PROMPT } from '../prompts/index.js';
import { 
  normalizeBusinessType, 
  normalizeCategory, 
  normalizeGender, 
  parseIndianCurrency 
} from '../utils/normalization.js';

/**
 * Deterministic offline slot extractor using regex patterns and domain heuristics.
 * Ensures the system functions 100% reliably even without live internet/API keys.
 */
export const extractSlotsOffline = (message = '') => {
  const text = message.toLowerCase();
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
  } else if (text.includes('find') || text.includes('search') || text.includes('chahiye') || text.includes('batao') || text.includes('help')) {
    intent = 'FIND_SCHEMES';
  }

  // 2. Extract Category
  const cat = normalizeCategory(text);
  if (cat) extracted.category = cat;

  // 3. Extract Gender
  const gen = normalizeGender(text);
  if (gen) extracted.gender = gen;

  // 4. Extract Business Type
  if (text.includes('tailor') || text.includes('silai') || text.includes('kirana') || 
      text.includes('dairy') || text.includes('doodh') || text.includes('murgi') || 
      text.includes('poultry') || text.includes('startup') || text.includes('handicraft') ||
      text.includes('shop') || text.includes('business')) {
    extracted.businessType = normalizeBusinessType(text);
  }

  // 5. Extract Purpose
  if (text.includes('loan') || text.includes('paisa') || text.includes('finance')) {
    extracted.purpose = 'business_loan';
  } else if (text.includes('women') || text.includes('mahila')) {
    extracted.purpose = 'women_entrepreneur';
  } else if (text.includes('startup') || text.includes('naya business')) {
    extracted.purpose = 'new_business';
  }

  // 6. Extract Age
  const ageMatch = text.match(/(?:age|umra|umar|saal|years?)\s*(?:is|hai)?\s*(\d{2})/i) || 
                   text.match(/(\d{2})\s*(?:saal|years?|yr)/i);
  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 14 && ageNum <= 99) {
      extracted.age = ageNum;
    }
  }

  // 7. Extract Income / Project Cost
  const parsedAmount = parseIndianCurrency(text);
  if (parsedAmount) {
    if (text.includes('income') || text.includes('aamdani') || text.includes('kamata') || text.includes('kamate')) {
      extracted.familyIncome = parsedAmount;
    } else if (text.includes('project') || text.includes('cost') || text.includes('laagat') || text.includes('kharach') || text.includes('budget')) {
      extracted.projectCost = parsedAmount;
    } else if (parsedAmount <= 500000 && !extracted.familyIncome) {
      // Default heuristic: smaller amount mentioned alone without context is usually income
      extracted.familyIncome = parsedAmount;
    } else if (parsedAmount > 500000 && !extracted.projectCost) {
      extracted.projectCost = parsedAmount;
    }
  }

  // 8. Extract Udyam status
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
    confidence: 0.90
  };
};

/**
 * Main NLU Slot Extraction Service.
 * Attempts LLM API if configured, otherwise uses offline deterministic extractor.
 * 
 * @param {string} message 
 * @param {Object} currentProfile 
 * @returns {Promise<Object>} Extracted slots & intent
 */
export const extractProfileSlots = async (message = '', currentProfile = {}) => {
  // If OpenAI API key is configured
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SLOT_FILLING_SYSTEM_PROMPT },
            { role: 'user', content: `Current profile: ${JSON.stringify(currentProfile)}\nUser message: "${message}"` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return parsed;
      }
    } catch (err) {
      console.warn(`[LLM Service] Online API failed, falling back to offline extractor: ${err.message}`);
    }
  }

  // Fallback to offline regex/heuristic extractor
  return extractSlotsOffline(message);
};

/**
 * Generates bilingual explanations for evaluation traces.
 */
export const generateExplanation = async (fullTrace = {}) => {
  const { schemeName, status, gapReport, nextAction } = fullTrace;

  if (status === 'ELIGIBLE') {
    return {
      status: 'ELIGIBLE',
      explanationEnglish: `Congratulations! You meet all the eligibility criteria for ${schemeName}. You can proceed with your application through ${nextAction.routeName}.`,
      explanationHindi: `बधाई हो! आप ${schemeName} की सभी पात्रता शर्तों को पूरा करते हैं। आप ${nextAction.routeName} के माध्यम से अपना आवेदन आगे बढ़ा सकते हैं।`,
      actionableAdvice: `Next Step: ${nextAction.instructions}`,
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
