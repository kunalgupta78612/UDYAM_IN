import mongoose from 'mongoose';

const ConditionSchema = new mongoose.Schema({
  conditionId: { type: String, required: true },
  field: { type: String, required: true },
  operator: { 
    type: String, 
    required: true, 
    enum: ['==', '!=', '<', '<=', '>', '>=', 'IN', 'NOT_IN'] 
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: null },
  description: { type: String, required: true },
  clause: { type: String, required: true },
  sourceId: { type: String, required: true },
  required: { type: Boolean, default: true }
}, { _id: false });

const SourceSchema = new mongoose.Schema({
  sourceId: { type: String, required: true },
  title: { type: String, required: true },
  organization: { type: String, required: true },
  url: { type: String, required: true },
  documentType: { type: String, default: 'official_guideline' },
  clause: { type: String, default: null },
  page: { type: Number, default: null },
  verifiedOn: { type: String, required: true }
}, { _id: false });

const SchemeSchema = new mongoose.Schema({
  schemeId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  shortDescription: { type: String, required: true },
  organization: {
    name: { type: String, required: true },
    ministry: { type: String, required: true }
  },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW'], default: 'ACTIVE' },
  
  // Search & Filtering Metadata (indexed individually)
  purpose: [{ type: String, index: true }],
  targetBeneficiaries: [{ type: String }],
  applicableGender: [{ type: String, enum: ['female', 'male', 'transgender', 'all'], index: true }],
  applicableCategories: [{ type: String, index: true }],
  states: [{ type: String, index: true }],
  businessTypes: [{ type: String, index: true }],
  
  // Rule Engine Requirements
  requiredFields: [{ type: String, required: true }],
  conditions: [ConditionSchema],
  
  // Financial Information
  financialBenefits: {
    minimumLoan: { type: Number, default: null },
    maximumLoan: { type: Number, default: null },
    subsidy: { type: String, default: null },
    marginMoney: { type: String, default: null },
    interestRate: { type: String, default: null },
    repaymentPeriod: { type: String, default: null }
  },
  
  // Actionable Route
  applicationRoute: {
    type: { 
      type: String, 
      enum: ['SCA', 'BANK', 'INCUBATOR', 'ONLINE_PORTAL', 'OTHER'], 
      required: true 
    },
    name: { type: String, required: true },
    url: { type: String, default: null },
    description: { type: String, required: true }
  },
  
  documents: [{ type: String }],
  sources: [SourceSchema],
  
  // Provenance & Quality
  conflict: { type: Boolean, default: false },
  conflictDetails: [{ type: mongoose.Schema.Types.Mixed }],
  verifiedOn: { type: String, required: true }
}, {
  timestamps: true
});

export const Scheme = mongoose.model('Scheme', SchemeSchema);
