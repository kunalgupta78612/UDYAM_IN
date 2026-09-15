import React from 'react';
import { ChatWindow } from '../components/chat/ChatWindow.jsx';
import { DemoPersonas } from '../components/chat/DemoPersonas.jsx';
import { useChatContext } from '../context/ChatContext.jsx';

export const Chat = () => {
  const { t, candidateCount, sendUserMessage, isLoading } = useChatContext();

  return (
    <div className="py-4 px-4 sm:px-6 max-w-7xl mx-auto space-y-3 sm:space-y-4">
      {/* Top Banner */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>{t('chat.advisorTitle')}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t('chat.advisorSubtitle')}
          </p>
        </div>

        {candidateCount > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700">
            {candidateCount} {t('chat.shortlistedSchemes')}
          </div>
        )}
      </div>

      {/* Jury Quick Demo Personas */}
      <DemoPersonas onSelectPersona={sendUserMessage} disabled={isLoading} />

      <ChatWindow />
    </div>
  );
};
