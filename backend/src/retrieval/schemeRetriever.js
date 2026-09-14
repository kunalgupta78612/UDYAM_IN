import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Scheme } from '../models/Scheme.js';
import { buildRetrievalQuery } from './filters.js';
import { rankSchemes } from './ranking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedSchemes = null;
const getSeedSchemesFallback = () => {
  if (!cachedSchemes) {
    const raw = fs.readFileSync(path.join(__dirname, '../../seed/schemes.json'), 'utf8');
    cachedSchemes = JSON.parse(raw);
  }
  return cachedSchemes;
};

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
  const isDbConnected = mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test';

  // Journey A: User specifically requested a known scheme
  if (specificSchemeId || profile.selectedSchemeId) {
    const targetId = specificSchemeId || profile.selectedSchemeId;

    if (isDbConnected) {
      try {
        const directScheme = await Scheme.findOne({ 
          schemeId: targetId,
          status: 'ACTIVE' 
        }).lean();
        return directScheme ? [directScheme] : [];
      } catch (err) {
        // Fallback
      }
    }

    const fallbackScheme = getSeedSchemesFallback().find(s => s.schemeId === targetId);
    return fallbackScheme ? [fallbackScheme] : [];
  }

  // Journey B: Unknown scheme -> Filter & Rank
  let matchedSchemes = [];

  if (isDbConnected) {
    try {
      const filterQuery = buildRetrievalQuery(profile);
      matchedSchemes = await Scheme.find(filterQuery).lean();
    } catch (err) {
      matchedSchemes = getSeedSchemesFallback();
    }
  } else {
    // In-memory filter fallback
    matchedSchemes = getSeedSchemesFallback();
  }

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
  const isDbConnected = mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test';

  if (!isDbConnected) {
    const all = getSeedSchemesFallback();
    if (!keyword || keyword.trim() === '') return all.slice(0, 30);
    const lower = keyword.toLowerCase();
    return all.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      s.shortDescription.toLowerCase().includes(lower) ||
      s.organization.name.toLowerCase().includes(lower)
    ).slice(0, 30);
  }

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
