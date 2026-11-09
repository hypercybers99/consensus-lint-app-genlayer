// scripts/scan_ascii.mjs
// Verifies all code and script files contain only pure ASCII characters (0 - 127)

import fs from 'fs';
import path from 'path';

const SCAN_DIRS = ['src', 'scripts', 'tests'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json', '.html', '.css'];

let violations = 0;
let scannedFiles = 0;

function scanPath(targetPath) {
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const f of files) {
      if (f === 'node_modules' || f === 'dist' || f === '.git' || f === 'contracts-reference') continue;
      scanPath(path.join(targetPath, f));
    }
  } else if (stat.isFile()) {
    const ext = path.extname(targetPath);
    if (!SCAN_EXTENSIONS.includes(ext)) return;

    scannedFiles++;
    const content = fs.readFileSync(targetPath);
    for (let i = 0; i < content.length; i++) {
      if (content[i] > 127) {
        console.error(`[FAIL] Non-ASCII byte 0x${content[i].toString(16)} at index ${i} in ${targetPath}`);
        violations++;
        break;
      }
    }
  }
}

console.log('=== RUNNING PURE ASCII SCAN ===');
for (const dir of SCAN_DIRS) {
  if (fs.existsSync(dir)) scanPath(path.resolve(dir));
}
scanPath(path.resolve('index.html'));

if (violations > 0) {
  console.error(`\nASCII Scan FAILED: ${violations} file(s) contained non-ASCII characters.`);
  process.exit(1);
} else {
  console.log(`[PASS] Pure ASCII scan verified ${scannedFiles} files without violations.`);
}
