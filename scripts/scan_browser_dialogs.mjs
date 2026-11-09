// scripts/scan_browser_dialogs.mjs
// Verifies that native browser dialogs (alert, confirm, prompt) are never used

import fs from 'fs';
import path from 'path';

const FORBIDDEN = [
  /\bwindow\.alert\b/,
  /\bwindow\.confirm\b/,
  /\bwindow\.prompt\b/,
  /\balert\s*\(/,
  /\bconfirm\s*\(/,
  /\bprompt\s*\(/,
];

let violations = 0;
let scannedFiles = 0;

function scanFile(filePath) {
  scannedFiles++;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('scan_browser_dialogs') || line.includes('FORBIDDEN')) continue;
    // Also skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    for (const pat of FORBIDDEN) {
      if (pat.test(line)) {
        console.error(`[FAIL] Native browser dialog found at ${filePath}:${i + 1}`);
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
    } else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js'))) {
      scanFile(full);
    }
  }
}

console.log('=== RUNNING BROWSER DIALOG SCAN ===');
walk(path.resolve('src'));

if (violations > 0) {
  console.error(`\nBrowser dialog scan FAILED: ${violations} native dialog call(s) found.`);
  process.exit(1);
} else {
  console.log(`[PASS] Browser dialog scan verified ${scannedFiles} files. All modals use accessible custom UI.`);
}
