// scripts/scan_banned.mjs
// Verifies no banned words or overclaims appear in docs, user-facing text, or UI strings

import fs from 'fs';
import path from 'path';

const BANNED_PATTERNS = [
  /\bcryptographic proof\b/i,
  /\btamper-proof\b/i,
  /\bbytecode\b/i,
  /\bunanimous\b/i,
  /\bimmutable\b/i,
  /\btrustless\b/i,
  /\bguarantee(?:s|d)?\b/i,
  /\bprevents\b/i,
  /\bofficial\b/i,
  /\bverifiable\b/i,
  /\bWCAG compliant\b/i,
  /\bfirst ever\b/i,
  /\bworld's first\b/i,
];

// Special checks for 'testnet' and 'live' network misuse
const NETWORK_MISUSE = [
  /\btestnet\b/i,
  /\blive network\b/i,
  /\blive on-chain\b/i,
];

const SCAN_DIRS = ['src', 'docs', 'public'];
let violations = 0;
let scannedFiles = 0;

function scanFile(filePath) {
  scannedFiles++;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments that explicitly discuss banned terms or raw status mapping
    if (line.includes('scan_banned') || line.includes('BANNED_PATTERNS') || line.includes('Raw receipt status')) {
      continue;
    }

    for (const pat of BANNED_PATTERNS) {
      if (pat.test(line)) {
        console.error(`[FAIL] Banned pattern ${pat} in ${filePath}:${i + 1}`);
        console.error(`  Line: ${line.trim()}`);
        violations++;
      }
    }

    for (const pat of NETWORK_MISUSE) {
      // allow references to testnetAsimov or testnetBradbury from genlayer-js SDK if any
      if (line.includes('testnetAsimov') || line.includes('testnetBradbury')) continue;
      if (pat.test(line)) {
        console.error(`[FAIL] Network name misuse ${pat} in ${filePath}:${i + 1}`);
        console.error(`  Line: ${line.trim()}`);
        violations++;
      }
    }
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
    } else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.md') || full.endsWith('.html'))) {
      scanFile(full);
    }
  }
}

console.log('=== RUNNING BANNED WORDS & HONESTY SCAN ===');
for (const dir of SCAN_DIRS) {
  if (fs.existsSync(dir)) walk(path.resolve(dir));
}

if (violations > 0) {
  console.error(`\nBanned words scan FAILED: ${violations} violation(s) found.`);
  process.exit(1);
} else {
  console.log(`[PASS] Banned words scan verified ${scannedFiles} files without violations.`);
}
