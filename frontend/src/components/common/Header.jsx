import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Globe, Compass, MessageSquare, BookOpen } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const Header = () => {
  const location = useLocation();
  const { language, toggleLanguage } = useChatContext();

  const navLinks = [
    { to: '/', labelEn: 'Home', labelHi: 'होम', icon: Compass },
    { to: '/chat', labelEn: 'AI Advisor', labelHi: 'एआई सलाहकार', icon: MessageSquare },
    { to: '/schemes', labelEn: 'Explore Schemes', labelHi: 'योजनाएं देखें', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-india-saffron via-brand-600 to-india-green flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                SchemeSaathi
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                SIH 2024
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'hi' ? 'उद्यमी योजना सलाहकार' : 'AI-Driven MSME Scheme Matching'}
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{language === 'hi' ? link.labelHi : link.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language & Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-brand-600" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          <Link
            to="/chat"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-semibold shadow-md hover:from-brand-700 hover:to-brand-800 transition-all transform hover:-translate-y-0.5"
          >
            {language === 'hi' ? 'चैट शुरू करें' : 'Start Match'}
          </Link>
        </div>
      </div>
    </header>
  );
};
