// src/components/TransactionModal.tsx
// Real-time transaction state pipeline and validator consensus receipt viewer

import React from 'react';
import { Modal } from './Modal';
import { TxStatusState } from '../types';
import { NETWORK_CONFIG } from '../config/contracts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: TxStatusState;
  actionTitle: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  state,
  actionTitle,
}) => {
  const isPending = state.step === 'submitting' || state.step === 'waiting_consensus' || state.step === 'reading_back';
  const isDone = state.step === 'completed' || state.step === 'reverted' || state.step === 'failed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? () => {} : onClose}
      title={actionTitle}
      description="Transaction lifecycle on GenLayer Studionet (Preview)"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <div
            className={`p-2 rounded-lg border ${
              state.step === 'submitting'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                : state.step !== 'idle'
                ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400'
                : 'border-slate-800 bg-slate-900/50 text-slate-500'
            }`}
          >
            1. Submitting
          </div>
          <div
            className={`p-2 rounded-lg border ${
              state.step === 'waiting_consensus'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                : state.step === 'reading_back' || state.step === 'completed' || state.step === 'reverted'
                ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400'
                : 'border-slate-800 bg-slate-900/50 text-slate-500'
            }`}
          >
            2. Consensus
          </div>
          <div
            className={`p-2 rounded-lg border ${
              state.step === 'reading_back'
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                : state.step === 'completed'
                ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400'
                : state.step === 'reverted' || state.step === 'failed'
                ? 'border-rose-600 bg-rose-950/40 text-rose-400'
                : 'border-slate-800 bg-slate-900/50 text-slate-500'
            }`}
          >
            3. Verification
          </div>
        </div>

        {/* Status Message */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center gap-3">
            {isPending && (
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
            {state.step === 'completed' && (
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                OK
              </span>
            )}
            {(state.step === 'reverted' || state.step === 'failed') && (
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                X
              </span>
            )}
            <span className="font-semibold text-slate-200">
              {state.step === 'submitting' && 'Broadcasting transaction to Studionet RPC...'}
              {state.step === 'waiting_consensus' && 'Awaiting validator agreement & receipt...'}
              {state.step === 'reading_back' && 'Reading back state from contract...'}
              {state.step === 'completed' && 'Transaction accepted and state updated.'}
              {state.step === 'reverted' && 'Transaction reverted by validators.'}
              {state.step === 'failed' && 'Transaction failed.'}
            </span>
          </div>

          {state.txHash && (
            <div className="text-xs font-mono space-y-1 pt-2 border-t border-slate-800">
              <span className="text-slate-400">Transaction Hash (Full 66 chars):</span>
              <div className="break-all text-cyan-400 bg-slate-900 p-2 rounded border border-slate-800">
                {state.txHash}
              </div>
              <a
                href={`${NETWORK_CONFIG.explorerUrl}/tx/${state.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-cyan-400 hover:underline pt-1"
              >
                View on GenLayer Studionet Explorer &rarr;
              </a>
            </div>
          )}

          {state.rawStatus && (
            <div className="text-xs text-slate-300">
              <span className="text-slate-400">Raw receipt status: </span>
              <span className="font-mono">{state.rawStatus}</span>
            </div>
          )}

          {state.executionOutcome && (
            <div
              className={`text-xs p-3 rounded border font-medium ${
                state.step === 'completed'
                  ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300'
                  : 'border-rose-800 bg-rose-950/30 text-rose-300'
              }`}
            >
              <span className="block font-bold mb-1">Consensus Outcome:</span>
              {state.executionOutcome}
            </div>
          )}

          {state.errorTitle && (
            <div className="text-xs p-3 rounded border border-rose-800 bg-rose-950/30 text-rose-200 space-y-1">
              <div className="font-bold text-rose-300">{state.errorTitle}</div>
              <div className="text-slate-300">{state.errorDetails || state.errorMessage}</div>
            </div>
          )}

          {state.readbackSuccess !== null && (
            <div className="text-xs text-slate-400">
              State readback: {state.readbackSuccess ? 'Verified on-chain' : 'Readback pending or unchanged'}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${
              isPending
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isPending ? 'Processing...' : 'Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
