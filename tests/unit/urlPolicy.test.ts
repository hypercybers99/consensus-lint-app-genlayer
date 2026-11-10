// tests/unit/urlPolicy.test.ts
// Verifies URL validation matches ConsensusLint.py _parse_and_validate_source_url exactly

import { describe, it, expect } from 'vitest';
import { parseAndValidateSourceUrl } from '../../src/services/urlPolicy';

describe('Source URL Policy Parity (ConsensusLint _parse_and_validate_source_url)', () => {
  describe('Valid Cases', () => {
    it('accepts valid pinned commit URL', () => {
      const url =
        'https://raw.githubusercontent.com/hypercybers99/consensus-lint-fixtures/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/good_contract.py';
      const parsed = parseAndValidateSourceUrl(url);
      expect(parsed.ownerRepo).toBe('hypercybers99/consensus-lint-fixtures');
      expect(parsed.ref).toBe('7bd436ef6ed18a787d88bc67217f0de63b7e85a8');
      expect(parsed.refKind).toBe('PINNED_COMMIT');
      expect(parsed.relPath).toBe('good_contract.py');
      expect(parsed.fileName).toBe('good_contract.py');
      expect(parsed.canonicalUrl).toBe(url);
    });

    it('accepts valid mutable branch/tag ref', () => {
      const url = 'https://raw.githubusercontent.com/owner-name/repo.js/v1.0.0/src/contracts/contract.py';
      const parsed = parseAndValidateSourceUrl(url);
      expect(parsed.ownerRepo).toBe('owner-name/repo.js');
      expect(parsed.ref).toBe('v1.0.0');
      expect(parsed.refKind).toBe('MUTABLE_REF');
      expect(parsed.relPath).toBe('src/contracts/contract.py');
      expect(parsed.fileName).toBe('contract.py');
    });

    it('accepts valid nested paths up to 6 segments', () => {
      const url = 'https://raw.githubusercontent.com/owner/repo/main/a/b/c/d/e/contract.py';
      const parsed = parseAndValidateSourceUrl(url);
      expect(parsed.relPath).toBe('a/b/c/d/e/contract.py');
      expect(parsed.fileName).toBe('contract.py');
    });

    it('normalizes trailing dot in hostname', () => {
      const url =
        'https://raw.githubusercontent.com./hypercybers99/consensus-lint-fixtures/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/good_contract.py';
      const parsed = parseAndValidateSourceUrl(url);
      expect(parsed.canonicalUrl).toBe(
        'https://raw.githubusercontent.com/hypercybers99/consensus-lint-fixtures/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/good_contract.py'
      );
    });

    it('accepts port 443 explicitly', () => {
      const url =
        'https://raw.githubusercontent.com:443/hypercybers99/consensus-lint-fixtures/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/good_contract.py';
      const parsed = parseAndValidateSourceUrl(url);
      expect(parsed.fileName).toBe('good_contract.py');
    });
  });

  describe('Negative Cases - Contract UserErrors', () => {
    it('rejects non-string or empty input', () => {
      expect(() => parseAndValidateSourceUrl(null)).toThrow('source url not valid');
      expect(() => parseAndValidateSourceUrl(undefined)).toThrow('source url not valid');
      expect(() => parseAndValidateSourceUrl(12345)).toThrow('source url not valid');
      expect(() => parseAndValidateSourceUrl('')).toThrow('source url not valid');
      expect(() => parseAndValidateSourceUrl('   ')).toThrow('source url not valid');
    });

    it('rejects URLs longer than 300 characters', () => {
      const longUrl = 'https://raw.githubusercontent.com/owner/repo/main/' + 'a'.repeat(260) + '.py';
      expect(longUrl.length).toBeGreaterThan(300);
      expect(() => parseAndValidateSourceUrl(longUrl)).toThrow('source url too long');
    });

    it('rejects characters outside ASCII 33..126 (spaces, unicode)', () => {
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/my contract.py')
      ).toThrow('source url not valid');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/kontrakt\u00fc.py')
      ).toThrow('source url not valid');
    });

    it('rejects non-https schemes (http, ftp)', () => {
      expect(() =>
        parseAndValidateSourceUrl(
          'http://raw.githubusercontent.com/owner/repo/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/contract.py'
        )
      ).toThrow('source url must use https');
      expect(() =>
        parseAndValidateSourceUrl(
          'ftp://raw.githubusercontent.com/owner/repo/7bd436ef6ed18a787d88bc67217f0de63b7e85a8/contract.py'
        )
      ).toThrow('source url must use https');
    });

    it('rejects embedded credentials', () => {
      expect(() =>
        parseAndValidateSourceUrl(
          'https://user:pass@raw.githubusercontent.com/owner/repo/main/contract.py'
        )
      ).toThrow('source url contains credentials');
      expect(() =>
        parseAndValidateSourceUrl(
          'https://token@raw.githubusercontent.com/owner/repo/main/contract.py'
        )
      ).toThrow('source url contains credentials');
    });

    it('rejects custom network ports', () => {
      expect(() =>
        parseAndValidateSourceUrl(
          'https://raw.githubusercontent.com:8080/owner/repo/main/contract.py'
        )
      ).toThrow('source url port not allowed');
      expect(() =>
        parseAndValidateSourceUrl(
          'https://raw.githubusercontent.com:8443/owner/repo/main/contract.py'
        )
      ).toThrow('source url port not allowed');
    });

    it('rejects query parameters or fragments', () => {
      expect(() =>
        parseAndValidateSourceUrl(
          'https://raw.githubusercontent.com/owner/repo/main/contract.py?raw=true'
        )
      ).toThrow('source url has query or fragment');
      expect(() =>
        parseAndValidateSourceUrl(
          'https://raw.githubusercontent.com/owner/repo/main/contract.py#L42'
        )
      ).toThrow('source url has query or fragment');
    });

    it('rejects disallowed hostnames', () => {
      expect(() =>
        parseAndValidateSourceUrl('https://github.com/owner/repo/raw/main/contract.py')
      ).toThrow('source host not allowed');
      expect(() =>
        parseAndValidateSourceUrl('https://gist.githubusercontent.com/owner/repo/raw/main/contract.py')
      ).toThrow('source host not allowed');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.gitlab.com/owner/repo/main/contract.py')
      ).toThrow('source host not allowed');
    });

    it('rejects path traversal and escaped slashes (//, .., %2f, %2e)', () => {
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner//repo/main/contract.py')
      ).toThrow('source url not valid');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/../contract.py')
      ).toThrow('source url not valid');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/%2fcontract.py')
      ).toThrow('source url not valid');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/%2e%2e/contract.py')
      ).toThrow('source url not valid');
    });

    it('rejects fewer than 4 path segments', () => {
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main')
      ).toThrow('source url not valid');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo')
      ).toThrow('source url not valid');
    });

    it('rejects invalid owner or repo characters', () => {
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/invalid_owner!/repo/main/contract.py')
      ).toThrow('source url not valid');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/invalid$repo/main/contract.py')
      ).toThrow('source url not valid');
    });

    it('rejects path nesting greater than 6 segments', () => {
      expect(() =>
        parseAndValidateSourceUrl(
          'https://raw.githubusercontent.com/owner/repo/main/1/2/3/4/5/6/7/contract.py'
        )
      ).toThrow('source url not valid');
    });

    it('rejects files not ending in .py', () => {
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/contract.js')
      ).toThrow('source path must end with .py');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/contract.pyc')
      ).toThrow('source path must end with .py');
      expect(() =>
        parseAndValidateSourceUrl('https://raw.githubusercontent.com/owner/repo/main/contract.txt')
      ).toThrow('source path must end with .py');
    });
  });
});
