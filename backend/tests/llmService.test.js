import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSlotsOffline, generateExplanation } from '../src/services/llmService.js';

test('LLM Service - Offline Extraction for Known Scheme Mention (Journey A)', () => {
  const res = extractSlotsOffline('I want to apply for Stand-Up India scheme.');
  assert.equal(res.intent, 'SPECIFIC_SCHEME');
  assert.equal(res.knownSchemeName, 'Stand-Up India Scheme');
});

test('LLM Service - Offline Extraction for Intent & Business (Journey B)', () => {
  const res = extractSlotsOffline('Mujhe silai ki dukaan shuru karni hai aur loan chahiye.');
  assert.equal(res.intent, 'FIND_SCHEMES');
  assert.equal(res.extractedFields.businessType, 'tailoring');
  assert.equal(res.extractedFields.purpose, 'business_loan');
});

test('LLM Service - Offline Extraction for Numbers, Category, and Age', () => {
  const res = extractSlotsOffline('Main OBC hu aur meri income dhai lakh hai, meri umra 28 saal hai.');
  assert.equal(res.extractedFields.category, 'OBC');
  assert.equal(res.extractedFields.familyIncome, 250000);
  assert.equal(res.extractedFields.age, 28);
});

test('LLM Service - Bilingual Explanation Generation', async () => {
  const mockTrace = {
    schemeName: 'NSFDC Term Loan Scheme',
    status: 'ELIGIBLE',
    nextAction: {
      routeName: 'State Channelizing Agency (SCA)',
      instructions: 'Submit form to SCA'
    }
  };

  const exp = await generateExplanation(mockTrace);
  assert.equal(exp.status, 'ELIGIBLE');
  assert.ok(exp.explanationEnglish.includes('Congratulations'));
  assert.ok(exp.explanationHindi.includes('बधाई'));
});
