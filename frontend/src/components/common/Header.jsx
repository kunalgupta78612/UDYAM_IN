import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Globe, Compass, MessageSquare, BookOpen, ChevronDown, Check, Calculator as CalcIcon, MapPin, Menu, X, ArrowRight } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const Header = () => {
  const location = useLocation();
  const { language, setLanguage, supportedLanguages, currentLanguageConfig, t } = useChatContext();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleMobileClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('#mobile-menu-btn')
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMobileClickOutside);
    return () => document.removeEventListener('mousedown', handleMobileClickOutside);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/', labelKey: 'nav.home', defaultLabel: 'Home', desc: 'Overview & Stats', icon: Compass },
    { to: '/chat', labelKey: 'nav.advisor', defaultLabel: 'AI Advisor', desc: 'Conversational Matching', icon: MessageSquare },
    { to: '/schemes', labelKey: 'nav.schemes', defaultLabel: 'Schemes', desc: 'Browse All Schemes', icon: BookOpen },
    { to: '/calculator', labelKey: 'nav.calculator', defaultLabel: 'EMI & Subsidy', desc: 'Loan & Subsidy Calc', icon: CalcIcon },
    { to: '/partners', labelKey: 'nav.partners', defaultLabel: 'Find Partners', desc: 'Channel Partner Map', icon: MapPin }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group perspective-1000 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent p-0.5 border border-amber-500/30 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <img 
              src="/logo-gold.png" 
              alt="Udyam Setu Surya Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(234,88,12,0.8)] transition-all"
            />
            <div className="absolute inset-0 rounded-xl bg-amber-400/20 blur-sm -z-10 group-hover:bg-amber-400/40 transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-amber-950 to-slate-800 bg-clip-text text-transparent group-hover:from-amber-600 group-hover:to-orange-700 transition-colors truncate">
                {t('brand.name', 'UDYAM SETU')}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                {t('brand.edition', 'SIH 2026')}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[170px] sm:max-w-none">
              {t('brand.tagline', 'AI-Driven MSME Scheme Matching')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(link.labelKey, link.defaultLabel)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controls: Language Selector, Desktop CTA, Mobile Menu Button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Multilingual Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-200"
              title={t('nav.language', 'Select Language')}
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="font-bold text-slate-800">{currentLanguageConfig.native}</span>
              <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">
                ({currentLanguageConfig.name})
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-60 sm:w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
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

          {/* Desktop CTA Action */}
          <Link
            to="/chat"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-semibold shadow-md hover:from-brand-700 hover:to-brand-800 transition-all transform hover:-translate-y-0.5"
          >
            {t('nav.startMatch', 'Start Match')}
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-200"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl shadow-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="grid grid-cols-1 gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3.5 p-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-brand-50 border border-brand-200 text-brand-700 font-bold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold truncate">
                        {t(link.labelKey, link.defaultLabel)}
                      </p>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-brand-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {link.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick CTA inside Mobile Menu */}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold text-xs shadow-md active:scale-98 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('nav.startMatch', 'Start AI Scheme Advisor')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
