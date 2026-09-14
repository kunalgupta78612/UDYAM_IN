import React from 'react';
import { ExternalLink, Check, X, AlertTriangle } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const EligibilityTrace = ({ traceItems = [] }) => {
  const { language } = useChatContext();

  if (!traceItems || traceItems.length === 0) return null;

  return (
    <div className="space-y-2.5 my-3">
      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {language === 'hi' ? 'शर्त-दर-शर्त पात्रता सत्यापन' : 'Clause-by-Clause Evaluation Trace'}
      </h5>

      <div className="space-y-2">
        {traceItems.map((item, index) => {
          const isPassed = item.status === 'PASSED';
          const isFailed = item.status === 'FAILED';

          return (
            <div
              key={index}
              className={`p-3 rounded-xl border text-xs transition-all ${
                isPassed
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : isFailed
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isFailed
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {isPassed ? <Check className="w-3 h-3" /> : isFailed ? <X className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{item.label}</span>
                      {item.clause && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono">
                          {item.clause}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-0.5 text-[11px]">{item.reason}</p>
                  </div>
                </div>

                {/* Values Comparison */}
                <div className="text-right shrink-0 ml-2">
                  <div className="text-[10px] text-slate-400 font-medium">{language === 'hi' ? 'आपका विवरण' : 'Your Value'}</div>
                  <div className="font-bold text-slate-800">{item.userValue}</div>
                  <div className="text-[10px] text-slate-500">{item.requirement}</div>
                </div>
              </div>

              {/* Legal Source URL */}
              {item.sourceUrl && (
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Official Government Source:</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-800 font-semibold underline"
                  >
                    <span>View Gazette / Guideline</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
