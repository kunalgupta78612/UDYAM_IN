import { Profile } from '../models/Profile.js';

const memoryProfiles = new Map();

/**
 * Retrieves a user profile by conversationId.
 * Endpoint: GET /api/profile/:conversationId
 */
export const getProfile = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    let profile = null;

    if (process.env.NODE_ENV !== 'test') {
      try {
        profile = await Profile.findOne({ conversationId }).lean();
      } catch (err) {
        profile = memoryProfiles.get(conversationId);
      }
    } else {
      profile = memoryProfiles.get(conversationId);
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile not found for session ${conversationId}`
      });
    }

    return res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirms or updates user profile attributes before final matching.
 * Endpoint: POST /api/profile/confirm
 */
export const confirmProfile = async (req, res, next) => {
  try {
    const { conversationId, updates = {} } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing conversationId'
      });
    }

    const updatedData = {
      ...updates,
      confirmed: true,
      updatedAt: new Date()
    };

    let profile = null;

    if (process.env.NODE_ENV !== 'test') {
      try {
        profile = await Profile.findOneAndUpdate(
          { conversationId },
          { $set: updatedData },
          { new: true, upsert: true }
        );
      } catch (err) {
        memoryProfiles.set(conversationId, { ...(memoryProfiles.get(conversationId) || {}), ...updatedData });
        profile = memoryProfiles.get(conversationId);
      }
    } else {
      memoryProfiles.set(conversationId, { ...(memoryProfiles.get(conversationId) || {}), ...updatedData });
      profile = memoryProfiles.get(conversationId);
    }

    return res.json({
      success: true,
      message: 'Profile confirmed successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};
