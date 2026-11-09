// src/components/Footer.tsx
// Persistent footer with honest scope declaration and pinned deployment addresses

import React from 'react';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-16 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Honest Scope Declaration */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-slate-300 font-medium leading-relaxed">
            <strong className="text-cyan-400">Notice of Scope:</strong> ConsensusLint is a static-analysis consensus-hygiene linter for GenLayer Intelligent Contracts on <strong className="text-slate-200">GenLayer Studionet (Preview)</strong>. Scores and grades reflect deterministic rule evaluation and validator consensus; they are static-analysis signals, not security certificates or warranties of correctness.
          </p>
        </div>

        {/* Contract Deployments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40">
            <span className="text-slate-400 block font-semibold mb-1">ConsensusLint Ledger (v1.0.1):</span>
            <a
              href={`${NETWORK_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESSES.consensusLint}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline break-all"
            >
              {CONTRACT_ADDRESSES.consensusLint}
            </a>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40">
            <span className="text-slate-400 block font-semibold mb-1">HygieneBadges Contract (v1.0.1):</span>
            <a
              href={`${NETWORK_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESSES.hygieneBadges}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline break-all"
            >
              {CONTRACT_ADDRESSES.hygieneBadges}
            </a>
          </div>
        </div>

        {/* External Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800/80 gap-3">
          <div>
            ConsensusLint Desk &bull; Running on {NETWORK_CONFIG.name} (Chain ID {NETWORK_CONFIG.chainId})
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/hypercybers99/consensus-lint-genlayer"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition"
            >
              Contracts Repo
            </a>
            <a
              href="https://github.com/hypercybers99/consensus-lint-fixtures"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition"
            >
              Fixtures Repo
            </a>
            <a
              href={NETWORK_CONFIG.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition"
            >
              Studionet Explorer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
