// tests/unit/evidenceConsistency.test.ts
// Verifies every hash displayed in evidence is 66 chars, valid hex, and verified in evidence_verification.json

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { VERIFIED_EVIDENCE_RECORDS } from '../../src/config/evidenceData';

interface VerificationDoc {
  network: string;
  chainId: number;
  totalVerified: number;
  records: Array<{
    hash: string;
    context: string;
    verified: boolean;
    rawStatus: string;
    agreement: string;
    outcome: string;
  }>;
}

describe('Evidence Consistency and Integrity Verification', () => {
  const verifDocPath = path.resolve('docs', 'evidence_verification.json');
  const verifDoc: VerificationDoc = JSON.parse(fs.readFileSync(verifDocPath, 'utf-8'));
  const verifiedHashMap = new Map(verifDoc.records.map((r) => [r.hash.toLowerCase(), r]));

  it('VERIFIED_EVIDENCE_RECORDS is non-empty and contains records to verify', () => {
    expect(VERIFIED_EVIDENCE_RECORDS.length).toBeGreaterThanOrEqual(10);
  });

  it('every transaction hash in VERIFIED_EVIDENCE_RECORDS is exactly 66 hex characters', () => {
    for (const record of VERIFIED_EVIDENCE_RECORDS) {
      expect(
        record.txHash,
        `Expected 66-char txHash in record ${record.label} (${record.category})`
      ).toMatch(/^0x[0-9a-fA-F]{64}$/);
      expect(record.txHash.length).toBe(66);
    }
  });

  it('every hash in VERIFIED_EVIDENCE_RECORDS is verified true in docs/evidence_verification.json', () => {
    for (const record of VERIFIED_EVIDENCE_RECORDS) {
      const match = verifiedHashMap.get(record.txHash.toLowerCase());
      expect(
        match,
        `Hash ${record.txHash} for ${record.label} (${record.category}) must exist in evidence_verification.json`
      ).toBeDefined();
      expect(match?.verified).toBe(true);
    }
  });

  it('evidence records adhere to outcome label standards', () => {
    for (const record of VERIFIED_EVIDENCE_RECORDS) {
      const validPrefix =
        record.outcome.startsWith('Accepted by validators') ||
        record.outcome.startsWith('Reverted - state not applied') ||
        record.outcome.startsWith('Validators did not agree');
      expect(
        validPrefix,
        `Outcome label "${record.outcome}" must start with a recognized outcome pattern`
      ).toBe(true);
    }
  });

  it('evidence records do not contain banned words in outcomes or labels', () => {
    const bannedPatterns = [
      /audit certificate/i,
      /security guarantee/i,
      /verified secure/i,
      /tamper-proof/i,
      /cryptographic proof/i,
      /bytecode/i,
      /unanimous/i,
      /trustless/i,
      /immutable/i,
      /official/i,
    ];

    for (const record of VERIFIED_EVIDENCE_RECORDS) {
      for (const pattern of bannedPatterns) {
        expect(record.outcome).not.toMatch(pattern);
        expect(record.label).not.toMatch(pattern);
        expect(record.category).not.toMatch(pattern);
      }
    }
  });
});
