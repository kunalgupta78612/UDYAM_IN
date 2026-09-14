import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildRetrievalQuery } from '../src/retrieval/filters.js';
import { calculateRelevanceScore, rankSchemes } from '../src/retrieval/ranking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = fs.readFileSync(path.join(__dirname, '../seed/schemes.json'), 'utf8');
const schemes = JSON.parse(rawData);

test('Retrieval - Query Builder Logic', () => {
  const profile = {
    category: 'OBC',
    gender: 'female',
    purpose: 'business_loan',
    businessType: 'silai shop'
  };

  const query = buildRetrievalQuery(profile);

  assert.equal(query.status, 'ACTIVE');
  assert.ok(Array.isArray(query.$and));
  assert.equal(query.$and.length, 4); // Category, Gender, Purpose, Business
});

test('Retrieval - Ranking & Relevance Scoring', () => {
  const profile = {
    category: 'OBC',
    gender: 'female',
    purpose: 'women_entrepreneur',
    businessType: 'silai'
  };

  const ranked = rankSchemes(schemes, profile);

  assert.ok(ranked.length > 0);
  assert.ok(ranked[0].relevanceScore > 0);

  // Top ranked schemes should be OBC female-oriented schemes (e.g., New Swarnima or Mahila Samriddhi)
  const topSchemeIds = ranked.slice(0, 3).map(s => s.schemeId);
  assert.ok(
    topSchemeIds.includes('nbcfdc_swarnima_005') || 
    topSchemeIds.includes('nbcfdc_mahila_samriddhi_018') ||
    topSchemeIds.includes('standup_india_011'),
    'Top schemes must match OBC female tailoring criteria'
  );
});
