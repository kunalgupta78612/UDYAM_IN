import React from 'react';
import { ChatWindow } from '../components/chat/ChatWindow.jsx';
import { DemoPersonas } from '../components/chat/DemoPersonas.jsx';
import { useChatContext } from '../context/ChatContext.jsx';
import { Sparkles, HelpCircle } from 'lucide-react';

export const Chat = () => {
  const { language, candidateCount, sendUserMessage, isLoading } = useChatContext();

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>{language === 'hi' ? 'स्कीमसाथी एआई सलाहकार' : 'SchemeSaathi AI Advisor'}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {language === 'hi' ? 'बोलकर या लिखकर अपनी आवश्यकता बताएं' : 'Interactive slot-filling with dynamic question optimization'}
          </p>
        </div>

        {candidateCount > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700">
            {candidateCount} {language === 'hi' ? 'योजनाएं जांची जा रही हैं' : 'Candidate Schemes Shortlisted'}
          </div>
        )}
      </div>

      {/* Jury Quick Demo Personas */}
      <DemoPersonas onSelectPersona={sendUserMessage} disabled={isLoading} />

      <ChatWindow />
    </div>
  );
};
