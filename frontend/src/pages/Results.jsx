import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext.jsx';
import { SchemeCard } from '../components/results/SchemeCard.jsx';
import { FundingStack } from '../components/results/FundingStack.jsx';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, XCircle, ArrowLeft, RefreshCw, FileText } from 'lucide-react';

export const Results = () => {
  const { matchResults, language, profile, triggerEligibilityCheck, isLoading } = useChatContext();
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'needInfo' | 'notEligible'

  if (!matchResults) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-100 text-brand-600 flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          {language === 'hi' ? 'कोई सक्रिय परिणाम नहीं मिला' : 'No Evaluation Results Yet'}
        </h3>
        <p className="text-xs text-slate-500">
          {language === 'hi'
            ? 'कृपया पहले चैट सलाहकार में विवरण दर्ज करें या पात्रता जांच प्रारंभ करें।'
            : 'Please start a chat session to build your profile and evaluate eligibility against government schemes.'}
        </p>
        <Link
          to="/chat"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
        >
          {language === 'hi' ? 'चैट प्रारंभ करें' : 'Start Chat Session'}
        </Link>
      </div>
    );
  }

  const { summary, results } = matchResults;
  const eligibleSchemes = results.eligible || [];
  const needInfoSchemes = results.needInfo || [];
  const notEligibleSchemes = results.notEligible || [];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Back and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            to="/chat"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'चैट पर वापस जाएं' : 'Back to Chat'}</span>
          </Link>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'hi' ? 'आपकी पात्रता परिणाम' : 'Your Eligibility Evaluation Report'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'hi' ? '100% सटीक नियम इंजन द्वारा सत्यापित' : 'Deterministic evaluation completed with clause-by-clause traces'}
          </p>
        </div>

        <button
          onClick={() => triggerEligibilityCheck(profile)}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{language === 'hi' ? 'पुनः मूल्यांकन करें' : 'Re-evaluate'}</span>
        </button>
      </div>

      {/* 3 Triage Tab Counters */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Eligible Tab */}
        <button
          onClick={() => setActiveTab('eligible')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'eligible'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {language === 'hi' ? 'पात्र योजनाएं' : 'Eligible Schemes'}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-950 mt-2">{summary.eligibleCount}</div>
        </button>

        {/* Need Info Tab */}
        <button
          onClick={() => setActiveTab('needInfo')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'needInfo'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {language === 'hi' ? 'अधूरी जानकारी' : 'Need More Info'}
            </span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-950 mt-2">{summary.needInfoCount}</div>
        </button>

        {/* Not Eligible Tab */}
        <button
          onClick={() => setActiveTab('notEligible')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'notEligible'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              {language === 'hi' ? 'अपात्र योजनाएं' : 'Not Eligible'}
            </span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-950 mt-2">{summary.notEligibleCount}</div>
        </button>
      </div>

      {/* Recommended Funding Stacks (Scheme Convergence) */}
      {matchResults.fundingStacks && matchResults.fundingStacks.length > 0 && (
        <FundingStack fundingStacks={matchResults.fundingStacks} />
      )}

      {/* Schemes List for Active Tab */}
      <div className="space-y-4">
        {activeTab === 'eligible' && (
          <>
            {eligibleSchemes.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                No eligible schemes found for the current profile parameters.
              </div>
            ) : (
              eligibleSchemes.map((s, idx) => <SchemeCard key={idx} schemeResult={s} />)
            )}
          </>
        )}

        {activeTab === 'needInfo' && (
          <>
            {needInfoSchemes.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                All candidate schemes have complete evaluations.
              </div>
            ) : (
              needInfoSchemes.map((s, idx) => <SchemeCard key={idx} schemeResult={s} />)
            )}
          </>
        )}

        {activeTab === 'notEligible' && (
          <>
            {notEligibleSchemes.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                No disqualified schemes.
              </div>
            ) : (
              notEligibleSchemes.map((s, idx) => <SchemeCard key={idx} schemeResult={s} />)
            )}
          </>
        )}
      </div>
    </div>
  );
};
