import React, { useState } from 'react';
import { Bot, User, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const ChatMessage = ({ message }) => {
  const { language, t, speakText, stopSpeaking, speakingMessageId } = useChatContext();
  const [copied, setCopied] = useState(false);
  const isBot = message.role === 'assistant';

  // Determine localized content based on available fields
  let content = message.content;
  if (message.contentByLang && message.contentByLang[language]) {
    content = message.contentByLang[language];
  } else if (language === 'hi' && message.contentHi) {
    content = message.contentHi;
  } else if (language === 'en' && message.contentEn) {
    content = message.contentEn;
  } else if (message.contentEn || message.contentHi) {
    content = language === 'hi' ? message.contentHi || message.contentEn : message.contentEn || message.contentHi;
  }

  // Fallback to content or raw string
  content = content || message.content || '';

  const messageId = message._id || `${message.timestamp || ''}_${content.substring(0, 15)}`;
  const isSpeaking = speakingMessageId === messageId;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(content, messageId);
    }
  };

  return (
    <div className={`flex items-start space-x-3 my-4 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isBot
            ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white'
            : 'bg-slate-800 text-white'
        }`}
      >
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-xl rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed relative group ${
          isBot
            ? 'bg-white border border-slate-200 text-slate-800'
            : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white'
        }`}
      >
        <p className="whitespace-pre-line">{content}</p>

        {/* Action icons & timestamp */}
        <div className={`flex items-center justify-between mt-2 pt-1 border-t ${
          isBot ? 'border-slate-100 text-slate-400' : 'border-white/20 text-brand-100'
        }`}>
          {/* Audio read-aloud and copy buttons for bot messages */}
          {isBot ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSpeak}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  isSpeaking ? 'text-brand-600 animate-pulse' : 'text-slate-400 hover:text-slate-700'
                }`}
                title={isSpeaking ? t('chat.stopReading', 'Stop') : t('chat.readAloud', 'Read Aloud')}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title={copied ? t('chat.copied', 'Copied!') : t('chat.copyText', 'Copy Text')}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <div />
          )}

          {message.timestamp && (
            <span className="text-[10px] font-medium ml-auto">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
