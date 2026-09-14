import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const GapReport = ({ gapReport }) => {
  const { language } = useChatContext();

  if (!gapReport || !gapReport.hasGaps) return null;

  return (
    <div className="my-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
      <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs mb-2">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span>{language === 'hi' ? 'पात्रता अंतर रिपोर्ट (Gap Analysis)' : 'Eligibility Gap Analysis'}</span>
      </div>

      <p className="text-xs text-amber-900 font-medium leading-relaxed">
        {gapReport.summary}
      </p>

      {gapReport.deficiencies && gapReport.deficiencies.length > 0 && (
        <ul className="mt-2 space-y-1 pl-4 list-disc text-xs text-amber-800">
          {gapReport.deficiencies.map((d, i) => (
            <li key={i}>
              <span className="font-semibold">{d.label}:</span> {d.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
