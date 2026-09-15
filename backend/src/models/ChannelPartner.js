import mongoose from 'mongoose';

const ChannelPartnerSchema = new mongoose.Schema({
  partnerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['SCA', 'PSB', 'RRB', 'NBFC_MFI'],
    index: true
  },
  
  // GeoJSON Point for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  address: { type: String, required: true },
  district: { type: String, required: true, index: true },
  state: { type: String, required: true, index: true },
  pincode: { type: String, default: null },

  contactPhone: { type: String, default: null },
  contactEmail: { type: String, default: null },
  website: { type: String, default: null },

  // Schemes this partner can process
  schemesHandled: [{ type: String, index: true }],

  // Fund utilization health (for NPA-based filtering)
  fundUtilization: {
    allocatedCrores: { type: Number, default: 0 },
    disbursedCrores: { type: Number, default: 0 },
    npaPercentage: { type: Number, default: 0 },
    overduePercentage: { type: Number, default: 0 },
    utilizationPercentage: { type: Number, default: 0 }
  },

  isActive: { type: Boolean, default: true },
  lastUpdated: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

// 2dsphere index for geospatial proximity queries
ChannelPartnerSchema.index({ location: '2dsphere' });

export const ChannelPartner = mongoose.model('ChannelPartner', ChannelPartnerSchema);
