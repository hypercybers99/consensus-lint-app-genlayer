// tests/unit/revertMapCompleteness.test.ts
// Extracts all gl.vm.UserError from reference contracts and asserts full mapping coverage

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { REVERT_MAP, parseRevertMessage } from '../../src/services/revertMap';

function extractUserErrorsFromContract(filename: string): string[] {
  const filePath = path.resolve('contracts-reference', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /gl\.vm\.UserError\(\s*["']([^"']+)["']\s*\)/g;
  const errors = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    errors.add(match[1]);
  }
  return Array.from(errors).sort();
}

describe('Revert Map Completeness Verification', () => {
  const consensusLintErrors = extractUserErrorsFromContract('ConsensusLint.py');
  const hygieneBadgesErrors = extractUserErrorsFromContract('HygieneBadges.py');
  const allContractErrors = Array.from(
    new Set([...consensusLintErrors, ...hygieneBadgesErrors])
  ).sort();

  it('contracts contain user errors to verify', () => {
    expect(consensusLintErrors.length).toBeGreaterThan(20);
    expect(hygieneBadgesErrors.length).toBeGreaterThan(10);
    expect(allContractErrors.length).toBeGreaterThan(30);
  });

  it('every gl.vm.UserError in ConsensusLint.py has an explicit entry in REVERT_MAP', () => {
    for (const err of consensusLintErrors) {
      expect(
        REVERT_MAP,
        `Expected ConsensusLint error "${err}" to exist in REVERT_MAP`
      ).toHaveProperty(err);
      expect(REVERT_MAP[err].title).toBeTruthy();
      expect(REVERT_MAP[err].explanation).toBeTruthy();
    }
  });

  it('every gl.vm.UserError in HygieneBadges.py has an explicit entry in REVERT_MAP', () => {
    for (const err of hygieneBadgesErrors) {
      expect(
        REVERT_MAP,
        `Expected HygieneBadges error "${err}" to exist in REVERT_MAP`
      ).toHaveProperty(err);
      expect(REVERT_MAP[err].title).toBeTruthy();
      expect(REVERT_MAP[err].explanation).toBeTruthy();
    }
  });

  it('parseRevertMessage never maps an on-chain UserError to generic fallback', () => {
    for (const err of allContractErrors) {
      const parsed = parseRevertMessage(err);
      expect(parsed.title).not.toBe('Transaction Reverted');
      expect(parsed.raw).toBe(err);
      expect(parsed.explanation.length).toBeGreaterThan(10);
    }
  });

  it('parseRevertMessage handles wrapped error objects and prefixes', () => {
    const wrappedError = new Error('Execution failed: gl.vm.UserError: only the registrant can do this');
    const parsed = parseRevertMessage(wrappedError);
    expect(parsed.title).toBe('Unauthorized Registrant');
    expect(parsed.raw).toBe('only the registrant can do this');
  });
});
