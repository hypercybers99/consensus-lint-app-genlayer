import fs from 'fs';
import path from 'path';

for (const fname of ['ConsensusLint.py', 'HygieneBadges.py']) {
  const content = fs.readFileSync(path.join('contracts-reference', fname), 'utf8');
  console.log(`=== ${fname} Reverts ===`);
  const regex = /gl\.vm\.UserError\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  const reverts = new Set();
  while ((match = regex.exec(content)) !== null) {
    reverts.add(match[1]);
  }
  for (const r of [...reverts].sort()) {
    console.log(`  "${r}"`);
  }
}
