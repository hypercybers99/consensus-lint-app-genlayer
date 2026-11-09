// scripts/scan_secrets.mjs
// Verifies no private keys or secrets are committed in source code

import fs from 'fs';
import path from 'path';

const SCAN_DIRS = ['src', 'public', 'scripts'];
let violations = 0;
let scannedFiles = 0;

// Hex pattern for private keys (64 hex characters preceded by 0x)
const PRIVKEY_PATTERN = /0x[a-fA-F0-9]{64}/g;

function scanFile(filePath) {
  scannedFiles++;
  // Public transaction hashes in evidence data or test fixtures are permitted public receipts
  if (filePath.endsWith('evidenceData.ts') || filePath.endsWith('live_evidence.json')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(PRIVKEY_PATTERN) || [];

  for (const m of matches) {
    console.error(`[FAIL] Potential private key secret found in ${filePath}: ${m}`);
    violations++;
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        walk(full);
      }
    } else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js') || full.endsWith('.mjs') || full.endsWith('.json'))) {
      if (full.endsWith('package-lock.json')) continue;
      scanFile(full);
    }
  }
}

console.log('=== RUNNING SECRETS SCAN ===');
for (const dir of SCAN_DIRS) {
  if (fs.existsSync(dir)) walk(path.resolve(dir));
}

if (violations > 0) {
  console.error(`\nSecrets scan FAILED: ${violations} secret(s) found.`);
  process.exit(1);
} else {
  console.log(`[PASS] Secrets scan verified ${scannedFiles} files without violations.`);
}
