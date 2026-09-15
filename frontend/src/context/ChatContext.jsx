import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageConfig } from '../i18n/languages.js';
import { t as translate } from '../i18n/translations.js';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [candidateCount, setCandidateCount] = useState(0);
  const [conversationStatus, setConversationStatus] = useState('ACTIVE');
  const [matchResults, setMatchResults] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  // Load language preference from localStorage or default
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('udyamsetu_language') || localStorage.getItem('schemesaathi_language');
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('udyamsetu_language', newLang);
    } catch (e) {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  // Translation helper bound to current language
  const t = useCallback(
    (keyPath, fallback = '') => {
      return translate(language, keyPath, fallback);
    },
    [language]
  );

  const currentLanguageConfig = getLanguageConfig(language);

  // Text-To-Speech Synthesis
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  }, []);

  const speakText = useCallback(
    (text, messageId = null) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        alert('Text-to-speech is not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();

      if (speakingMessageId === messageId) {
        setSpeakingMessageId(null);
        return;
      }

      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguageConfig.speechVoiceLang || 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      utterance.onerror = () => {
        setSpeakingMessageId(null);
      };

      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    },
    [currentLanguageConfig, speakingMessageId]
  );

  const initSession = async () => {
    try {
      setIsLoading(true);
      const data = await api.startChat(language);
      setConversationId(data.conversationId);
      setMessages([data.botMessage]);
      setProfile(data.profile || {});
      setConversationStatus('ACTIVE');
      setMatchResults(null);
    } catch (err) {
      console.error('Session init error:', err);
      setMessages([
        {
          role: 'assistant',
          content: 'Namaste! I am UDYAM SETU AI Advisor. Let us find the right government scheme for your business. Tell me about your enterprise, required loan amount, and social category to begin.',
          contentEn: 'Namaste! I am UDYAM SETU AI Advisor. Let us find the right government scheme for your business. Tell me about your enterprise, required loan amount, and social category to begin.',
          contentHi: 'नमस्ते! मैं उद्यम सेतु एआई सलाहकार हूँ। आइए आपके व्यवसाय के लिए सही सरकारी योजना खोजें। शुरुआत करने के लिए अपने उद्यम, आवश्यक ऋण राशि और सामाजिक श्रेणी के बारे में बताएं।',
          quickReplies: [
            { text: 'Tailoring / Boutique (सिलाई / बुटीक)', payload: 'I run a tailoring boutique shop and need loan' },
            { text: 'Food Stall / Vendor (खान-पान / विक्रेता)', payload: 'I am a street food vendor and need working capital' },
            { text: 'Manufacturing / Tech (विनिर्माण / तकनीकी)', payload: 'I want to start a manufacturing unit' }
          ],
          timestamp: new Date()
        }
      ]);
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

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await api.sendMessage(conversationId, text, language);
      setMessages((prev) => [...prev, data.botMessage]);
      setProfile(data.profile || {});
      setCandidateCount(data.candidateCount || 0);
      setConversationStatus(data.status);
    } catch (err) {
      console.error('Message send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('common.error', 'Sorry, I encountered an error connecting to the server. Please try again.'),
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
        setLanguage,
        toggleLanguage,
        t,
        currentLanguageConfig,
        supportedLanguages: SUPPORTED_LANGUAGES,
        speakText,
        stopSpeaking,
        speakingMessageId,
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
