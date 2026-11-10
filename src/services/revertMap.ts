// src/services/revertMap.ts
// Maps contract revert strings from ConsensusLint and HygieneBadges to user-friendly messages

export const REVERT_MAP: Record<string, { title: string; explanation: string }> = {
  // ConsensusLint.py reverts
  'audit cooldown active': {
    title: 'Cooldown Active',
    explanation: 'Audits for a target must be spaced at least 300 seconds apart. Please wait until the cooldown timer expires before requesting another audit.',
  },
  'audit evaluation failed': {
    title: 'Audit Evaluation Failed',
    explanation: 'Validators could not complete the consensus hygiene analysis on the fetched source code.',
  },
  'audit not found': {
    title: 'Audit Not Found',
    explanation: 'The requested audit record number does not exist for this target.',
  },
  'clock unavailable': {
    title: 'Clock Unavailable',
    explanation: 'The validator execution environment was unable to resolve the current consensus timestamp.',
  },
  'datetime must be string': {
    title: 'Timestamp Error',
    explanation: 'Internal datetime validation expected a string value.',
  },
  'empty datetime': {
    title: 'Timestamp Error',
    explanation: 'Internal datetime validation received an empty string.',
  },
  'fetch failed': {
    title: 'Fetch Failed',
    explanation: 'Validators were unable to retrieve the source file from GitHub. Check that the file exists and is publicly accessible.',
  },
  'finding not present in audit': {
    title: 'Finding Not Found',
    explanation: 'The specified rule finding does not exist in this audit run, so a response cannot be attached to it.',
  },
  'invalid ISO-8601 datetime format': {
    title: 'Invalid Timestamp',
    explanation: 'The validator timestamp did not match expected ISO-8601 formatting.',
  },
  'invalid label length': {
    title: 'Invalid Label Length',
    explanation: 'The contract label must be between 3 and 64 characters long.',
  },
  'invalid series length': {
    title: 'Invalid Series Length',
    explanation: 'The series identifier must be between 1 and 48 characters long.',
  },
  'invalid stance': {
    title: 'Invalid Stance',
    explanation: 'The response stance must be one of: FIXED_NEXT, DISPUTE, or WONTFIX.',
  },
  'maximum audits reached': {
    title: 'Maximum Audits Reached',
    explanation: 'This target has reached the maximum cap of 10 audits allowed on-chain.',
  },
  'model output invalid': {
    title: 'Validator Analysis Invalid',
    explanation: 'The validator model output could not be parsed according to consensus schema requirements.',
  },
  'note length out of range': {
    title: 'Note Length Out of Range',
    explanation: 'Maintainer response notes must be between 5 and 280 characters long.',
  },
  'only the registrant can do this': {
    title: 'Unauthorized Registrant',
    explanation: 'Only the account that registered this target is permitted to attach maintainer responses to findings.',
  },
  'response limit reached for this audit': {
    title: 'Response Limit Reached',
    explanation: 'A maximum of 10 maintainer responses can be attached to a single audit.',
  },
  'source could not be parsed': {
    title: 'Source Parse Error',
    explanation: 'The fetched file could not be parsed as valid Python source by the validator parser.',
  },
  'source host not allowed': {
    title: 'Host Not Allowed',
    explanation: 'Source URLs must be hosted on raw.githubusercontent.com.',
  },
  'source is not valid utf-8': {
    title: 'Invalid Encoding',
    explanation: 'The source file is not valid UTF-8 text.',
  },
  'source path must end with .py': {
    title: 'Invalid File Extension',
    explanation: 'The source URL path must point to a Python file ending in .py.',
  },
  'source url contains credentials': {
    title: 'URL Contains Credentials',
    explanation: 'User credentials (username:password@) are not permitted in source URLs.',
  },
  'source url has query or fragment': {
    title: 'Invalid URL Format',
    explanation: 'Source URLs must not contain query parameters (?) or URL fragments (#).',
  },
  'source url must use https': {
    title: 'HTTPS Required',
    explanation: 'Source URLs must use the https:// protocol scheme.',
  },
  'source url not valid': {
    title: 'Invalid URL',
    explanation: 'The provided source URL does not conform to the required URL format.',
  },
  'source url port not allowed': {
    title: 'Port Not Allowed',
    explanation: 'Custom network ports are not permitted in source URLs.',
  },
  'source url too long': {
    title: 'URL Too Long',
    explanation: 'The source URL exceeds the maximum allowed length (512 characters).',
  },
  'target already registered': {
    title: 'Target Already Registered',
    explanation: 'A contract target with this source URL is already registered in the registry.',
  },
  'target not found': {
    title: 'Target Not Found',
    explanation: 'No target exists matching the specified 12-character target identifier.',
  },

  // HygieneBadges.py reverts
  'badge already claimed for this target and sender': {
    title: 'Badge Already Claimed',
    explanation: 'You have already claimed a hygiene badge for this contract target from this address.',
  },
  'badge not found': {
    title: 'Badge Not Found',
    explanation: 'No badge was found with the specified badge identifier.',
  },
  'cannot claim badge for truncated audit': {
    title: 'Truncated Audits Ineligible',
    explanation: 'Hygiene badges cannot be claimed for audits where source code was truncated (> 120,000 bytes) due to validator limits.',
  },
  'failed to query target from ledger': {
    title: 'Ledger Query Failed',
    explanation: 'The badge contract failed to query target information from the ConsensusLint ledger contract.',
  },
  'invalid display name length': {
    title: 'Invalid Display Name',
    explanation: 'The badge display name must be between 1 and 64 characters long.',
  },
  'invalid ledger contract address format': {
    title: 'Invalid Address Format',
    explanation: 'The ledger contract address provided is not a valid 42-character hex address.',
  },
  'ledger address already set': {
    title: 'Ledger Already Set',
    explanation: 'The ledger address has already been configured for this badge contract.',
  },
  'ledger not set': {
    title: 'Ledger Not Configured',
    explanation: 'The badge contract does not yet have a ledger contract address configured.',
  },
  'only owner can set ledger address': {
    title: 'Owner Restricted',
    explanation: 'Only the deployer/owner account of the badge contract can update the ledger address.',
  },
  'target has no scored audit': {
    title: 'No Scored Audit',
    explanation: 'The target contract has not yet been audited. Run an audit first before claiming a hygiene badge.',
  },
  'target not found in ledger': {
    title: 'Target Missing in Ledger',
    explanation: 'The specified target ID does not exist in the ConsensusLint ledger contract.',
  },
};

export function parseRevertMessage(rawError: unknown): { title: string; explanation: string; raw: string } {
  const rawStr = typeof rawError === 'string' ? rawError : (rawError as any)?.message || JSON.stringify(rawError || '');
  const sortedEntries = Object.entries(REVERT_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [key, mapping] of sortedEntries) {
    if (rawStr.includes(key)) {
      return { title: mapping.title, explanation: mapping.explanation, raw: key };
    }
  }
  return {
    title: 'Transaction Reverted',
    explanation: rawStr || 'The transaction was reverted by validators on GenLayer Studionet (Preview).',
    raw: rawStr,
  };
}
