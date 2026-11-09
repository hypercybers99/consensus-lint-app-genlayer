// src/components/Navbar.tsx
// Header navigation with network indicator and throwaway wallet status

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { NETWORK_CONFIG } from '../config/contracts';
import { Z_INDEX } from '../styles/zIndex';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { address, balance } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/board', label: 'Leaderboard' },
    { to: '/register', label: 'Register Target' },
    { to: '/rules', label: 'Rules' },
    { to: '/badges', label: 'Badges' },
    { to: '/method', label: 'Methodology' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/wallet', label: 'Wallet' },
  ];

  return (
    <header
      className="sticky top-0 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md"
      style={{ zIndex: Z_INDEX.stickyHeader }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="ConsensusLint Logo" className="w-9 h-9 transition-transform group-hover:scale-105" />
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
                  ConsensusLint <span className="text-cyan-400 font-light">Desk</span>
                </span>
                <span className="block text-[10px] text-slate-400 -mt-1 font-mono">
                  v1.0.1
                </span>
              </div>
            </Link>

            {/* Network Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium ml-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {NETWORK_CONFIG.name}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Wallet Status Pill */}
          <div className="flex items-center gap-3">
            <Link
              to="/wallet"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-slate-600 transition text-xs font-mono text-slate-300"
              title="Manage in-app throwaway key"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400 hidden sm:inline">
                {balance !== null ? `${balance} GEN` : '0 GEN'}
              </span>
              <span className="text-slate-200">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No Key'}
              </span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-1">
            <div className="px-3 py-1 text-xs text-cyan-400 font-medium">
              Network: {NETWORK_CONFIG.name}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === link.to
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
