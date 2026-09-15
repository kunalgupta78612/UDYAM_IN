import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Scale, Cpu, Search, CheckCircle } from 'lucide-react';
import { useChatContext } from '../context/ChatContext.jsx';

export const Home = () => {
  const { language } = useChatContext();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>{language === 'hi' ? 'स्मार्ट इंडिया हैकथॉन 2026' : 'Smart India Hackathon 2026 Theme Solution'}</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          {language === 'hi' ? (
            <>
              उद्यम सेतु - अपने व्यवसाय के लिए खोजें <span className="bg-gradient-to-r from-india-saffron via-brand-600 to-india-green bg-clip-text text-transparent">सही सरकारी योजना</span>
            </>
          ) : (
            <>
              UDYAM SETU — Find the Right Government Scheme for <span className="bg-gradient-to-r from-india-saffron via-brand-600 to-india-green bg-clip-text text-transparent">Your Business</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {language === 'hi'
            ? 'उद्यम सेतु के साथ बिना किसी जटिलता के, अपनी भाषा (हिंदी/अंग्रेजी) में बोलकर या लिखकर जानें कि आप किस सरकारी योजना के लिए 100% पात्र हैं।'
            : 'AI-driven conversational matching paired with a 100% deterministic rule engine. Get verified eligibility traces, rejection gap reports, and direct application routes.'}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/chat"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-extrabold text-base shadow-xl shadow-brand-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{language === 'hi' ? 'योजना खोजें (Start AI Advisor)' : 'Start AI Scheme Advisor'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/schemes"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-base shadow-sm transition-all"
          >
            <Search className="w-5 h-5 text-slate-500" />
            <span>{language === 'hi' ? 'सभी योजनाएं देखें' : 'Browse All Schemes'}</span>
          </Link>
        </div>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid md:grid-cols-3 gap-6 my-16">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {language === 'hi' ? 'स्वाभाविक भाषा समझ (NLU)' : 'Conversational NLU'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'हिंदी, अंग्रेजी और हिंग्लिश में बोलें। सिस्टम आपकी आवश्यकता समझकर प्रोफाइल तैयार करता है।'
              : 'Speak or type in Hindi, English, or Hinglish. Extracts income, category, and business requirements automatically.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {language === 'hi' ? '100% सटीक नियम इंजन' : 'Deterministic Rule Engine'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'एआई कोई झूठा निर्णय नहीं लेता। वास्तविक पात्रता नियमों और कानूनी धाराओं के अनुसार परखी जाती है।'
              : 'Zero LLM hallucinations. Rules are verified against official gazettes with clause-by-clause audit traces.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {language === 'hi' ? 'सीधा आवेदन मार्गदर्शन' : 'Actionable Routing & Gaps'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'पात्रता के बाद बैंक, SCA या पोर्टल का सीधा लिंक और आवश्यक दस्तावेजों की चेकलिस्ट प्राप्त करें।'
              : 'Direct links to State Channelizing Agencies (SCAs), banks, and incubation portals with document checklists.'}
          </p>
        </div>
      </div>
    </div>
  );
};
