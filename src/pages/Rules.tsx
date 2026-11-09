// src/pages/Rules.tsx
// Catalog of 18 consensus hygiene rules (CL01-CL18) and on-chain trigger statistics

import React, { useEffect, useState } from 'react';
import { getRules, getRuleStats } from '../services/genlayer';

export const Rules: React.FC = () => {
  const [rulesData, setRulesData] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [r, s] = await Promise.allSettled([getRules(), getRuleStats()]);
        if (mounted) {
          if (r.status === 'fulfilled') setRulesData(r.value);
          if (s.status === 'fulfilled') setStatsData(s.value);
        }
      } catch (e) {
        console.error('Failed to load rules:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const rawRules = rulesData?.rules || {};
  const ruleIds = Object.keys(rawRules).sort();

  const filteredRuleIds = ruleIds.filter((id) => {
    const rule = rawRules[id];
    if (severityFilter !== 'ALL' && rule.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = id.toLowerCase().includes(q);
      const matchName = rule.name?.toLowerCase().includes(q);
      const matchDesc = rule.desc?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Consensus Hygiene Rules (CL01 - CL18)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Catalog of deterministic rules evaluated by validators on GenLayer Studionet (Preview).
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                severityFilter === sev
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rule or keyword..."
            className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-sans">
          Loading rules catalogue from GenLayer Studionet (Preview)...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRuleIds.map((ruleId) => {
            const rule = rawRules[ruleId];
            const stat = statsData?.[ruleId];

            return (
              <div
                key={ruleId}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-400 font-mono font-bold text-xs">
                      {ruleId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : rule.severity === 'MAJOR'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : rule.severity === 'MINOR'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {rule.severity}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                      {rule.method}
                    </span>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400 text-[11px] block">Weight:</span>
                    <span className="text-slate-200 font-bold">-{rule.weight} (cap -{rule.cap})</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white">{rule.name}</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rule.desc}</p>
                </div>

                {stat && (
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>
                      Triggered in:{' '}
                      <strong className="text-cyan-400">{stat.targets_with_finding}</strong> /{' '}
                      {stat.targets_scored_total} scored targets
                    </div>
                    <div>
                      Share: <strong className="text-slate-200">{stat.share_pct}%</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
