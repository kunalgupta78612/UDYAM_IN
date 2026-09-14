import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateScheme } from '../seed/seedSchemes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Verified Scheme Dataset - Strict Integrity Check', () => {
  const filePath = path.join(__dirname, '../seed/schemes.json');
  assert.ok(fs.existsSync(filePath), 'schemes.json must exist');

  const rawData = fs.readFileSync(filePath, 'utf8');
  const schemes = JSON.parse(rawData);

  assert.ok(Array.isArray(schemes), 'schemes.json must contain an array');
  assert.equal(schemes.length, 18, 'Must have exactly 18 verified schemes for hackathon MVP');

  const uniqueIds = new Set();

  schemes.forEach((scheme, index) => {
    // Check uniqueness
    assert.ok(!uniqueIds.has(scheme.schemeId), `Duplicate schemeId found: ${scheme.schemeId}`);
    uniqueIds.add(scheme.schemeId);

    // Run validator
    const errors = validateScheme(scheme);
    assert.deepEqual(errors, [], `Scheme #${index} (${scheme.schemeId}) failed validation: ${errors.join(', ')}`);

    // Verify conditions integrity
    scheme.conditions.forEach((cond) => {
      assert.ok(cond.clause, `Condition ${cond.conditionId} must have clause reference`);
      assert.ok(cond.sourceId, `Condition ${cond.conditionId} must have sourceId`);
    });

    // Verify applicationRoute
    assert.ok(scheme.applicationRoute?.type, `Scheme ${scheme.schemeId} must have applicationRoute type`);
    assert.ok(scheme.applicationRoute?.description, `Scheme ${scheme.schemeId} must have applicationRoute description`);
  });
});
