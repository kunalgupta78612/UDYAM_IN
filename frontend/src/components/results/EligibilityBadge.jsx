import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const EligibilityBadge = ({ status }) => {
  const { language } = useChatContext();

  if (status === 'ELIGIBLE') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>{language === 'hi' ? 'पात्र (ELIGIBLE)' : 'ELIGIBLE'}</span>
      </span>
    );
  }

  if (status === 'NEED_INFO') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>{language === 'hi' ? 'अधिक जानकारी चाहिए' : 'NEED MORE INFO'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-sm">
      <XCircle className="w-3.5 h-3.5 text-rose-600" />
      <span>{language === 'hi' ? 'अपात्र (NOT ELIGIBLE)' : 'NOT ELIGIBLE'}</span>
    </span>
  );
};
