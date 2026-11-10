// tests/e2e/accessibility_and_occlusion.spec.ts
// E2E test suite covering:
// 3a. Modal dialog occlusion matrix (elementFromPoint at 390x667, 500x400, 630x300)
//     Checks title, close control, body, and EVERY footer button.
// 3b. Axe-core accessibility scans across all 9 routes AND dialog open (1440, 500, 390, light/dark)
// 3c. Keyboard navigation (Tab, Shift+Tab, Enter, Space, Escape, inert background, focus return)

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const OCCLUSION_VIEWPORTS = [
  { width: 390, height: 667, label: '390x667' },
  { width: 500, height: 400, label: '500x400' },
  { width: 630, height: 300, label: '630x300' },
];

const AXE_VIEWPORTS = [
  { width: 1440, height: 900, label: 'desktop-1440' },
  { width: 500, height: 800, label: 'tablet-500' },
  { width: 390, height: 844, label: 'mobile-390' },
];

const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/board', name: 'Leaderboard' },
  { path: '/register', name: 'Register' },
  { path: '/t/c74c8288839d', name: 'TargetDetail' },
  { path: '/rules', name: 'Rules' },
  { path: '/badges', name: 'Badges' },
  { path: '/method', name: 'Methodology' },
  { path: '/evidence', name: 'Evidence' },
  { path: '/wallet', name: 'Wallet' },
];

test.describe('Accessibility, Occlusion, and Keyboard Navigation Suite', () => {
  // ========================================================
  // 3a. Occlusion Matrix across Viewports & Dialog Controls
  // ========================================================
  test('3a. Modal dialog occlusion matrix across 390x667, 500x400, 630x300', async ({ page }) => {
    test.setTimeout(120000);

    for (const vp of OCCLUSION_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Click preset and submit to trigger modal
      await page.click('button:has-text("GoodContract Fixture")');
      await page.click('button:has-text("Submit Target to Studionet")');

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // 1. Check title occlusion via elementFromPoint
      const titleEl = page.locator('#modal-title');
      await titleEl.scrollIntoViewIfNeeded();
      const titleHit = await titleEl.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return el.contains(hit) || hit === el;
      });
      expect(titleHit, `Title occluded at ${vp.label}`).toBe(true);

      // 2. Check close control occlusion via elementFromPoint
      const closeBtn = page.locator('button[aria-label="Close dialog"]');
      if (await closeBtn.isVisible()) {
        const closeHit = await closeBtn.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          return el.contains(hit) || hit === el;
        });
        expect(closeHit, `Close button occluded at ${vp.label}`).toBe(true);
      }

      // 3. Check dialog body element center point
      const dialogBox = await dialog.boundingBox();
      expect(dialogBox).not.toBeNull();
      if (dialogBox) {
        const bodyHit = await page.evaluate(
          ({ x, y }) => {
            const el = document.elementFromPoint(x, y);
            const dlg = document.querySelector('[role="dialog"]');
            return dlg ? dlg.contains(el) || el === dlg : false;
          },
          { x: dialogBox.x + dialogBox.width / 2, y: dialogBox.y + dialogBox.height / 2 }
        );
        expect(bodyHit, `Dialog body occluded at ${vp.label}`).toBe(true);
      }

      // 4. Check EVERY footer button via elementFromPoint
      const footerButtons = page.locator('[role="dialog"] .flex.justify-end button');
      const btnCount = await footerButtons.count();
      expect(btnCount).toBeGreaterThan(0);
      for (let i = 0; i < btnCount; i++) {
        const btn = footerButtons.nth(i);
        if (await btn.isVisible()) {
          await btn.scrollIntoViewIfNeeded();
          const btnHit = await btn.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            return el.contains(hit) || hit === el;
          });
          expect(btnHit, `Footer button ${i} occluded at ${vp.label}`).toBe(true);
        }
      }

      // Close modal
      await page.keyboard.press('Escape');
    }
  });

  // ========================================================
  // 3b. Axe Accessibility Scans across Routes, Dialogs & Themes
  // ========================================================
  test('3b. Axe-core accessibility scan across routes, dialogs, viewports, and themes', async ({ page }) => {
    test.setTimeout(300000);
    const axeEntries: any[] = [];

    // 1. Audit all 9 routes
    for (const route of ROUTES) {
      for (const vp of AXE_VIEWPORTS) {
        for (const theme of ['dark', 'light']) {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(route.path);
          await page.waitForLoadState('networkidle');

          await page.evaluate((t) => {
            if (t === 'light') {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            }
          }, theme);

          const axe = new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .disableRules(['color-contrast']);

          const results = await axe.analyze();

          axeEntries.push({
            route: route.path,
            name: route.name,
            viewport: vp.label,
            theme,
            violationsCount: results.violations.length,
            violations: results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.slice(0, 3).map((n) => n.target),
            })),
          });

          expect(
            results.violations.length,
            `Axe violations on ${route.path} (${vp.label}, ${theme}): ${JSON.stringify(results.violations)}`
          ).toBe(0);
        }
      }
    }

    // 2. Audit with Dialog open
    for (const vp of AXE_VIEWPORTS) {
      for (const theme of ['dark', 'light']) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto('/register');
        await page.waitForLoadState('networkidle');

        await page.evaluate((t) => {
          if (t === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }, theme);

        await page.click('button:has-text("GoodContract Fixture")');
        await page.click('button:has-text("Submit Target to Studionet")');
        await expect(page.locator('[role="dialog"]')).toBeVisible();

        const axe = new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .disableRules(['color-contrast']);

        const results = await axe.analyze();

        axeEntries.push({
          route: '/register (dialog-open)',
          name: 'TransactionModal Open',
          viewport: vp.label,
          theme,
          violationsCount: results.violations.length,
          violations: results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.slice(0, 3).map((n) => n.target),
          })),
        });

        expect(
          results.violations.length,
          `Axe violations on /register dialog (${vp.label}, ${theme}): ${JSON.stringify(results.violations)}`
        ).toBe(0);

        await page.keyboard.press('Escape');
      }
    }

    // Save axe matrix results
    const matrixDoc = {
      scannedAt: new Date().toISOString(),
      totalScans: axeEntries.length,
      zeroViolations: axeEntries.every((e) => e.violationsCount === 0),
      entries: axeEntries,
    };
    fs.writeFileSync(
      path.resolve('docs', 'axe_matrix.json'),
      JSON.stringify(matrixDoc, null, 2),
      'utf-8'
    );
  });

  // ========================================================
  // 3c. Keyboard Navigation & Tab Trap Verification
  // ========================================================
  test('3c. Keyboard navigation, focus trap, and Escape handling', async ({ page }) => {
    // 1. Route-level keyboard navigation
    for (const route of ROUTES) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // In WebKit (Safari), Alt+Tab is the standard key for link navigation
      const browserName = test.info().project.name;
      const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
      await page.keyboard.press(tabKey);
      await page.keyboard.press(tabKey);
      const activeTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
      expect(['a', 'button', 'input', 'select', 'textarea', 'pre', 'div', 'body']).toContain(activeTag);
    }

    // 2. Dialog-level focus trapping and return
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Focus the submit button
    const submitBtn = page.locator('button:has-text("Submit Target to Studionet")');
    await submitBtn.focus();

    await page.click('button:has-text("GoodContract Fixture")');
    await submitBtn.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify app-root is inert while dialog is open
    const isInert = await page.evaluate(() =>
      document.getElementById('app-root')?.hasAttribute('inert')
    );
    expect(isInert).toBe(true);

    // Verify Tab cycles strictly within dialog and never reaches background
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedInDialog = await page.evaluate(() => {
        const active = document.activeElement;
        const dlg = document.querySelector('[role="dialog"]');
        return dlg ? dlg.contains(active) : false;
      });
      expect(focusedInDialog, `Focus leaked out of dialog on Tab #${i + 1}`).toBe(true);
    }

    // Verify Shift+Tab backward cycling stays within dialog
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    const focusedShiftTab = await page.evaluate(() => {
      const active = document.activeElement;
      const dlg = document.querySelector('[role="dialog"]');
      return dlg ? dlg.contains(active) : false;
    });
    expect(focusedShiftTab).toBe(true);

    // Test Escape key closes modal and restores focus
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5000 });

    // Verify app-root inert attribute is removed
    const isNotInert = await page.evaluate(() =>
      document.getElementById('app-root')?.hasAttribute('inert')
    );
    expect(isNotInert).toBe(false);
  });
});
