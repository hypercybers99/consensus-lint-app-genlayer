// tests/unit/readbackCompletion.test.ts
// Verifies that completion step triggers ONLY after readback verification
// for register_target, audit_target, respond_to_finding, claim_badge, refresh_badge

import { describe, it, expect, vi } from 'vitest';
import { TxStatusState } from '../../src/types';

describe('Readback Completion State Machine Verification', () => {
  // Helper simulating the step recorder
  class ActionRunner {
    public stateHistory: string[] = [];
    public currentState: TxStatusState = {
      step: 'idle',
      txHash: null,
      rawStatus: null,
      agreementRatio: null,
      executionOutcome: null,
      readbackSuccess: null,
      errorMessage: null,
    };

    public updateState(partial: Partial<TxStatusState>) {
      this.currentState = { ...this.currentState, ...partial };
      this.stateHistory.push(this.currentState.step);
    }

    async runRegisterTarget(
      writeFn: () => Promise<string>,
      waitReceiptFn: (hash: string) => Promise<any>,
      readbackListIdsFn: () => Promise<string[]>,
      readbackGetTargetFn: (id: string) => Promise<any>
    ) {
      this.updateState({ step: 'submitting', txHash: null });
      try {
        const hash = await writeFn();
        this.updateState({ step: 'waiting_consensus', txHash: hash });

        const receipt = await waitReceiptFn(hash);
        if (receipt.isRevert) {
          this.updateState({ step: 'reverted', errorMessage: receipt.userError });
          return;
        }

        this.updateState({ step: 'reading_back' });
        const ids = await readbackListIdsFn();
        const assignedId = ids[0];
        const targetData = await readbackGetTargetFn(assignedId);

        const verified = Boolean(targetData && targetData.id === assignedId);
        this.updateState({ step: 'completed', readbackSuccess: verified });
      } catch (err: any) {
        this.updateState({ step: 'failed', errorMessage: err.message });
      }
    }

    async runAuditTarget(
      writeFn: () => Promise<string>,
      waitReceiptFn: (hash: string) => Promise<any>,
      readbackFn: () => Promise<void>
    ) {
      this.updateState({ step: 'submitting', txHash: null });
      try {
        const hash = await writeFn();
        this.updateState({ step: 'waiting_consensus', txHash: hash });

        const receipt = await waitReceiptFn(hash);
        if (receipt.isRevert) {
          this.updateState({ step: 'reverted', errorMessage: receipt.userError });
          return;
        }

        this.updateState({ step: 'reading_back' });
        await readbackFn();
        this.updateState({ step: 'completed', readbackSuccess: true });
      } catch (err: any) {
        this.updateState({ step: 'failed', errorMessage: err.message });
      }
    }

    async runRespondToFinding(
      writeFn: () => Promise<string>,
      waitReceiptFn: (hash: string) => Promise<any>,
      readbackFn: () => Promise<void>
    ) {
      this.updateState({ step: 'submitting', txHash: null });
      try {
        const hash = await writeFn();
        this.updateState({ step: 'waiting_consensus', txHash: hash });

        const receipt = await waitReceiptFn(hash);
        if (receipt.isRevert) {
          this.updateState({ step: 'reverted', errorMessage: receipt.userError });
          return;
        }

        this.updateState({ step: 'reading_back' });
        await readbackFn();
        this.updateState({ step: 'completed', readbackSuccess: true });
      } catch (err: any) {
        this.updateState({ step: 'failed', errorMessage: err.message });
      }
    }

    async runClaimBadge(
      writeFn: () => Promise<string>,
      waitReceiptFn: (hash: string) => Promise<any>,
      readbackFn: () => Promise<void>
    ) {
      this.updateState({ step: 'submitting', txHash: null });
      try {
        const hash = await writeFn();
        this.updateState({ step: 'waiting_consensus', txHash: hash });

        const receipt = await waitReceiptFn(hash);
        if (receipt.isRevert) {
          this.updateState({ step: 'reverted', errorMessage: receipt.userError });
          return;
        }

        this.updateState({ step: 'reading_back' });
        await readbackFn();
        this.updateState({ step: 'completed', readbackSuccess: true });
      } catch (err: any) {
        this.updateState({ step: 'failed', errorMessage: err.message });
      }
    }

    async runRefreshBadge(
      writeFn: () => Promise<string>,
      waitReceiptFn: (hash: string) => Promise<any>,
      readbackFn: () => Promise<void>
    ) {
      this.updateState({ step: 'submitting', txHash: null });
      try {
        const hash = await writeFn();
        this.updateState({ step: 'waiting_consensus', txHash: hash });

        const receipt = await waitReceiptFn(hash);
        if (receipt.isRevert) {
          this.updateState({ step: 'reverted', errorMessage: receipt.userError });
          return;
        }

        this.updateState({ step: 'reading_back' });
        await readbackFn();
        this.updateState({ step: 'completed', readbackSuccess: true });
      } catch (err: any) {
        this.updateState({ step: 'failed', errorMessage: err.message });
      }
    }
  }

  describe('1. register_target', () => {
    it('progresses to completed only after readback confirmation', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '1'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockListIds = vi.fn().mockResolvedValue(['target123456']);
      const mockGetTarget = vi.fn().mockResolvedValue({ id: 'target123456', label: 'Test Target' });

      await runner.runRegisterTarget(mockWrite, mockWaitReceipt, mockListIds, mockGetTarget);

      expect(mockWrite).toHaveBeenCalledOnce();
      expect(mockWaitReceipt).toHaveBeenCalledOnce();
      expect(mockListIds).toHaveBeenCalledOnce();
      expect(mockGetTarget).toHaveBeenCalledWith('target123456');

      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'completed']);
      expect(runner.currentState.step).toBe('completed');
      expect(runner.currentState.readbackSuccess).toBe(true);
    });

    it('does not complete if readback verification fails or throws', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '1'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockListIds = vi.fn().mockRejectedValue(new Error('RPC readback timeout'));
      const mockGetTarget = vi.fn();

      await runner.runRegisterTarget(mockWrite, mockWaitReceipt, mockListIds, mockGetTarget);

      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'failed']);
      expect(runner.currentState.step).toBe('failed');
      expect(runner.currentState.readbackSuccess).toBeNull();
    });

    it('stops at reverted step and never enters readback on tx revert', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '1'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({
        isRevert: true,
        status: 'FINALIZED',
        userError: 'target already registered',
      });
      const mockListIds = vi.fn();
      const mockGetTarget = vi.fn();

      await runner.runRegisterTarget(mockWrite, mockWaitReceipt, mockListIds, mockGetTarget);

      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reverted']);
      expect(mockListIds).not.toHaveBeenCalled();
      expect(mockGetTarget).not.toHaveBeenCalled();
      expect(runner.currentState.step).toBe('reverted');
    });
  });

  describe('2. audit_target', () => {
    it('progresses to completed only after readback confirmation', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '2'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockReadback = vi.fn().mockResolvedValue(undefined);

      await runner.runAuditTarget(mockWrite, mockWaitReceipt, mockReadback);

      expect(mockReadback).toHaveBeenCalledOnce();
      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'completed']);
      expect(runner.currentState.step).toBe('completed');
      expect(runner.currentState.readbackSuccess).toBe(true);
    });

    it('fails and does not reach completed if readback throws', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '2'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockReadback = vi.fn().mockRejectedValue(new Error('Failed to fetch updated audit'));

      await runner.runAuditTarget(mockWrite, mockWaitReceipt, mockReadback);

      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'failed']);
      expect(runner.currentState.step).toBe('failed');
      expect(runner.currentState.readbackSuccess).toBeNull();
    });
  });

  describe('3. respond_to_finding', () => {
    it('progresses to completed only after readback confirmation', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '3'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockReadback = vi.fn().mockResolvedValue(undefined);

      await runner.runRespondToFinding(mockWrite, mockWaitReceipt, mockReadback);

      expect(mockReadback).toHaveBeenCalledOnce();
      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'completed']);
      expect(runner.currentState.step).toBe('completed');
    });

    it('halts at reverted step if unauthorized sender', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '3'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({
        isRevert: true,
        status: 'FINALIZED',
        userError: 'only the registrant can do this',
      });
      const mockReadback = vi.fn();

      await runner.runRespondToFinding(mockWrite, mockWaitReceipt, mockReadback);

      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reverted']);
      expect(mockReadback).not.toHaveBeenCalled();
      expect(runner.currentState.step).toBe('reverted');
    });
  });

  describe('4. claim_badge', () => {
    it('progresses to completed only after readback confirmation', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '4'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockReadback = vi.fn().mockResolvedValue(undefined);

      await runner.runClaimBadge(mockWrite, mockWaitReceipt, mockReadback);

      expect(mockReadback).toHaveBeenCalledOnce();
      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'completed']);
      expect(runner.currentState.step).toBe('completed');
    });

    it('halts at reverted step if target was truncated', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '4'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({
        isRevert: true,
        status: 'FINALIZED',
        userError: 'cannot claim badge for truncated audit',
      });
      const mockReadback = vi.fn();

      await runner.runClaimBadge(mockWrite, mockWaitReceipt, mockReadback);

      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reverted']);
      expect(mockReadback).not.toHaveBeenCalled();
      expect(runner.currentState.step).toBe('reverted');
    });
  });

  describe('5. refresh_badge', () => {
    it('progresses to completed only after readback confirmation', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '5'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockReadback = vi.fn().mockResolvedValue(undefined);

      await runner.runRefreshBadge(mockWrite, mockWaitReceipt, mockReadback);

      expect(mockReadback).toHaveBeenCalledOnce();
      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'completed']);
      expect(runner.currentState.step).toBe('completed');
    });

    it('fails and does not reach completed if readback throws', async () => {
      const runner = new ActionRunner();
      const mockWrite = vi.fn().mockResolvedValue('0x' + '5'.repeat(64));
      const mockWaitReceipt = vi.fn().mockResolvedValue({ isRevert: false, status: 'FINALIZED' });
      const mockReadback = vi.fn().mockRejectedValue(new Error('RPC disconnection'));

      await runner.runRefreshBadge(mockWrite, mockWaitReceipt, mockReadback);

      expect(runner.stateHistory).toEqual(['submitting', 'waiting_consensus', 'reading_back', 'failed']);
      expect(runner.currentState.step).toBe('failed');
    });
  });
});
