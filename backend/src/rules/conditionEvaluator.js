import { evaluateOperator } from './operators.js';

/**
 * Checks if a profile field value is considered missing/unprovided.
 * @param {*} val 
 * @returns {boolean}
 */
export const isValueMissing = (val) => {
  return val === undefined || val === null || val === '';
};

/**
 * Formats a human-readable reason string based on evaluation outcome.
 */
const generateReason = (condition, userValue, passed) => {
  const { field, operator, value, unit, description } = condition;
  const unitStr = unit ? ` ${unit}` : '';

  if (passed) {
    return `${description || field} satisfied (User: ${userValue}${unitStr}, Required: ${operator} ${JSON.stringify(value)}${unitStr})`;
  }

  // Failure reasons
  if (operator === '<=') {
    const diff = Number(userValue) - Number(value);
    return `Exceeds permitted maximum limit by ${diff}${unitStr}.`;
  }
  if (operator === '>=') {
    const diff = Number(value) - Number(userValue);
    return `Below required minimum threshold by ${diff}${unitStr}.`;
  }
  if (operator === 'IN') {
    return `"${userValue}" is not in the eligible categories: [${Array.isArray(value) ? value.join(', ') : value}].`;
  }
  if (operator === '==') {
    return `Required ${field} is "${value}", but user has "${userValue}".`;
  }

  return `Failed requirement: ${description || field}.`;
};

/**
 * Evaluates a single condition against a user profile.
 * @param {Object} condition - Condition object from scheme.conditions
 * @param {Object} profile - User profile object
 * @returns {Object} Evaluation trace item
 */
export const evaluateCondition = (condition, profile = {}) => {
  const { conditionId, field, operator, value, unit, clause, sourceId, required = true, description } = condition;
  const userValue = profile[field];

  if (isValueMissing(userValue)) {
    return {
      conditionId,
      field,
      required,
      status: 'MISSING',
      result: null,
      userValue: null,
      requiredValue: value,
      operator,
      unit,
      clause,
      sourceId,
      description,
      reason: `Required information "${field}" has not been provided yet.`
    };
  }

  const passed = evaluateOperator(operator, userValue, value);

  return {
    conditionId,
    field,
    required,
    status: 'EVALUATED',
    result: passed,
    userValue,
    requiredValue: value,
    operator,
    unit,
    clause,
    sourceId,
    description,
    reason: generateReason(condition, userValue, passed)
  };
};
