import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex items-start space-x-3 my-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
        <Bot className="w-5 h-5" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center space-x-1.5">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"></div>
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};
