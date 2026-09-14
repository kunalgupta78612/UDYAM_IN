import React from 'react';

export const QuickReplies = ({ options = [], onSelect, disabled }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 my-3 pl-12">
      {options.map((opt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(opt)}
          disabled={disabled}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 hover:border-brand-500 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          {opt}
        </button>
      ))}
    </div>
  );
};
