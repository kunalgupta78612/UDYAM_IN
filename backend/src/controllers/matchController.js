import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Scheme, Profile, MatchLog } from '../models/index.js';
import { evaluateScheme } from '../rules/ruleEngine.js';
import { generateEligibilityTrace } from '../rules/traceGenerator.js';
import { generateExplanation } from '../services/llmService.js';
import { findCandidateSchemes } from '../retrieval/schemeRetriever.js';
import { generateFundingStacks } from '../services/fundingStackService.js';

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
 * Runs deterministic rule evaluation against user profile and returns triaged results.
 * Endpoint: POST /api/match
 */
export const matchSchemes = async (req, res, next) => {
  try {
    const { conversationId, profile: directProfile, schemeIds } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test';

    let userProfile = directProfile;

    if (!userProfile && conversationId) {
      if (isDbConnected) {
        try {
          const found = await Profile.findOne({ conversationId }).lean();
          if (found) userProfile = found;
        } catch (err) {
          // fallback
        }
      }
    }

    if (!userProfile) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid user profile or active conversationId.'
      });
    }

    // Retrieve target schemes for evaluation
    let targetSchemes = [];
    if (Array.isArray(schemeIds) && schemeIds.length > 0) {
      if (isDbConnected) {
        try {
          targetSchemes = await Scheme.find({ schemeId: { $in: schemeIds }, status: 'ACTIVE' }).lean();
        } catch (err) {
          targetSchemes = getSeedSchemesFallback().filter(s => schemeIds.includes(s.schemeId));
        }
      } else {
        targetSchemes = getSeedSchemesFallback().filter(s => schemeIds.includes(s.schemeId));
      }
    } else {
      // Evaluate candidate schemes matching profile
      targetSchemes = await findCandidateSchemes(userProfile, { limit: 30 });
    }

    // Run deterministic evaluation across all schemes
    const detailedResults = [];

    for (const scheme of targetSchemes) {
      const evalResult = evaluateScheme(scheme, userProfile);
      const fullTrace = generateEligibilityTrace(evalResult, scheme);
      const explanation = await generateExplanation(fullTrace);

      detailedResults.push({
        ...fullTrace,
        explanation
      });

      // Log match result in background if DB is active
      if (conversationId && isDbConnected) {
        MatchLog.create({
          conversationId,
          schemeId: scheme.schemeId,
          schemeName: scheme.name,
          status: evalResult.status,
          conditions: evalResult.conditions,
          missingFields: evalResult.missingFields,
          gapSummary: evalResult.gapSummary,
          ruleVersion: scheme.version || 1
        }).catch(err => console.warn(`[MatchLog Warning] ${err.message}`));
      }
    }

    const eligible = detailedResults.filter(r => r.status === 'ELIGIBLE');
    const needInfo = detailedResults.filter(r => r.status === 'NEED_INFO');
    const notEligible = detailedResults.filter(r => r.status === 'NOT_ELIGIBLE');

    const fundingStacks = generateFundingStacks(eligible, userProfile);

    return res.json({
      success: true,
      summary: {
        totalEvaluated: detailedResults.length,
        eligibleCount: eligible.length,
        needInfoCount: needInfo.length,
        notEligibleCount: notEligible.length,
        stackCount: fundingStacks.length
      },
      results: {
        eligible,
        needInfo,
        notEligible
      },
      fundingStacks,
      profile: userProfile
    });
  } catch (error) {
    next(error);
  }
};
