import { Scheme } from '../models/Scheme.js';
import { buildRetrievalQuery } from './filters.js';
import { rankSchemes } from './ranking.js';

/**
 * Retrieves candidate schemes tailored to the user profile.
 * Implements the 2-stage retrieval pipeline: Database Filtering -> Candidate Ranking.
 * 
 * @param {Object} profile - Structured user profile
 * @param {Object} options - { limit: 20, specificSchemeId: null }
 * @returns {Promise<Array<Object>>} Ranked candidate schemes
 */
export const findCandidateSchemes = async (profile = {}, options = {}) => {
  const { limit = 20, specificSchemeId = null } = options;

  // Journey A: User specifically requested a known scheme
  if (specificSchemeId || profile.selectedSchemeId) {
    const targetId = specificSchemeId || profile.selectedSchemeId;
    const directScheme = await Scheme.findOne({ 
      schemeId: targetId,
      status: 'ACTIVE' 
    }).lean();

    return directScheme ? [directScheme] : [];
  }

  // Journey B: Unknown scheme -> Filter & Rank
  const filterQuery = buildRetrievalQuery(profile);
  const matchedSchemes = await Scheme.find(filterQuery).lean();

  // Rank candidate schemes by user profile relevance
  const rankedCandidates = rankSchemes(matchedSchemes, profile);

  // Return top N candidates for rule evaluation
  return rankedCandidates.slice(0, limit);
};

/**
 * Direct keyword search across scheme titles, descriptions, and ministries.
 * @param {string} keyword 
 * @param {Object} filters 
 * @returns {Promise<Array<Object>>}
 */
export const searchSchemesByKeyword = async (keyword = '', filters = {}) => {
  if (!keyword || keyword.trim() === '') {
    return Scheme.find({ status: 'ACTIVE', ...filters }).limit(30).lean();
  }

  const regex = new RegExp(keyword.trim(), 'i');
  return Scheme.find({
    status: 'ACTIVE',
    $or: [
      { name: regex },
      { shortDescription: regex },
      { 'organization.name': regex },
      { 'organization.ministry': regex },
      { purpose: regex },
      { businessTypes: regex }
    ],
    ...filters
  }).limit(30).lean();
};
