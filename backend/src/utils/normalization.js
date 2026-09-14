/**
 * Domain-Specific Normalization for Indian Entrepreneurship & Vernacular Slang
 */

const BUSINESS_TYPE_SYNONYMS = {
  tailoring: [
    'tailoring', 'tailor', 'silai', 'silai shop', 'silai center', 'silai ki dukan',
    'stitching', 'boutique', 'garment making', 'dress designing', 'darzi', 'kapda silai', 'tailoring / boutique'
  ],
  retail: [
    'retail', 'kirana', 'kirana store', 'general store', 'grocery store', 'dukan',
    'ration shop', 'provisions', 'supermarket', 'vendor', 'shopkeeper', 'kirana / grocery'
  ],
  beauty_parlor: [
    'beauty parlor', 'beauty parlour', 'parlor', 'parlour', 'salon', 'saloon',
    'makeup studio', 'beautician', 'hair cutting', 'spa'
  ],
  dairy: [
    'dairy', 'dairy farming', 'doodh', 'doodh dairy', 'milk', 'milk collection',
    'gaay bhains', 'cow farming', 'buffalo farming', 'cattle rearing', 'dairy / milk'
  ],
  poultry: [
    'poultry', 'poultry farm', 'murgi farm', 'murgi palan', 'chicken farm', 'egg production'
  ],
  handicraft: [
    'handicraft', 'hastshilp', 'artisan', 'craft', 'pottery', 'matka', 'sculptor',
    'murti', 'weaving', 'bunkar', 'handloom', 'carpet', 'embroidery', 'zari', 'handicraft / artisan'
  ],
  transport: [
    'transport', 'commercial vehicle', 'auto', 'auto rickshaw', 'taxi', 'tempo',
    'loading auto', 'driver', 'truck', 'e-rickshaw', 'erickshaw'
  ],
  carpenter: [
    'carpenter', 'carpentry', 'badhai', 'wood work', 'furniture making', 'furniture'
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
    'horticulture', 'floriculture', 'polyhouse', 'agri processing', 'agriculture'
  ],
  food_processing: [
    'food processing', 'bakery', 'namkeen', 'sweet shop', 'mithai', 'catering',
    'restaurant', 'dhaba', 'canteen', 'flour mill', 'chakki', 'oil mill'
  ],
  manufacturing: [
    'manufacturing', 'factory', 'small industry', 'workshop', 'plastic molding',
    'fabrication', 'welding', 'lathe machine', 'packaging'
  ]
};

const CATEGORY_SYNONYMS = {
  SC: ['sc', 'scheduled caste', 'dalit', 'harijan', 'anushuchit jati'],
  ST: ['st', 'scheduled tribe', 'adivasi', 'anushuchit janjati', 'tribal'],
  OBC: ['obc', 'other backward class', 'backward class', 'pichhda varg', 'pichhda', 'bc'],
  GENERAL: ['general', 'gen', 'samanya', 'open', 'forward', 'ur', 'unreserved']
};

const GENDER_SYNONYMS = {
  female: ['female', 'woman', 'women', 'mahila', 'aurat', 'lady', 'girl', 'shrimati', 'female (महिला)'],
  male: ['male', 'man', 'men', 'purush', 'aadmi', 'boy', 'shri', 'male (पुरुष)'],
  transgender: ['transgender', 'trans', 'third gender', 'kinnar']
};

const PURPOSE_SYNONYMS = {
  business_loan: ['business loan', 'loan', 'paisa', 'finance', 'ऋण', 'karz', 'loan amount'],
  new_business: ['start new business', 'new business', 'naya business', 'startup', 'shuru'],
  women_entrepreneur: ['women entrepreneur support', 'women entrepreneur', 'mahila udyami', 'women'],
  self_employment: ['self employment', 'swarojgar', 'rojgar'],
  agriculture: ['agriculture', 'kheti', 'krishi']
};

/**
 * Normalizes user-input business descriptions into a standardized taxonomy key.
 * @param {string} rawInput 
 * @returns {string} Normalized business type key
 */
export const normalizeBusinessType = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') return 'general_trade';
  const clean = rawInput.toLowerCase().trim();

  for (const [standardKey, synonyms] of Object.entries(BUSINESS_TYPE_SYNONYMS)) {
    if (synonyms.some(syn => clean.includes(syn) || syn.includes(clean))) {
      return standardKey;
    }
  }

  return clean.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
};

/**
 * Normalizes user-input purpose.
 * @param {string} rawPurpose 
 * @returns {string}
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
 * Normalizes user-input social category.
 * @param {string} rawCategory 
 * @returns {string|null} SC | ST | OBC | GENERAL | null
 */
export const normalizeCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== 'string') return null;
  const clean = rawCategory.toLowerCase().trim();

  for (const [standardCat, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some(syn => clean === syn || clean.includes(syn))) {
      return standardCat;
    }
  }
  return rawCategory.toUpperCase().trim();
};

/**
 * Normalizes user-input gender.
 * @param {string} rawGender 
 * @returns {string|null} female | male | transgender | null
 */
export const normalizeGender = (rawGender) => {
  if (!rawGender || typeof rawGender !== 'string') return null;
  const clean = rawGender.toLowerCase().trim();

  for (const [standardGender, synonyms] of Object.entries(GENDER_SYNONYMS)) {
    if (synonyms.some(syn => clean === syn || clean.includes(syn))) {
      return standardGender;
    }
  }
  return null;
};

/**
 * Parses age and age range strings (e.g. "18 - 25 Years" -> 22, "26 - 35" -> 30, "28" -> 28).
 * @param {string|number} input 
 * @returns {number|null}
 */
export const parseAge = (input) => {
  if (typeof input === 'number') return input;
  if (!input || typeof input !== 'string') return null;

  const text = input.toLowerCase().trim();

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
 * Parses colloquial Indian numbers & ranges (e.g. "₹1 - ₹2 Lakh", "Up to ₹50,000", "2.5 lakh", "dhai lakh", "1 crore").
 * @param {string|number} input 
 * @returns {number|null} Parsed integer amount
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

  // Range: "25 lakh - 1 crore" -> 5000000
  if (text.includes('25 lakh') && text.includes('1 crore')) {
    return 2500000;
  }

  // Direct special colloquial words
  if (text.includes('dhai lakh') || text.includes('dhayi lakh') || text.includes('2.5 lakh')) return 250000;
  if (text.includes('dedh lakh') || text.includes('1.5 lakh')) return 150000;
  if (text.includes('ek lakh') || text.includes('1 lakh')) return 100000;
  if (text.includes('below 1.5 lakh') || text.includes('below ₹1.5 lakh')) return 150000;
  if (text.includes('50000') || text.includes('50,000') || text.includes('50 hazar') || text.includes('50k')) return 50000;

  // Crore parser
  const crMatch = text.match(/([\d.]+)\s*(?:cr|crore|karod|crores)/);
  if (crMatch) {
    return Math.round(parseFloat(crMatch[1]) * 10000000);
  }

  // Lakh parser
  const lakhMatch = text.match(/([\d.]+)\s*(?:lakh|lakhs|lac|lacs|l)/);
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
