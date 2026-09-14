import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

const PERSONAS = [
  {
    id: 'savitri',
    name: '👩 Savitri Bai',
    role: 'OBC Woman Artisan / Tailor',
    input: 'I am an OBC female tailor. My annual family income is ₹2.5 lakh, age is 28 years, and project cost is ₹1.5 lakh for a tailoring boutique.',
    badge: 'OBC Female Micro-Loan'
  },
  {
    id: 'ramesh',
    name: '👨 Ramesh Kumar',
    role: 'SC Tech / Commercial Startup',
    input: 'I am an SC category entrepreneur. My annual family income is ₹2.8 lakh, age is 25, and I need a ₹25 lakh loan for setting up a logistics & service business.',
    badge: 'SC Youth Enterprise'
  },
  {
    id: 'vikas',
    name: '🧑 Vikas Sharma',
    role: 'General Category Street Vendor',
    input: 'I am a general category vendor. My annual family income is ₹4.5 lakh, age is 32 years, and I need a ₹40,000 working capital loan.',
    badge: 'Collateral-Free MUDRA'
  }
];

export const DemoPersonas = ({ onSelectPersona, disabled }) => {
  const { language } = useChatContext();

  return (
    <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/80 via-white to-amber-50/80 border border-brand-200/80 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>{language === 'hi' ? 'SIH जूरी प्रस्तुति डेमो प्रोफाइल (1-क्लिक टेस्ट):' : 'SIH Jury Demo Personas (1-Click Evaluation):'}</span>
        </span>
        <span className="text-[10px] text-brand-600 font-bold px-2 py-0.5 rounded-full bg-brand-100">
          Fast Demo Mode
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPersona(p.input)}
            className="text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-800 group-hover:text-brand-700">
                {p.name}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {p.badge}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{p.role}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
