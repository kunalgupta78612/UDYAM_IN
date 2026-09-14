import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateScheme, evaluateMultipleSchemes, MATCH_STATUS } from '../src/rules/ruleEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = fs.readFileSync(path.join(__dirname, '../seed/schemes.json'), 'utf8');
const schemes = JSON.parse(rawData);

const tlsScheme = schemes.find(s => s.schemeId === 'nsfdc_tls_001');
const swarnimaScheme = schemes.find(s => s.schemeId === 'nbcfdc_swarnima_005');

test('Rule Engine - Perfect Eligible Match (NSFDC TLS)', () => {
  const profile = {
    category: 'SC',
    familyIncome: 250000,
    age: 28,
    projectCost: 600000
  };

  const result = evaluateScheme(tlsScheme, profile);

  assert.equal(result.status, MATCH_STATUS.ELIGIBLE);
  assert.equal(result.missingFields.length, 0);
  assert.equal(result.gapSummary, null);
  assert.ok(result.conditions.every(c => c.result === true));
});

test('Rule Engine - Rejection on Income Breach (NSFDC TLS)', () => {
  const profile = {
    category: 'SC',
    familyIncome: 450000, // Limit is 3,00,000
    age: 28,
    projectCost: 600000
  };

  const result = evaluateScheme(tlsScheme, profile);

  assert.equal(result.status, MATCH_STATUS.NOT_ELIGIBLE);
  assert.ok(result.gapSummary.includes('Exceeds permitted maximum limit by 150000 INR'));
  
  const incomeTrace = result.conditions.find(c => c.field === 'familyIncome');
  assert.equal(incomeTrace.result, false);
  assert.equal(incomeTrace.userValue, 450000);
});

test('Rule Engine - Rejection on Category Mismatch (New Swarnima)', () => {
  const profile = {
    category: 'SC', // Requires OBC
    gender: 'female',
    familyIncome: 200000,
    age: 30,
    projectCost: 150000
  };

  const result = evaluateScheme(swarnimaScheme, profile);

  assert.equal(result.status, MATCH_STATUS.NOT_ELIGIBLE);
  const catTrace = result.conditions.find(c => c.field === 'category');
  assert.equal(catTrace.result, false);
});

test('Rule Engine - NEED_INFO on Partial Profile', () => {
  const partialProfile = {
    category: 'SC',
    familyIncome: 200000
    // missing age and projectCost
  };

  const result = evaluateScheme(tlsScheme, partialProfile);

  assert.equal(result.status, MATCH_STATUS.NEED_INFO);
  assert.ok(result.missingFields.includes('age'));
  assert.ok(result.missingFields.includes('projectCost'));
});

test('Rule Engine - Multi-Scheme Batch Evaluation Bucketing', () => {
  const profile = {
    category: 'OBC',
    gender: 'female',
    familyIncome: 200000,
    age: 25,
    projectCost: 150000
  };

  const { summary, eligible, notEligible, needInfo } = evaluateMultipleSchemes(schemes, profile);

  assert.equal(summary.total, 18);
  assert.ok(summary.eligibleCount > 0, 'Should have at least one eligible scheme for OBC female');
  assert.ok(summary.notEligibleCount > 0, 'Should have ineligible schemes (e.g. SC-only)');
  assert.equal(summary.eligibleCount + summary.notEligibleCount + summary.needInfoCount, 18);
});
