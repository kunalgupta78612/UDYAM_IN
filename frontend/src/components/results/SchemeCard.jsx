import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Building, IndianRupee } from 'lucide-react';
import { EligibilityBadge } from './EligibilityBadge.jsx';
import { EligibilityTrace } from './EligibilityTrace.jsx';
import { GapReport } from './GapReport.jsx';
import { NextAction } from './NextAction.jsx';
import { useChatContext } from '../../context/ChatContext.jsx';

export const SchemeCard = ({ schemeResult }) => {
  const [isExpanded, setIsExpanded] = useState(schemeResult.status === 'ELIGIBLE');
  const { language, t } = useChatContext();

  const isEligible = schemeResult.status === 'ELIGIBLE';

  return (
    <div
      className={`rounded-2xl border bg-white shadow-md transition-all duration-200 overflow-hidden ${
        isEligible
          ? 'border-emerald-300 ring-1 ring-emerald-200'
          : schemeResult.status === 'NEED_INFO'
          ? 'border-amber-300'
          : 'border-slate-200 opacity-90'
      }`}
    >
      {/* Header Bar */}
      <div className="p-5 cursor-pointer hover:bg-slate-50/60" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <EligibilityBadge status={schemeResult.status} />
              {schemeResult.verifiedOn && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  Verified: {schemeResult.verifiedOn}
                </span>
              )}
            </div>

            <h4 className="text-base font-extrabold text-slate-900 mt-1">
              {schemeResult.schemeName}
            </h4>

            {schemeResult.organization && (
              <p className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                <Building className="w-3.5 h-3.5" />
                <span>{schemeResult.organization.name} • {schemeResult.organization.ministry}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Financial Highlights Pill */}
        {schemeResult.financialBenefits && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            {schemeResult.financialBenefits.maximumLoan && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 font-bold border border-brand-200">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>{t('schemes.maxAssistance')}: Up to ₹{Number(schemeResult.financialBenefits.maximumLoan).toLocaleString('en-IN')}</span>
              </span>
            )}
            {schemeResult.financialBenefits.interestRate && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                Interest: {schemeResult.financialBenefits.interestRate}
              </span>
            )}
            {schemeResult.financialBenefits.subsidy && (
              <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                {t('schemes.subsidyRate')}: {schemeResult.financialBenefits.subsidy}
              </span>
            )}
          </div>
        )}

        {/* Explanation Summary */}
        {schemeResult.explanation && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <p>
              {language === 'hi' && schemeResult.explanation.explanationHindi
                ? schemeResult.explanation.explanationHindi
                : schemeResult.explanation.explanationEnglish}
            </p>
          </div>
        )}
      </div>

      {/* Accordion Expandable Details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40">
          {/* Itemized Trace */}
          <EligibilityTrace traceItems={schemeResult.traceItems} />

          {/* Gap Report */}
          <GapReport gapReport={schemeResult.gapReport} />

          {/* Actionable Routing */}
          <NextAction nextAction={schemeResult.nextAction} documents={schemeResult.documents} />
        </div>
      )}
    </div>
  );
};
