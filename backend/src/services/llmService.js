import dotenv from 'dotenv';
dotenv.config();
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
 * Strips markdown code block wrappers (```json ... ```) from LLM output.
 */
export const cleanJsonResponse = (text = '') => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

/**
 * Executes a Gemini API call with automatic multi-model fallback.
 */
async function callGeminiApi(prompt, temperature = 0.2) {
  if (!process.env.GEMINI_API_KEY) return null;

  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-flash-latest',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest'
  ];

  const models = [...new Set(candidateModels)];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          return contentText;
        }
      } else if (response.status === 429 || response.status === 503 || response.status === 404) {
        continue;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}

/**
 * Deterministic offline slot extractor with comprehensive Hindi/Hinglish speech-to-text phonetic support.
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
  } else if (text.includes('nsfdc') || text.includes('term loan')) {
    knownSchemeName = 'NSFDC Term Loan Scheme';
    intent = 'SPECIFIC_SCHEME';
  } else if (text.includes('i know') || text.includes('know my scheme') || text.includes('i kn scheme') || text.includes('know scheme') || text.includes('naam pata hai') || text.includes('specific scheme')) {
    intent = 'SPECIFIC_SCHEME';
  } else if (text.includes('find') || text.includes('search') || text.includes('chahiye') || text.includes('batao') || text.includes('help') || text.includes('shuru karni')) {
    intent = 'FIND_SCHEMES';
  }

  // 2. Direct Context Mapping: If bot specifically just asked for expectedField
  if (expectedField) {
    if (expectedField === 'specificScheme' && knownSchemeName) {
      intent = 'SPECIFIC_SCHEME';
    } else if (expectedField === 'projectCost') {
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
      const normalizedBt = normalizeBusinessType(text);
      if (normalizedBt && !['other', 'others', 'business_loan', 'start_new_business', 'new_business'].includes(normalizedBt)) {
        extracted.businessType = normalizedBt;
      }
    } else if (expectedField === 'purpose') {
      extracted.purpose = normalizePurpose(text);
    } else if (expectedField === 'udyamRegistered') {
      if (text.includes('yes') || text.includes('haan') || text.includes('हाँ') || text.includes('have') || text.includes('hai')) {
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

  const parsedAge = parseAge(text);
  if (parsedAge && !extracted.age) {
    extracted.age = parsedAge;
  }

  const isGenericLoanOrPurpose = /^(business loan|start new business|new business|loan|self employment|agriculture|karz|paisa|other|others|अन्य)$/i.test(text.trim());

  if (!isGenericLoanOrPurpose) {
    if (text.includes('tailor') || text.includes('silai') || text.includes('silaye') || text.includes('bunai') ||
        text.includes('kirana') || text.includes('dairy') || text.includes('doodh') || text.includes('murgi') || 
        text.includes('poultry') || text.includes('tech startup') || text.includes('handicraft') || text.includes('hastshilp') ||
        text.includes('boutique') || text.includes('carpenter') || text.includes('badhai') || text.includes('parlor') ||
        text.includes('parlour') || text.includes('salon') || text.includes('cyber cafe') || text.includes('csc') ||
        text.includes('repair') || text.includes('mechanic') || text.includes('welding') || text.includes('karkhana') ||
        text.includes('factory') || text.includes('bakery') || text.includes('restaurant') || text.includes('hotel') ||
        text.includes('dhaba') || text.includes('transport') || text.includes('auto rickshaw') || text.includes('farming') ||
        text.includes('kheti')) {
      if (!extracted.businessType) {
        const norm = normalizeBusinessType(text);
        if (norm && !['other', 'others', 'business_loan', 'start_new_business'].includes(norm)) {
          extracted.businessType = norm;
        }
      }
    }
  }

  if (text.includes('loan') || text.includes('paisa') || text.includes('finance') || text.includes('ऋण') || text.includes('karz') || text.includes('chahiye tha')) {
    if (!extracted.purpose) extracted.purpose = 'business_loan';
  } else if (text.includes('women') || text.includes('mahila')) {
    if (!extracted.purpose) extracted.purpose = 'women_entrepreneur';
  } else if (text.includes('startup') || text.includes('naya business') || text.includes('start new') || text.includes('kholna')) {
    if (!extracted.purpose) extracted.purpose = 'new_business';
  }

  const parsedAmount = parseIndianCurrency(text);
  if (parsedAmount && !extracted.familyIncome && !extracted.projectCost && !['age', 'category', 'gender', 'udyamRegistered', 'specificScheme'].includes(expectedField)) {
    const isLoanOrProject = text.includes('loan') || text.includes('karz') || text.includes('laagat') || 
                            text.includes('kharach') || text.includes('budget') || text.includes('project') || 
                            text.includes('chahiye') || text.includes('ke liye') || text.includes('ka liya');
    const isIncome = text.includes('income') || text.includes('aamdani') || text.includes('kamata') || 
                     text.includes('kamati') || text.includes('kamate') || text.includes('salary') || text.includes('tankha');

    if (isIncome && !isLoanOrProject) {
      extracted.familyIncome = parsedAmount;
    } else if (isLoanOrProject) {
      extracted.projectCost = parsedAmount;
    } else if (currentProfile.projectCost && !currentProfile.familyIncome) {
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
 * Main NLU Slot Extraction Service using Gemini LLM with STT phonetic resilience.
 */
export const extractProfileSlots = async (message = '', currentProfile = {}, expectedField = null) => {
  const localSlots = extractSlotsOffline(message, currentProfile, expectedField);

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `${SLOT_FILLING_SYSTEM_PROMPT}

Current User Profile: ${JSON.stringify(currentProfile)}
Expected Question Field: ${expectedField || 'None'}
User Message: "${message}"

Return ONLY pure JSON matching the schema.`;

      const contentText = await callGeminiApi(prompt, 0.1);
      if (contentText) {
        const cleaned = cleanJsonResponse(contentText);
        const parsed = JSON.parse(cleaned);

        const cleanExtracted = {};
        if (parsed.extractedFields) {
          for (const [k, v] of Object.entries(parsed.extractedFields)) {
            if (v !== null && v !== undefined && v !== '') {
              if (k === 'businessType' && typeof v === 'string') {
                const norm = normalizeBusinessType(v);
                if (norm && !['other', 'others', 'business_loan', 'start_new_business'].includes(norm)) {
                  cleanExtracted[k] = norm;
                }
              } else if (k === 'category' && typeof v === 'string') {
                const normalizedCat = normalizeCategory(v) || normalizeCategory(message);
                // Prevent hallucinated GENERAL if user didn't say general/samanya/open
                if (normalizedCat === 'GENERAL') {
                  const hasGenWord = /\b(general|gen|samanya|open|ur|unreserved)\b/i.test(message);
                  if (hasGenWord) {
                    cleanExtracted[k] = 'GENERAL';
                  }
                } else if (normalizedCat) {
                  cleanExtracted[k] = normalizedCat;
                }
              } else if (k === 'gender' && typeof v === 'string') {
                cleanExtracted[k] = normalizeGender(v) || v;
              } else if (k === 'purpose' && typeof v === 'string') {
                cleanExtracted[k] = normalizePurpose(v) || v;
              } else if (k === 'age' && typeof v === 'number') {
                cleanExtracted[k] = v;
              } else if (k === 'projectCost' && typeof v === 'number') {
                cleanExtracted[k] = v;
              } else if (k === 'familyIncome' && typeof v === 'number') {
                cleanExtracted[k] = v;
              } else {
                cleanExtracted[k] = v;
              }
            }
          }
        }

        // Merge, letting verified offline speech parsers take precedence on voice patterns
        return {
          intent: parsed.intent || localSlots.intent,
          knownSchemeName: parsed.knownSchemeName || localSlots.knownSchemeName,
          extractedFields: {
            ...cleanExtracted,
            ...localSlots.extractedFields // ensures deterministic offline STT regex isn't overwritten by LLM hallucinations
          },
          confidence: parsed.confidence || 0.95
        };
      }
    } catch (err) {
      console.warn(`[Gemini Slot Extraction Warning] ${err.message}`);
    }
  }

  return localSlots;
};

/**
 * Generates natural, dynamic conversational responses using Gemini LLM.
 */
export const generateConversationalReply = async ({ 
  userMessage, 
  profile = {}, 
  nextField = null, 
  isConfirmation = false, 
  contextPrompt = '',
  defaultEn = '', 
  defaultHi = '' 
}) => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are Udyam Setu AI (UDYAM SETU), a warm, polite, and encouraging assistant helping Indian micro-entrepreneurs, artisans, and women founders discover government schemes.

CONTEXT:
- User Message: "${userMessage}"
- Current Profile Data: ${JSON.stringify(profile)}
- Target Field / Next Action: ${nextField || (isConfirmation ? 'Confirm Profile' : 'General')}
- Specific Instruction: ${contextPrompt || 'Acknowledge the user naturally and ask the next question clearly.'}
- English Fallback: "${defaultEn}"
- Hindi Fallback: "${defaultHi}"

TASK:
Generate a short, friendly, and natural conversational response (1-2 sentences) in both English and Hindi.
- Acknowledge what the user said with empathy and enthusiasm.
- Smoothly transition into the required next question or next step.
- Do NOT be repetitive or robotic.
- Provide a clean Hindi (or natural Hinglish) version.

Return ONLY a valid JSON object matching this schema:
{
  "contentEn": "...",
  "contentHi": "..."
}`;

      const contentText = await callGeminiApi(prompt, 0.3);
      if (contentText) {
        const cleaned = cleanJsonResponse(contentText);
        const parsed = JSON.parse(cleaned);
        if (parsed.contentEn && parsed.contentHi) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[Gemini Reply Generation Warning] ${err.message}`);
    }
  }

  return {
    contentEn: defaultEn,
    contentHi: defaultHi
  };
};

/**
 * Generates bilingual explanations for evaluation traces using Gemini LLM.
 */
export const generateExplanation = async (fullTrace = {}) => {
  const { schemeName, status, gapReport, nextAction, traceItems = [] } = fullTrace;

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `${EXPLANATION_SYSTEM_PROMPT}

Scheme Name: ${schemeName}
Status: ${status}
Conditions Evaluated: ${JSON.stringify(traceItems)}
Gap Report: ${JSON.stringify(gapReport)}
Next Action / Route: ${JSON.stringify(nextAction)}

Generate a personalized, clear explanation in both English and Hindi. Return ONLY valid JSON matching the schema.`;

      const contentText = await callGeminiApi(prompt, 0.2);
      if (contentText) {
        const cleaned = cleanJsonResponse(contentText);
        const parsed = JSON.parse(cleaned);
        if (parsed.explanationEnglish && parsed.explanationHindi) {
          return {
            status,
            explanationEnglish: parsed.explanationEnglish,
            explanationHindi: parsed.explanationHindi,
            actionableAdvice: parsed.actionableAdvice || `Apply via ${nextAction?.routeName || 'Official Portal'}`,
            keyHighlight: parsed.keyHighlight || (status === 'ELIGIBLE' ? 'Eligible for benefits' : 'Review criteria')
          };
        }
      }
    } catch (err) {
      console.warn(`[Gemini Explanation Warning] ${err.message}`);
    }
  }

  // Deterministic Fallback if API is offline
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
