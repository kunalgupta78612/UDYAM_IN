import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [candidateCount, setCandidateCount] = useState(0);
  const [conversationStatus, setConversationStatus] = useState('ACTIVE');
  const [matchResults, setMatchResults] = useState(null);
  const [language, setLanguage] = useState('en'); // 'en' or 'hi'

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const initSession = async () => {
    try {
      setIsLoading(true);
      const data = await api.startChat();
      setConversationId(data.conversationId);
      setMessages([data.botMessage]);
      setProfile(data.profile || {});
      setConversationStatus('ACTIVE');
      setMatchResults(null);
    } catch (err) {
      console.error('Session init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendUserMessage = async (text) => {
    if (!text || !text.trim() || !conversationId) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await api.sendMessage(conversationId, text);
      setMessages(prev => [...prev, data.botMessage]);
      setProfile(data.profile || {});
      setCandidateCount(data.candidateCount || 0);
      setConversationStatus(data.status);
    } catch (err) {
      console.error('Message send error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to the server. Please try again.',
          contentEn: 'Sorry, I encountered an error connecting to the server. Please try again.',
          contentHi: 'क्षमा करें, सर्वर से कनेक्ट करने में समस्या आई। कृपया पुनः प्रयास करें।',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEligibilityCheck = async (customProfile = null) => {
    try {
      setIsLoading(true);
      const targetProfile = customProfile || profile;
      const data = await api.matchSchemes({
        conversationId,
        profile: targetProfile
      });
      setMatchResults(data);
      return data;
    } catch (err) {
      console.error('Eligibility check error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversationId,
        messages,
        profile,
        setProfile,
        isLoading,
        candidateCount,
        conversationStatus,
        matchResults,
        language,
        toggleLanguage,
        initSession,
        sendUserMessage,
        triggerEligibilityCheck
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
