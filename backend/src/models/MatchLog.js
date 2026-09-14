import mongoose from 'mongoose';

const MatchConditionTraceSchema = new mongoose.Schema({
  conditionId: { type: String, required: true },
  field: { type: String, required: true },
  userValue: { type: mongoose.Schema.Types.Mixed },
  requiredValue: { type: mongoose.Schema.Types.Mixed },
  operator: { type: String },
  result: { type: Boolean, required: true },
  reason: { type: String },
  clause: { type: String },
  sourceId: { type: String },
  sourceUrl: { type: String }
}, { _id: false });

const MatchLogSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  schemeId: { type: String, required: true, index: true },
  schemeName: { type: String },
  status: { 
    type: String, 
    enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'NEED_INFO'], 
    required: true 
  },
  conditions: [MatchConditionTraceSchema],
  missingFields: [{ type: String }],
  gapSummary: { type: String, default: null },
  ruleVersion: { type: Number, default: 1 }
}, {
  timestamps: true
});

export const MatchLog = mongoose.model('MatchLog', MatchLogSchema);
