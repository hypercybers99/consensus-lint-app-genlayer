// scripts/check_address_consistency.mjs
// Verifies that active contract addresses match pinned values and superseded addresses are not called

import fs from 'fs';
import path from 'path';

const ACTIVE_CONSENSUS_LINT = '0xDd9c4b5d187664780142f24E4327D48Db59363D7';
const ACTIVE_HYGIENE_BADGES = '0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140';

const SUPERSEDED = [
  '0xE2cBaf1916Df7C742486B2eC4E5d3A3289115F2D',
  '0x3CA9E1b7804b442eaA932ae190d494D4A59295bF',
  '0xCAF2c7cdBD0a6EB4154b763c9fA869407CcCb7b6',
  '0xdbb2a19163deba1DacDbC2C719D660bA1CDe3130',
];

console.log('=== CHECKING ADDRESS CONSISTENCY ===');

// Check src/config/contracts.ts
const contractsConfigPath = path.resolve('src/config/contracts.ts');
const contractsContent = fs.readFileSync(contractsConfigPath, 'utf8');

if (!contractsContent.includes(ACTIVE_CONSENSUS_LINT)) {
  console.error(`[FAIL] Active ConsensusLint address missing in ${contractsConfigPath}`);
  process.exit(1);
}
if (!contractsContent.includes(ACTIVE_HYGIENE_BADGES)) {
  console.error(`[FAIL] Active HygieneBadges address missing in ${contractsConfigPath}`);
  process.exit(1);
}

// Ensure superseded addresses do NOT appear anywhere in src outside src/config/contracts.ts
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js'))) {
      if (fullPath.endsWith('contracts.ts')) continue;
      const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
      for (const sup of SUPERSEDED) {
        if (content.includes(sup.toLowerCase())) {
          console.error(`[FAIL] Superseded address ${sup} found in ${fullPath}!`);
          process.exit(1);
        }
      }
    }
  }
}

scanDir(path.resolve('src'));
console.log('[PASS] Active addresses pinned and verified. No superseded addresses called in application code.');
