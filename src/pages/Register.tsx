// src/pages/Register.tsx
// Contract target registration form with strict client-side validation and quick presets

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { writeRegisterTarget, waitReceiptWithRetry, getTarget, listTargetIds } from '../services/genlayer';
import { TransactionModal } from '../components/TransactionModal';
import { TxStatusState } from '../types';
import { parseRevertMessage } from '../services/revertMap';
import { parseAndValidateSourceUrl } from '../services/urlPolicy';

const PRESETS = [
  {
    name: 'GoodContract Fixture',
    label: 'GoodContract Fixture',
    series: 'Unit Fixtures',
    url: 'https://raw.githubusercontent.com/hypercybers99/consensus-lint-fixtures/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/good_contract.py',
    description: 'Clean contract adhering to consensus hygiene standards (Score 100/A)',
  },
  {
    name: 'BadContract Fixture',
    label: 'BadContract Fixture',
    series: 'Unit Fixtures',
    url: 'https://raw.githubusercontent.com/hypercybers99/consensus-lint-fixtures/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/bad_contract.py',
    description: 'Contract with 11 intentional consensus hygiene violations',
  },
  {
    name: 'MixedContract Fixture',
    label: 'MixedContract Fixture',
    series: 'Unit Fixtures',
    url: 'https://raw.githubusercontent.com/hypercybers99/consensus-lint-fixtures/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/mixed_contract.py',
    description: 'Realistic contract with minor warnings',
  },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { account, address } = useWallet();

  const [label, setLabel] = useState('');
  const [series, setSeries] = useState('ConsensusLint Targets');
  const [sourceUrl, setSourceUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [newTargetId, setNewTargetId] = useState<string | null>(null);
  const [txState, setTxState] = useState<TxStatusState>({
    step: 'idle',
    txHash: null,
    rawStatus: null,
    agreementRatio: null,
    executionOutcome: null,
    readbackSuccess: null,
    errorMessage: null,
  });

  const validateForm = (): boolean => {
    setValidationError(null);
    const cleanLabel = label.trim();
    if (cleanLabel.length < 3 || cleanLabel.length > 64) {
      setValidationError('Label length must be between 3 and 64 characters.');
      return false;
    }

    const cleanSeries = series.trim();
    if (cleanSeries.length < 1 || cleanSeries.length > 48) {
      setValidationError('Series length must be between 1 and 48 characters.');
      return false;
    }

    try {
      parseAndValidateSourceUrl(sourceUrl);
    } catch (e: any) {
      const parsed = parseRevertMessage(e.message);
      setValidationError(parsed.explanation || e.message);
      return false;
    }

    return true;
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setLabel(preset.label);
    setSeries(preset.series);
    setSourceUrl(preset.url);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!account) {
      setValidationError('No wallet key available. Check the Wallet tab to generate or import a key.');
      return;
    }

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
      const hash = await writeRegisterTarget(label.trim(), series.trim(), sourceUrl.trim(), account);
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

      // Read back assigned target ID
      const ids = await listTargetIds(0, 1);
      const assignedId = ids[0];
      setNewTargetId(assignedId);

      const targetData = await getTarget(assignedId);

      setTxState((prev) => ({
        ...prev,
        step: 'completed',
        readbackSuccess: targetData && targetData.id === assignedId,
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Register Contract Target
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Add an Intelligent Contract source file to the ConsensusLint registry on GenLayer Studionet (Preview).
        </p>
      </div>

      {/* Quick Presets */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          One-Click Fixture Presets:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3 rounded-lg border border-slate-800 bg-slate-950/80 hover:border-cyan-700/60 hover:bg-slate-900 transition space-y-1"
            >
              <div className="text-xs font-bold text-cyan-400">{p.name}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
        {validationError && (
          <div className="p-4 rounded-lg border border-rose-800 bg-rose-950/40 text-rose-200 text-xs font-medium">
            {validationError}
          </div>
        )}

        {/* Label */}
        <div className="space-y-1">
          <label htmlFor="label-input" className="block text-sm font-semibold text-slate-200">
            Contract Label <span className="text-cyan-400">*</span>
          </label>
          <input
            id="label-input"
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. MyContract Core"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <p className="text-[11px] text-slate-500">3 to 64 characters describing the contract.</p>
        </div>

        {/* Series */}
        <div className="space-y-1">
          <label htmlFor="series-input" className="block text-sm font-semibold text-slate-200">
            Project Series <span className="text-cyan-400">*</span>
          </label>
          <input
            id="series-input"
            type="text"
            required
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            placeholder="e.g. Production Contracts"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <p className="text-[11px] text-slate-500">1 to 48 characters for grouping revisions.</p>
        </div>

        {/* Source URL */}
        <div className="space-y-1">
          <label htmlFor="url-input" className="block text-sm font-semibold text-slate-200">
            Source URL (GitHub Raw) <span className="text-cyan-400">*</span>
          </label>
          <input
            id="url-input"
            type="url"
            required
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://raw.githubusercontent.com/owner/repo/commit-or-branch/path/to/contract.py"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 text-sm font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <p className="text-[11px] text-slate-500">
            Must be HTTPS, hosted on raw.githubusercontent.com, and end in .py. Pinned commit SHAs strongly recommended.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-950/40"
          >
            Submit Target to Studionet
          </button>
        </div>
      </form>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => {
          setTxModalOpen(false);
          if (txState.step === 'completed' && newTargetId) {
            navigate(`/t/${newTargetId}`);
          }
        }}
        state={txState}
        actionTitle="Register Target Contract"
      />
    </div>
  );
};
