import { normalizeCategory, normalizeGender, normalizeBusinessType } from '../utils/normalization.js';

/**
 * Builds a fast, index-optimized MongoDB pre-filtering query from user profile.
 * Filters 5,000+ schemes down to a relevant candidate subset (10-30 schemes).
 * 
 * @param {Object} profile - User profile
 * @returns {Object} MongoDB query filter object
 */
export const buildRetrievalQuery = (profile = {}) => {
  const query = { status: 'ACTIVE' };
  const andClauses = [];

  // 1. Social Category Filter
  if (profile.category) {
    const normCategory = normalizeCategory(profile.category);
    andClauses.push({
      applicableCategories: {
        $in: [normCategory, 'ALL', 'ALL_IF_WOMEN']
      }
    });
  }

  // 2. Gender Filter
  if (profile.gender) {
    const normGender = normalizeGender(profile.gender);
    if (normGender) {
      andClauses.push({
        applicableGender: {
          $in: [normGender, 'all']
        }
      });
    }
  }

  // 3. State / Domicile Filter
  if (profile.state && profile.state !== 'ALL') {
    andClauses.push({
      states: {
        $in: [profile.state.toUpperCase(), 'ALL']
      }
    });
  }

  // 4. Purpose Filter
  if (profile.purpose) {
    const cleanPurpose = profile.purpose.toLowerCase().trim();
    andClauses.push({
      $or: [
        { purpose: cleanPurpose },
        { purpose: 'business_loan' } // Default broadest MSME match
      ]
    });
  }

  // 5. Business Type Filter
  if (profile.businessType) {
    const normBusiness = normalizeBusinessType(profile.businessType);
    andClauses.push({
      $or: [
        { businessTypes: normBusiness },
        { businessTypes: 'manufacturing' },
        { businessTypes: 'services' },
        { businessTypes: 'general_trade' },
        { businessTypes: { $size: 0 } } // Schemes without business restriction
      ]
    });
  }

  if (andClauses.length > 0) {
    query.$and = andClauses;
  }

  return query;
};
