const BASE_URL = '/api';

export const api = {
  async startChat(language = 'en') {
    const res = await fetch(`${BASE_URL}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language })
    });
    if (!res.ok) throw new Error('Failed to start chat session');
    return res.json();
  },

  async sendMessage(conversationId, message, language = 'en') {
    const res = await fetch(`${BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message, language })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async confirmProfile(conversationId, updates) {
    const res = await fetch(`${BASE_URL}/profile/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, updates })
    });
    if (!res.ok) throw new Error('Failed to confirm profile');
    return res.json();
  },

  async matchSchemes({ conversationId, profile, schemeIds }) {
    const res = await fetch(`${BASE_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, profile, schemeIds })
    });
    if (!res.ok) throw new Error('Failed to evaluate scheme eligibility');
    return res.json();
  },

  async getSchemes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/schemes${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch schemes');
    return res.json();
  },

  async getSchemeById(schemeId) {
    const res = await fetch(`${BASE_URL}/schemes/${schemeId}`);
    if (!res.ok) throw new Error(`Failed to fetch scheme ${schemeId}`);
    return res.json();
  },

  // Calculator Endpoints
  async getCalculatorSchemes() {
    const res = await fetch(`${BASE_URL}/calculator/schemes`);
    if (!res.ok) throw new Error('Failed to fetch calculator schemes');
    return res.json();
  },

  async calculateEMI(params) {
    const res = await fetch(`${BASE_URL}/calculator/emi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to calculate EMI');
    return res.json();
  },

  async calculateSubsidy(params) {
    const res = await fetch(`${BASE_URL}/calculator/subsidy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to calculate subsidy');
    return res.json();
  },

  // Channel Partner Locator Endpoints
  async getNearbyPartners(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/partners/nearby${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch nearby partners');
    return res.json();
  },

  async getAllPartners(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/partners${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch channel partners');
    return res.json();
  },

  async getPartnerById(partnerId) {
    const res = await fetch(`${BASE_URL}/partners/${partnerId}`);
    if (!res.ok) throw new Error(`Failed to fetch partner ${partnerId}`);
    return res.json();
  }
};
