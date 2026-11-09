// src/pages/Evidence.tsx
// Verified on-chain evidence table with full 66-character hashes and validator agreement ratios

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VERIFIED_EVIDENCE_RECORDS, EvidenceRecord } from '../config/evidenceData';
import { NETWORK_CONFIG } from '../config/contracts';

export const Evidence: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['ALL', ...Array.from(new Set(VERIFIED_EVIDENCE_RECORDS.map((r) => r.category)))];

  const filtered = VERIFIED_EVIDENCE_RECORDS.filter((r) => {
    if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchLabel = r.label.toLowerCase().includes(q);
      const matchTid = r.targetId.toLowerCase().includes(q);
      const matchHash = r.txHash.toLowerCase().includes(q);
      if (!matchLabel && !matchTid && !matchHash) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Verified On-Chain Evidence
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical records of transactions executed on GenLayer Studionet (Preview) with validator consensus receipts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterCategory === c
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hash, label, or target ID..."
            className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Evidence Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Target Label</th>
              <th scope="col" className="px-4 py-3">Target ID</th>
              <th scope="col" className="px-4 py-3">Tx Hash (Full 66 Chars)</th>
              <th scope="col" className="px-4 py-3">Agreement</th>
              <th scope="col" className="px-4 py-3">Consensus Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {filtered.map((row: EvidenceRecord, i: number) => (
              <tr key={i} className="hover:bg-slate-800/30 transition">
                <td className="px-4 py-3 font-sans font-semibold text-slate-300 whitespace-nowrap">
                  {row.category}
                </td>
                <td className="px-4 py-3 font-sans text-slate-200">
                  {row.label}
                </td>
                <td className="px-4 py-3">
                  {row.targetId ? (
                    <Link to={`/t/${row.targetId}`} className="text-cyan-400 hover:underline">
                      {row.targetId}
                    </Link>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-3 font-mono">
                  <a
                    href={`${NETWORK_CONFIG.explorerUrl}/tx/${row.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline break-all block max-w-xs sm:max-w-md"
                    title="View receipt on GenLayer Studionet Explorer"
                  >
                    {row.txHash}
                  </a>
                </td>
                <td className="px-4 py-3 text-emerald-400 font-bold whitespace-nowrap">
                  {row.agreement} agreed
                </td>
                <td className="px-4 py-3 font-sans text-slate-300 text-[11px] whitespace-nowrap">
                  {row.outcome}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
