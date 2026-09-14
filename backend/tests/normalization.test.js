import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  normalizeBusinessType, 
  normalizeCategory, 
  normalizeGender, 
  parseIndianCurrency 
} from '../src/utils/normalization.js';

test('Normalization - Business Types Mapping', () => {
  assert.equal(normalizeBusinessType('silai ki shop'), 'tailoring');
  assert.equal(normalizeBusinessType('stitching and boutique'), 'tailoring');
  assert.equal(normalizeBusinessType('kirana store'), 'retail');
  assert.equal(normalizeBusinessType('gaay bhains ka doodh'), 'dairy');
  assert.equal(normalizeBusinessType('murgi palan farm'), 'poultry');
  assert.equal(normalizeBusinessType('pottery and hastshilp'), 'handicraft');
  assert.equal(normalizeBusinessType('ai software startup'), 'tech_startup');
  assert.equal(normalizeBusinessType('badhai wood work'), 'carpenter');
});

test('Normalization - Social Category & Gender Mapping', () => {
  assert.equal(normalizeCategory('dalit'), 'SC');
  assert.equal(normalizeCategory('scheduled caste'), 'SC');
  assert.equal(normalizeCategory('pichhda varg'), 'OBC');
  assert.equal(normalizeCategory('adivasi'), 'ST');
  assert.equal(normalizeCategory('samanya'), 'GENERAL');

  assert.equal(normalizeGender('mahila'), 'female');
  assert.equal(normalizeGender('woman'), 'female');
  assert.equal(normalizeGender('purush'), 'male');
  assert.equal(normalizeGender('kinnar'), 'transgender');
});

test('Normalization - Indian Spoken Currency Parsing', () => {
  assert.equal(parseIndianCurrency('dhai lakh'), 250000);
  assert.equal(parseIndianCurrency('dedh lakh'), 150000);
  assert.equal(parseIndianCurrency('2.5 lakh'), 250000);
  assert.equal(parseIndianCurrency('5 lakh'), 500000);
  assert.equal(parseIndianCurrency('50 hazar'), 50000);
  assert.equal(parseIndianCurrency('50k'), 50000);
  assert.equal(parseIndianCurrency('1.5 crore'), 15000000);
  assert.equal(parseIndianCurrency('1 cr'), 10000000);
  assert.equal(parseIndianCurrency('₹3,00,000'), 300000);
  assert.equal(parseIndianCurrency(300000), 300000);
});
