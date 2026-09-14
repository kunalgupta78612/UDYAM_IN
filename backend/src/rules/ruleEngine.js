import { evaluateCondition } from './conditionEvaluator.js';

export const MATCH_STATUS = {
  ELIGIBLE: 'ELIGIBLE',
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
  NEED_INFO: 'NEED_INFO'
};

/**
 * Evaluates a single scheme against a user profile.
 * 
 * Rules:
 * 1. If ANY mandatory condition definitively fails -> NOT_ELIGIBLE.
 * 2. Else if ANY mandatory condition is missing user data -> NEED_INFO.
 * 3. Else (all mandatory conditions pass) -> ELIGIBLE.
 * 
 * @param {Object} scheme - Full Scheme document or JSON
 * @param {Object} profile - User profile document or JSON
 * @returns {Object} Scheme evaluation result with itemized condition traces
 */
export const evaluateScheme = (scheme, profile = {}) => {
  if (!scheme || !Array.isArray(scheme.conditions)) {
    throw new Error('Invalid scheme format: missing conditions array');
  }

  const traces = [];
  const missingFields = new Set();
  let hasFailedMandatory = false;
  let hasMissingMandatory = false;

  for (const condition of scheme.conditions) {
    const trace = evaluateCondition(condition, profile);
    traces.push(trace);

    if (trace.status === 'MISSING') {
      missingFields.add(condition.field);
      if (condition.required !== false) {
        hasMissingMandatory = true;
      }
    } else if (trace.status === 'EVALUATED') {
      if (trace.result === false && condition.required !== false) {
        hasFailedMandatory = true;
      }
    }
  }

  // Also verify requiredFields defined at the scheme root level
  if (Array.isArray(scheme.requiredFields)) {
    scheme.requiredFields.forEach((field) => {
      const val = profile[field];
      if (val === undefined || val === null || val === '') {
        missingFields.add(field);
        hasMissingMandatory = true;
      }
    });
  }

  let status = MATCH_STATUS.ELIGIBLE;
  if (hasFailedMandatory) {
    status = MATCH_STATUS.NOT_ELIGIBLE;
  } else if (hasMissingMandatory) {
    status = MATCH_STATUS.NEED_INFO;
  }

  // Generate a concise gap summary if not eligible
  let gapSummary = null;
  if (status === MATCH_STATUS.NOT_ELIGIBLE) {
    const failedTraces = traces.filter(t => t.result === false);
    gapSummary = failedTraces.map(t => t.reason).join(' | ');
  }

  return {
    schemeId: scheme.schemeId,
    schemeName: scheme.name,
    organization: scheme.organization,
    status,
    missingFields: Array.from(missingFields),
    gapSummary,
    conditions: traces,
    financialBenefits: scheme.financialBenefits || null,
    applicationRoute: scheme.applicationRoute || null,
    version: scheme.version || 1,
    verifiedOn: scheme.verifiedOn || null
  };
};

/**
 * Evaluates multiple schemes against a user profile and returns triaged results.
 * @param {Array<Object>} schemes - Array of schemes
 * @param {Object} profile - User profile
 * @returns {Object} Triaged bucketed results
 */
export const evaluateMultipleSchemes = (schemes = [], profile = {}) => {
  const results = schemes.map(scheme => evaluateScheme(scheme, profile));

  const eligible = results.filter(r => r.status === MATCH_STATUS.ELIGIBLE);
  const needInfo = results.filter(r => r.status === MATCH_STATUS.NEED_INFO);
  const notEligible = results.filter(r => r.status === MATCH_STATUS.NOT_ELIGIBLE);

  return {
    summary: {
      total: results.length,
      eligibleCount: eligible.length,
      needInfoCount: needInfo.length,
      notEligibleCount: notEligible.length
    },
    results,
    eligible,
    needInfo,
    notEligible
  };
};
