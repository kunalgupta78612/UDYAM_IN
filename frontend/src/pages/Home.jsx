import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Scale, Cpu, Search, CheckCircle2, Zap, Award, Layers } from 'lucide-react';
import { useChatContext } from '../context/ChatContext.jsx';
import { SolarHero3D } from '../components/common/SolarHero3D.jsx';

export const Home = () => {
  const { t } = useChatContext();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>{t('home.badge')}</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          {t('home.heroTitle1')}{' '}
          <span className="bg-gradient-to-r from-india-saffron via-brand-600 to-india-green bg-clip-text text-transparent">
            {t('home.heroTitleHighlight1')}
          </span>{' '}
          {t('home.heroTitleHighlight2')}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('home.heroSubtitle')}
        </p>

        {/* 3D Solar Interactive Emblem */}
        <SolarHero3D />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/chat"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-extrabold text-base shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{t('home.startAdvisor')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/schemes"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-base shadow-sm transition-all"
          >
            <Search className="w-5 h-5 text-slate-500" />
            <span>{t('home.browseSchemes')}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-brand-600 block">{t('home.stats1Number')}</span>
          <span className="text-xs font-semibold text-slate-500">{t('home.stats1Label')}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-india-green block">{t('home.stats2Number')}</span>
          <span className="text-xs font-semibold text-slate-500">{t('home.stats2Label')}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-amber-600 block">{t('home.stats3Number')}</span>
          <span className="text-xs font-semibold text-slate-500">{t('home.stats3Label')}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-indigo-600 block">{t('home.stats4Number')}</span>
          <span className="text-xs font-semibold text-slate-500">{t('home.stats4Label')}</span>
        </div>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {t('home.feature1Title')}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('home.feature1Desc')}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {t('home.feature2Title')}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('home.feature2Desc')}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-lg hover:shadow-xl transition-all">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {t('home.feature3Title')}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('home.feature3Desc')}
          </p>
        </div>
      </div>

      {/* 3-Step How It Works */}
      <div className="max-w-5xl mx-auto w-full p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-brand-950 text-white shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-300">
            {t('home.howItWorksBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('home.howItWorksTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            {t('home.howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/30 text-brand-300 font-black flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-white">{t('home.step1Title')}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{t('home.step1Desc')}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-300 font-black flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-white">{t('home.step2Title')}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{t('home.step2Desc')}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/30 text-amber-300 font-black flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-white">{t('home.step3Title')}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{t('home.step3Desc')}</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/chat"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <span>{t('home.ctaButton')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
