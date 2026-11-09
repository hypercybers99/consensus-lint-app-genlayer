// src/pages/Badges.tsx
// HygieneBadges claiming, refreshing, on-chain minting history, and owner ledger configuration

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import {
  getBadgesMeta,
  listBadgeIds,
  getBadge,
  getBadgeOwner,
  writeClaimBadge,
  writeRefreshBadge,
  writeSetLedger,
  waitReceiptWithRetry,
} from '../services/genlayer';
import { GradeBadge } from '../components/GradeBadge';
import { TransactionModal } from '../components/TransactionModal';
import { TxStatusState } from '../types';
import { parseRevertMessage } from '../services/revertMap';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export const Badges: React.FC = () => {
  const { account, address } = useWallet();

  const [meta, setMeta] = useState<any>(null);
  const [badgeOwner, setBadgeOwner] = useState<string>('');
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Claim form state
  const [claimTargetId, setClaimTargetId] = useState('');
  const [claimDisplayName, setClaimDisplayName] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);

  // Refresh form state
  const [refreshBadgeId, setRefreshBadgeId] = useState('');
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Admin ledger set form state
  const [newLedgerAddress, setNewLedgerAddress] = useState<string>(CONTRACT_ADDRESSES.consensusLint);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalTitle, setTxModalTitle] = useState('Badge Transaction');
  const [txState, setTxState] = useState<TxStatusState>({
    step: 'idle',
    txHash: null,
    rawStatus: null,
    agreementRatio: null,
    executionOutcome: null,
    readbackSuccess: null,
    errorMessage: null,
  });

  const loadBadges = useCallback(async () => {
    setLoading(true);
    try {
      const [m, o, ids] = await Promise.all([
        getBadgesMeta(),
        getBadgeOwner(),
        listBadgeIds(0, 50),
      ]);
      setMeta(m);
      setBadgeOwner(o);

      if (ids && ids.length > 0) {
        const loaded = await Promise.all(ids.map((bid) => getBadge(bid)));
        setBadges(loaded);
      } else {
        setBadges([]);
      }
    } catch (e) {
      console.error('Failed to load badges:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError(null);
    if (!account) {
      setClaimError('No wallet account available.');
      return;
    }
    const cleanTid = claimTargetId.trim();
    const cleanName = claimDisplayName.trim();
    if (cleanTid.length !== 12) {
      setClaimError('Target ID must be exactly 12 characters.');
      return;
    }
    if (cleanName.length < 1 || cleanName.length > 64) {
      setClaimError('Display name must be between 1 and 64 characters.');
      return;
    }

    setTxModalTitle('Claim Hygiene Badge');
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
      const hash = await writeClaimBadge(cleanTid, cleanName, account);
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
          errorMessage: receipt.userError || 'Claim transaction reverted',
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

      await loadBadges();
      setClaimDisplayName('');

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
        errorMessage: err.message || 'Transaction submission failed',
      }));
    }
  };

  const handleRefresh = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshError(null);
    if (!account) {
      setRefreshError('No wallet account available.');
      return;
    }
    const cleanBid = refreshBadgeId.trim();
    if (cleanBid.length !== 12) {
      setRefreshError('Badge ID must be exactly 12 characters.');
      return;
    }

    setTxModalTitle('Refresh Hygiene Badge');
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
      const hash = await writeRefreshBadge(cleanBid, account);
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
          errorMessage: receipt.userError || 'Refresh transaction reverted',
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

      await loadBadges();

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
        errorMessage: err.message || 'Transaction submission failed',
      }));
    }
  };

  const handleSetLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    setLedgerError(null);
    if (!account) return;
    const cleanAddr = newLedgerAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddr)) {
      setLedgerError('Ledger address must be a valid 42-character hex address.');
      return;
    }

    setTxModalTitle('Set Ledger Contract Address');
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
      const hash = await writeSetLedger(cleanAddr, account);
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
          errorMessage: receipt.userError || 'Reverted',
        }));
        return;
      }

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
        errorMessage: err.message || 'Transaction failed',
      }));
    }
  };

  const isOwner = address && badgeOwner && address.toLowerCase() === badgeOwner.toLowerCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Hygiene Badges (v1.0.1)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          On-chain recognition contract tied to verified ConsensusLint audit scores on GenLayer Studionet (Preview).
        </p>
      </div>

      {/* Meta Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Badges Minted
          </span>
          <div className="text-3xl font-bold font-mono text-cyan-400 mt-2">
            {loading ? '...' : meta?.badges_total ?? badges.length}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 sm:col-span-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Connected Ledger Contract
          </span>
          <div className="text-xs font-mono text-slate-200 break-all mt-2">
            {loading ? '...' : meta?.ledger_address ?? CONTRACT_ADDRESSES.consensusLint}
          </div>
        </div>
      </div>

      {/* Action Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claim Badge Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <h2 className="text-base font-bold text-white">Claim Hygiene Badge</h2>
          <p className="text-xs text-slate-400">
            Mint an on-chain badge for a scored, non-truncated audit target. Truncated audits are ineligible.
          </p>

          {claimError && (
            <div className="p-3 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {claimError}
            </div>
          )}

          <form onSubmit={handleClaim} className="space-y-3 text-xs">
            <div>
              <label htmlFor="claim-target-id" className="block text-slate-300 font-semibold mb-1">
                Target ID (12 characters):
              </label>
              <input
                id="claim-target-id"
                type="text"
                required
                maxLength={12}
                value={claimTargetId}
                onChange={(e) => setClaimTargetId(e.target.value)}
                placeholder="e.g. 2bac0b36b071"
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="claim-display-name" className="block text-slate-300 font-semibold mb-1">
                Display Name (1 to 64 chars):
              </label>
              <input
                id="claim-display-name"
                type="text"
                required
                maxLength={64}
                value={claimDisplayName}
                onChange={(e) => setClaimDisplayName(e.target.value)}
                placeholder="e.g. GoodContract Clean Hygiene Badge"
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
            >
              Claim Badge On-Chain
            </button>
          </form>
        </div>

        {/* Refresh Badge Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <h2 className="text-base font-bold text-white">Refresh Badge Score</h2>
          <p className="text-xs text-slate-400">
            Synchronize an existing badge with the target&apos;s latest audit score from the ConsensusLint ledger.
          </p>

          {refreshError && (
            <div className="p-3 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
              {refreshError}
            </div>
          )}

          <form onSubmit={handleRefresh} className="space-y-3 text-xs">
            <div>
              <label htmlFor="refresh-badge-id" className="block text-slate-300 font-semibold mb-1">
                Badge ID (12 characters):
              </label>
              <input
                id="refresh-badge-id"
                type="text"
                required
                maxLength={12}
                value={refreshBadgeId}
                onChange={(e) => setRefreshBadgeId(e.target.value)}
                placeholder="e.g. 530360cf70b6"
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-7">
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold transition"
              >
                Refresh Badge State
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Minted Badges Registry */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Minted Hygiene Badges ({badges.length})</h2>

        {badges.length === 0 ? (
          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-slate-500 text-sm">
            No hygiene badges minted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 block">ID: {b.id}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{b.display_name}</h3>
                  </div>
                  <GradeBadge grade={b.current_grade} size="md" />
                </div>

                <div className="text-xs font-mono space-y-1 pt-2 border-t border-slate-800 text-slate-400">
                  <div>
                    Target:{' '}
                    <Link to={`/t/${b.target_id}`} className="text-cyan-400 hover:underline">
                      {b.target_id}
                    </Link>
                  </div>
                  <div>
                    Current Score:{' '}
                    <strong className="text-slate-200">{b.current_score}/100</strong>
                  </div>
                  <div className="truncate">Claimer: {b.claimer}</div>
                  <div>Claimed: {b.claimed_at}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Section (Restricted) */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-5 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Owner Contract Management
          </span>
          <span className="font-mono text-slate-500 text-[11px]">
            Owner: {badgeOwner || 'Loading...'}
          </span>
        </div>

        {!isOwner && (
          <p className="text-slate-400 leading-relaxed">
            Updating the ledger address requires the HygieneBadges contract owner key.
          </p>
        )}

        {ledgerError && (
          <div className="p-3 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-300">
            {ledgerError}
          </div>
        )}

        {isOwner && (
          <form onSubmit={handleSetLedger} className="space-y-3 pt-2">
            <div>
              <label htmlFor="admin-ledger-addr" className="block text-slate-300 font-semibold mb-1">
                New ConsensusLint Ledger Address:
              </label>
              <input
                id="admin-ledger-addr"
                type="text"
                required
                value={newLedgerAddress}
                onChange={(e) => setNewLedgerAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              Update Ledger Address
            </button>
          </form>
        )}
      </div>

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
