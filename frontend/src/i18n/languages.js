export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
    region: 'All India',
    voiceCode: 'en-IN',
    speechVoiceLang: 'en-IN'
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    region: 'भारत (National)',
    voiceCode: 'hi-IN',
    speechVoiceLang: 'hi-IN'
  },
  {
    code: 'mr',
    name: 'Marathi',
    native: 'मराठी',
    region: 'महाराष्ट्र',
    voiceCode: 'mr-IN',
    speechVoiceLang: 'mr-IN'
  },
  {
    code: 'bn',
    name: 'Bengali',
    native: 'বাংলা',
    region: 'পশ্চিমবঙ্গ',
    voiceCode: 'bn-IN',
    speechVoiceLang: 'bn-IN'
  },
  {
    code: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    region: 'தமிழ்நாடு',
    voiceCode: 'ta-IN',
    speechVoiceLang: 'ta-IN'
  },
  {
    code: 'te',
    name: 'Telugu',
    native: 'తెలుగు',
    region: 'ఆంధ్రప్రదేశ్ / తెలంగాణ',
    voiceCode: 'te-IN',
    speechVoiceLang: 'te-IN'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    native: 'ગુજરાતી',
    region: 'ગુજરાત',
    voiceCode: 'gu-IN',
    speechVoiceLang: 'gu-IN'
  },
  {
    code: 'kn',
    name: 'Kannada',
    native: 'ಕನ್ನಡ',
    region: 'ಕರ್ನಾಟಕ',
    voiceCode: 'kn-IN',
    speechVoiceLang: 'kn-IN'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    native: 'ਪੰਜਾਬੀ',
    region: 'ਪੰਜਾਬ',
    voiceCode: 'pa-IN',
    speechVoiceLang: 'pa-IN'
  },
  {
    code: 'or',
    name: 'Odia',
    native: 'ଓଡ଼ିଆ',
    region: 'ଓଡ଼ିଶା',
    voiceCode: 'or-IN',
    speechVoiceLang: 'or-IN'
  }
];

export const DEFAULT_LANGUAGE = 'en';

export const getLanguageConfig = (code) => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[0];
};
