/**
 * Domain-Specific Normalization for Indian Entrepreneurship & Vernacular Slang
 */

const BUSINESS_TYPE_SYNONYMS = {
  tailoring: [
    'tailoring', 'tailor', 'silai', 'silai shop', 'silai center', 'silai ki dukan',
    'stitching', 'boutique', 'garment making', 'dress designing', 'darzi', 'kapda silai'
  ],
  retail: [
    'retail', 'kirana', 'kirana store', 'general store', 'grocery store', 'dukan',
    'ration shop', 'provisions', 'supermarket', 'vendor', 'shopkeeper'
  ],
  beauty_parlor: [
    'beauty parlor', 'beauty parlour', 'parlor', 'parlour', 'salon', 'saloon',
    'makeup studio', 'beautician', 'hair cutting', 'spa'
  ],
  dairy: [
    'dairy', 'dairy farming', 'doodh', 'doodh dairy', 'milk', 'milk collection',
    'gaay bhains', 'cow farming', 'buffalo farming', 'cattle rearing'
  ],
  poultry: [
    'poultry', 'poultry farm', 'murgi farm', 'murgi palan', 'chicken farm', 'egg production'
  ],
  handicraft: [
    'handicraft', 'hastshilp', 'artisan', 'craft', 'pottery', 'matka', 'sculptor',
    'murti', 'weaving', 'bunkar', 'handloom', 'carpet', 'embroidery', 'zari'
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
    'edtech', 'fintech', 'biotech', 'hardware', 'coding'
  ],
  agriculture_allied: [
    'farming', 'kheti', 'krishi', 'kisan', 'organic farming', 'vegetable',
    'horticulture', 'floriculture', 'polyhouse', 'agri processing'
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
  female: ['female', 'woman', 'women', 'mahila', 'aurat', 'lady', 'girl', 'shrimati'],
  male: ['male', 'man', 'men', 'purush', 'aadmi', 'boy', 'shri'],
  transgender: ['transgender', 'trans', 'third gender', 'kinnar']
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

  // Fallback slugification
  return clean.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
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
 * Parses colloquial Indian numbers (e.g. "2.5 lakh", "dhai lakh", "50k", "1 crore") into pure INR integers.
 * @param {string|number} input 
 * @returns {number|null} Parsed integer amount
 */
export const parseIndianCurrency = (input) => {
  if (typeof input === 'number') return Math.round(input);
  if (!input || typeof input !== 'string') return null;

  const text = input.toLowerCase().replace(/,/g, '').trim();

  // Direct special colloquial words
  if (text.includes('dhai lakh') || text.includes('dhayi lakh') || text.includes('2.5 lakh')) return 250000;
  if (text.includes('dedh lakh') || text.includes('1.5 lakh')) return 150000;
  if (text.includes('ek lakh') || text.includes('1 lakh')) return 100000;

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

  // Pure digits extraction
  const digitsMatch = text.match(/(\d+)/);
  if (digitsMatch) {
    return parseInt(digitsMatch[1], 10);
  }

  return null;
};
