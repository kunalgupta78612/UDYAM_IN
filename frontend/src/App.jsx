import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/common/Header.jsx';
import { Home } from './pages/Home.jsx';
import { Chat } from './pages/Chat.jsx';
import { Results } from './pages/Results.jsx';
import { Schemes } from './pages/Schemes.jsx';
import { Calculator } from './pages/Calculator.jsx';
import { PartnerLocator } from './pages/PartnerLocator.jsx';
import { MobileBottomNav } from './components/common/MobileBottomNav.jsx';

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/results" element={<Results />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/partners" element={<PartnerLocator />} />
        </Routes>
      </main>
      <MobileBottomNav />
    </div>
  );
};
