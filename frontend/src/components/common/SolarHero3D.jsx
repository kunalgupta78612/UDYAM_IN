import React, { useState, useRef } from 'react';
import { Sparkles, ShieldCheck, Zap, Globe, Award } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';

export const SolarHero3D = () => {
  const { t } = useChatContext();
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [flareActive, setFlareActive] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth angle bounds (-18 to +18 deg)
    const rotateY = (x / (rect.width / 2)) * 18;
    const rotateX = -(y / (rect.height / 2)) * 18;
    setCoords({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const triggerFlare = () => {
    setFlareActive(true);
    setTimeout(() => setFlareActive(false), 1200);
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto my-4 py-8 flex flex-col items-center justify-center perspective-1000 select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Transform Stage */}
      <div 
        ref={cardRef}
        onClick={triggerFlare}
        className="relative w-80 h-80 sm:w-96 sm:h-96 preserve-3d cursor-pointer transition-transform duration-200 ease-out"
        style={{
          transform: isHovered 
            ? `rotateX(${coords.x}deg) rotateY(${coords.y}deg) scale3d(1.05, 1.05, 1.05)` 
            : 'rotateX(5deg) rotateY(0deg) scale3d(1, 1, 1)'
        }}
      >
        {/* Layer -2: Deep Ambient Glow */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/30 to-yellow-400/20 blur-3xl -z-20 transition-all duration-500"
          style={{
            transform: 'translateZ(-60px)',
            opacity: flareActive ? 1 : 0.75
          }}
        />

        {/* Layer -1: 3D Rotating Solar Flare Rings */}
        <div 
          className="absolute -inset-8 rounded-full border border-dashed border-amber-400/30 animate-spin-slow pointer-events-none"
          style={{ transform: 'translateZ(-30px)' }}
        />
        <div 
          className="absolute -inset-14 rounded-full border border-dotted border-orange-400/25 animate-spin-slow-reverse pointer-events-none"
          style={{ transform: 'translateZ(-45px)' }}
        />

        {/* Layer 0: Main Surya Solar Core */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Radiant Solar Aura Pulse */}
          <div 
            className={`absolute inset-4 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-500/20 to-yellow-500/30 blur-xl transition-all duration-700 ${
              flareActive ? 'scale-125 opacity-100' : 'animate-pulse opacity-60'
            }`}
          />

          {/* Central Surya Emblem with 3D Depth */}
          <img 
            src="/logo-gold.png" 
            alt="Udyam Setu Surya Emblem" 
            className={`w-72 h-72 sm:w-84 sm:h-84 object-contain filter drop-shadow-[0_15px_30px_rgba(234,88,12,0.4)] transition-all duration-500 ${
              flareActive ? 'scale-110 drop-shadow-[0_20px_50px_rgba(245,158,11,0.85)]' : 'hover:scale-105'
            }`}
            style={{
              transform: 'translateZ(40px)',
              filter: isHovered 
                ? 'drop-shadow(0 20px 40px rgba(245, 158, 11, 0.65)) brightness(1.08)' 
                : 'drop-shadow(0 15px 30px rgba(234, 88, 12, 0.45))'
            }}
          />

          {/* Click Flare Radial Wave */}
          {flareActive && (
            <div 
              className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping pointer-events-none"
              style={{ transform: 'translateZ(50px)' }}
            />
          )}
        </div>

        {/* Layer 1: Relatable 3D Orbital Pillars (Enterprise Superpowers) */}
        
        {/* Orbital 1: Deterministic Engine */}
        <div 
          className="absolute top-0 -left-6 sm:-left-12 px-3.5 py-2 rounded-2xl glass-panel bg-white/90 border border-amber-200/80 shadow-xl flex items-center space-x-2 transition-all duration-300 pointer-events-auto"
          style={{
            transform: `translateZ(60px) translateY(${isHovered ? coords.x * 0.8 : 0}px)`,
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-black text-slate-800 tracking-tight">100% Deterministic</span>
            <span className="block text-[9px] font-semibold text-amber-600">Zero Hallucination</span>
          </div>
        </div>

        {/* Orbital 2: Scheme Convergence (PMEGP + MUDRA) */}
        <div 
          className="absolute top-2 -right-6 sm:-right-12 px-3.5 py-2 rounded-2xl glass-panel bg-white/90 border border-emerald-200/80 shadow-xl flex items-center space-x-2 transition-all duration-300 pointer-events-auto"
          style={{
            transform: `translateZ(75px) translateY(${isHovered ? -coords.x * 0.8 : 0}px)`,
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-black text-slate-800 tracking-tight">Scheme Convergence</span>
            <span className="block text-[9px] font-semibold text-emerald-600">PMEGP + MUDRA</span>
          </div>
        </div>

        {/* Orbital 3: Multilingual Voice NLU */}
        <div 
          className="absolute bottom-4 -left-4 sm:-left-10 px-3.5 py-2 rounded-2xl glass-panel bg-white/90 border border-indigo-200/80 shadow-xl flex items-center space-x-2 transition-all duration-300 pointer-events-auto"
          style={{
            transform: `translateZ(65px) translateX(${isHovered ? coords.y * 0.8 : 0}px)`,
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
            <Globe className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-black text-slate-800 tracking-tight">10+ Indian Languages</span>
            <span className="block text-[9px] font-semibold text-indigo-600">Voice & Speech NLU</span>
          </div>
        </div>

        {/* Orbital 4: Direct Subsidies */}
        <div 
          className="absolute bottom-2 -right-4 sm:-right-8 px-3.5 py-2 rounded-2xl glass-panel bg-white/90 border border-amber-300/80 shadow-xl flex items-center space-x-2 transition-all duration-300 pointer-events-auto"
          style={{
            transform: `translateZ(70px) translateX(${isHovered ? -coords.y * 0.8 : 0}px)`,
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-500 text-white flex items-center justify-center shadow-sm">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-black text-slate-800 tracking-tight">Up to 35% Subsidy</span>
            <span className="block text-[9px] font-semibold text-amber-700">Govt. Certified MSME</span>
          </div>
        </div>
      </div>

      {/* Interactive Micro-hint */}
      <div className="mt-4 flex items-center space-x-2 text-[11px] font-semibold text-slate-500 bg-amber-50/80 px-3.5 py-1.5 rounded-full border border-amber-200/60 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
        <span>Click Surya to converge schemes • Move mouse for 3D perspective</span>
      </div>
    </div>
  );
};
