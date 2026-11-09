// src/pages/Wallet.tsx
// In-app throwaway key manager, balance query, import/export, and live funding measurement notice

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { NETWORK_CONFIG } from '../config/contracts';

export const Wallet: React.FC = () => {
  const {
    account,
    address,
    privateKey,
    balance,
    loadingBalance,
    generateNewWallet,
    importKey,
    clearWallet,
    refreshBalance,
  } = useWallet();

  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    const success = importKey(importInput);
    if (!success) {
      setImportError('Invalid private key format. Must be a 64-character hex string (optional 0x prefix).');
    } else {
      setImportInput('');
    }
  };

  const handleCopyKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          In-App Throwaway Key Manager
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage local private keys for signing transactions on GenLayer Studionet (Preview).
        </p>
      </div>

      {/* Funding Measurement Notice (Requirement B3) */}
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-cyan-800/80 bg-cyan-950/40 p-5 space-y-2 text-xs text-cyan-200"
      >
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Live Funding Measurement (Recorded: 2026-11-09)</span>
        </div>
        <p className="leading-relaxed">
          On <strong className="text-white">GenLayer Studionet (Preview)</strong>, write transactions currently execute with <strong className="text-white">0 GEN</strong> account balance.
          ConsensusLint Desk provides this informational notice rather than blocking actions on account balances.
          Notice: Studionet Preview behavior may change as network fee policies evolve.
        </p>
      </div>

      {/* Active Account Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Connected Account
            </span>
            <div className="text-base font-bold font-mono text-white mt-1 break-all">
              {address || 'No Account Loaded'}
            </div>
            {address && (
              <a
                href={`${NETWORK_CONFIG.explorerUrl}/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:underline mt-1 inline-block"
              >
                View on GenLayer Studionet Explorer &rarr;
              </a>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-right sm:min-w-[160px]">
            <span className="text-[11px] text-slate-400 block font-semibold">Studionet Balance</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {loadingBalance ? '...' : `${balance || '0.0000'} GEN`}
            </div>
            <button
              type="button"
              onClick={refreshBalance}
              disabled={loadingBalance}
              className="text-[10px] text-cyan-400 hover:underline mt-1 inline-block"
            >
              {loadingBalance ? 'Checking...' : 'Refresh balance'}
            </button>
          </div>
        </div>

        {/* Private Key Reveal / Export */}
        {privateKey && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Private Key (Local Storage)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  {showKey ? 'Hide Key' : 'Reveal Key'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  {copied ? 'Copied!' : 'Copy Key'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 break-all select-all">
              {showKey ? privateKey : '****************************************************************'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={generateNewWallet}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
          >
            Generate Fresh Key
          </button>
          <button
            type="button"
            onClick={clearWallet}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Clear Stored Key
          </button>
        </div>
      </div>

      {/* Import Key Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Import Existing Private Key</h2>
        <p className="text-xs text-slate-400">
          Paste a 64-character hexadecimal private key to sign transactions from an existing account.
        </p>

        {importError && (
          <div className="p-3 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
            {importError}
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label htmlFor="import-key-input" className="block text-xs font-semibold text-slate-300 mb-1">
              Private Key Hex:
            </label>
            <input
              id="import-key-input"
              type="password"
              required
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="0x... or 64 hex characters"
              className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Import Key
          </button>
        </form>
      </div>
    </div>
  );
};
