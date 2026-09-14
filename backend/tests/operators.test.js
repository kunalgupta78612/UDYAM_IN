import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateOperator, OPERATORS } from '../src/rules/operators.js';

test('Operators - Number Comparisons', () => {
  assert.equal(evaluateOperator('<=', 250000, 300000), true);
  assert.equal(evaluateOperator('<=', 300000, 300000), true);
  assert.equal(evaluateOperator('<=', 350000, 300000), false);

  assert.equal(evaluateOperator('>=', 18, 18), true);
  assert.equal(evaluateOperator('>=', 25, 18), true);
  assert.equal(evaluateOperator('>=', 17, 18), false);

  assert.equal(evaluateOperator('<', 100, 200), true);
  assert.equal(evaluateOperator('>', 200, 100), true);
});

test('Operators - String & Case Insensitivity', () => {
  assert.equal(evaluateOperator('==', 'female', 'female'), true);
  assert.equal(evaluateOperator('==', 'FEMALE', 'female'), true);
  assert.equal(evaluateOperator('!=', 'male', 'female'), true);
  assert.equal(evaluateOperator('!=', 'female', 'FEMALE'), false);
});

test('Operators - Array IN & NOT_IN', () => {
  assert.equal(evaluateOperator('IN', 'OBC', ['SC', 'OBC', 'ST']), true);
  assert.equal(evaluateOperator('IN', 'obc', ['SC', 'OBC', 'ST']), true);
  assert.equal(evaluateOperator('IN', 'GENERAL', ['SC', 'OBC']), false);

  assert.equal(evaluateOperator('NOT_IN', 'GENERAL', ['SC', 'OBC']), true);
  assert.equal(evaluateOperator('NOT_IN', 'SC', ['SC', 'OBC']), false);
});

test('Operators - Unsupported operator error', () => {
  assert.throws(() => evaluateOperator('LIKE', 'abc', 'abc'), /Unsupported rule operator/);
});
