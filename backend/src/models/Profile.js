import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  category: { type: String, default: null },
  gender: { type: String, enum: ['female', 'male', 'transgender', 'other', null], default: null },
  age: { type: Number, default: null },
  familyIncome: { type: Number, default: null },
  businessType: { type: String, default: null },
  projectCost: { type: Number, default: null },
  udyamRegistered: { type: Boolean, default: null },
  state: { type: String, default: 'ALL' },
  purpose: { type: String, default: null },
  confirmed: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Profile = mongoose.model('Profile', ProfileSchema);
