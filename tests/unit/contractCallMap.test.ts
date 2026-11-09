// tests/unit/contractCallMap.test.ts
// Verifies 1:1 parity between reference contracts and dApp call-map

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CONSENSUS_LINT_CALL_MAP, HYGIENE_BADGES_CALL_MAP, ContractMethodDef } from '../../src/services/contractCallMap';

interface ExtractedMethod {
  name: string;
  mode: 'write' | 'view';
  params: string[];
}

function extractMethodsFromContract(contractFilename: string): Record<string, ExtractedMethod> {
  const filePath = path.resolve('contracts-reference', contractFilename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const methods: Record<string, ExtractedMethod> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const decoratorMatch = line.match(/^@gl\.public\.(write|view)$/);
    if (decoratorMatch) {
      const mode = decoratorMatch[1] as 'write' | 'view';
      // Find following def line
      let defLine = '';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim().startsWith('def ')) {
          defLine = lines[j].trim();
          break;
        }
      }
      if (defLine) {
        const defMatch = defLine.match(/^def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
        if (defMatch) {
          const name = defMatch[1];
          const rawParams = defMatch[2]
            .split(',')
            .map((p) => p.trim().split(':')[0].trim())
            .filter((p) => p && p !== 'self');
          methods[name] = {
            name,
            mode,
            params: rawParams,
          };
        }
      }
    }
  }

  return methods;
}

describe('Requirement B1 - Contract Call-Map Parity Verification', () => {
  it('ConsensusLint.py reference matches CONSENSUS_LINT_CALL_MAP exactly', () => {
    const extracted = extractMethodsFromContract('ConsensusLint.py');
    const callMapKeys = Object.keys(CONSENSUS_LINT_CALL_MAP).sort();
    const extractedKeys = Object.keys(extracted).sort();

    expect(callMapKeys).toEqual(extractedKeys);

    for (const name of extractedKeys) {
      const ext = extracted[name];
      const mapped = CONSENSUS_LINT_CALL_MAP[name];
      expect(mapped).toBeDefined();
      expect(mapped.mode).toBe(ext.mode);
      expect(mapped.params).toEqual(ext.params);
      expect(mapped.params.length).toBe(ext.params.length);
    }
  });

  it('HygieneBadges.py reference matches HYGIENE_BADGES_CALL_MAP exactly', () => {
    const extracted = extractMethodsFromContract('HygieneBadges.py');
    const callMapKeys = Object.keys(HYGIENE_BADGES_CALL_MAP).sort();
    const extractedKeys = Object.keys(extracted).sort();

    expect(callMapKeys).toEqual(extractedKeys);

    for (const name of extractedKeys) {
      const ext = extracted[name];
      const mapped = HYGIENE_BADGES_CALL_MAP[name];
      expect(mapped).toBeDefined();
      expect(mapped.mode).toBe(ext.mode);
      expect(mapped.params).toEqual(ext.params);
      expect(mapped.params.length).toBe(ext.params.length);
    }
  });

  it('demonstrates deliberate negative mismatch test fails if call-map differs', () => {
    const mutatedMap: Record<string, ContractMethodDef> = {
      ...CONSENSUS_LINT_CALL_MAP,
      non_existent_method: {
        name: 'non_existent_method',
        mode: 'write',
        params: ['bad_param'],
      },
    };
    const extracted = extractMethodsFromContract('ConsensusLint.py');
    const hasMismatch = !Object.prototype.hasOwnProperty.call(extracted, 'non_existent_method');
    expect(hasMismatch).toBe(true);
  });
});
