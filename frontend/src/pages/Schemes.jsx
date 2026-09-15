import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Search, Building, ArrowUpRight, Filter, Sparkles } from 'lucide-react';
import { useChatContext } from '../context/ChatContext.jsx';
import { useNavigate } from 'react-router-dom';

export const Schemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const { t, sendUserMessage } = useChatContext();
  const navigate = useNavigate();

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (purposeFilter) params.purpose = purposeFilter;

      const data = await api.getSchemes(params);
      setSchemes(data.schemes || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [categoryFilter, purposeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleCheckEligibility = (schemeName) => {
    navigate('/chat');
    sendUserMessage(`I want to evaluate my eligibility for ${schemeName}`);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {t('schemes.title')}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t('schemes.subtitle')}
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('schemes.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="">{t('schemes.allCategories')}</option>
            <option value="SC">{t('schemes.catSC', 'SC (Scheduled Caste)')}</option>
            <option value="OBC">{t('schemes.catOBC', 'OBC')}</option>
            <option value="ST">{t('schemes.catST', 'ST')}</option>
            <option value="GENERAL">{t('schemes.catGeneral', 'General')}</option>
          </select>

          {/* Purpose Filter */}
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="">{t('schemes.allPurposes')}</option>
            <option value="business_loan">{t('schemes.purposeBusinessLoan', 'Business Loan')}</option>
            <option value="women_entrepreneur">{t('schemes.purposeWomen', 'Women Entrepreneur')}</option>
            <option value="startup">{t('schemes.purposeStartup', 'Startup / Enterprise')}</option>
            <option value="working_capital">{t('schemes.purposeWorkingCapital', 'Working Capital')}</option>
            <option value="self_employment">{t('schemes.purposeSelfEmployment', 'Self Employment')}</option>
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">{t('common.loading')}</div>
      ) : schemes.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          {t('schemes.noSchemesFound')}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => (
            <div
              key={scheme.schemeId}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {scheme.organization?.name?.split(' ')[0] || 'Government'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">v{scheme.version || 1}</span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{scheme.name}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{scheme.shortDescription}</p>

                {scheme.financialBenefits?.maximumLoan && (
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-emerald-800">
                    {t('schemes.maxAssistance')}: ₹{Number(scheme.financialBenefits.maximumLoan).toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {scheme.conditions?.length || 0} {t('schemes.rulesCount')}
                  </span>

                  {scheme.sources?.[0]?.url && (
                    <a
                      href={scheme.sources[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-800"
                    >
                      <span>{t('common.officialUrl')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckEligibility(scheme.name)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-bold text-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('schemes.checkEligibility')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
