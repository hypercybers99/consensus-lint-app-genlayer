import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EXPECTED_CONTRACTS = {
  'ConsensusLint.py': {
    sha256: 'ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25',
    bytes: 68032,
  },
  'HygieneBadges.py': {
    sha256: '6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923',
    bytes: 8990,
  },
};

const refDir = path.resolve('contracts-reference');
let hasError = false;

console.log('=== CHECKING REFERENCE CONTRACTS SHA-256 AND BYTE SIZES ===');

for (const [filename, expected] of Object.entries(EXPECTED_CONTRACTS)) {
  const filePath = path.join(refDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Reference file missing: ${filePath}`);
    hasError = true;
    continue;
  }

  const content = fs.readFileSync(filePath);
  const actualSha = crypto.createHash('sha256').update(content).digest('hex');
  const actualBytes = content.length;

  if (actualSha !== expected.sha256) {
    console.error(`[FAIL] ${filename} SHA-256 mismatch:`);
    console.error(`  Expected: ${expected.sha256}`);
    console.error(`  Actual:   ${actualSha}`);
    hasError = true;
  } else if (actualBytes !== expected.bytes) {
    console.error(`[FAIL] ${filename} Byte size mismatch:`);
    console.error(`  Expected: ${expected.bytes}`);
    console.error(`  Actual:   ${actualBytes}`);
    hasError = true;
  } else {
    console.log(`[PASS] ${filename}: SHA-256 ${actualSha.slice(0, 16)}... (${actualBytes} bytes) matches pinned reference.`);
  }
}

if (hasError) {
  console.error('\nReference contract verification FAILED.');
  process.exit(1);
} else {
  console.log('\nAll reference contracts verified byte-for-byte identical to pinned sources.');
}
