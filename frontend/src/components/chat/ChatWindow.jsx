import React, { useRef, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext.jsx';
import { ChatMessage } from './ChatMessage.jsx';
import { QuickReplies } from './QuickReplies.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { ChatInput } from './ChatInput.jsx';
import { ProfileConfirmation } from '../profile/ProfileConfirmation.jsx';

export const ChatWindow = () => {
  const { messages, isLoading, sendUserMessage, conversationStatus, initSession, conversationId } = useChatContext();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      initSession();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const lastMessage = messages[messages.length - 1];
  const quickReplies = lastMessage?.role === 'assistant' ? lastMessage.quickReplies : [];
  const showConfirmation = lastMessage?.showProfileConfirmation || conversationStatus === 'CONFIRMATION';

  return (
    <div className="flex flex-col h-[560px] sm:h-[620px] lg:h-[650px] max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
        {messages.length === 0 && isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 py-12">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium">Connecting to UDYAM SETU Advisor...</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {/* Dynamic Quick Reply Chips */}
        {quickReplies && quickReplies.length > 0 && !isLoading && !showConfirmation && (
          <QuickReplies options={quickReplies} onSelect={sendUserMessage} disabled={isLoading} />
        )}

        {/* Profile Confirmation Card */}
        {showConfirmation && !isLoading && (
          <ProfileConfirmation onConfirm={() => {}} />
        )}

        {/* Loading Indicator */}
        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-200">
        <ChatInput onSend={sendUserMessage} disabled={isLoading} />
      </div>
    </div>
  );
};
