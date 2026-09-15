import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Globe, Compass, MessageSquare, BookOpen, ChevronDown, Check } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const Header = () => {
  const location = useLocation();
  const { language, setLanguage, supportedLanguages, currentLanguageConfig, t } = useChatContext();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', labelKey: 'nav.home', icon: Compass },
    { to: '/chat', labelKey: 'nav.advisor', icon: MessageSquare },
    { to: '/schemes', labelKey: 'nav.schemes', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-india-saffron via-brand-600 to-india-green flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {t('brand.name', 'UDYAM SETU')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                {t('brand.edition', 'SIH 2026')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
              {t('brand.tagline', 'AI-Driven MSME Scheme Matching')}
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
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(link.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language Selector & CTA Action */}
        <div className="flex items-center space-x-3">
          {/* Multilingual Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-200"
              title={t('nav.language', 'Select Language')}
            >
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              <span className="font-bold text-slate-800">{currentLanguageConfig.native}</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                ({currentLanguageConfig.name})
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('nav.language', 'Select Language')}
                  </span>
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {supportedLanguages.length} Languages
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {supportedLanguages.map((lang) => {
                    const isSelected = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-brand-50/70 text-brand-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold flex items-center space-x-1.5">
                            <span>{lang.native}</span>
                            <span className="text-[11px] font-normal text-slate-500">({lang.name})</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{lang.region}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/chat"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-semibold shadow-md hover:from-brand-700 hover:to-brand-800 transition-all transform hover:-translate-y-0.5"
          >
            {t('nav.startMatch', 'Start Match')}
          </Link>
        </div>
      </div>
    </header>
  );
};
