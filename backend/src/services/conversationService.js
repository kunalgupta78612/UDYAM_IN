import { extractProfileSlots, generateConversationalReply } from './llmService.js';
import { findCandidateSchemes } from '../retrieval/schemeRetriever.js';
import { evaluateMultipleSchemes } from '../rules/ruleEngine.js';
import { isValueMissing } from '../rules/conditionEvaluator.js';

// Question templates with contextual quick-reply chips and 10 Indian language translations
const QUESTION_TEMPLATES = {
  specificScheme: {
    questionEn: 'Which government scheme would you like to evaluate?',
    questionHi: 'आप किस सरकारी योजना के लिए अपनी पात्रता जांचना चाहते हैं?',
    byLang: {
      en: 'Which government scheme would you like to evaluate?',
      hi: 'आप किस सरकारी योजना के लिए अपनी पात्रता जांचना चाहते हैं?',
      mr: 'तुम्हाला कोणत्या सरकारी योजनेसाठी तुमची पात्रता तपासायची आहे?',
      bn: 'আপনি কোন সরকারি স্কিমের জন্য আপনার যোগ্যতা যাচাই করতে চান?',
      ta: 'எந்த அரசு திட்டத்திற்கான உங்கள் தகுதியை மதிப்பிட விரும்புகிறீர்கள்?',
      te: 'మీరు ఏ ప్రభుత్వ పథకానికి మీ అర్హతను పరిశీలించాలనుకుంటున్నారు?',
      gu: 'તમે કઈ સરકારી યોજના માટે તમારી પાત્રતા તપાસવા માંગો છો?',
      kn: 'ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆಗೆ ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಪರೀಕ್ಷಿಸಲು ನೀವು ಬಯಸುತ್ತೀರಿ?',
      pa: 'ਤੁਸੀਂ ਕਿਸ ਸਰਕਾਰੀ ਸਕੀਮ ਲਈ ਆਪਣੀ ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
      or: 'ଆପଣ କେଉଁ ସରକାରୀ ଯୋଜନା ପାଇଁ ଆପଣଙ୍କ ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରିବାକୁ ଚାହାଁନ୍ତି?'
    },
    quickReplies: [
      'Stand-Up India Scheme',
      'PMEGP Loan & Subsidy',
      'PM MUDRA Yojana',
      'New Swarnima (Women)',
      'PM Vishwakarma Scheme',
      'NSFDC Term Loan'
    ]
  },
  purpose: {
    questionEn: 'What kind of support are you looking for?',
    questionHi: 'आप किस प्रकार की सहायता या योजना खोज रहे हैं?',
    byLang: {
      en: 'What kind of support are you looking for?',
      hi: 'आप किस प्रकार की सहायता या योजना खोज रहे हैं?',
      mr: 'तुम्हाला कोणत्या प्रकारच्या मदतीची किंवा योजनेची गरज आहे?',
      bn: 'আপনি কী ধরনের সহায়তা বা স্কিম খুঁজছেন?',
      ta: 'நீங்கள் எந்த வகையான உதவி அல்லது திட்டத்தை நாடுகிறீர்கள்?',
      te: 'మీరు ఎలాంటి సహాయం లేదా పథకం కోసం చూస్తున్నారు?',
      gu: 'તમે કેવા પ્રકારની સહાય અથવા યોજના શોધી રહ્યા છો?',
      kn: 'ನೀವು ಯಾವ ರೀತಿಯ ಬೆಂಬಲ ಅಥವಾ ಯೋಜನೆಯನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?',
      pa: 'ਤੁਸੀਂ ਕਿਸ ਤਰ੍ਹਾਂ ਦੀ ਸਹਾਇਤਾ ਜਾਂ ਸਕੀਮ ਲੱਭ ਰਹੇ ਹੋ?',
      or: 'ଆପଣ କେଉଁ ପ୍ରକାରର ସହାୟତା ବା ଯୋଜନା ଖୋଜୁଛନ୍ତି?'
    },
    quickReplies: ['Business Loan', 'Start New Business', 'Women Entrepreneur Support', 'Self Employment', 'Agriculture']
  },
  businessType: {
    questionEn: 'What type of business or trade are you planning or currently running?',
    questionHi: 'आप किस प्रकार का व्यवसाय या व्यापार शुरू करने या चलाने की योजना बना रहे हैं?',
    byLang: {
      en: 'What type of business or trade are you planning or currently running?',
      hi: 'आप किस प्रकार का व्यवसाय या व्यापार शुरू करने या चलाने की योजना बना रहे हैं?',
      mr: 'तुम्ही कोणत्या प्रकारचा व्यवसाय किंवा व्यापार सुरू करण्याची किंवा चालवण्याची योजना आखत आहात?',
      bn: 'আপনি কোন ধরনের ব্যবসা শুরু করার বা চালানোর পরিকল্পনা করছেন?',
      ta: 'நீங்கள் என்ன வகையான வணிகம் அல்லது தொழிலைத் தொடங்க திட்டமிட்டுள்ளீர்கள்?',
      te: 'మీరు ఏ రకమైన వ్యాపారాన్ని ప్రారంభించాలని లేదా నడపాలని ప్లాన్ చేస్తున్నారు?',
      gu: 'તમે કયા પ્રકારનો વ્યવસાય અથવા વેપાર શરૂ કરવા કે ચલાવવાનું વિચારી રહ્યા છો?',
      kn: 'ನೀವು ಯಾವ ರೀತಿಯ ವ್ಯವಹಾರ ಅಥವಾ ವ್ಯಾಪಾರವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಯೋಜಿಸುತ್ತಿದ್ದೀರಿ?',
      pa: 'ਤੁਸੀਂ ਕਿਸ ਕਿਸਮ ਦਾ ਕਾਰੋਬਾਰ ਸ਼ੁਰੂ ਕਰਨ ਜਾਂ ਚਲਾਉਣ ਦੀ ਯੋਜਨਾ ਬਣਾ ਰਹੇ ਹੋ?',
      or: 'ଆପଣ କେଉଁ ପ୍ରକାରର ବ୍ୟବସାୟ ଆରମ୍ଭ କରିବାକୁ ଯୋଜନା କରୁଛନ୍ତି?'
    },
    quickReplies: ['Tailoring / Boutique', 'Kirana / Grocery', 'Dairy / Milk', 'Handicraft / Artisan', 'Tech Startup', 'Other']
  },
  category: {
    questionEn: 'What is your social category?',
    questionHi: 'आपकी सामाजिक श्रेणी (Category) क्या है?',
    byLang: {
      en: 'What is your social category?',
      hi: 'आपकी सामाजिक श्रेणी (Category) क्या है?',
      mr: 'तुमचा सामाजिक प्रवर्ग (Category) कोणता आहे?',
      bn: 'আপনার সামাজিক শ্রেণি (Category) কী?',
      ta: 'உங்கள் சமூகப் பிரிவு (Category) எது?',
      te: 'మీ సామాజిక వర్గం (Category) ఏమిటి?',
      gu: 'તમારો સામાજિક વર્ગ (Category) કયો છે?',
      kn: 'ನಿಮ್ಮ ಸಾಮಾಜಿಕ ವರ್ಗ (Category) ಯಾವುದು?',
      pa: 'ਤੁਹਾਡੀ ਸਮਾਜਿਕ ਸ਼੍ਰੇਣੀ (Category) ਕੀ ਹੈ?',
      or: 'ଆପଣଙ୍କ ସାମାଜିକ ବର୍ଗ (Category) କ’ଣ?'
    },
    quickReplies: ['OBC', 'SC', 'ST', 'General']
  },
  gender: {
    questionEn: 'What is your gender?',
    questionHi: 'आपका लिंग (Gender) क्या है?',
    byLang: {
      en: 'What is your gender?',
      hi: 'आपका लिंग (Gender) क्या है?',
      mr: 'तुमचे लिंग (Gender) काय आहे?',
      bn: 'আপনার লিঙ্গ (Gender) কী?',
      ta: 'உங்கள் பாலினம் (Gender) எது?',
      te: 'మీ లింగం (Gender) ఏమిటి?',
      gu: 'તમારી જાતિ (Gender) શું છે?',
      kn: 'ನಿಮ್ಮ ಲಿಂಗ (Gender) ಯಾವುದು?',
      pa: 'ਤੁਹਾਡਾ ਲਿੰਗ (Gender) ਕੀ ਹੈ?',
      or: 'ଆପଣଙ୍କ ଲିଙ୍ଗ (Gender) କ’ଣ?'
    },
    quickReplies: ['Female (महिला)', 'Male (पुरुष)', 'Transgender']
  },
  projectCost: {
    questionEn: 'What is the estimated total project cost or loan amount required?',
    questionHi: 'परियोजना की अनुमानित कुल लागत या आवश्यक ऋण राशि कितनी है?',
    quickReplies: ['Up to ₹50,000', '₹1 - ₹2 Lakh', '₹5 - ₹10 Lakh', '₹25 Lakh - ₹1 Crore']
  },
  familyIncome: {
    questionEn: 'What is your approximate annual family income?',
    questionHi: 'आपकी वार्षिक पारिवारिक आय (Annual Family Income) कितनी है?',
    byLang: {
      en: 'What is your approximate annual family income?',
      hi: 'आपकी वार्षिक पारिवारिक आय (Annual Family Income) कितनी है?',
      mr: 'तुमचे अंदाजे वार्षिक कौटुंबिक उत्पन्न किती आहे?',
      bn: 'আপনার আনুমানিক বার্ষিক পারিবারিক আয় কত?',
      ta: 'உங்கள் தோராயமான குடும்ப ஆண்டு வருமானம் எவ்வளவு?',
      te: 'మీ సుమారు వార్షిక కుటుంబ ఆదాయం ఎంత?',
      gu: 'તમારી અંદાજિત વાર્ષિક પારિવારિક આવક કેટલી છે?',
      kn: 'ನಿಮ್ಮ ಅಂದಾಜು ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ ಎಷ್ಟು?',
      pa: 'ਤੁਹਾਡੀ ਅੰਦਾਜ਼ਨ ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ ਕਿੰਨੀ ਹੈ?',
      or: 'ଆପଣଙ୍କ ଆନୁମାନିକ ବାର୍ଷିକ ପାରିବାରିକ ଆୟ କେତେ?'
    },
    quickReplies: ['Below ₹1.5 Lakh', '₹2.5 Lakh', '₹3 Lakh', '₹5 Lakh', 'Above ₹5 Lakh']
  },
  age: {
    questionEn: 'What is your age in years?',
    questionHi: 'आपकी आयु (Age) कितने वर्ष है?',
    byLang: {
      en: 'What is your age in years?',
      hi: 'आपकी आयु (Age) कितने वर्ष है?',
      mr: 'तुमचे वय (Age) किती वर्षे आहे?',
      bn: 'আপনার বয়স (Age) কত বছর?',
      ta: 'உங்கள் வயது (Age) எத்தனை ஆண்டுகள்?',
      te: 'మీ వయస్సు (Age) ఎన్ని సంవత్సరాలు?',
      gu: 'તમારી ઉંમર (Age) કેટલા વર્ષ છે?',
      kn: 'ನಿಮ್ಮ ವಯಸ್ಸು (Age) ಎಷ್ಟು ವರ್ಷ?',
      pa: 'ਤੁਹਾਡੀ ਉਮਰ (Age) ਕਿੰਨੇ ਸਾਲ ਹੈ?',
      or: 'ଆପଣଙ୍କ ବୟସ (Age) କେତେ ବର୍ଷ?'
    },
    quickReplies: ['18 - 25 Years', '26 - 35 Years', '36 - 50 Years', 'Above 50 Years']
  },
  projectCost: {
    questionEn: 'What is the estimated total project cost or loan amount required?',
    questionHi: 'परियोजना की अनुमानित कुल लागत या आवश्यक ऋण राशि कितनी है?',
    byLang: {
      en: 'What is the estimated total project cost or loan amount required?',
      hi: 'परियोजना की अनुमानित कुल लागत या आवश्यक ऋण राशि कितनी है?',
      mr: 'प्रकल्पाचा अंदाजे एकूण खर्च किंवा आवश्यक कर्ज रक्कम किती आहे?',
      bn: 'প্রকল্পের আনুমানিক মোট ব্যয় বা প্রয়োজনীয় ঋণের পরিমাণ কত?',
      ta: 'திட்டத்தின் மதிப்பிடப்பட்ட மொத்த செலவு அல்லது கடன் தொகை எவ்வளவு?',
      te: 'ప్రాజెక్ట్ సుమారు మొత్తం ఖర్చు లేదా అవసరమైన రుణం ఎంత?',
      gu: 'પ્રોજેક્ટનો અંદાજિત કુલ ખર્ચ અથવા જરૂરી લોનની રકમ કેટલી છે?',
      kn: 'ಯೋಜನೆಯ ಅಂದಾಜು ಒಟ್ಟು ವೆಚ್ಚ ಅಥವಾ ಸಾಲದ ಮೊತ್ತ ಎಷ್ಟು?',
      pa: 'ਪ੍ਰੋਜੈਕਟ ਦੀ ਅੰਦਾਜ਼ਨ ਕੁੱਲ ਲਾਗਤ ਜਾਂ ਲੋੜੀਂਦੀ ਕਰਜ਼ਾ ਰਕਮ ਕਿੰਨੀ ਹੈ?',
      or: 'ପ୍ରକଳ୍ପର ଆନୁମାନିକ ମୋଟ ଖର୍ଚ୍ଚ ବା ଆବଶ୍ୟକ ଋଣ ରାଶି କେତେ?'
    },
    quickReplies: ['Up to ₹50,000', '₹1 - ₹2 Lakh', '₹5 - ₹10 Lakh', '₹25 Lakh - ₹1 Crore']
  },
  udyamRegistered: {
    questionEn: 'Do you have an MSME / Udyam Registration certificate?',
    questionHi: 'क्या आपके पास एमएसएमई / उद्यम पंजीकरण (Udyam Registration) है?',
    byLang: {
      en: 'Do you have an MSME / Udyam Registration certificate?',
      hi: 'क्या आपके पास एमएसएमई / उद्यम पंजीकरण (Udyam Registration) है?',
      mr: 'तुमच्याकडे एमएसएमई / उद्यम नोंदणी प्रमाणपत्र आहे का?',
      bn: 'আপনার কি এমএসএমই / উদ্যম নিবন্ধন সনদ রয়েছে?',
      ta: 'உங்களிடம் MSME / உத்யம் பதிவு சான்றிதழ் உள்ளதா?',
      te: 'మీకు MSME / ఉద్యమ్ రిజిస్ట్రేషన్ సర్టిఫికేట్ ఉందా?',
      gu: 'શું તમારી પાસે MSME / ઉદ્યમ નોંધણી પ્રમાણપત્ર છે?',
      kn: 'ನಿಮ್ಮ ಬಳಿ MSME / ಉದ್ಯಮ್ ನೋಂದಣಿ ಪ್ರಮಾಣಪತ್ರವಿದೆಯೇ?',
      pa: 'ਕੀ ਤੁਹਾਡੇ ਕੋਲ MSME / ਉਦਯਮ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਰਟੀਫਿਕੇਟ ਹੈ?',
      or: 'ଆପଣଙ୍କ ପାଖରେ MSME / ଉଦ୍ୟମ ପଞ୍ଜୀକରଣ ପ୍ରମାଣପତ୍ର ଅଛି କି?'
    },
    quickReplies: ['Yes (हाँ)', 'No (नहीं)', 'Applying Soon']
  }
};

/**
 * Computes the optimal next question to ask using an Elimination/Frequency Heuristic.
 * Prioritizes the missing field that will resolve or eliminate the largest number of candidate schemes.
 */
export const selectNextFieldToQuery = (candidateSchemes = [], profile = {}) => {
  // 1. Initial trade / purpose if missing
  if (isValueMissing(profile.purpose) && isValueMissing(profile.businessType)) {
    return 'purpose';
  }
  if (isValueMissing(profile.businessType)) {
    return 'businessType';
  }

  // 2. Count missing required fields across all candidate schemes
  const missingFieldFrequency = {};

  if (candidateSchemes && candidateSchemes.length > 0) {
    for (const scheme of candidateSchemes) {
      const required = scheme.requiredFields || [];
      for (const field of required) {
        if (isValueMissing(profile[field])) {
          missingFieldFrequency[field] = (missingFieldFrequency[field] || 0) + 1;
        }
      }
    }
  } else {
    // If no candidate schemes loaded yet, check core demographic parameters
    const coreFields = ['category', 'gender', 'projectCost', 'familyIncome', 'age'];
    for (const field of coreFields) {
      if (isValueMissing(profile[field])) {
        missingFieldFrequency[field] = 1;
      }
    }
  }

  // Sort missing fields by frequency (descending)
  const sortedMissingFields = Object.entries(missingFieldFrequency)
    .sort((a, b) => b[1] - a[1]);

  if (sortedMissingFields.length === 0) {
    return null; // All required fields collected!
  }

  return sortedMissingFields[0][0];
};

/**
 * Processes incoming user message, updates conversation state, and generates next bot action.
 */
export const processUserMessage = async ({ message, conversation = {}, profile = {} }) => {
  const expectedField = conversation.nextQueryField || conversation.currentQueryField || null;

  // 1. Extract NLU slots from user message with expectedField context
  const nluResult = await extractProfileSlots(message, profile, expectedField);
  const updatedProfile = {
    ...profile,
    ...nluResult.extractedFields
  };

  let selectedSchemeId = conversation.selectedSchemeId || null;
  let journey = conversation.journey || (nluResult.intent === 'SPECIFIC_SCHEME' ? 'SPECIFIC_SCHEME' : (nluResult.intent === 'FIND_SCHEMES' ? 'FIND_SCHEMES' : null));

  // 2. Resolve Scheme Name if mentioned or if answering specificScheme question
  const schemeSearchTerm = nluResult.knownSchemeName || (expectedField === 'specificScheme' ? message : null);
  if (schemeSearchTerm) {
    const directCandidates = await findCandidateSchemes({}, { specificSchemeId: null });
    const normalizedTerm = schemeSearchTerm.toLowerCase().trim();
    const matched = directCandidates.find(s => 
      s.name.toLowerCase().includes(normalizedTerm) ||
      (normalizedTerm.includes('stand') && s.name.toLowerCase().includes('stand-up')) ||
      (normalizedTerm.includes('pmegp') && s.name.toLowerCase().includes('pmegp')) ||
      (normalizedTerm.includes('mudra') && s.name.toLowerCase().includes('mudra')) ||
      (normalizedTerm.includes('swarnima') && s.name.toLowerCase().includes('swarnima')) ||
      (normalizedTerm.includes('vishwakarma') && s.name.toLowerCase().includes('vishwakarma')) ||
      (normalizedTerm.includes('term loan') && s.name.toLowerCase().includes('term loan')) ||
      (normalizedTerm.includes('nsfdc') && s.name.toLowerCase().includes('nsfdc'))
    );
    if (matched) {
      selectedSchemeId = matched.schemeId;
      journey = 'SPECIFIC_SCHEME';
    }
  }

  // 3. Journey A Branch: User wants a specific scheme, but hasn't picked one yet
  if ((journey === 'SPECIFIC_SCHEME' || nluResult.intent === 'SPECIFIC_SCHEME') && !selectedSchemeId) {
    const questionConfig = QUESTION_TEMPLATES.specificScheme;

    const reply = await generateConversationalReply({
      userMessage: message,
      profile: updatedProfile,
      nextField: 'specificScheme',
      isConfirmation: false,
      contextPrompt: 'The user wants to check a specific scheme they know. Politely ask them to name the scheme or select from the options.',
      defaultEn: questionConfig.questionEn,
      defaultHi: questionConfig.questionHi
    });

    return {
      conversationStatus: 'WAITING_INFO',
      journey: 'SPECIFIC_SCHEME',
      selectedSchemeId: null,
      candidateSchemeIds: [],
      profile: updatedProfile,
      nextQueryField: 'specificScheme',
      botMessage: {
        role: 'assistant',
        contentEn: reply.contentEn,
        contentHi: reply.contentHi,
        contentByLang: questionConfig.byLang,
        quickReplies: questionConfig.quickReplies,
        showProfileConfirmation: false
      }
    };
  }

  // 4. Retrieve Candidate Schemes (filtered by selectedSchemeId if in Journey A)
  const candidateSchemes = await findCandidateSchemes(updatedProfile, { 
    specificSchemeId: selectedSchemeId,
    limit: 15 
  });

  // Check if user clicked/typed "Other" for businessType or purpose
  const trimmedMsg = message.trim();
  const isOtherBusinessRequest = 
    /^(other|others|अन्य|kuch aur|koi aur|other business|something else|dusra)$/i.test(trimmedMsg) &&
    (expectedField === 'businessType' || isValueMissing(updatedProfile.businessType));

  if (isOtherBusinessRequest) {
    const questionConfig = {
      questionEn: 'Could you please specify what business, trade, or craft you are planning or running?',
      questionHi: 'कृपया बताएं कि आप किस प्रकार का व्यवसाय, व्यापार या कार्य कर रहे हैं या शुरू करना चाहते हैं?',
      byLang: {
        en: 'Could you please specify what business, trade, or craft you are planning or running?',
        hi: 'कृपया बताएं कि आप किस प्रकार का व्यवसाय, व्यापार या कार्य कर रहे हैं या शुरू करना चाहते हैं?',
        mr: 'कृपया स्पष्ट करा की तुम्ही कोणत्या प्रकारचा व्यवसाय, व्यापार किंवा काम सुरू करण्याचा विचार करत आहात?',
        bn: 'অনুগ্রহ করে নির্দিষ্ট করে বলুন আপনি কী ধরনের ব্যবসা বা কাজ শুরু করতে চান?',
        ta: 'நீங்கள் என்ன குறிப்பிட்ட தொழில் அல்லது வணிகத்தைத் தொடங்க விரும்புகிறீர்கள் என்பதைத் தெரிவிக்கவும்?',
        te: 'మీరు ఏ నిర్దిష్ట వ్యాపారం లేదా పనిని ప్రారంభించాలనుకుంటున్నారో దయచేసి పేర్కొనండి?',
        gu: 'કૃપા કરીને જણાવો કે તમે કયા ચોક્કસ પ્રકારનો વ્યવસાય કે કામ શરૂ કરવા માંગો છો?',
        kn: 'ನೀವು ಯಾವ ನಿರ್ದಿಷ್ಟ ವ್ಯವಹಾರ ಅಥವಾ ಕೆಲಸವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಯೋಜಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬುದನ್ನು ದಯವಿಟ್ಟು ತಿಳಿಸಿ?',
        pa: 'ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ ਕਿ ਤੁਸੀਂ ਕਿਸ ਖਾਸ ਕਾਰੋਬਾਰ ਜਾਂ ਕੰਮ ਦੀ ਯੋਜਨਾ ਬਣਾ ਰਹੇ ਹੋ?',
        or: 'ଦୟାକରି ସ୍ପଷ୍ଟ କରନ୍ତୁ ଯେ ଆପଣ କେଉଁ ନିର୍ଦ୍ଦିଷ୍ଟ ବ୍ୟବସାୟ ବା କାର୍ଯ୍ୟ ଆରମ୍ଭ କରିବାକୁ ଚାହୁଁଛନ୍ତି?'
      },
      quickReplies: [
        'Cyber Cafe / CSC Center',
        'Mobile & Electronics Repair',
        'Coaching / Tuition Center',
        'Welding / Fabrication Unit',
        'Food Stall / Catering'
      ]
    };

    const reply = await generateConversationalReply({
      userMessage: message,
      profile: updatedProfile,
      nextField: 'businessType',
      isConfirmation: false,
      contextPrompt: 'The user clicked or mentioned "Other" for business type. Politely ask them what specific trade, enterprise, or business they are running or planning.',
      defaultEn: questionConfig.questionEn,
      defaultHi: questionConfig.questionHi
    });

    return {
      conversationStatus: 'WAITING_INFO',
      journey,
      selectedSchemeId,
      candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
      profile: updatedProfile,
      nextQueryField: 'businessType',
      botMessage: {
        role: 'assistant',
        contentEn: reply.contentEn,
        contentHi: reply.contentHi,
        contentByLang: questionConfig.byLang,
        quickReplies: questionConfig.quickReplies,
        showProfileConfirmation: false
      }
    };
  }

  const isOtherPurposeRequest = 
    /^(other|others|अन्य|kuch aur|koi aur)$/i.test(trimmedMsg) &&
    expectedField === 'purpose';

  if (isOtherPurposeRequest) {
    const questionConfig = {
      questionEn: 'Please specify what kind of financial support or scheme assistance you need.',
      questionHi: 'कृपया बताएं कि आपको किस प्रकार की वित्तीय सहायता या योजना की आवश्यकता है?',
      byLang: {
        en: 'Please specify what kind of financial support or scheme assistance you need.',
        hi: 'कृपया बताएं कि आपको किस प्रकार की वित्तीय सहायता या योजना की आवश्यकता है?'
      },
      quickReplies: ['Working Capital Loan', 'Machinery / Equipment Grant', 'Skill Development Training']
    };

    const reply = await generateConversationalReply({
      userMessage: message,
      profile: updatedProfile,
      nextField: 'purpose',
      isConfirmation: false,
      contextPrompt: 'The user clicked "Other" for purpose. Ask them specifically what kind of scheme or financial support they need.',
      defaultEn: questionConfig.questionEn,
      defaultHi: questionConfig.questionHi
    });

    return {
      conversationStatus: 'WAITING_INFO',
      journey,
      selectedSchemeId,
      candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
      profile: updatedProfile,
      nextQueryField: 'purpose',
      botMessage: {
        role: 'assistant',
        contentEn: reply.contentEn,
        contentHi: reply.contentHi,
        contentByLang: questionConfig.byLang,
        quickReplies: questionConfig.quickReplies,
        showProfileConfirmation: false
      }
    };
  }

  // 5. Determine Next Action or Question
  const nextField = selectNextFieldToQuery(candidateSchemes, updatedProfile);

  // If all required fields are filled -> Transition to Profile Confirmation
  if (!nextField) {
    const defaultEn = 'Thank you! I have recorded your details. Please review and confirm your profile before we run the official eligibility evaluation.';
    const defaultHi = 'धन्यवाद! मैंने आपका विवरण दर्ज कर लिया है। आधिकारिक पात्रता मूल्यांकन चलाने से पहले कृपया अपनी प्रोफ़ाइल की पुष्टि करें।';

    const reply = await generateConversationalReply({
      userMessage: message,
      profile: updatedProfile,
      nextField: null,
      isConfirmation: true,
      contextPrompt: 'All necessary information has been collected. Warmly invite the user to review and confirm their profile to see their official eligibility.',
      defaultEn,
      defaultHi
    });

    return {
      conversationStatus: 'CONFIRMATION',
      journey,
      selectedSchemeId,
      candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
      profile: updatedProfile,
      botMessage: {
        role: 'assistant',
        contentEn: reply.contentEn,
        contentHi: reply.contentHi,
        contentByLang: {
          en: defaultEn,
          hi: defaultHi,
          mr: 'धन्यवाद! मी तुमचे तपशील नोंदवले आहेत. अधिकृत पात्रता तपासण्यापूर्वी कृपया आपल्या प्रोफाइलची पुष्टी करा.',
          bn: 'ধন্যবাদ! আমি আপনার বিবরণ রেকর্ড করেছি। অফিসিয়াল যোগ্যতা মূল্যায়নের আগে দয়া করে আপনার প্রোফাইল নিশ্চিত করুন।',
          ta: 'நன்றி! உங்கள் விவரங்களை பதிவு செய்துள்ளேன். தகுதி மதிப்பீட்டிற்கு முன் உங்கள் சுயவிவரத்தை உறுதிப்படுத்தவும்.',
          te: 'ధన్యవాదాలు! మీ వివరాలను నమోదు చేశాను. అధికారిక అర్హత పరిశీలనకు ముందు దయచేసి మీ ప్రొఫైల్‌ను ధృవీకరించండి.',
          gu: 'આભાર! મેં તમારી વિગતો નોંધી લીધી છે. સત્તાવાર પાત્રતા મૂલ્યાંકન પહેલાં કૃપા કરીને તમારી પ્રોਫાઇલની પુષ્ટિ કરો.',
          kn: 'ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿದ್ದೇನೆ. ಅಧಿಕೃತ ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನಕ್ಕೂ ಮುನ್ನ ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ದೃಢೀಕರಿಸಿ.',
          pa: 'ਧੰਨਵਾਦ! ਮੈਂ ਤੁਹਾਡੇ ਵੇਰਵੇ ਦਰਜ ਕਰ ਲਏ ਹਨ। ਅਧਿਕਾਰਤ ਯੋਗਤਾ ਜਾਂਚ ਤੋਂ ਪਹਿਲਾਂ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਪ੍ਰੋਫਾਈਲ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।',
          or: 'ଧନ୍ୟବାଦ! ମୁଁ ଆପଣଙ୍କ ବିବରଣୀ ରେକର୍ଡ କରିଛି। ଯୋଗ୍ୟତା ମୂଲ୍ୟାୟନ ପୂର୍ବରୁ ଦୟାକରି ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ନିଶ୍ଚିତ କରନ୍ତୁ।'
        },
        quickReplies: ['Confirm & Check Eligibility (पुष्टि करें)', 'Edit Details (संशोधित करें)'],
        showProfileConfirmation: true
      }
    };
  }

  // 6. Otherwise, ask for the next missing field
  const questionConfig = QUESTION_TEMPLATES[nextField] || {
    questionEn: `Please provide your ${nextField}.`,
    questionHi: `कृपया अपना ${nextField} बताएं।`,
    byLang: {
      en: `Please provide your ${nextField}.`,
      hi: `कृपया अपना ${nextField} बताएं।`
    },
    quickReplies: []
  };

  // Generate dynamic conversational reply from Gemini
  const selectedSchemeObj = candidateSchemes.find(s => s.schemeId === selectedSchemeId);
  const schemeContext = selectedSchemeObj ? `Evaluating specific scheme: "${selectedSchemeObj.name}".` : 'Finding best matching government schemes.';

  const reply = await generateConversationalReply({
    userMessage: message,
    profile: updatedProfile,
    nextField,
    isConfirmation: false,
    contextPrompt: `${schemeContext} Acknowledge the user's latest input empathetically and naturally ask for their ${nextField}.`,
    defaultEn: questionConfig.questionEn,
    defaultHi: questionConfig.questionHi
  });

  return {
    conversationStatus: 'WAITING_INFO',
    journey,
    selectedSchemeId,
    candidateSchemeIds: candidateSchemes.map(s => s.schemeId),
    profile: updatedProfile,
    nextQueryField: nextField,
    botMessage: {
      role: 'assistant',
      contentEn: reply.contentEn,
      contentHi: reply.contentHi,
      contentByLang: questionConfig.byLang,
      quickReplies: questionConfig.quickReplies,
      showProfileConfirmation: false
    }
  };
};
