// scripts/run_real_lighthouse.mjs
// Runs real Lighthouse 13 CLI audits against production deployment
// Saves raw outputs in docs/lighthouse/ and summary in docs/lighthouse_summary.json

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROD_URL = process.env.PROD_URL || 'https://consensus-lint-app-genlayer.vercel.app';
const OUT_DIR = path.resolve('docs', 'lighthouse');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const ROUTES = [
  { path: '', name: 'home' },
  { path: '/board', name: 'board' },
  { path: '/register', name: 'register' },
  { path: '/rules', name: 'rules' },
  { path: '/evidence', name: 'evidence' },
  { path: '/badges', name: 'badges' },
];

console.log('=== RUNNING REAL LIGHTHOUSE AUDITS ON PRODUCTION ===');
console.log('Target URL:', PROD_URL);

const summaryEntries = [];

for (const route of ROUTES) {
  const targetUrl = `${PROD_URL}${route.path}`;

  // 1. Mobile Run
  const mobileFile = path.join(OUT_DIR, `${route.name}_mobile.json`);
  console.log(`\n[Lighthouse] Running Mobile: ${targetUrl}...`);
  try {
    execSync(
      `npx lighthouse ${targetUrl} --output=json --output-path="${mobileFile}" --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox --disable-gpu" --form-factor=mobile --quiet`,
      { stdio: 'inherit' }
    );
    const reportMobile = JSON.parse(fs.readFileSync(mobileFile, 'utf-8'));
    summaryEntries.push({
      route: route.path || '/',
      name: route.name,
      device: 'mobile',
      scores: {
        performance: Math.round((reportMobile.categories.performance?.score || 0) * 100),
        accessibility: Math.round((reportMobile.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((reportMobile.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((reportMobile.categories.seo?.score || 0) * 100),
      },
      fcpMs: reportMobile.audits?.['first-contentful-paint']?.numericValue || null,
      lcpMs: reportMobile.audits?.['largest-contentful-paint']?.numericValue || null,
    });
  } catch (e) {
    console.error(`Mobile audit failed for ${route.name}:`, e.message);
  }

  // 2. Desktop Run
  const desktopFile = path.join(OUT_DIR, `${route.name}_desktop.json`);
  console.log(`[Lighthouse] Running Desktop: ${targetUrl}...`);
  try {
    execSync(
      `npx lighthouse ${targetUrl} --output=json --output-path="${desktopFile}" --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox --disable-gpu" --preset=desktop --quiet`,
      { stdio: 'inherit' }
    );
    const reportDesktop = JSON.parse(fs.readFileSync(desktopFile, 'utf-8'));
    summaryEntries.push({
      route: route.path || '/',
      name: route.name,
      device: 'desktop',
      scores: {
        performance: Math.round((reportDesktop.categories.performance?.score || 0) * 100),
        accessibility: Math.round((reportDesktop.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((reportDesktop.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((reportDesktop.categories.seo?.score || 0) * 100),
      },
      fcpMs: reportDesktop.audits?.['first-contentful-paint']?.numericValue || null,
      lcpMs: reportDesktop.audits?.['largest-contentful-paint']?.numericValue || null,
    });
  } catch (e) {
    console.error(`Desktop audit failed for ${route.name}:`, e.message);
  }
}

const summaryDoc = {
  auditedAt: new Date().toISOString(),
  targetUrl: PROD_URL,
  totalAudits: summaryEntries.length,
  results: summaryEntries,
};

fs.writeFileSync(
  path.resolve('docs', 'lighthouse_summary.json'),
  JSON.stringify(summaryDoc, null, 2),
  'utf-8'
);

console.log('\n=== REAL LIGHTHOUSE AUDITS COMPLETE ===');
console.log(`Saved summary of ${summaryEntries.length} audits to docs/lighthouse_summary.json`);
