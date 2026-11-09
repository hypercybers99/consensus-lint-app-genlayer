// src/types/index.ts
// Core domain interfaces for ConsensusLint Desk

export interface TargetMetadata {
  target_id: string;
  label: string;
  series: string;
  source_url: string;
  registrant: string;
  registered_at: string;
  audits_count: number;
  last_audit_n: number;
  last_score: number | null;
  last_grade: string | null;
  last_audited_at: string | null;
  best_score: number | null;
  first_score: number | null;
}

export interface RuleFinding {
  rule_id: string;
  risk: string;
  message: string;
  line_start: number;
  line_end: number;
  snippet?: string;
}

export interface MaintainerResponse {
  response_id: string;
  rule_id: string;
  stance: 'FIXED_NEXT' | 'DISPUTE' | 'WONTFIX';
  note: string;
  responder: string;
  responded_at: string;
}

export interface AuditRecord {
  audit_n: number;
  audited_at: string;
  auditor: string;
  source_bytes: number;
  source_sha256: string;
  truncated: boolean;
  score: number;
  grade: string;
  findings: RuleFinding[];
  responses: MaintainerResponse[];
}

export interface TargetSummary {
  target_id: string;
  label: string;
  series: string;
  source_url: string;
  registrant: string;
  registered_at: string;
  audits_count: number;
  latest_audit?: AuditRecord | null;
  progress?: {
    first_score: number | null;
    best_score: number | null;
    latest_score: number | null;
    delta: number | null;
  };
}

export interface RuleDefinition {
  rule_id: string;
  category: string;
  description: string;
  severity: string;
  deduction: number;
}

export interface LeaderboardEntry {
  target_id: string;
  label: string;
  series: string;
  score: number;
  grade: string;
  source_bytes: number;
  truncated: boolean;
  audits_count: number;
  first_score?: number;
  delta?: number;
}

export interface LeaderboardData {
  best: LeaderboardEntry[];
  partial: LeaderboardEntry[];
  most_improved: LeaderboardEntry[];
}

export interface BadgeRecord {
  badge_id: string;
  target_id: string;
  recipient: string;
  display_name: string;
  score: number;
  grade: string;
  minted_at: string;
  refreshed_at: string;
  audit_n: number;
}

export interface LedgerMeta {
  targets_count: number;
  audits_count: number;
  responses_count: number;
  version: string;
  name: string;
  owner?: string;
}

export interface BadgeMeta {
  badges_count: number;
  name: string;
  symbol: string;
  ledger_address: string;
  owner: string;
}

export type TxStep = 'idle' | 'submitting' | 'waiting_consensus' | 'reading_back' | 'completed' | 'reverted' | 'failed';

export interface TxStatusState {
  step: TxStep;
  txHash: string | null;
  rawStatus: string | null;
  agreementRatio: string | null;
  executionOutcome: string | null;
  readbackSuccess: boolean | null;
  errorMessage: string | null;
  errorTitle?: string;
  errorDetails?: string;
}
