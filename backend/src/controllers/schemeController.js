import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Scheme } from '../models/Scheme.js';
import { searchSchemesByKeyword } from '../retrieval/schemeRetriever.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedSchemes = null;
const getSeedSchemesFallback = () => {
  if (!cachedSchemes) {
    const raw = fs.readFileSync(path.join(__dirname, '../../seed/schemes.json'), 'utf8');
    cachedSchemes = JSON.parse(raw);
  }
  return cachedSchemes;
};

/**
 * Lists all active schemes with optional keyword search and category filters.
 * Endpoint: GET /api/schemes
 */
export const getSchemes = async (req, res, next) => {
  try {
    const { search, category, gender, purpose } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test';
    let schemes = [];

    if (isDbConnected) {
      try {
        const filter = { status: 'ACTIVE' };
        if (category) filter.applicableCategories = { $in: [category.toUpperCase(), 'ALL'] };
        if (gender) filter.applicableGender = { $in: [gender.toLowerCase(), 'all'] };
        if (purpose) filter.purpose = purpose.toLowerCase();

        if (search) {
          schemes = await searchSchemesByKeyword(search, filter);
        } else {
          schemes = await Scheme.find(filter).lean();
        }
      } catch (dbErr) {
        schemes = getSeedSchemesFallback();
      }
    } else {
      schemes = getSeedSchemesFallback();
      if (search) {
        const lower = search.toLowerCase();
        schemes = schemes.filter(s => 
          s.name.toLowerCase().includes(lower) || 
          s.shortDescription.toLowerCase().includes(lower)
        );
      }
    }

    return res.json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single scheme by its unique schemeId.
 * Endpoint: GET /api/schemes/:schemeId
 */
export const getSchemeById = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test';
    let scheme = null;

    if (isDbConnected) {
      try {
        scheme = await Scheme.findOne({ schemeId }).lean();
      } catch (dbErr) {
        scheme = getSeedSchemesFallback().find(s => s.schemeId === schemeId);
      }
    } else {
      scheme = getSeedSchemesFallback().find(s => s.schemeId === schemeId);
    }

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: `Scheme not found with ID: ${schemeId}`
      });
    }

    return res.json({
      success: true,
      scheme
    });
  } catch (error) {
    next(error);
  }
};
