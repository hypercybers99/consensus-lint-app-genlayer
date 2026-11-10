// scripts/capture_screenshots.mjs
// Captures curated desktop (1440x900) and mobile (390x844) screenshots across all 9 routes
// Verifies all images are under 1 MB.

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PROD_URL = process.env.PROD_URL || 'https://consensus-lint-app-genlayer.vercel.app';
const OUT_DIR = path.resolve('docs', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/board', name: 'board' },
  { path: '/register', name: 'register' },
  { path: '/t/c74c8288839d', name: 'target_detail' },
  { path: '/rules', name: 'rules' },
  { path: '/badges', name: 'badges' },
  { path: '/method', name: 'methodology' },
  { path: '/evidence', name: 'evidence' },
  { path: '/wallet', name: 'wallet' },
];

async function main() {
  console.log('=== CAPTURING CURATED SCREENSHOTS ===');
  console.log('Target URL:', PROD_URL);

  const browser = await chromium.launch();
  const captured = [];

  for (const r of ROUTES) {
    const fullUrl = `${PROD_URL}${r.path}`;
    console.log(`\nCapturing: ${r.name} (${fullUrl})...`);

    // 1. Desktop 1440x900
    const pageDesk = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await pageDesk.goto(fullUrl);
    await pageDesk.waitForLoadState('networkidle');
    const deskPath = path.join(OUT_DIR, `${r.name}_desktop_1440.png`);
    await pageDesk.screenshot({ path: deskPath, fullPage: false });
    const deskSize = fs.statSync(deskPath).size;
    captured.push({ name: `${r.name}_desktop_1440`, path: deskPath, size: deskSize });
    console.log(`  [OK] Desktop: ${deskSize} bytes`);
    await pageDesk.close();

    // 2. Mobile 390x844
    const pageMob = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    await pageMob.goto(fullUrl);
    await pageMob.waitForLoadState('networkidle');
    const mobPath = path.join(OUT_DIR, `${r.name}_mobile_390.png`);
    await pageMob.screenshot({ path: mobPath, fullPage: false });
    const mobSize = fs.statSync(mobPath).size;
    captured.push({ name: `${r.name}_mobile_390`, path: mobPath, size: mobSize });
    console.log(`  [OK] Mobile: ${mobSize} bytes`);
    await pageMob.close();
  }

  await browser.close();

  console.log('\n=== SCREENSHOT CAPTURE SUMMARY ===');
  let overLimit = 0;
  for (const item of captured) {
    const isOver = item.size > 1024 * 1024;
    if (isOver) overLimit++;
    console.log(`${item.name}.png: ${(item.size / 1024).toFixed(1)} KB ${isOver ? '[EXCEEDS 1MB!]' : '[OK]'}`);
  }

  if (overLimit > 0) {
    console.error(`ERROR: ${overLimit} screenshots exceed 1 MB limit!`);
    process.exit(1);
  }
  console.log(`\nAll ${captured.length} screenshots saved under docs/screenshots (all < 1 MB).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
