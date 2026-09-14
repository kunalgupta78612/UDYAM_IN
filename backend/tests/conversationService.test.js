import test from 'node:test';
import assert from 'node:assert/strict';
import { selectNextFieldToQuery } from '../src/services/conversationService.js';

test('Conversation Service - Question Heuristic selects purpose if empty', () => {
  const emptyProfile = {};
  const next = selectNextFieldToQuery([], emptyProfile);
  assert.equal(next, 'purpose');
});

test('Conversation Service - Question Heuristic finds most critical missing field across schemes', () => {
  const candidateSchemes = [
    { requiredFields: ['category', 'familyIncome', 'age', 'projectCost'] },
    { requiredFields: ['category', 'gender', 'familyIncome'] },
    { requiredFields: ['category', 'familyIncome', 'age'] }
  ];

  const profile = {
    purpose: 'business_loan',
    businessType: 'tailoring'
  };

  // 'category' and 'familyIncome' appear in all 3 schemes
  const nextField = selectNextFieldToQuery(candidateSchemes, profile);
  assert.ok(['category', 'familyIncome'].includes(nextField));
});

test('Conversation Service - Returns null when all required fields are satisfied', () => {
  const candidateSchemes = [
    { requiredFields: ['category', 'familyIncome', 'age'] }
  ];

  const completeProfile = {
    purpose: 'business_loan',
    businessType: 'tailoring',
    category: 'OBC',
    familyIncome: 250000,
    age: 28
  };

  const nextField = selectNextFieldToQuery(candidateSchemes, completeProfile);
  assert.equal(nextField, null);
});
