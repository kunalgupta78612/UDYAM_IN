import React from 'react';
import { Bot, User, CheckCircle2 } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const ChatMessage = ({ message }) => {
  const { language } = useChatContext();
  const isBot = message.role === 'assistant';

  const content = language === 'hi' && message.contentHi ? message.contentHi : (message.contentEn || message.content);

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
        className={`max-w-xl rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
          isBot
            ? 'bg-white border border-slate-200 text-slate-800'
            : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white'
        }`}
      >
        <p className="whitespace-pre-line">{content}</p>
        
        {message.timestamp && (
          <span
            className={`block text-[10px] mt-1.5 font-medium ${
              isBot ? 'text-slate-400' : 'text-brand-100 text-right'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};
