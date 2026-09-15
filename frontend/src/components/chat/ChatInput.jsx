import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Globe } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('hi-IN'); // Default to Hindi on priority
  const { language } = useChatContext();
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

  // Web Speech API Integration with Hindi Priority
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
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
      recognition.lang = speechLang;
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
          setText(prev => (prev ? `${prev} ${currentTranscript}`.trim() : currentTranscript.trim()));
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

  const toggleSpeechLanguage = () => {
    setSpeechLang(prev => (prev === 'hi-IN' ? 'en-IN' : 'hi-IN'));
  };

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 p-2 bg-white rounded-2xl border border-slate-300 shadow-md focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
        {/* Voice Language Switcher Badge */}
        <button
          type="button"
          onClick={toggleSpeechLanguage}
          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-1 border border-slate-200"
          title="Click to switch voice language (Hindi / English)"
        >
          <Globe className="w-3 h-3 text-slate-500" />
          <span>{speechLang === 'hi-IN' ? 'हिंदी Mic' : 'Eng Mic'}</span>
        </button>

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md'
              : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
          }`}
          title={isListening ? 'Stop Listening' : `Speak in ${speechLang === 'hi-IN' ? 'Hindi' : 'English'}`}
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
              ? speechLang === 'hi-IN' ? '🎙️ सुन रहा हूँ... बोलिए (उदा: मैं ओबीसी हूँ, सिलाई का काम है)' : '🎙️ Listening... Speak now'
              : language === 'hi' ? 'अपना संदेश लिखें या बोलें (उदा: मैं ओबीसी हूँ, डेढ़ लाख का लोन चाहिए)...' : 'Type or speak (e.g. I am OBC, need 1.5 lakh loan for tailoring)...'
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
    </div>
  );
};
