// src/pages/Leaderboard.tsx
// Partitioned leaderboard: Best (full), Partial (truncated), and Most Improved

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBoard } from '../services/genlayer';
import { GradeBadge } from '../components/GradeBadge';

export const Leaderboard: React.FC = () => {
  const [boardData, setBoardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'best' | 'partial' | 'most_improved'>('best');
  const [loading, setLoading] = useState(true);
  const [rpcError, setRpcError] = useState<string | null>(null);

  const fetchBoard = async () => {
    setLoading(true);
    setRpcError(null);
    try {
      const res = await getBoard(50);
      setBoardData(res);
    } catch (e: any) {
      console.error('Failed to fetch leaderboard:', e);
      setRpcError(e?.message || 'RPC communication error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const items = boardData?.[activeTab] || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Consensus Hygiene Leaderboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Rankings on GenLayer Studionet (Preview) based on deterministic rule deductions and validator agreement.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('best')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'best'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Clean Audits ({boardData?.best?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('partial')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'partial'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Partial / Truncated ({boardData?.partial?.length || 0})</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
            Cut at 120KB
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('most_improved')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'most_improved'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Most Improved ({boardData?.most_improved?.length || 0})
        </button>
      </div>

      {/* Partial Tab Explanatory Notice */}
      {activeTab === 'partial' && (
        <div className="rounded-xl border border-amber-800/80 bg-amber-950/40 p-4 text-xs text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Notice: Source Code Truncation Policy (ConsensusLint v1.0.1)</span>
          </div>
          <p className="leading-relaxed">
            Contracts exceeding the 120,000 byte limit are audited on their leading 120,000 bytes with <code className="font-mono bg-slate-900 px-1 py-0.5 rounded">truncated = true</code>.
            Under ConsensusLint v1.0.1 rules, the stored score is capped at <strong>89</strong> and the grade is capped at <strong>B</strong>.
            Truncated contracts are segregated to this dedicated table and are strictly ineligible for hygiene badges.
          </p>
        </div>
      )}

      {/* Table */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Hygiene leaderboard table"
        className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      >
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3">Rank</th>
              <th scope="col" className="px-4 py-3">Contract Label</th>
              <th scope="col" className="px-4 py-3">Target ID</th>
              <th scope="col" className="px-4 py-3">Hygiene Grade</th>
              <th scope="col" className="px-4 py-3">Score</th>
              {activeTab === 'partial' && <th scope="col" className="px-4 py-3">Truncation Badge</th>}
              <th scope="col" className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500 font-sans">
                  Loading leaderboard from GenLayer Studionet (Preview)...
                </td>
              </tr>
            ) : rpcError ? (
              <tr>
                <td colSpan={7} className="text-center py-8 font-sans">
                  <div className="text-rose-400 font-medium mb-2">
                    Failed to communicate with GenLayer Studionet (Preview) RPC endpoint.
                  </div>
                  <button
                    type="button"
                    onClick={fetchBoard}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500 font-sans">
                  No targets found in this partition.
                </td>
              </tr>
            ) : (
              items.map((entry: any, index: number) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 text-slate-400 font-bold">#{index + 1}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-slate-200">
                    {entry.label}
                  </td>
                  <td className="px-4 py-3 text-cyan-400">{entry.id}</td>
                  <td className="px-4 py-3">
                    <GradeBadge grade={entry.grade} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-100">
                    {entry.score}/100
                  </td>
                  {activeTab === 'partial' && (
                    <td className="px-4 py-3 font-sans">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-amber-950 border border-amber-800 text-amber-300 font-medium">
                        source cut at 120,000 bytes
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-right font-sans">
                    <Link
                      to={`/t/${entry.id}`}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium transition"
                    >
                      View Findings &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
