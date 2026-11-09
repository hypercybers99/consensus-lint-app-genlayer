// src/App.tsx
// Main application layout, routing, and context providers

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { Register } from './pages/Register';
import { TargetDetail } from './pages/TargetDetail';
import { Rules } from './pages/Rules';
import { Badges } from './pages/Badges';
import { Methodology } from './pages/Methodology';
import { Evidence } from './pages/Evidence';
import { Wallet } from './pages/Wallet';

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/board" element={<Leaderboard />} />
              <Route path="/register" element={<Register />} />
              <Route path="/t/:id" element={<TargetDetail />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/method" element={<Methodology />} />
              <Route path="/evidence" element={<Evidence />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route
                path="*"
                element={
                  <div className="text-center py-20 space-y-4">
                    <h1 className="text-3xl font-bold text-white">404 - Page Not Found</h1>
                    <p className="text-slate-400">The requested page does not exist on ConsensusLint Desk.</p>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
};

export default App;
