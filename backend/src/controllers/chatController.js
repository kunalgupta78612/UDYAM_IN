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
      contentByLang: {
        en: 'Namaste! I am Udyam Setu AI. I can help you discover government schemes, subsidies, and loans tailored to your business.\n\nDo you already have a specific scheme in mind, or would you like me to help you find one?',
        hi: 'नमस्ते! मैं उद्यम सेतु एआई (UDYAM SETU) हूँ। मैं आपके व्यवसाय के लिए उपयुक्त सरकारी योजनाओं, अनुदानों और ऋणों को खोजने में आपकी मदद कर सकता हूँ।\n\nक्या आप पहले से किसी विशिष्ट योजना के बारे में जानते हैं, या आप चाहते हैं कि मैं आपके लिए उपयुक्त योजना खोजूँ?',
        mr: 'नमस्ते! मी उद्यम सेतु (Udyam Setu) आहे. मी तुमच्या व्यवसायासाठी योग्य सरकारी योजना, अनुदाने आणि कर्ज शोधण्यात मदत करू शकतो.\n\nतुम्हाला आधीच एखाद्या विशिष्ट योजनेबद्दल माहिती आहे का, की मी योग्य योजना शोधण्यात मदत करू?',
        bn: 'নমস্কার! আমি উদ্যোগ সেতু (Udyam Setu)। আমি আপনার ব্যবসার উপযোগী সরকারি স্কিম, অনুদান এবং ঋণ খুঁজে পেতে সাহায্য করতে পারি।\n\nআপনার কি ইতিমধ্যে নির্দিষ্ট কোনো স্কিম জানা আছে, নাকি আমি আপনাকে উপযুক্ত স্কিম খুঁজে পেতে সাহায্য করব?',
        ta: 'வணக்கம்! நான் உத்யம் சேது (Udyam Setu). உங்கள் வணிகத்திற்கு ஏற்ற அரசு திட்டங்கள், மானியங்கள் மற்றும் கடன்களைக் கண்டறிய நான் உதவ முடியும்.\n\nஉங்களுக்கு ஏற்கனவே ஏதேனும் குறிப்பிட்ட திட்டம் தெரியுமா, அல்லது நான் பொருத்தமான திட்டத்தைக் கண்டறிய உதவ வேண்டுமா?',
        te: 'నమస్కారం! నేను ఉద్యమ్ సేతు (Udyam Setu). మీ వ్యాపారానికి తగిన ప్రభుత్వ పథకాలు, రాయితీలు మరియు రుణాలను కనుగొనడంలో నేను సహాయపడగలను.\n\nమీకు ఇప్పటికే ఏదైనా నిర్దిష్ట పథకం గురించి తెలుసా, లేదా నేను మీకు తగిన పథకాన్ని కనుగొనాలా?',
        gu: 'નમસ્તે! હું ઉદ્યમ સેતુ (Udyam Setu) છું. હું તમારા વ્યવસાય માટે યોગ્ય સરકારી યોજનાઓ, સબસિડી અને લોન શોધવામાં તમારી મદદ કરી શકું છું.\n\nશું તમે પહેલેથી જ કોઈ ચોક્કસ યોજના વિશે જાણો છો, કે હું તમારા માટે યોગ્ય યોજના શોધું?',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ಉದ್ಯಮ್ ಸೇತು (Udyam Setu). ನಿಮ್ಮ ವ್ಯವಹಾರಕ್ಕೆ ಸೂಕ್ತವಾದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಅನುದಾನಗಳು ಮತ್ತು ಸಾಲಗಳನ್ನು ಹುಡುಕಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.\n\nನಿಮಗೆ ಈಗಾಗಲೇ ನಿರ್ದಿಷ್ಟ ಯೋಜನೆಯ ಬಗ್ಗೆ ತಿಳಿದಿದೆಯೇ ಅಥವಾ ನಿಮಗಾಗಿ ಸೂಕ್ತ ಯೋಜನೆಯನ್ನು ನಾನು ಹುಡುಕಬೇಕೇ?',
        pa: 'ਨਮਸਤੇ! ਮੈਂ ਉਦਯਮ ਸੇਤੂ (Udyam Setu) ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਕਾਰੋਬਾਰ ਲਈ ਢੁਕਵੀਆਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ, ਗ੍ਰਾਂਟਾਂ ਅਤੇ ਕਰਜ਼ੇ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।\n\nਕੀ ਤੁਸੀਂ ਪਹਿਲਾਂ ਹੀ ਕਿਸੇ ਖਾਸ ਸਕੀਮ ਬਾਰੇ ਜਾਣਦੇ ਹੋ, ਜਾਂ ਕੀ ਤੁਸੀਂ ਚਾਹੁੰਦੇ ਹੋ ਕਿ ਮੈਂ ਤੁਹਾਡੇ ਲਈ ਢੁਕਵੀਂ ਸਕੀਮ ਲੱਭਾਂ?',
        or: 'ନମସ୍କାର! ମୁଁ ଉଦ୍ୟମ ସେତୁ (Udyam Setu)। ଆପଣଙ୍କ ବ୍ୟବସାୟ ପାଇଁ ଉପଯୁକ୍ତ ସରକାରୀ ଯୋଜନା, ଅନୁଦାନ ଓ ଋଣ ଖୋଜିବାରେ ମୁଁ ସାହାଯ୍ୟ କରିପାରିବି।\n\nଆପଣ ପୂର୍ବରୁ କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ଯୋଜନା ବିଷୟରେ ଜାଣନ୍ତି କି, ନା ମୁଁ ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ଯୋଜନା ଖୋଜିବି?'
      },
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
    const lang = req.body.language || 'en';
    const localizedContent = (processResult.botMessage.contentByLang && processResult.botMessage.contentByLang[lang]) 
      || (lang === 'hi' ? processResult.botMessage.contentHi : processResult.botMessage.contentEn)
      || processResult.botMessage.contentEn;

    const botMsgObj = {
      role: 'assistant',
      content: localizedContent,
      contentEn: processResult.botMessage.contentEn,
      contentHi: processResult.botMessage.contentHi,
      contentByLang: processResult.botMessage.contentByLang || {},
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
