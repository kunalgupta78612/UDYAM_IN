import { normalizeCategory, normalizeGender, normalizeBusinessType } from '../utils/normalization.js';

/**
 * Calculates a relevance score for a scheme based on the user's current profile.
 * High relevance score = scheme should be evaluated & presented first.
 * 
 * Note: Ranking indicates relevance/intent match, NOT final eligibility.
 * 
 * @param {Object} scheme - Scheme document
 * @param {Object} profile - User profile
 * @returns {number} Score
 */
export const calculateRelevanceScore = (scheme, profile = {}) => {
  let score = 0;

  const normCat = normalizeCategory(profile.category);
  const normGender = normalizeGender(profile.gender);
  const normBusiness = normalizeBusinessType(profile.businessType);
  const cleanPurpose = profile.purpose ? profile.purpose.toLowerCase().trim() : null;

  // 1. Purpose Match (+5 for exact, +2 for general)
  if (cleanPurpose && Array.isArray(scheme.purpose)) {
    if (scheme.purpose.includes(cleanPurpose)) {
      score += 5;
    } else if (scheme.purpose.includes('business_loan') || scheme.purpose.includes('new_business')) {
      score += 2;
    }
  }

  // 2. Business Type Match (+4)
  if (normBusiness && Array.isArray(scheme.businessTypes)) {
    if (scheme.businessTypes.includes(normBusiness)) {
      score += 4;
    }
  }

  // 3. Social Category Match (+4 for specific, +1 for ALL)
  if (normCat && Array.isArray(scheme.applicableCategories)) {
    if (scheme.applicableCategories.includes(normCat)) {
      score += 4;
    } else if (scheme.applicableCategories.includes('ALL')) {
      score += 1;
    }
  }

  // 4. Gender Match (+3 for female-focused, +1 for all)
  if (normGender && Array.isArray(scheme.applicableGender)) {
    if (normGender === 'female' && scheme.applicableGender.includes('female') && !scheme.applicableGender.includes('male')) {
      score += 3; // Exclusive women scheme bonus
    } else if (scheme.applicableGender.includes(normGender) || scheme.applicableGender.includes('all')) {
      score += 1;
    }
  }

  // 5. Target Beneficiary tag match (+2)
  if (Array.isArray(scheme.targetBeneficiaries)) {
    if (normCat && scheme.targetBeneficiaries.includes(normCat)) score += 2;
    if (normGender === 'female' && scheme.targetBeneficiaries.includes('women')) score += 2;
  }

  return score;
};

/**
 * Sorts schemes in descending order of relevance score.
 * @param {Array<Object>} schemes 
 * @param {Object} profile 
 * @returns {Array<Object>} Ranked schemes with attached relevanceScore
 */
export const rankSchemes = (schemes = [], profile = {}) => {
  return schemes
    .map(scheme => {
      const score = calculateRelevanceScore(scheme, profile);
      return {
        ...scheme,
        relevanceScore: score
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};
