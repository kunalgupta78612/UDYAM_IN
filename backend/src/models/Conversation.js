import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  quickReplies: [{ type: String }],
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true, index: true },
  messages: [MessageSchema],
  currentIntent: { type: String, default: null },
  selectedSchemeId: { type: String, default: null },
  candidateSchemeIds: [{ type: String }],
  status: { 
    type: String, 
    enum: ['ACTIVE', 'WAITING_INFO', 'CONFIRMATION', 'EVALUATED', 'COMPLETED'], 
    default: 'ACTIVE' 
  }
}, {
  timestamps: true
});

export const Conversation = mongoose.model('Conversation', ConversationSchema);
