// tests/unit/txOutcomeMapping.test.ts
// Table-driven tests verifying transaction outcome label mapping

import { describe, it, expect } from 'vitest';
import { determineOutcomeLabel, calculateAgreement, AgreementResult } from '../../src/services/genlayer';

describe('Transaction Outcome Label Mapping', () => {
  interface TestCase {
    description: string;
    tx: { status: string; consensus_data?: any };
    userError: string | null;
    agreement: AgreementResult;
    expected: string;
  }

  const testCases: TestCase[] = [
    {
      description: 'Accepted by majority (5/5 agreed)',
      tx: { status: 'ACCEPTED' },
      userError: null,
      agreement: { agree: 5, total: 5, str: '5/5' },
      expected: 'Accepted by validators (5/5 agreed) - state applied',
    },
    {
      description: 'Accepted by majority (3/5 agreed)',
      tx: { status: 'ACCEPTED' },
      userError: null,
      agreement: { agree: 3, total: 5, str: '3/5' },
      expected: 'Accepted by validators (3/5 agreed) - state applied',
    },
    {
      description: 'Finalized status with unanimous agreement',
      tx: { status: 'FINALIZED' },
      userError: null,
      agreement: { agree: 5, total: 5, str: '5/5' },
      expected: 'Accepted by validators (5/5 agreed) - state applied',
    },
    {
      description: 'Finalized status with 4/5 agreement',
      tx: { status: 'FINALIZED' },
      userError: null,
      agreement: { agree: 4, total: 5, str: '4/5' },
      expected: 'Accepted by validators (4/5 agreed) - state applied',
    },
    {
      description: 'FINALIZED but validators disagreed (2/5 agreed, majority disagree)',
      tx: { status: 'FINALIZED' },
      userError: null,
      agreement: { agree: 2, total: 5, str: '2/5' },
      expected: 'Validators did not agree (2/5) - state not applied',
    },
    {
      description: 'FINALIZED but only 1/5 agreed',
      tx: { status: 'FINALIZED' },
      userError: null,
      agreement: { agree: 1, total: 5, str: '1/5' },
      expected: 'Validators did not agree (1/5) - state not applied',
    },
    {
      description: 'FINALIZED but 0/5 agreed',
      tx: { status: 'FINALIZED' },
      userError: null,
      agreement: { agree: 0, total: 5, str: '0/5' },
      expected: 'Validators did not agree (0/5) - state not applied',
    },
    {
      description: 'Reverted with 5/5 agreed on revert',
      tx: { status: 'FINALIZED' },
      userError: 'only the registrant can do this',
      agreement: { agree: 5, total: 5, str: '5/5' },
      expected: 'Reverted - state not applied (5/5 agreed on the revert)',
    },
    {
      description: 'Reverted with 3/5 agreed on revert',
      tx: { status: 'ACCEPTED' },
      userError: 'cannot claim badge for truncated audit',
      agreement: { agree: 3, total: 5, str: '3/5' },
      expected: 'Reverted - state not applied (3/5 agreed on the revert)',
    },
    {
      description: 'Non-finalized status (e.g. REJECTED)',
      tx: { status: 'REJECTED' },
      userError: null,
      agreement: { agree: 1, total: 5, str: '1/5' },
      expected: 'Validators did not agree (1/5) - state not applied',
    },
  ];

  testCases.forEach(({ description, tx, userError, agreement, expected }) => {
    it(description, () => {
      const outcome = determineOutcomeLabel(tx, userError, agreement);
      expect(outcome).toBe(expected);
    });
  });

  it('calculateAgreement counts agree votes correctly', () => {
    const rawTx = {
      consensus_data: {
        votes: {
          '0xVal1': 'agree',
          '0xVal2': 'agree',
          '0xVal3': 'agree',
          '0xVal4': 'disagree',
          '0xVal5': 'agree',
        },
      },
    };
    const res = calculateAgreement(rawTx);
    expect(res.agree).toBe(4);
    expect(res.total).toBe(5);
    expect(res.str).toBe('4/5');
  });

  it('calculateAgreement handles empty or missing consensus_data safely', () => {
    const emptyTx = {};
    const res = calculateAgreement(emptyTx);
    expect(res.agree).toBe(0);
    expect(res.total).toBe(0);
    expect(res.str).toBe('N/A');
  });
});
