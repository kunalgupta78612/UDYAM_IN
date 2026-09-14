import test from 'node:test';
import assert from 'node:assert/strict';
import { processUserMessage } from '../src/services/conversationService.js';

test('Conversation - No Repeat Question on Quick Reply Options', async () => {
  let conversation = {
    conversationId: 'test_conv_loop',
    status: 'ACTIVE',
    nextQueryField: null
  };
  let profile = {
    conversationId: 'test_conv_loop',
    state: 'ALL'
  };

  const sampleAnswers = {
    purpose: 'Business Loan',
    businessType: 'Tailoring / Boutique',
    category: 'OBC',
    gender: 'Female',
    familyIncome: '₹2.5 Lakh',
    age: '18 - 25 Years',
    projectCost: '₹1 - ₹2 Lakh',
    udyamRegistered: 'Yes'
  };

  // Turn 1: User specifies business
  let res = await processUserMessage({
    message: 'Tailoring / Boutique',
    conversation,
    profile
  });
  profile = res.profile;
  conversation.nextQueryField = res.nextQueryField;
  assert.equal(profile.businessType, 'tailoring');

  const askedQuestions = [];

  // Loop through dialogue questions until confirmation
  let turn = 0;
  while (res.nextQueryField && turn < 10) {
    turn++;
    const currentField = res.nextQueryField;
    assert.ok(!askedQuestions.includes(currentField), `Must not ask for "${currentField}" more than once! History: ${askedQuestions.join(', ')}`);
    askedQuestions.push(currentField);

    const userReply = sampleAnswers[currentField] || 'OBC';
    res = await processUserMessage({
      message: userReply,
      conversation,
      profile
    });

    profile = res.profile;
    conversation.nextQueryField = res.nextQueryField;
  }

  assert.equal(res.conversationStatus, 'CONFIRMATION', 'Must reach CONFIRMATION state without looping');
  assert.equal(profile.projectCost, 200000, 'Project cost must be 200000');
  assert.equal(profile.familyIncome, 250000, 'Family income must be 250000');
  assert.ok(profile.age >= 18, 'Age must be populated');
});
