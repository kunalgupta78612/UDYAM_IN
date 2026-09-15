/**
 * Partner Locator Controller
 * 
 * Geo-spatial channel partner discovery with NPA-based health filtering.
 * Uses MongoDB $geoNear for proximity queries.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { ChannelPartner } from '../models/ChannelPartner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedPartners = null;
const getPartnersFallback = () => {
  if (!cachedPartners) {
    const raw = fs.readFileSync(path.join(__dirname, '../../seed/channelPartners.json'), 'utf8');
    cachedPartners = JSON.parse(raw);
  }
  return cachedPartners;
};

/**
 * Haversine distance calculation (km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * GET /api/partners/nearby
 * Find nearest channel partners based on user's geolocation.
 * Query: lat, lng, maxDistanceKm (default 100), schemeId, type, limit (default 15)
 */
export const getNearbyPartners = async (req, res, next) => {
  try {
    const { lat, lng, maxDistanceKm = 500, schemeId, type, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Please provide lat and lng coordinates.'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseFloat(maxDistanceKm) * 1000; // Convert to meters

    const isDbConnected = mongoose.connection.readyState === 1;

    let results = [];

    if (isDbConnected) {
      try {
        const matchStage = {
          isActive: true,
          'fundUtilization.npaPercentage': { $lte: 10 } // Filter out high NPA partners
        };

        if (schemeId) {
          matchStage.schemesHandled = schemeId;
        }
        if (type) {
          matchStage.type = type;
        }

        results = await ChannelPartner.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [longitude, latitude] },
              distanceField: 'distanceMeters',
              maxDistance,
              spherical: true,
              query: matchStage
            }
          },
          { $limit: parseInt(limit) },
          {
            $addFields: {
              distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] }
            }
          }
        ]);
      } catch (err) {
        console.warn('[Partner Geo Query Fallback]', err.message);
        results = [];
      }
    }

    // Fallback: in-memory distance calc from seed data
    if (results.length === 0) {
      let partners = getPartnersFallback().filter(p => p.isActive !== false);

      // Apply NPA filter
      partners = partners.filter(p => (p.fundUtilization?.npaPercentage || 0) <= 10);

      if (schemeId) {
        partners = partners.filter(p => p.schemesHandled?.includes(schemeId));
      }
      if (type) {
        partners = partners.filter(p => p.type === type);
      }

      results = partners.map(p => {
        const pLat = p.location?.coordinates?.[1] || 0;
        const pLng = p.location?.coordinates?.[0] || 0;
        const dist = haversineDistance(latitude, longitude, pLat, pLng);
        return {
          ...p,
          distanceKm: Math.round(dist * 10) / 10,
          distanceMeters: Math.round(dist * 1000)
        };
      })
      .filter(p => p.distanceKm <= parseFloat(maxDistanceKm))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, parseInt(limit));
    }

    // Compute health badge
    const enriched = results.map(p => ({
      ...p,
      healthBadge: getHealthBadge(p.fundUtilization || p)
    }));

    return res.json({
      success: true,
      count: enriched.length,
      userLocation: { lat: latitude, lng: longitude },
      partners: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/partners
 * List all channel partners with optional filters.
 * Query: state, type, schemeId, active
 */
export const getAllPartners = async (req, res, next) => {
  try {
    const { state, type, schemeId, active = 'true' } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    let partners = [];

    if (isDbConnected) {
      try {
        const query = {};
        if (state) query.state = new RegExp(state, 'i');
        if (type) query.type = type;
        if (schemeId) query.schemesHandled = schemeId;
        if (active === 'true') query.isActive = true;

        partners = await ChannelPartner.find(query).lean();
      } catch (err) {
        partners = [];
      }
    }

    if (partners.length === 0) {
      partners = getPartnersFallback();
      if (state) partners = partners.filter(p => p.state.toLowerCase().includes(state.toLowerCase()));
      if (type) partners = partners.filter(p => p.type === type);
      if (schemeId) partners = partners.filter(p => p.schemesHandled?.includes(schemeId));
      if (active === 'true') partners = partners.filter(p => p.isActive !== false);
    }

    const enriched = partners.map(p => ({
      ...p,
      healthBadge: getHealthBadge(p.fundUtilization || p)
    }));

    return res.json({
      success: true,
      count: enriched.length,
      partners: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/partners/:partnerId
 */
export const getPartnerById = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    let partner = null;

    if (isDbConnected) {
      try {
        partner = await ChannelPartner.findOne({ partnerId }).lean();
      } catch (err) {
        // fallback
      }
    }

    if (!partner) {
      partner = getPartnersFallback().find(p => p.partnerId === partnerId);
    }

    if (!partner) {
      return res.status(404).json({ success: false, error: 'Channel partner not found.' });
    }

    partner.healthBadge = getHealthBadge(partner.fundUtilization || partner);

    return res.json({ success: true, partner });
  } catch (error) {
    next(error);
  }
};

/**
 * Determines fund health badge based on NPA and utilization.
 */
const getHealthBadge = (fundData = {}) => {
  const npa = fundData.npaPercentage || 0;
  const utilization = fundData.utilizationPercentage || 0;

  if (npa <= 3 && utilization >= 80) {
    return { level: 'GREEN', label: 'Excellent Fund Health', labelHi: 'उत्कृष्ट निधि स्वास्थ्य' };
  }
  if (npa <= 6 && utilization >= 65) {
    return { level: 'AMBER', label: 'Good Fund Health', labelHi: 'अच्छा निधि स्वास्थ्य' };
  }
  if (npa <= 10) {
    return { level: 'ORANGE', label: 'Moderate Fund Health', labelHi: 'सामान्य निधि स्वास्थ्य' };
  }
  return { level: 'RED', label: 'High Risk — Consider Alternative', labelHi: 'उच्च जोखिम — विकल्प पर विचार करें' };
};
