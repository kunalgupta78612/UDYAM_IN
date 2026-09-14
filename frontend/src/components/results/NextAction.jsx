import React from 'react';
import { Landmark, ArrowUpRight, FileCheck, Building2, Globe } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const NextAction = ({ nextAction, documents = [] }) => {
  const { language } = useChatContext();

  if (!nextAction) return null;

  const getRouteIcon = (type) => {
    switch (type) {
      case 'BANK': return Landmark;
      case 'SCA': return Building2;
      case 'ONLINE_PORTAL': return Globe;
      default: return Building2;
    }
  };

  const Icon = getRouteIcon(nextAction.routeType);

  return (
    <div className="my-3 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-brand-950 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider block">
              {language === 'hi' ? 'अगला कदम / आवेदन मार्ग' : 'Actionable Next Step'}
            </span>
            <h5 className="text-sm font-bold text-white">{nextAction.routeName}</h5>
          </div>
        </div>

        {nextAction.url && (
          <a
            href={nextAction.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>{language === 'hi' ? 'आवेदन पोर्टल खोलें' : 'Apply Online'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        {nextAction.instructions}
      </p>

      {/* Required Documents Checklist */}
      {documents && documents.length > 0 && (
        <div className="pt-2.5 border-t border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            {language === 'hi' ? 'आवश्यक दस्तावेज (Document Checklist)' : 'Required Documents Checklist'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {documents.map((doc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
              >
                <FileCheck className="w-3 h-3 text-emerald-400" />
                <span>{doc}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
