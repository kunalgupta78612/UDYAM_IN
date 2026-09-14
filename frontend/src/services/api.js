const BASE_URL = '/api';

export const api = {
  async startChat() {
    const res = await fetch(`${BASE_URL}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to start chat session');
    return res.json();
  },

  async sendMessage(conversationId, message) {
    const res = await fetch(`${BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message })
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
  }
};
