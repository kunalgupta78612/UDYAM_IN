import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateScheme } from '../src/rules/ruleEngine.js';
import { generateEligibilityTrace, formatCurrencyINR } from '../src/rules/traceGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = fs.readFileSync(path.join(__dirname, '../seed/schemes.json'), 'utf8');
const schemes = JSON.parse(rawData);
const tlsScheme = schemes.find(s => s.schemeId === 'nsfdc_tls_001');

test('Trace Generator - Currency formatting', () => {
  assert.equal(formatCurrencyINR(250000), '₹2,50,000');
  assert.equal(formatCurrencyINR(10000000), '₹1,00,00,000');
  assert.equal(formatCurrencyINR(null), 'N/A');
});

test('Trace Generator - Complete Trace & Gap Report Generation', () => {
  const profile = {
    category: 'SC',
    familyIncome: 450000, // Limit is 300000 (Failed)
    age: 28, // Minimum 18 (Passed)
    projectCost: 600000 // Max 5000000 (Passed)
  };

  const evalResult = evaluateScheme(tlsScheme, profile);
  const fullTrace = generateEligibilityTrace(evalResult, tlsScheme);

  assert.equal(fullTrace.status, 'NOT_ELIGIBLE');
  assert.equal(fullTrace.metrics.passedCount, 3);
  assert.equal(fullTrace.metrics.failedCount, 1);
  assert.equal(fullTrace.metrics.missingCount, 0);

  // Verify Gap Report
  assert.equal(fullTrace.gapReport.hasGaps, true);
  assert.equal(fullTrace.gapReport.deficiencies.length, 1);
  assert.equal(fullTrace.gapReport.deficiencies[0].field, 'familyIncome');

  // Verify Next Action & Routing
  assert.equal(fullTrace.nextAction.routeType, 'SCA');
  assert.ok(fullTrace.nextAction.url.startsWith('https://'));

  // Verify documents
  assert.ok(fullTrace.documents.length > 0);
});
