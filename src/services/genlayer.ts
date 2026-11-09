// src/services/genlayer.ts
// GenLayer client, contract calls, consensus receipt polling, and outcome formatting

import { createClient, chains } from 'genlayer-js';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';
import { parseRevertMessage } from './revertMap';
import { CONSENSUS_LINT_CALL_MAP, HYGIENE_BADGES_CALL_MAP } from './contractCallMap';

export interface AgreementResult {
  agree: number;
  total: number;
  str: string;
}

export interface ReceiptInfo {
  status: string;
  txHash: string;
  agreement: AgreementResult;
  isRevert: boolean;
  userError?: string;
  outcomeLabel: string;
  raw: any;
}

export function getClient(account?: any): any {
  return createClient({
    chain: chains.studionet,
    account: account || undefined,
  });
}

export function calculateAgreement(tx: any): AgreementResult {
  if (!tx || !tx.consensus_data || !tx.consensus_data.votes) {
    return { agree: 0, total: 0, str: 'N/A' };
  }
  const votes = tx.consensus_data.votes;
  const agreeCount = Object.values(votes).filter((v) => v === 'agree').length;
  const totalCount = Object.keys(votes).length;
  return {
    agree: agreeCount,
    total: totalCount,
    str: `${agreeCount}/${totalCount}`,
  };
}

export function decodeUserError(tx: any): string | null {
  try {
    const leader = tx?.consensus_data?.leader_receipt?.[0];
    if (leader && leader.execution_result !== 'SUCCESS') {
      if (leader.result) {
        const binary = typeof atob === 'function' ? atob(leader.result) : Buffer.from(leader.result, 'base64').toString('binary');
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        if (bytes.length > 0 && bytes[0] === 1) {
          return new TextDecoder().decode(bytes.slice(1));
        }
        return new TextDecoder().decode(bytes);
      }
      return leader.genvm_result?.error_description || 'Execution failed';
    }
  } catch (e) {
    // Ignore decoding errors
  }
  return null;
}

export function determineOutcomeLabel(tx: any, userError: string | null, agreement: AgreementResult): string {
  const isFinalOrAccepted = tx.status === 'ACCEPTED' || tx.status === 'FINALIZED';
  if (userError) {
    return `Reverted - state not applied (${agreement.str} agreed on the revert)`;
  }
  if (isFinalOrAccepted) {
    if (agreement.total > 0 && agreement.agree < Math.ceil(agreement.total / 2)) {
      return `Validators did not agree (${agreement.str}) - state not applied`;
    }
    return `Accepted by validators (${agreement.str} agreed) - state applied`;
  }
  return `Validators did not agree (${agreement.str}) - state not applied`;
}

export async function waitReceiptWithRetry(
  hash: string,
  maxRetries = 60,
  intervalMs = 3000,
  onPoll?: (attempt: number) => void
): Promise<ReceiptInfo> {
  for (let i = 0; i < maxRetries; i++) {
    if (onPoll) onPoll(i + 1);
    try {
      const res = await fetch(NETWORK_CONFIG.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionByHash',
          params: [hash],
        }),
      });
      const json = await res.json();
      const tx = json.result;
      if (tx && (tx.status === 'ACCEPTED' || tx.status === 'FINALIZED')) {
        const agreement = calculateAgreement(tx);
        const userError = decodeUserError(tx);
        const outcomeLabel = determineOutcomeLabel(tx, userError, agreement);
        return {
          status: tx.status,
          txHash: hash,
          agreement,
          isRevert: !!userError,
          userError: userError || undefined,
          outcomeLabel,
          raw: tx,
        };
      }
    } catch (e) {
      // Continue polling on transient errors
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout waiting for transaction receipt: ${hash}`);
}

// -------------------------------------------------------------
// READ CALLS (ConsensusLint)
// -------------------------------------------------------------

export async function getMeta(): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_meta.name,
    args: [],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getBoard(limit = 20): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_board.name,
    args: [limit],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getRules(): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_rules.name,
    args: [],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getRuleStats(): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_rule_stats.name,
    args: [],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function listTargetIds(offset = 0, limit = 50): Promise<string[]> {
  const client = getClient();
  const raw = (await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.list_target_ids.name,
    args: [offset, limit],
  })) as any;
  return typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
}

export async function getTarget(targetId: string): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_target.name,
    args: [targetId],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getTargetSummary(targetId: string): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_target_summary.name,
    args: [targetId],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getAudit(targetId: string, auditN: number): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_audit.name,
    args: [targetId, auditN],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getAudits(targetId: string, offset = 0, limit = 10): Promise<any[]> {
  const client = getClient();
  const raw = (await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_audits.name,
    args: [targetId, offset, limit],
  })) as any;
  return typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
}

export async function getProgress(targetId: string): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.get_progress.name,
    args: [targetId],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

// -------------------------------------------------------------
// READ CALLS (HygieneBadges)
// -------------------------------------------------------------

export async function getBadgesMeta(): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.get_meta.name,
    args: [],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getLedgerAddress(): Promise<string> {
  const client = getClient();
  const raw = (await client.readContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.get_ledger_address.name,
    args: [],
  })) as any;
  return typeof raw === 'string' ? raw.replace(/^"|"$/g, '') : String(raw || '');
}

export async function getBadgeOwner(): Promise<string> {
  const client = getClient();
  const raw = (await client.readContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.get_owner.name,
    args: [],
  })) as any;
  return typeof raw === 'string' ? raw.replace(/^"|"$/g, '') : String(raw || '');
}

export async function listBadgeIds(offset = 0, limit = 50): Promise<string[]> {
  const client = getClient();
  const raw = (await client.readContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.list_badge_ids.name,
    args: [offset, limit],
  })) as any;
  return typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
}

export async function getBadge(badgeId: string): Promise<any> {
  const client = getClient();
  const raw = await client.readContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.get_badge.name,
    args: [badgeId],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

// -------------------------------------------------------------
// WRITE CALLS (ConsensusLint)
// -------------------------------------------------------------

export async function writeRegisterTarget(
  label: string,
  series: string,
  sourceUrl: string,
  account: any
): Promise<string> {
  const client = getClient(account);
  return await client.writeContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.register_target.name,
    args: [label, series, sourceUrl],
    value: 0n,
  });
}

export async function writeAuditTarget(targetId: string, account: any): Promise<string> {
  const client = getClient(account);
  return await client.writeContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.audit_target.name,
    args: [targetId],
    value: 0n,
  });
}

export async function writeRespondToFinding(
  targetId: string,
  auditN: number,
  ruleId: string,
  stance: 'FIXED_NEXT' | 'DISPUTE' | 'WONTFIX',
  note: string,
  account: any
): Promise<string> {
  const client = getClient(account);
  return await client.writeContract({
    address: CONTRACT_ADDRESSES.consensusLint,
    functionName: CONSENSUS_LINT_CALL_MAP.respond_to_finding.name,
    args: [targetId, auditN, ruleId, stance, note],
    value: 0n,
  });
}

// -------------------------------------------------------------
// WRITE CALLS (HygieneBadges)
// -------------------------------------------------------------

export async function writeClaimBadge(
  targetId: string,
  displayName: string,
  account: any
): Promise<string> {
  const client = getClient(account);
  return await client.writeContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.claim_badge.name,
    args: [targetId, displayName],
    value: 0n,
  });
}

export async function writeRefreshBadge(badgeId: string, account: any): Promise<string> {
  const client = getClient(account);
  return await client.writeContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.refresh_badge.name,
    args: [badgeId],
    value: 0n,
  });
}

export async function writeSetLedger(ledgerAddress: string, account: any): Promise<string> {
  const client = getClient(account);
  return await client.writeContract({
    address: CONTRACT_ADDRESSES.hygieneBadges,
    functionName: HYGIENE_BADGES_CALL_MAP.set_ledger.name,
    args: [ledgerAddress],
    value: 0n,
  });
}
