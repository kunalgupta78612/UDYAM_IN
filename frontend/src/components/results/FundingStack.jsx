import React from 'react';
import { Layers, Plus, Sparkles, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const FundingStack = ({ fundingStacks = [] }) => {
  const { language } = useChatContext();

  if (!fundingStacks || fundingStacks.length === 0) return null;

  return (
    <div className="my-8 space-y-4">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-india-saffron text-white flex items-center justify-center shadow-md">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <span>{language === 'hi' ? 'अनुशंसित फंडिंग स्टैक संयोजन (Funding Stacks)' : 'Recommended Funding Stacks (Scheme Convergence)'}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Innovation
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {language === 'hi'
              ? 'सब्सिडी और रियायती ऋण योजनाओं का कानूनी रूप से अनुमत संयोजन'
              : 'Legally permitted combinations of capital subsidies and term loans for maximized enterprise support'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {fundingStacks.map((stack, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-gradient-to-br from-white to-amber-50/40 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {stack.badge}
                </span>
                <span className="text-xs font-bold text-amber-800 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Converged Support</span>
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 mb-2">
                {language === 'hi' && stack.titleHi ? stack.titleHi : stack.title}
              </h4>

              {/* Stack Combination Badges */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 my-3 p-3 rounded-xl bg-white border border-amber-200 shadow-sm text-xs font-bold text-slate-800">
                <div className="flex-1 text-emerald-800">{stack.primaryScheme}</div>
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 self-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 text-brand-800">{stack.secondaryScheme}</div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi' && stack.benefitSummaryHi ? stack.benefitSummaryHi : stack.benefitSummary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono text-[10px] text-slate-400">{stack.legalClause}</span>
              <span className="text-[10px] text-amber-700 font-semibold">*Subject to approval</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
