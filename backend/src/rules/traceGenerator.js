/**
 * Formats a raw number as an Indian Currency string (e.g. 250000 -> ₹2,50,000)
 */
export const formatCurrencyINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

/**
 * Maps technical field names to clean human-readable labels.
 */
const FIELD_LABELS = {
  category: 'Social Category',
  gender: 'Gender',
  age: 'Age (Years)',
  familyIncome: 'Annual Family Income',
  projectCost: 'Total Project Cost',
  businessType: 'Business Type',
  udyamRegistered: 'Udyam Registration',
  state: 'State / Domicile'
};

/**
 * Converts a raw condition trace into an actionable UI-ready checklist item.
 */
export const formatTraceItem = (conditionTrace, sourcesMap = new Map()) => {
  const { field, result, status, userValue, requiredValue, operator, unit, clause, sourceId, reason, description } = conditionTrace;
  
  const label = FIELD_LABELS[field] || field;
  const source = sourcesMap.get(sourceId) || {};
  const sourceUrl = source.url || null;

  let displayStatus = 'MISSING';
  let icon = '🟡';

  if (status === 'EVALUATED') {
    if (result === true) {
      displayStatus = 'PASSED';
      icon = '✅';
    } else {
      displayStatus = 'FAILED';
      icon = '❌';
    }
  }

  // Format display values
  let formattedUserVal = userValue;
  let formattedReqVal = `${operator} ${JSON.stringify(requiredValue)}`;

  if (unit === 'INR') {
    formattedUserVal = userValue !== null ? formatCurrencyINR(userValue) : 'Not Provided';
    if (operator === '<=') formattedReqVal = `Maximum ${formatCurrencyINR(requiredValue)}`;
    else if (operator === '>=') formattedReqVal = `Minimum ${formatCurrencyINR(requiredValue)}`;
    else formattedReqVal = `${operator} ${formatCurrencyINR(requiredValue)}`;
  } else if (unit === 'YEARS') {
    formattedUserVal = userValue !== null ? `${userValue} Years` : 'Not Provided';
    if (operator === '>=') formattedReqVal = `Minimum ${requiredValue} Years`;
    else if (operator === '<=') formattedReqVal = `Maximum ${requiredValue} Years`;
  } else if (field === 'category' && operator === 'IN') {
    formattedReqVal = Array.isArray(requiredValue) ? requiredValue.join(' / ') : requiredValue;
  }

  return {
    field,
    label,
    description,
    status: displayStatus,
    icon,
    userValue: formattedUserVal,
    requirement: formattedReqVal,
    clause: clause || null,
    sourceId: sourceId || null,
    sourceUrl,
    reason
  };
};

/**
 * Builds a comprehensive, audit-proof Eligibility Trace & Gap Report.
 * @param {Object} evaluationResult - Output from evaluateScheme()
 * @param {Object} scheme - Full Scheme document
 * @returns {Object} Comprehensive UI-ready Trace and Action Report
 */
export const generateEligibilityTrace = (evaluationResult, scheme) => {
  const sourcesMap = new Map();
  if (Array.isArray(scheme?.sources)) {
    scheme.sources.forEach(s => sourcesMap.set(s.sourceId, s));
  }

  const traceItems = (evaluationResult.conditions || []).map(c => formatTraceItem(c, sourcesMap));

  const passedCount = traceItems.filter(t => t.status === 'PASSED').length;
  const failedCount = traceItems.filter(t => t.status === 'FAILED').length;
  const missingCount = traceItems.filter(t => t.status === 'MISSING').length;

  // Build targeted gap guidance if rejected
  const failedItems = traceItems.filter(t => t.status === 'FAILED');
  const gapItems = failedItems.map(f => ({
    field: f.field,
    label: f.label,
    userValue: f.userValue,
    requirement: f.requirement,
    reason: f.reason,
    clause: f.clause
  }));

  return {
    schemeId: evaluationResult.schemeId,
    schemeName: evaluationResult.schemeName,
    status: evaluationResult.status,
    metrics: {
      totalConditions: traceItems.length,
      passedCount,
      failedCount,
      missingCount
    },
    traceItems,
    missingFields: evaluationResult.missingFields || [],
    gapReport: {
      hasGaps: failedItems.length > 0,
      summary: evaluationResult.gapSummary,
      deficiencies: gapItems
    },
    nextAction: {
      routeType: scheme?.applicationRoute?.type || 'OTHER',
      routeName: scheme?.applicationRoute?.name || 'Official Portal',
      url: scheme?.applicationRoute?.url || scheme?.sources?.[0]?.url || 'https://msme.gov.in',
      instructions: scheme?.applicationRoute?.description || 'Follow official application guidelines.'
    },
    documents: scheme?.documents || [],
    verifiedOn: scheme?.verifiedOn || null
  };
};
