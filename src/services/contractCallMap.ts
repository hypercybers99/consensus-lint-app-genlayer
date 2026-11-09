// src/services/contractCallMap.ts
// Single source of truth for contract methods, arity, and execution mode

export interface ContractMethodDef {
  name: string;
  mode: 'write' | 'view';
  params: string[];
}

export const CONSENSUS_LINT_CALL_MAP: Record<string, ContractMethodDef> = {
  register_target: {
    name: 'register_target',
    mode: 'write',
    params: ['label', 'series', 'source_url'],
  },
  audit_target: {
    name: 'audit_target',
    mode: 'write',
    params: ['target_id'],
  },
  respond_to_finding: {
    name: 'respond_to_finding',
    mode: 'write',
    params: ['target_id', 'audit_n', 'rule_id', 'stance', 'note'],
  },
  get_target: {
    name: 'get_target',
    mode: 'view',
    params: ['target_id'],
  },
  get_audit: {
    name: 'get_audit',
    mode: 'view',
    params: ['target_id', 'n'],
  },
  get_audits: {
    name: 'get_audits',
    mode: 'view',
    params: ['target_id', 'offset', 'limit'],
  },
  get_target_summary: {
    name: 'get_target_summary',
    mode: 'view',
    params: ['target_id'],
  },
  get_progress: {
    name: 'get_progress',
    mode: 'view',
    params: ['target_id'],
  },
  list_target_ids: {
    name: 'list_target_ids',
    mode: 'view',
    params: ['offset', 'limit'],
  },
  list_series: {
    name: 'list_series',
    mode: 'view',
    params: ['series', 'offset', 'limit'],
  },
  get_board: {
    name: 'get_board',
    mode: 'view',
    params: ['limit'],
  },
  get_rule_stats: {
    name: 'get_rule_stats',
    mode: 'view',
    params: [],
  },
  get_rules: {
    name: 'get_rules',
    mode: 'view',
    params: [],
  },
  get_meta: {
    name: 'get_meta',
    mode: 'view',
    params: [],
  },
};

export const HYGIENE_BADGES_CALL_MAP: Record<string, ContractMethodDef> = {
  get_owner: {
    name: 'get_owner',
    mode: 'view',
    params: [],
  },
  get_ledger_address: {
    name: 'get_ledger_address',
    mode: 'view',
    params: [],
  },
  set_ledger: {
    name: 'set_ledger',
    mode: 'write',
    params: ['ledger_address'],
  },
  claim_badge: {
    name: 'claim_badge',
    mode: 'write',
    params: ['target_id', 'display_name'],
  },
  refresh_badge: {
    name: 'refresh_badge',
    mode: 'write',
    params: ['badge_id'],
  },
  get_badge: {
    name: 'get_badge',
    mode: 'view',
    params: ['badge_id'],
  },
  list_badge_ids: {
    name: 'list_badge_ids',
    mode: 'view',
    params: ['offset', 'limit'],
  },
  get_meta: {
    name: 'get_meta',
    mode: 'view',
    params: [],
  },
};
