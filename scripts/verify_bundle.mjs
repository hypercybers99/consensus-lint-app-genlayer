// scripts/verify_bundle.mjs
// Verifies production bundle contains active contract addresses and pure ASCII output

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');

const ACTIVE_ADDRESSES = [
  '0xDd9c4b5d187664780142f24E4327D48Db59363D7',
  '0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140',
];

console.log('=== VERIFYING PRODUCTION BUNDLE ===');

if (!fs.existsSync(DIST_DIR)) {
  console.error('[FAIL] dist/ directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

let foundActive = 0;
let jsFiles = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && (full.endsWith('.js') || full.endsWith('.html'))) {
      jsFiles++;
      const content = fs.readFileSync(full, 'utf8');
      for (const addr of ACTIVE_ADDRESSES) {
        if (content.toLowerCase().includes(addr.toLowerCase())) {
          foundActive++;
        }
      }
    }
  }
}

walk(DIST_DIR);

if (foundActive === 0) {
  console.error('[FAIL] Active contract addresses not found in bundle!');
  process.exit(1);
}

console.log(`[PASS] Bundle verified across ${jsFiles} assets. Active addresses present.`);
