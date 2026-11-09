// src/config/contracts.ts
// Address and network configuration for ConsensusLint Desk

export const NETWORK_CONFIG = {
  name: 'GenLayer Studionet (Preview)',
  chainId: 61999,
  rpcUrl: 'https://studio.genlayer.com/api',
  explorerUrl: 'https://explorer-studio.genlayer.com',
} as const;

export const CONTRACT_ADDRESSES = {
  consensusLint: '0xDd9c4b5d187664780142f24E4327D48Db59363D7',
  hygieneBadges: '0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140',
} as const;

export const CONTRACT_SHA256 = {
  consensusLint: 'ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25',
  hygieneBadges: '6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923',
} as const;

export const SUPERSEDED_ADDRESSES = [
  {
    label: 'ConsensusLint v1.0.0',
    address: '0xE2cBaf1916Df7C742486B2eC4E5d3A3289115F2D',
    reason: 'Superseded by v1.0.1 (score capping at 89, board separation, J2 clarification)',
  },
  {
    label: 'HygieneBadges v1.0.0',
    address: '0x3CA9E1b7804b442eaA932ae190d494D4A59295bF',
    reason: 'Superseded by v1.0.1 (rejection of badge minting on truncated audits)',
  },
  {
    label: 'Probe Diagnostic',
    address: '0xCAF2c7cdBD0a6EB4154b763c9fA869407CcCb7b6',
    reason: 'Diagnostic probe only',
  },
  {
    label: 'ConsensusLint v0',
    address: '0xdbb2a19163deba1DacDbC2C719D660bA1CDe3130',
    reason: 'Initial preview deployment',
  },
] as const;

export const CONTRACT_CONSTANTS = {
  MAX_SOURCE_BYTES: 120000,
  AUDIT_COOLDOWN_SECONDS: 300,
  MAX_AUDITS_PER_TARGET: 10,
  MAX_RESPONSES_PER_AUDIT: 10,
  PAGE_LIMIT_MAX: 50,
  LABEL_MIN: 3,
  LABEL_MAX: 64,
  SERIES_MAX: 48,
  ALLOWED_HOST: 'raw.githubusercontent.com',
  ALLOWED_STANCES: ['FIXED_NEXT', 'DISPUTE', 'WONTFIX'] as const,
  NOTE_MIN: 5,
  NOTE_MAX: 280,
  TRUNCATION_SCORE_CAP: 89,
  TRUNCATION_GRADE_CAP: 'B',
} as const;
