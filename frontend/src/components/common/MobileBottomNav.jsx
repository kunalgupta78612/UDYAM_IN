import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, MessageSquare, BookOpen, Calculator as CalcIcon, MapPin } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useChatContext();

  const navItems = [
    { to: '/', labelKey: 'nav.home', defaultLabel: 'Home', icon: Compass },
    { to: '/chat', labelKey: 'nav.advisor', defaultLabel: 'Advisor', icon: MessageSquare },
    { to: '/schemes', labelKey: 'nav.schemes', defaultLabel: 'Schemes', icon: BookOpen },
    { to: '/calculator', labelKey: 'nav.calculator', defaultLabel: 'Calculator', icon: CalcIcon },
    { to: '/partners', labelKey: 'nav.partners', defaultLabel: 'Partners', icon: MapPin }
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 py-1.5"
    >
      <div className="grid grid-cols-5 gap-0.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-brand-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`relative p-1 rounded-lg transition-transform ${
                  isActive
                    ? 'bg-brand-50 shadow-sm scale-110'
                    : 'hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-500'}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight text-center truncate max-w-[62px] ${
                isActive ? 'font-black text-brand-700' : 'font-medium'
              }`}>
                {t(item.labelKey, item.defaultLabel)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
