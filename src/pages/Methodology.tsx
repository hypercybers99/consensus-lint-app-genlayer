// src/pages/Methodology.tsx
// Detailed calibration, scoring mechanics, truncation policies, and honest scope boundaries

import React from 'react';

export const Methodology: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 text-slate-300 text-sm leading-relaxed">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          ConsensusLint Methodology & Calibration
        </h1>
        <p className="text-slate-400 mt-2">
          Technical specifications for deterministic consensus-hygiene evaluation on GenLayer Studionet (Preview).
        </p>
      </div>

      {/* Honest Scope Declaration */}
      <section className="rounded-xl border border-cyan-800/60 bg-cyan-950/30 p-5 space-y-3">
        <h2 className="text-base font-bold text-cyan-300">Important Statement of Scope</h2>
        <p>
          ConsensusLint is a <strong>validator-verified consensus-hygiene linter</strong>. It evaluates Python source code against 18 deterministic rules designed to flag non-determinism, validator recomputation hazards, unpaginated storage loops, and unhandled parser fallbacks.
        </p>
        <p>
          A high consensus score indicates adherence to GenLayer consensus hygiene patterns; it is <strong>not a security certificate</strong> and does not replace manual human code review.
        </p>
      </section>

      {/* Scoring Engine & Formula */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Scoring Engine & Formula</h2>
        <p>
          Every audited contract starts with a perfect baseline score of <strong className="text-white">100 points</strong>. Validators parse the source AST and execute heuristic checks. When a rule is triggered, points are deducted according to the rule weight up to the rule-specific penalty cap:
        </p>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 font-mono text-xs text-cyan-300">
          Final Score = max(0, 100 - sum(min(rule_weight * trigger_count, rule_cap)))
        </div>

        {/* Grade Bands Table */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Grade bands explanation table"
          className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 mt-4 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3">Score Range</th>
                <th scope="col" className="px-4 py-3">Grade</th>
                <th scope="col" className="px-4 py-3">Consensus Hygiene Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              <tr>
                <td className="px-4 py-3 text-emerald-400 font-bold">90 - 100</td>
                <td className="px-4 py-3 text-emerald-300 font-bold">A</td>
                <td className="px-4 py-3 font-sans text-slate-300">
                  Clean consensus hygiene. Follows all recommended GenLayer Intelligent Contract conventions.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-cyan-400 font-bold">80 - 89</td>
                <td className="px-4 py-3 text-cyan-300 font-bold">B</td>
                <td className="px-4 py-3 font-sans text-slate-300">
                  Acceptable hygiene with minor stylistic or boundary cautions (e.g. unbounded parameter length).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-amber-400 font-bold">70 - 79</td>
                <td className="px-4 py-3 text-amber-300 font-bold">C</td>
                <td className="px-4 py-3 font-sans text-slate-300">
                  Moderate consensus hygiene concerns. Contains patterns likely to cause disagreement under high load.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-orange-400 font-bold">60 - 69</td>
                <td className="px-4 py-3 text-orange-300 font-bold">D</td>
                <td className="px-4 py-3 font-sans text-slate-300">
                  Poor consensus hygiene. High likelihood of validator divergences or resource limit exhaustion.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-rose-400 font-bold">0 - 59</td>
                <td className="px-4 py-3 text-rose-300 font-bold">F</td>
                <td className="px-4 py-3 font-sans text-slate-300">
                  Critical non-determinism, wall-clock time calls, or validator recomputation bypasses detected.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Truncation Policy */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Source Truncation & Capping (v1.0.1)</h2>
        <p>
          GenLayer Studionet (Preview) validators operate within finite memory and execution windows. ConsensusLint enforces a strict maximum source size of <strong className="text-white">120,000 bytes</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Files larger than 120,000 bytes have their source sliced at the 120,000-byte mark prior to parsing.
          </li>
          <li>
            The audit is flagged with <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-amber-300">truncated = true</code>.
          </li>
          <li>
            In ConsensusLint v1.0.1, the stored score is <strong>capped at 89</strong>, and the grade is <strong>capped at B</strong>, even if zero findings were found in the analyzed portion.
          </li>
          <li>
            Truncated audits are partitioned from the clean leaderboard and are strictly ineligible for minting on-chain hygiene badges.
          </li>
        </ul>
      </section>

      {/* Consensus Verification */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">3. Validator Consensus Protocol</h2>
        <p>
          Unlike client-side linters, ConsensusLint audits execute directly on-chain within GenVM:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Leader Fetch & Analysis:</strong> The leader validator fetches the source code from GitHub, executes the linter engine, and proposes the findings and score.
          </li>
          <li>
            <strong>Validator Recomputation:</strong> Participating validators independently fetch the identical commit-pinned URL, re-run the linter engine, and compare results.
          </li>
          <li>
            <strong>Consensus Agreement:</strong> Transactions are accepted when a majority of validators agree (typically 3 of 5).
          </li>
        </ol>
      </section>
    </div>
  );
};
