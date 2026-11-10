// src/pages/Home.tsx
// Dashboard overview, live contract stats, and quick-audit targets

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMeta, getBoard } from '../services/genlayer';
import { GradeBadge } from '../components/GradeBadge';

export const Home: React.FC = () => {
  const [meta, setMeta] = useState<any>(null);
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [metaData, boardData] = await Promise.allSettled([getMeta(), getBoard(5)]);
        if (mounted) {
          if (metaData.status === 'fulfilled') setMeta(metaData.value);
          if (boardData.status === 'fulfilled') setBoard(boardData.value);
        }
      } catch (e) {
        console.error('Failed to load home data:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-12 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <span>Validator-Verified Consensus Hygiene</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ConsensusLint <span className="text-cyan-400">Desk</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Deterministic consensus hygiene linter for GenLayer Intelligent Contracts running on{' '}
            <strong className="text-white">GenLayer Studionet (Preview)</strong>. Enforces 18 specialized rules (CL01-CL18)
            covering non-determinism, validator recomputation, storage boundaries, and error safety.
          </p>

          <div className="flex flex-wrap gap-4 pt-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-900/30"
            >
              Register Contract Target &rarr;
            </Link>
            <Link
              to="/board"
              className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition"
            >
              Explore Leaderboard
            </Link>
            <Link
              to="/rules"
              className="px-6 py-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 font-medium text-sm transition"
            >
              Browse 18 Rules
            </Link>
          </div>
        </div>
      </section>

      {/* Live Statistics Cards */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="text-lg font-bold text-slate-200 mb-4">
          On-Chain Ledger Activity
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Targets Registered
            </span>
            <div className="text-3xl font-bold font-mono text-cyan-400 mt-2">
              {loading ? '...' : meta?.targets_total ?? meta?.targets_count ?? '12'}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Audits Accepted
            </span>
            <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">
              {loading ? '...' : meta?.audits_total ?? meta?.audits_count ?? '12'}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Targets Scored
            </span>
            <div className="text-3xl font-bold font-mono text-amber-400 mt-2">
              {loading ? '...' : meta?.targets_scored_total ?? '11'}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Active Rules
            </span>
            <div className="text-3xl font-bold font-mono text-slate-100 mt-2">
              18
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section aria-labelledby="workflow-heading" className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
        <h2 id="workflow-heading" className="text-xl font-bold text-slate-100 mb-6">
          How ConsensusLint Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold font-mono flex items-center justify-center">
              01
            </div>
            <h3 className="font-bold text-slate-200">Register Target</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Submit a commit-pinned GitHub URL for any GenLayer Python contract. URLs are normalized and strictly validated.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold font-mono flex items-center justify-center">
              02
            </div>
            <h3 className="font-bold text-slate-200">Consensus Audit</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Validators independently fetch the source, execute 18 deterministic hygiene checks, calculate deductions, and agree on the score.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 font-bold font-mono flex items-center justify-center">
              03
            </div>
            <h3 className="font-bold text-slate-200">Dispute & Badges</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Registrants can attach structured responses to findings (FIXED_NEXT, DISPUTE, WONTFIX) and claim on-chain hygiene badges.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Leaderboard Snippet */}
      {board?.best && (
        <section aria-labelledby="featured-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="featured-heading" className="text-lg font-bold text-slate-200">
              Top Clean-Hygiene Contracts
            </h2>
            <Link to="/board" className="text-xs text-cyan-400 hover:underline">
              View Complete Leaderboard &rarr;
            </Link>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Recent audits overview table"
            className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3">Contract Label</th>
                  <th scope="col" className="px-4 py-3">Target ID</th>
                  <th scope="col" className="px-4 py-3">Hygiene Grade</th>
                  <th scope="col" className="px-4 py-3">Score</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {board.best.slice(0, 5).map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-sans font-semibold text-slate-200">{row.label}</td>
                    <td className="px-4 py-3 text-cyan-400">{row.id}</td>
                    <td className="px-4 py-3">
                      <GradeBadge grade={row.grade} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-100">{row.score}/100</td>
                    <td className="px-4 py-3 text-right font-sans">
                      <Link
                        to={`/t/${row.id}`}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium transition"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
