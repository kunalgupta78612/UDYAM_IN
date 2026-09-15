import React from 'react';
import { Sparkles } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const DemoPersonas = ({ onSelectPersona, disabled }) => {
  const { t } = useChatContext();

  const personas = [
    {
      id: 'savitri',
      name: t('personas.savitriName'),
      role: t('personas.savitriRole'),
      input: t('personas.savitriInput'),
      badge: t('personas.savitriBadge')
    },
    {
      id: 'ramesh',
      name: t('personas.rameshName'),
      role: t('personas.rameshRole'),
      input: t('personas.rameshInput'),
      badge: t('personas.rameshBadge')
    },
    {
      id: 'vikas',
      name: t('personas.vikasName'),
      role: t('personas.vikasRole'),
      input: t('personas.vikasInput'),
      badge: t('personas.vikasBadge')
    }
  ];

  return (
    <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/80 via-white to-amber-50/80 border border-brand-200/80 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>{t('chat.juryDemoTitle')}</span>
        </span>
        <span className="text-[10px] text-brand-600 font-bold px-2 py-0.5 rounded-full bg-brand-100">
          {t('chat.fastDemoBadge')}
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        {personas.map((p) => (
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
