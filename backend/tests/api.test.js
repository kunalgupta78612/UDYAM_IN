import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

// Helper to make mock requests to Express app without binding a real TCP port
const request = async (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const port = server.address().port;
        const options = {
          method,
          headers: { 'Content-Type': 'application/json' }
        };
        if (body) {
          options.body = JSON.stringify(body);
        }

        const res = await fetch(`http://localhost:${port}${path}`, options);
        const data = await res.json();
        server.close(() => resolve({ status: res.status, body: data }));
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
};

test('API - Health Check Endpoint', async () => {
  const res = await request('GET', '/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
});

test('API - GET /api/schemes', async () => {
  const res = await request('GET', '/api/schemes');
  assert.equal(res.status, 200);
  assert.ok(res.body.schemes.length >= 18);
});

test('API - GET /api/schemes/:schemeId', async () => {
  const res = await request('GET', '/api/schemes/nsfdc_tls_001');
  assert.equal(res.status, 200);
  assert.equal(res.body.scheme.schemeId, 'nsfdc_tls_001');
});

test('API - POST /api/chat/start & /api/chat/message flow', async () => {
  // Start session
  const startRes = await request('POST', '/api/chat/start');
  assert.equal(startRes.status, 201);
  const convId = startRes.body.conversationId;
  assert.ok(convId);

  // Send first message
  const msgRes = await request('POST', '/api/chat/message', {
    conversationId: convId,
    message: 'I want a business loan for my tailoring shop.'
  });

  assert.equal(msgRes.status, 200);
  assert.equal(msgRes.body.success, true);
  assert.equal(msgRes.body.profile.businessType, 'tailoring');
  assert.ok(msgRes.body.botMessage.contentEn);
});

test('API - POST /api/match deterministic evaluation', async () => {
  const matchRes = await request('POST', '/api/match', {
    profile: {
      category: 'OBC',
      gender: 'female',
      familyIncome: 200000,
      age: 28,
      projectCost: 150000,
      purpose: 'women_entrepreneur',
      businessType: 'tailoring'
    }
  });

  assert.equal(matchRes.status, 200);
  assert.equal(matchRes.body.success, true);
  assert.ok(matchRes.body.summary.eligibleCount > 0);
  assert.ok(matchRes.body.results.eligible.length > 0);
  
  // Verify trace item format in eligible scheme
  const topEligible = matchRes.body.results.eligible[0];
  assert.ok(topEligible.traceItems.length > 0);
  assert.ok(topEligible.explanation.explanationHindi);
  assert.ok(topEligible.nextAction.routeType);
});
