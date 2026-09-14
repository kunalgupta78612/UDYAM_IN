import React, { useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { language } = useChatContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  // Web Speech API Integration
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => (prev ? `${prev} ${transcript}` : transcript));
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
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2 p-2 bg-white rounded-2xl border border-slate-300 shadow-md focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
      {/* Voice Input Button */}
      <button
        type="button"
        onClick={toggleVoiceInput}
        className={`p-2.5 rounded-xl transition-all ${
          isListening
            ? 'bg-rose-500 text-white animate-pulse shadow-md'
            : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'
        }`}
        title={isListening ? 'Stop Listening' : 'Speak (Voice Input)'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Text Input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          isListening
            ? language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'
            : language === 'hi' ? 'अपना संदेश लिखें या बोलें (उदा: मेरी आय ₹2.5 लाख है)...' : 'Type or speak (e.g. I need a loan for my tailoring shop)...'
        }
        disabled={disabled}
        className="flex-1 px-2 py-2 text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all transform active:scale-95"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
