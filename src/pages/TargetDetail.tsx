// src/pages/TargetDetail.tsx
// Target inspection, consensus audit trigger, per-rule findings, code snippets, and maintainer responses

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import {
  getTarget,
  getAudit,
  writeAuditTarget,
  writeRespondToFinding,
  waitReceiptWithRetry,
} from '../services/genlayer';
import { GradeBadge } from '../components/GradeBadge';
import { CooldownTimer } from '../components/CooldownTimer';
import { TransactionModal } from '../components/TransactionModal';
import { TxStatusState } from '../types';
import { parseRevertMessage } from '../services/revertMap';
import { NETWORK_CONFIG, CONTRACT_CONSTANTS } from '../config/contracts';

export const TargetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { account, address } = useWallet();

  const [target, setTarget] = useState<any>(null);
  const [selectedAuditN, setSelectedAuditN] = useState<number>(1);
  const [currentAudit, setCurrentAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Maintainer response form state
  const [responseRuleId, setResponseRuleId] = useState('');
  const [responseStance, setResponseStance] = useState<'FIXED_NEXT' | 'DISPUTE' | 'WONTFIX'>('FIXED_NEXT');
  const [responseNote, setResponseNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalTitle, setTxModalTitle] = useState('Consensus Transaction');
  const [txState, setTxState] = useState<TxStatusState>({
    step: 'idle',
    txHash: null,
    rawStatus: null,
    agreementRatio: null,
    executionOutcome: null,
    readbackSuccess: null,
    errorMessage: null,
  });

  const loadTargetAndAudit = useCallback(async (auditNToLoad?: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await getTarget(id);
      setTarget(t);
      const targetN = auditNToLoad || t?.latest_n || 1;
      setSelectedAuditN(targetN);
      if (t && t.audits_total > 0) {
        const a = await getAudit(id, targetN);
        setCurrentAudit(a);
      }
    } catch (e) {
      console.error('Failed to load target detail:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTargetAndAudit();
  }, [loadTargetAndAudit]);

  const handleSelectAudit = async (n: number) => {
    setSelectedAuditN(n);
    if (!id) return;
    try {
      const a = await getAudit(id, n);
      setCurrentAudit(a);
    } catch (e) {
      console.error('Failed to load audit #', n, e);
    }
  };

  const handleTriggerAudit = async () => {
    if (!id || !account) return;
    setTxModalTitle('Trigger Consensus Audit');
    setTxModalOpen(true);
    setTxState({
      step: 'submitting',
      txHash: null,
      rawStatus: null,
      agreementRatio: null,
      executionOutcome: null,
      readbackSuccess: null,
      errorMessage: null,
    });

    try {
      const hash = await writeAuditTarget(id, account);
      setTxState((prev) => ({
        ...prev,
        step: 'waiting_consensus',
        txHash: hash,
      }));

      const receipt = await waitReceiptWithRetry(hash);

      if (receipt.isRevert) {
        const parsed = parseRevertMessage(receipt.userError);
        setTxState((prev) => ({
          ...prev,
          step: 'reverted',
          rawStatus: receipt.status,
          agreementRatio: receipt.agreement.str,
          executionOutcome: receipt.outcomeLabel,
          errorTitle: parsed.title,
          errorDetails: parsed.explanation,
          errorMessage: receipt.userError || 'Transaction reverted',
        }));
        return;
      }

      setTxState((prev) => ({
        ...prev,
        step: 'reading_back',
        rawStatus: receipt.status,
        agreementRatio: receipt.agreement.str,
        executionOutcome: receipt.outcomeLabel,
      }));

      await loadTargetAndAudit();

      setTxState((prev) => ({
        ...prev,
        step: 'completed',
        readbackSuccess: true,
      }));
    } catch (err: any) {
      const parsed = parseRevertMessage(err);
      setTxState((prev) => ({
        ...prev,
        step: 'failed',
        errorTitle: parsed.title,
        errorDetails: parsed.explanation,
        errorMessage: err.message || 'Audit transaction failed',
      }));
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!id || !account) {
      setFormError('Account required.');
      return;
    }
    if (!responseRuleId) {
      setFormError('Please select a rule from the audit findings.');
      return;
    }
    const cleanNote = responseNote.trim();
    if (cleanNote.length < CONTRACT_CONSTANTS.NOTE_MIN || cleanNote.length > CONTRACT_CONSTANTS.NOTE_MAX) {
      setFormError(`Note must be between ${CONTRACT_CONSTANTS.NOTE_MIN} and ${CONTRACT_CONSTANTS.NOTE_MAX} characters.`);
      return;
    }

    setTxModalTitle('Submit Maintainer Response');
    setTxModalOpen(true);
    setTxState({
      step: 'submitting',
      txHash: null,
      rawStatus: null,
      agreementRatio: null,
      executionOutcome: null,
      readbackSuccess: null,
      errorMessage: null,
    });

    try {
      const hash = await writeRespondToFinding(
        id,
        selectedAuditN,
        responseRuleId,
        responseStance,
        cleanNote,
        account
      );
      setTxState((prev) => ({
        ...prev,
        step: 'waiting_consensus',
        txHash: hash,
      }));

      const receipt = await waitReceiptWithRetry(hash);

      if (receipt.isRevert) {
        const parsed = parseRevertMessage(receipt.userError);
        setTxState((prev) => ({
          ...prev,
          step: 'reverted',
          rawStatus: receipt.status,
          agreementRatio: receipt.agreement.str,
          executionOutcome: receipt.outcomeLabel,
          errorTitle: parsed.title,
          errorDetails: parsed.explanation,
          errorMessage: receipt.userError || 'Transaction reverted',
        }));
        return;
      }

      setTxState((prev) => ({
        ...prev,
        step: 'reading_back',
        rawStatus: receipt.status,
        agreementRatio: receipt.agreement.str,
        executionOutcome: receipt.outcomeLabel,
      }));

      await loadTargetAndAudit(selectedAuditN);
      setResponseNote('');

      setTxState((prev) => ({
        ...prev,
        step: 'completed',
        readbackSuccess: true,
      }));
    } catch (err: any) {
      const parsed = parseRevertMessage(err);
      setTxState((prev) => ({
        ...prev,
        step: 'failed',
        errorTitle: parsed.title,
        errorDetails: parsed.explanation,
        errorMessage: err.message || 'Response transaction failed',
      }));
    }
  };

  if (loading && !target) {
    return (
      <div className="text-center py-20 text-slate-400 font-sans">
        Loading target details from GenLayer Studionet (Preview)...
      </div>
    );
  }

  if (!target) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <h1 className="text-2xl font-bold text-slate-100">Target Not Found</h1>
        <p className="text-sm text-slate-400">Target ID &quot;{id}&quot; does not exist on the ConsensusLint registry.</p>
        <Link to="/board" className="inline-block px-4 py-2 bg-slate-800 rounded text-cyan-400 text-sm">
          Return to Leaderboard
        </Link>
      </div>
    );
  }

  const isRegistrant = address && target.registrant && address.toLowerCase() === target.registrant.toLowerCase();
  const findingKeys = currentAudit?.findings ? Object.keys(currentAudit.findings) : [];

  return (
    <div className="space-y-8">
      {/* Target Header Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{target.label}</h1>
              {target.latest_grade && <GradeBadge grade={target.latest_grade} size="md" />}
            </div>
            <div className="text-xs font-mono text-cyan-400 mt-1">
              Target ID: <span className="text-slate-200">{target.id}</span> &bull; Series:{' '}
              <span className="text-slate-300">{target.series}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CooldownTimer lastAuditTs={target.last_audit_ts || null} />
            <button
              type="button"
              onClick={handleTriggerAudit}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
            >
              Trigger Audit
            </button>
          </div>
        </div>

        {/* Target Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-400 block font-sans">Source URL:</span>
            <a
              href={target.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline break-all block"
            >
              {target.source_url}
            </a>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block font-sans">Registrant Account:</span>
            <a
              href={`${NETWORK_CONFIG.explorerUrl}/address/${target.registrant}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline break-all block"
            >
              {target.registrant}
            </a>
          </div>

          <div className="text-slate-300 font-sans">
            <span className="text-slate-400 font-sans">Registered At: </span>
            {target.registered_at}
          </div>

          <div className="text-slate-300 font-sans">
            <span className="text-slate-400 font-sans">Total Audits Recorded: </span>
            {target.audits_total} / {CONTRACT_CONSTANTS.MAX_AUDITS_PER_TARGET}
          </div>
        </div>
      </div>

      {/* Audits Tab Bar */}
      {target.audits_total > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 font-sans">
            Audit Runs:
          </span>
          {Array.from({ length: target.audits_total }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleSelectAudit(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                selectedAuditN === n
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Audit #{n}
            </button>
          ))}
        </div>
      )}

      {/* Current Audit Details */}
      {currentAudit && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Audit #{currentAudit.n} Results</span>
                {currentAudit.truncated && (
                  <span className="px-2 py-0.5 rounded text-[11px] bg-amber-950 border border-amber-800 text-amber-300 font-medium font-sans">
                    source cut at 120,000 bytes
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Audited at: {currentAudit.at} &bull; Auditor: {currentAudit.auditor.slice(0, 10)}...
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Consensus Score</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">
                  {currentAudit.score}/100
                </span>
              </div>
              <GradeBadge grade={currentAudit.grade} size="lg" />
            </div>
          </div>

          {/* Audit Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 block font-sans">Source Size</span>
              <span className="text-slate-200 font-bold">{currentAudit.source_bytes} bytes</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 sm:col-span-2">
              <span className="text-slate-400 block font-sans">Source SHA-256</span>
              <span className="text-cyan-400 break-all">{currentAudit.source_sha256}</span>
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-sans">
              Rule Findings ({findingKeys.length})
            </h3>

            {findingKeys.length === 0 ? (
              <div className="p-6 rounded-lg border border-emerald-800/40 bg-emerald-950/20 text-emerald-300 text-xs">
                No hygiene violations detected. Perfect 100/A consensus evaluation.
              </div>
            ) : (
              <div className="space-y-4">
                {findingKeys.map((ruleId) => {
                  const finding = currentAudit.findings[ruleId];
                  const responsesForRule = (currentAudit.responses || []).filter(
                    (r: any) => r.rule_id === ruleId
                  );

                  return (
                    <div
                      key={ruleId}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-800 text-cyan-300">
                            {ruleId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              finding.severity === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : finding.severity === 'MAJOR'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {finding.severity}
                          </span>
                          <span className="text-xs text-slate-400 font-sans">
                            Method: {finding.method}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          {finding.count} occurrence(s)
                        </span>
                      </div>

                      {/* Snippets */}
                      {finding.items && finding.items.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {finding.items.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 rounded border border-slate-850 bg-slate-900 font-mono text-xs text-slate-300 space-y-1"
                            >
                              <div className="text-[11px] text-cyan-400">Line {item.line}:</div>
                              <pre className="overflow-x-auto text-[11px] text-slate-200">
                                <code>{item.snippet}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Attached Responses */}
                      {responsesForRule.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                            Maintainer Responses:
                          </span>
                          {responsesForRule.map((resp: any, rIdx: number) => (
                            <div
                              key={rIdx}
                              className="p-3 rounded border border-slate-800 bg-slate-900/50 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    resp.stance === 'FIXED_NEXT'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : resp.stance === 'DISPUTE'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {resp.stance}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {resp.responded_at || 'Recorded on-chain'}
                                </span>
                              </div>
                              <p className="text-slate-300 font-sans italic">&quot;{resp.note}&quot;</p>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Responder: {resp.responder}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Maintainer Response Form */}
          {findingKeys.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">
                  Attach Maintainer Response
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Registrants may attach structured responses (FIXED_NEXT, DISPUTE, or WONTFIX) with on-chain notes.
                </p>
              </div>

              {!isRegistrant && (
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 text-xs text-slate-400 font-sans">
                  Note: The ConsensusLint contract enforces that only the registrant account (
                  <code className="text-cyan-400">{target.registrant.slice(0, 10)}...</code>) can attach responses.
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 text-xs font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitResponse} className="space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rule-select" className="block text-slate-300 font-semibold mb-1">
                      Rule to Address:
                    </label>
                    <select
                      id="rule-select"
                      required
                      value={responseRuleId}
                      onChange={(e) => setResponseRuleId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Select Rule --</option>
                      {findingKeys.map((r) => (
                        <option key={r} value={r}>
                          {r} ({currentAudit.findings[r].severity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="stance-select" className="block text-slate-300 font-semibold mb-1">
                      Stance:
                    </label>
                    <select
                      id="stance-select"
                      value={responseStance}
                      onChange={(e) =>
                        setResponseStance(e.target.value as 'FIXED_NEXT' | 'DISPUTE' | 'WONTFIX')
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="FIXED_NEXT">FIXED_NEXT (Acknowledged, will fix)</option>
                      <option value="DISPUTE">DISPUTE (Disputing validator rule finding)</option>
                      <option value="WONTFIX">WONTFIX (Intentional design decision)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="note-input" className="block text-slate-300 font-semibold mb-1">
                    Response Note ({responseNote.length}/{CONTRACT_CONSTANTS.NOTE_MAX} chars):
                  </label>
                  <textarea
                    id="note-input"
                    required
                    rows={2}
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Provide detailed justification or fix plan (5 to 280 characters)..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
                >
                  Submit Response to Studionet
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        state={txState}
        actionTitle={txModalTitle}
      />
    </div>
  );
};
