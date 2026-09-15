import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Globe } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { language, currentLanguageConfig, t } = useChatContext();
  const recognitionRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onSend(text.trim());
    setText('');
  };

  // Web Speech API Integration with multilingual Indian language speech models
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      // Uses the active language's speech model (hi-IN, mr-IN, ta-IN, te-IN, bn-IN, gu-IN, kn-IN, pa-IN, or-IN, en-IN)
      recognition.lang = currentLanguageConfig.voiceCode || 'hi-IN';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (event.results[0].isFinal) {
          setText((prev) => (prev ? `${prev} ${currentTranscript}`.trim() : currentTranscript.trim()));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 p-2 bg-white rounded-2xl border border-slate-300 shadow-md focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all"
      >
        {/* Active Language Mic Badge */}
        <div
          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200 shrink-0"
          title={`Active Voice Recognition Language: ${currentLanguageConfig.name} (${currentLanguageConfig.native})`}
        >
          <Globe className="w-3 h-3 text-brand-600" />
          <span>{currentLanguageConfig.native}</span>
        </div>

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md'
              : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
          }`}
          title={isListening ? t('chat.stopListeningTooltip', 'Stop Listening') : `${t('chat.speakTooltip', 'Speak')} (${currentLanguageConfig.name})`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isListening ? t('chat.listeningPlaceholder') : t('chat.inputPlaceholder')}
          disabled={disabled}
          className="flex-1 px-2 py-2 text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all transform active:scale-95"
          title={t('chat.sendTooltip', 'Send')}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
