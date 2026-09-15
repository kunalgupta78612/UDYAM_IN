import mongoose from 'mongoose';
import { Conversation, Profile } from '../models/index.js';
import { processUserMessage } from '../services/conversationService.js';

// In-memory fallback stores when running in test/mock mode without live Mongo connection
const memoryConversations = new Map();
const memoryProfiles = new Map();

/**
 * Starts a new chat session.
 * Endpoint: POST /api/chat/start
 */
export const startConversation = async (req, res, next) => {
  try {
    const conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const initialMessage = {
      role: 'assistant',
      contentEn: 'Namaste! I am Udyam Setu AI. I can help you discover government schemes, subsidies, and loans tailored to your business.\n\nDo you already have a specific scheme in mind, or would you like me to help you find one?',
      contentHi: 'नमस्ते! मैं उद्यम सेतु एआई (UDYAM SETU) हूँ। मैं आपके व्यवसाय के लिए उपयुक्त सरकारी योजनाओं, अनुदानों और ऋणों को खोजने में आपकी मदद कर सकता हूँ।\n\nक्या आप पहले से किसी विशिष्ट योजना के बारे में जानते हैं, या आप चाहते हैं कि मैं आपके लिए उपयुक्त योजना खोजूँ?',
      quickReplies: ['Help me find a scheme (योजना खोजने में मदद करें)', 'I know my scheme (मुझे योजना का नाम पता है)'],
      timestamp: new Date()
    };

    const initialProfile = {
      conversationId,
      state: 'ALL',
      confirmed: false
    };

    const isDbConnected = mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test';

    if (isDbConnected) {
      try {
        await Conversation.create({
          conversationId,
          messages: [initialMessage],
          status: 'ACTIVE'
        });
        await Profile.create(initialProfile);
      } catch (dbErr) {
        memoryConversations.set(conversationId, { messages: [initialMessage], status: 'ACTIVE' });
        memoryProfiles.set(conversationId, initialProfile);
      }
    } else {
      memoryConversations.set(conversationId, { messages: [initialMessage], status: 'ACTIVE' });
      memoryProfiles.set(conversationId, initialProfile);
    }

    return res.status(201).json({
      success: true,
      conversationId,
      botMessage: initialMessage,
      profile: initialProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles incoming chat messages.
 * Endpoint: POST /api/chat/message
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: conversationId and message'
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test';
    let conversation = null;
    let profile = null;

    if (isDbConnected) {
      try {
        conversation = await Conversation.findOne({ conversationId });
        profile = await Profile.findOne({ conversationId });
      } catch (err) {
        conversation = memoryConversations.get(conversationId);
        profile = memoryProfiles.get(conversationId);
      }
    } else {
      conversation = memoryConversations.get(conversationId) || { messages: [], status: 'ACTIVE' };
      profile = memoryProfiles.get(conversationId) || { conversationId };
    }

    if (!conversation) {
      conversation = { conversationId, messages: [], status: 'ACTIVE' };
    }
    if (!profile) {
      profile = { conversationId };
    }

    // Process message through conversational AI pipeline
    const processResult = await processUserMessage({
      message,
      conversation,
      profile: profile.toObject ? profile.toObject() : profile
    });

    const userMsgObj = { role: 'user', content: message, timestamp: new Date() };
    const botMsgObj = {
      role: 'assistant',
      content: processResult.botMessage.contentEn,
      contentEn: processResult.botMessage.contentEn,
      contentHi: processResult.botMessage.contentHi,
      quickReplies: processResult.botMessage.quickReplies,
      showProfileConfirmation: processResult.botMessage.showProfileConfirmation,
      timestamp: new Date()
    };

    // Update conversation and profile records
    if (isDbConnected) {
      try {
        await Conversation.findOneAndUpdate(
          { conversationId },
          {
            $push: { messages: { $each: [userMsgObj, botMsgObj] } },
            selectedSchemeId: processResult.selectedSchemeId,
            candidateSchemeIds: processResult.candidateSchemeIds,
            status: processResult.conversationStatus,
            nextQueryField: processResult.nextQueryField || null
          },
          { upsert: true }
        );

        await Profile.findOneAndUpdate(
          { conversationId },
          processResult.profile,
          { upsert: true, new: true }
        );
      } catch (err) {
        memoryConversations.set(conversationId, {
          messages: [...(conversation.messages || []), userMsgObj, botMsgObj],
          status: processResult.conversationStatus,
          nextQueryField: processResult.nextQueryField || null
        });
        memoryProfiles.set(conversationId, processResult.profile);
      }
    } else {
      memoryConversations.set(conversationId, {
        messages: [...(conversation.messages || []), userMsgObj, botMsgObj],
        status: processResult.conversationStatus,
        nextQueryField: processResult.nextQueryField || null
      });
      memoryProfiles.set(conversationId, processResult.profile);
    }

    return res.json({
      success: true,
      conversationId,
      status: processResult.conversationStatus,
      botMessage: botMsgObj,
      profile: processResult.profile,
      candidateCount: (processResult.candidateSchemeIds || []).length,
      nextQueryField: processResult.nextQueryField || null
    });
  } catch (error) {
    next(error);
  }
};
