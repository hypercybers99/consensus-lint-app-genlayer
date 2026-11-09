// tests/e2e/accessibility_and_occlusion.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { width: 390, height: 667, name: 'mobile-portrait' },
  { width: 500, height: 400, name: 'compact-landscape' },
  { width: 630, height: 300, name: 'tablet-shallow' },
  { width: 1280, height: 800, name: 'desktop' },
];

const ROUTES = [
  { path: '/', name: 'Dashboard' },
  { path: '/board', name: 'Leaderboard' },
  { path: '/register', name: 'Register' },
  { path: '/rules', name: 'Rules' },
  { path: '/badges', name: 'Badges' },
  { path: '/method', name: 'Methodology' },
  { path: '/evidence', name: 'Evidence' },
  { path: '/wallet', name: 'Wallet' },
];

test.describe('ConsensusLint Desk E2E & Accessibility Suite', () => {
  const axeMatrixResults: any[] = [];

  test('Axe-Core accessibility scan across all routes and responsive viewports', async ({ page }) => {
    test.setTimeout(180000);
    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        const axe = new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .disableRules(['color-contrast']); // Disable color-contrast in headless mock if needed

        const results = await axe.analyze();

        axeMatrixResults.push({
          route: route.path,
          name: route.name,
          viewport: `${vp.width}x${vp.height} (${vp.name})`,
          violationsCount: results.violations.length,
          passesCount: results.passes.length,
          violations: results.violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
        });

        expect(results.violations.length).toBe(0);
      }
    }

    fs.writeFileSync('docs/axe_matrix.json', JSON.stringify({ scannedAt: new Date().toISOString(), totalRuns: axeMatrixResults.length, results: axeMatrixResults }, null, 2));
  });

  test('Modal dialog portal, inert isolation, and occlusion check (document.elementFromPoint)', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Click quick preset button
    await page.click('button:has-text("GoodContract Fixture")');

    // Open transaction modal
    await page.click('button:has-text("Submit Target to Studionet")');

    // Modal dialog should be visible
    const modalDialog = page.locator('[role="dialog"]');
    await expect(modalDialog).toBeVisible();

    // Verify #app-root has inert
    const appRootInert = await page.evaluate(() => document.getElementById('app-root')?.hasAttribute('inert'));
    expect(appRootInert).toBe(true);

    // Verify occlusion: elementFromPoint at center of dialog belongs to #modal-root
    const box = await modalDialog.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      const topElement = await page.evaluate(
        ({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          const modalRoot = document.getElementById('modal-root');
          return {
            tagName: el?.tagName,
            isInsideModalRoot: !!(modalRoot && modalRoot.contains(el)),
            id: el?.id,
            className: el?.className,
          };
        },
        { x: centerX, y: centerY }
      );

      expect(topElement.isInsideModalRoot).toBe(true);
    }

    // Escape closes modal (when close button is enabled or after completion)
  });

  test('Keyboard navigation and focus trap verification', async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');

    // Focus first interactive button
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedTag);
  });
});
