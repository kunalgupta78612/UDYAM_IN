/**
 * Domain-Specific Normalization for Indian Entrepreneurship, Hindi Vernacular, & Speech-to-Text Phonetics
 */

const BUSINESS_TYPE_SYNONYMS = {
  tailoring: [
    'tailoring', 'tailor', 'silai', 'silai shop', 'silai center', 'silai ki dukan',
    'stitching', 'boutique', 'garment making', 'dress designing', 'darzi', 'darji', 
    'kapda silai', 'tailoring / boutique', 'silaye', 'silaye bunai', 'silayi', 'silay', 'silai bunai'
  ],
  retail: [
    'retail', 'kirana', 'kirana store', 'general store', 'grocery store', 'dukan',
    'ration shop', 'provisions', 'supermarket', 'vendor', 'shopkeeper', 'kirana / grocery',
    'chhoti dukan', 'parchoon', 'kirana dukan'
  ],
  beauty_parlor: [
    'beauty parlor', 'beauty parlour', 'parlor', 'parlour', 'salon', 'saloon',
    'makeup studio', 'beautician', 'hair cutting', 'spa', 'beauty centre'
  ],
  dairy: [
    'dairy', 'dairy farming', 'doodh', 'doodh dairy', 'milk', 'milk collection',
    'gaay bhains', 'cow farming', 'buffalo farming', 'cattle rearing', 'dairy / milk', 'pashupalan'
  ],
  poultry: [
    'poultry', 'poultry farm', 'murgi farm', 'murgi palan', 'chicken farm', 'egg production', 'murgi'
  ],
  handicraft: [
    'handicraft', 'hastshilp', 'artisan', 'craft', 'pottery', 'matka', 'sculptor',
    'murti', 'weaving', 'bunkar', 'handloom', 'carpet', 'embroidery', 'zari', 'handicraft / artisan',
    'kasidakari', 'hastakala', 'karigar', 'shilpkar'
  ],
  transport: [
    'transport', 'commercial vehicle', 'auto', 'auto rickshaw', 'taxi', 'tempo',
    'loading auto', 'driver', 'truck', 'e-rickshaw', 'erickshaw', 'gaadi'
  ],
  carpenter: [
    'carpenter', 'carpentry', 'badhai', 'wood work', 'furniture making', 'furniture', 'kashthakala'
  ],
  sanitation_services: [
    'sanitation', 'cleaning', 'safai', 'sewer cleaning', 'suction machine',
    'mechanized cleaning', 'waste management', 'garbage truck'
  ],
  tech_startup: [
    'tech', 'technology', 'startup', 'software', 'app', 'it services', 'ai startup',
    'edtech', 'fintech', 'biotech', 'hardware', 'coding', 'tech startup'
  ],
  agriculture_allied: [
    'farming', 'kheti', 'krishi', 'kisan', 'organic farming', 'vegetable',
    'horticulture', 'floriculture', 'polyhouse', 'agri processing', 'agriculture', 'sabzi'
  ],
  food_processing: [
    'food processing', 'bakery', 'namkeen', 'sweet shop', 'mithai', 'catering',
    'restaurant', 'dhaba', 'canteen', 'flour mill', 'chakki', 'oil mill', 'hotel'
  ],
  manufacturing: [
    'manufacturing', 'factory', 'small industry', 'workshop', 'plastic molding',
    'fabrication', 'welding', 'lathe machine', 'packaging', 'karkhana'
  ],
  repair_services: [
    'repair', 'repairing', 'electrician', 'mobile repair', 'motor repair', 'mechanic', 'plumber', 'repair shop', 'marammat'
  ],
  services: [
    'cyber cafe', 'csc', 'csc center', 'online services', 'photocopy', 'internet cafe', 'jan seva kendra', 'coaching', 'tuition'
  ]
};

// Robust phonetic & Hindi synonyms for Social Categories
const CATEGORY_SYNONYMS = {
  OBC: [
    'obc', 'o b c', 'obisi', 'ugisi', 'ogisi', 'ob c', 'o.b.c', 'o.b.c.', 'obici', 
    'pichhda', 'pichhde', 'pichhda varg', 'pichhde varg', 'backward', 'bc', 
    'other backward class', 'other backward classes', 'obse', 'obsi', 'ovc', 'ugc', 
    'ugisi hoon', 'obc category', 'ओबीसी', 'अन्य पिछड़ा वर्ग', 'पिछड़ा वर्ग'
  ],
  SC: [
    'sc', 's c', 'es c', 'esi', 'aesi', 'shc', 's.c.', 's.c', 'scheduled caste', 
    'dalit', 'harijan', 'anushuchit jati', 'shedule caste', 'sheduled caste', 
    'एससी', 'अनुसूचित जाति', 'दलित'
  ],
  ST: [
    'st', 's t', 'es t', 'esti', 'aesti', 's.t.', 's.t', 'scheduled tribe', 
    'adivasi', 'tribal', 'anushuchit janjati', 'shedule tribe', 'sheduled tribe', 
    'एसटी', 'अनुसूचित जनजाति', 'आदिवासी'
  ],
  GENERAL: [
    'general', 'gen', 'samanya', 'samanya varg', 'open', 'open category', 
    'forward', 'ur', 'unreserved', 'सामान्य', 'सामान्य वर्ग', 'अनारक्षित'
  ]
};

const GENDER_SYNONYMS = {
  male: [
    'male', 'man', 'men', 'purush', 'aadmi', 'boy', 'shri', 'male (पुरुष)', 
    'mail', 'mard', 'ladka', 'bhai', 'पुरुष', 'मर्द', 'आदमी', 'लड़का'
  ],
  female: [
    'female', 'woman', 'women', 'mahila', 'aurat', 'lady', 'girl', 'shrimati', 
    'female (महिला)', 'femail', 'fe mail', 'ladki', 'behan', 'stree', 'nari',
    'महिला', 'औरत', 'स्त्री', 'लड़की', 'नारी'
  ],
  transgender: [
    'transgender', 'trans', 'third gender', 'kinnar', 'tritiya ling', 
    'किन्नर', 'ट्रांसजेंडर', 'तृतीय लिंग'
  ]
};

const PURPOSE_SYNONYMS = {
  business_loan: ['business loan', 'loan', 'paisa', 'finance', 'ऋण', 'karz', 'loan amount', 'laagat', 'chahiye tha', 'sahayata'],
  new_business: ['start new business', 'new business', 'naya business', 'startup', 'shuru', 'lagana', 'kholna'],
  women_entrepreneur: ['women entrepreneur support', 'women entrepreneur', 'mahila udyami', 'women', 'mahila'],
  self_employment: ['self employment', 'swarojgar', 'rojgar'],
  agriculture: ['agriculture', 'kheti', 'krishi']
};

const HINDI_AGE_WORDS = {
  'atharah': 18, 'athra': 18, 'atharah saal': 18,
  'unnis': 19, 'unnis saal': 19,
  'bees': 20, 'bis': 20, 'bees saal': 20,
  'ikkis': 21, 'ikis': 21, 'ikkis saal': 21, 'ikis saal': 21,
  'bais': 22, 'baais': 22, 'bais saal': 22,
  'teis': 23, 'tehis': 23, 'teyis': 23, 'teis saal': 23,
  'chaubis': 24, 'chobis': 24, 'chaubis saal': 24,
  'pachis': 25, 'pachees': 25, 'pachis saal': 25,
  'chhabis': 26, 'chhabees': 26, 'chhabis saal': 26,
  'sattais': 27, 'sattais saal': 27,
  'atthais': 28, 'atthais saal': 28,
  'unatis': 29, 'untis': 29, 'unatis saal': 29,
  'tees': 30, 'tees saal': 30,
  'ikattis': 31, 'battis': 32, 'tentis': 33, 'chauntis': 34, 'paintis': 35,
  'chhattis': 36, 'saintis': 37, 'adhtis': 38, 'untalis': 39, 'chalis': 40,
  'iktalis': 41, 'bayalis': 42, 'tentalis': 43, 'chawalis': 44, 'paintalis': 45,
  'chhiyalis': 46, 'saintalis': 47, 'adhtalis': 48, 'unchas': 49, 'pachas': 50,
  'ikkyavan': 51, 'bavan': 52, 'tirpan': 53, 'chaunwan': 54, 'pachpan': 55,
  'chhappan': 56, 'sattavan': 57, 'atthavan': 58, 'unsath': 59, 'saath': 60
};

/**
 * Normalizes user-input business descriptions into a standardized taxonomy key.
 */
export const normalizeBusinessType = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const clean = rawInput.toLowerCase().trim();

  // If user says "Other" / "अन्य" without providing a specific trade
  if (['other', 'others', 'अन्य', 'kuch aur', 'koi aur', 'other business', 'something else', 'dusra'].includes(clean)) {
    return null;
  }

  for (const [standardKey, synonyms] of Object.entries(BUSINESS_TYPE_SYNONYMS)) {
    if (synonyms.some(syn => clean.includes(syn) || syn.includes(clean))) {
      return standardKey;
    }
  }

  const formatted = clean.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return formatted || 'general_trade';
};

/**
 * Normalizes user-input purpose.
 */
export const normalizePurpose = (rawPurpose) => {
  if (!rawPurpose || typeof rawPurpose !== 'string') return 'business_loan';
  const clean = rawPurpose.toLowerCase().trim();

  for (const [standardKey, synonyms] of Object.entries(PURPOSE_SYNONYMS)) {
    if (synonyms.some(syn => clean.includes(syn) || syn.includes(clean))) {
      return standardKey;
    }
  }
  return 'business_loan';
};

/**
 * Normalizes user-input social category with voice & phonetic tolerance.
 * NEVER defaults to GENERAL unless explicitly matched.
 * @returns {string|null} SC | ST | OBC | GENERAL | null
 */
export const normalizeCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== 'string') return null;
  const clean = rawCategory.toLowerCase().trim();

  // 1. Check exact word or inclusion of synonyms
  // Prioritize specific categories (OBC, SC, ST) before GENERAL
  for (const syn of CATEGORY_SYNONYMS.OBC) {
    if (clean === syn || new RegExp(`\\b${syn}\\b`, 'i').test(clean) || clean.includes(syn)) {
      return 'OBC';
    }
  }

  for (const syn of CATEGORY_SYNONYMS.SC) {
    if (clean === syn || new RegExp(`\\b${syn}\\b`, 'i').test(clean) || clean.includes(syn)) {
      return 'SC';
    }
  }

  for (const syn of CATEGORY_SYNONYMS.ST) {
    if (clean === syn || new RegExp(`\\b${syn}\\b`, 'i').test(clean) || clean.includes(syn)) {
      return 'ST';
    }
  }

  for (const syn of CATEGORY_SYNONYMS.GENERAL) {
    if (clean === syn || new RegExp(`\\b${syn}\\b`, 'i').test(clean)) {
      return 'GENERAL';
    }
  }

  return null;
};

/**
 * Normalizes user-input gender.
 * @returns {string|null} female | male | transgender | null
 */
export const normalizeGender = (rawGender) => {
  if (!rawGender || typeof rawGender !== 'string') return null;
  const clean = rawGender.toLowerCase().trim();

  // Check female first to prevent 'male' inside 'female' false-match
  for (const syn of GENDER_SYNONYMS.female) {
    if (clean === syn || new RegExp(`\\b${syn}\\b`, 'i').test(clean) || clean.includes(syn)) {
      return 'female';
    }
  }

  for (const syn of GENDER_SYNONYMS.transgender) {
    if (clean === syn || new RegExp(`\\b${syn}\\b`, 'i').test(clean) || clean.includes(syn)) {
      return 'transgender';
    }
  }

  for (const syn of GENDER_SYNONYMS.male) {
    if (clean === syn || new RegExp(`\\b${syn}\\b`, 'i').test(clean)) {
      return 'male';
    }
  }

  return null;
};

/**
 * Parses age from digits or spoken Hindi words (e.g. "ikkis saal" -> 21, "28" -> 28, "18 - 25 Years" -> 22).
 */
export const parseAge = (input) => {
  if (typeof input === 'number') return input;
  if (!input || typeof input !== 'string') return null;

  const text = input.toLowerCase().trim();

  // Spoken Hindi words
  for (const [hindiWord, numVal] of Object.entries(HINDI_AGE_WORDS)) {
    if (new RegExp(`\\b${hindiWord}\\b`, 'i').test(text)) {
      return numVal;
    }
  }

  // Range checks from quick replies: "18 - 25 years" -> 22
  const rangeMatch = text.match(/(\d{2})\s*-\s*(\d{2})/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return Math.round((min + max) / 2);
  }

  if (text.includes('above 50') || text.includes('50+')) return 52;
  if (text.includes('below 25')) return 22;

  const singleMatch = text.match(/(\d{2})/);
  if (singleMatch) {
    const num = parseInt(singleMatch[1], 10);
    if (num >= 14 && num <= 99) return num;
  }

  return null;
};

/**
 * Parses colloquial Indian numbers & ranges (e.g. "dedh laakh" -> 150000, "₹1 - ₹2 Lakh" -> 200000).
 */
export const parseIndianCurrency = (input) => {
  if (typeof input === 'number') return Math.round(input);
  if (!input || typeof input !== 'string') return null;

  const text = input.toLowerCase().replace(/,/g, '').replace(/₹/g, '').trim();

  // Range: "1 - 2 lakh" or "1-2 lakh" -> take upper/mid (200000)
  const lakhRange = text.match(/([\d.]+)\s*-\s*([\d.]+)\s*(?:lakh|lacs|lac|l)/);
  if (lakhRange) {
    return Math.round(parseFloat(lakhRange[2]) * 100000);
  }

  // Range: "25 lakh - 1 crore" -> 2500000
  if (text.includes('25 lakh') && text.includes('1 crore')) {
    return 2500000;
  }

  // Direct special colloquial spoken words (Hindi & Hinglish)
  if (text.includes('dedh laakh') || text.includes('dedh lakh') || text.includes('1.5 lakh') || text.includes('1.5 laakh')) return 150000;
  if (text.includes('dhai laakh') || text.includes('dhai lakh') || text.includes('dhayi lakh') || text.includes('2.5 lakh')) return 250000;
  if (text.includes('sadhe teen lakh') || text.includes('3.5 lakh')) return 350000;
  if (text.includes('ek laakh') || text.includes('ek lakh') || text.includes('1 lakh') || text.includes('1 laakh')) return 100000;
  if (text.includes('do laakh') || text.includes('do lakh') || text.includes('2 lakh') || text.includes('2 laakh')) return 200000;
  if (text.includes('teen laakh') || text.includes('teen lakh') || text.includes('3 lakh')) return 300000;
  if (text.includes('char laakh') || text.includes('char lakh') || text.includes('4 lakh')) return 400000;
  if (text.includes('paanch laakh') || text.includes('paanch lakh') || text.includes('panch lakh') || text.includes('5 lakh')) return 500000;
  if (text.includes('dus laakh') || text.includes('dus lakh') || text.includes('10 lakh')) return 1000000;
  if (text.includes('below 1.5 lakh') || text.includes('below ₹1.5 lakh')) return 150000;
  if (text.includes('pachas hazar') || text.includes('50000') || text.includes('50,000') || text.includes('50 hazar') || text.includes('50k')) return 50000;

  // Crore parser
  const crMatch = text.match(/([\d.]+)\s*(?:cr|crore|karod|crores)/);
  if (crMatch) {
    return Math.round(parseFloat(crMatch[1]) * 10000000);
  }

  // Lakh parser
  const lakhMatch = text.match(/([\d.]+)\s*(?:lakh|lakhs|laakh|lac|lacs|l)/);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  // Thousands / K parser
  const kMatch = text.match(/([\d.]+)\s*(?:k|hazar|hazaar|thousand|thousands)/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Pure digits extraction (only if >= 4 digits like 5000, 250000 to avoid capturing age numbers)
  const digitsMatch = text.match(/(\d{4,})/);
  if (digitsMatch) {
    return parseInt(digitsMatch[1], 10);
  }

  return null;
};
