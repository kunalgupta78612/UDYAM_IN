/**
 * Pure Deterministic Operator Evaluators for Government Scheme Rules
 */

export const OPERATORS = {
  '==': (userVal, targetVal) => {
    if (typeof userVal === 'string' && typeof targetVal === 'string') {
      return userVal.trim().toUpperCase() === targetVal.trim().toUpperCase();
    }
    return userVal === targetVal;
  },

  '!=': (userVal, targetVal) => {
    if (typeof userVal === 'string' && typeof targetVal === 'string') {
      return userVal.trim().toUpperCase() !== targetVal.trim().toUpperCase();
    }
    return userVal !== targetVal;
  },

  '<': (userVal, targetVal) => {
    const numUser = Number(userVal);
    const numTarget = Number(targetVal);
    if (isNaN(numUser) || isNaN(numTarget)) return false;
    return numUser < numTarget;
  },

  '<=': (userVal, targetVal) => {
    const numUser = Number(userVal);
    const numTarget = Number(targetVal);
    if (isNaN(numUser) || isNaN(numTarget)) return false;
    return numUser <= numTarget;
  },

  '>': (userVal, targetVal) => {
    const numUser = Number(userVal);
    const numTarget = Number(targetVal);
    if (isNaN(numUser) || isNaN(numTarget)) return false;
    return numUser > numTarget;
  },

  '>=': (userVal, targetVal) => {
    const numUser = Number(userVal);
    const numTarget = Number(targetVal);
    if (isNaN(numUser) || isNaN(numTarget)) return false;
    return numUser >= numTarget;
  },

  'IN': (userVal, targetArray) => {
    if (!Array.isArray(targetArray)) return false;
    if (typeof userVal === 'string') {
      const normalizedUser = userVal.trim().toUpperCase();
      return targetArray.some(item => String(item).trim().toUpperCase() === normalizedUser);
    }
    return targetArray.includes(userVal);
  },

  'NOT_IN': (userVal, targetArray) => {
    return !OPERATORS['IN'](userVal, targetArray);
  }
};

/**
 * Evaluates a single binary operation between user value and target value.
 * @param {string} operator 
 * @param {*} userValue 
 * @param {*} targetValue 
 * @returns {boolean}
 */
export const evaluateOperator = (operator, userValue, targetValue) => {
  const opFunc = OPERATORS[operator];
  if (!opFunc) {
    throw new Error(`Unsupported rule operator: "${operator}"`);
  }
  return opFunc(userValue, targetValue);
};
