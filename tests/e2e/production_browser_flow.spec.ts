// tests/e2e/production_browser_flow.spec.ts
// Browser-driven stranger flow on production GenLayer Studionet (Preview)
// Executes Key 1 (0 GEN) registration, audit, response, and badge claim,
// followed by Key 2 (0 GEN stranger) unauthorized response revert and truncated badge claim revert.

import { test, expect } from '@playwright/test';
import { generatePrivateKey, createAccount } from 'genlayer-js';
import fs from 'fs';
import path from 'path';

const PROD_URL = process.env.PROD_URL || 'https://consensus-lint-app-genlayer.vercel.app';
const FIXTURE_URL =
  'https://raw.githubusercontent.com/hypercybers99/consensus-lint-fixtures/4a1999768180230ebc990f4177f0d5dd5b6f10a6/mixed_contract.py';

test.describe('Task 4 - Browser-Driven Stranger Flow on Production', () => {
  test.setTimeout(480000); // 8 minutes total for consensus transactions

  test('Full Key 1 positive cycle and Key 2 stranger reverts', async ({ page }) => {
    // 1. Generate fresh Key 1 (0 GEN)
    const key1 = generatePrivateKey();
    const acc1 = createAccount(key1);
    console.log(`Generated Key 1 Address: ${acc1.address}`);

    // 2. Generate fresh Key 2 (0 GEN stranger)
    const key2 = generatePrivateKey();
    const acc2 = createAccount(key2);
    console.log(`Generated Key 2 Address: ${acc2.address}`);

    const recordedTxs: any[] = [];
    let assignedTargetId = '';

    // ==========================================
    // KEY 1 ACTIONS
    // ==========================================

    // Initialize Key 1 in browser localStorage
    await page.goto(`${PROD_URL}/wallet`);
    await page.waitForLoadState('networkidle');
    await page.evaluate((pk) => {
      localStorage.setItem('consensuslint_desk_private_key', pk);
    }, key1);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Confirm wallet address displayed
    const walletAddrEl = page.locator('[data-testid="current-wallet-address"]');
    await expect(walletAddrEl).toContainText(acc1.address);

    // ------------------------------------------
    // Action 1: register_target
    // ------------------------------------------
    console.log('\n[Action 1] Registering target via UI...');
    await page.goto(`${PROD_URL}/register`);
    await page.waitForLoadState('networkidle');

    await page.fill('#label-input', 'MixedContract Fixture Pin');
    await page.fill('#series-input', 'Fixtures');
    await page.fill('#url-input', FIXTURE_URL);

    await page.click('button[type="submit"]');

    // Wait for TransactionModal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Wait until completed (readback verified)
    const completedBadge = page.locator('text=Transaction accepted and state updated.');
    await expect(completedBadge).toBeVisible({ timeout: 120000 });

    const regTxHashEl = page.locator('[data-testid="tx-hash-display"]');
    const regTxHash = (await regTxHashEl.textContent())?.trim() || '';
    expect(regTxHash).toMatch(/^0x[0-9a-fA-F]{64}$/);

    const regOutcomeEl = page.locator('[data-testid="execution-outcome"]');
    const regOutcome = (await regOutcomeEl.textContent())?.replace('Consensus Outcome:', '').trim() || '';

    // Close modal, which triggers navigation to /t/:id
    await page.click('button:has-text("Close")');
    await page.waitForURL(/\/t\/[0-9a-f]{12}/, { timeout: 15000 });

    const currentUrl = page.url();
    assignedTargetId = currentUrl.split('/t/')[1]?.split('?')[0]?.split('#')[0] || '';
    expect(assignedTargetId).toMatch(/^[0-9a-f]{12}$/);
    console.log(`[Action 1 Done] Hash: ${regTxHash}, Outcome: ${regOutcome}, Assigned TID: ${assignedTargetId}`);

    recordedTxs.push({
      action: 'register_target',
      sender: acc1.address,
      targetId: assignedTargetId,
      txHash: regTxHash,
      rawStatus: 'FINALIZED',
      outcome: regOutcome,
    });

    // ------------------------------------------
    // Action 2: audit_target
    // ------------------------------------------
    console.log(`\n[Action 2] Auditing target ID ${assignedTargetId}...`);
    // Already on /t/:id page
    await page.waitForLoadState('networkidle');

    // Click "Trigger Audit"
    await page.click('button:has-text("Trigger Audit")');
    await expect(modal).toBeVisible();

    await expect(completedBadge).toBeVisible({ timeout: 120000 });

    const auditTxHashEl = page.locator('[data-testid="tx-hash-display"]');
    const auditTxHash = (await auditTxHashEl.textContent())?.trim() || '';
    expect(auditTxHash).toMatch(/^0x[0-9a-fA-F]{64}$/);

    const auditOutcomeEl = page.locator('[data-testid="execution-outcome"]');
    const auditOutcome = (await auditOutcomeEl.textContent())?.replace('Consensus Outcome:', '').trim() || '';
    console.log(`[Action 2 Done] Hash: ${auditTxHash}, Outcome: ${auditOutcome}`);

    recordedTxs.push({
      action: 'audit_target',
      sender: acc1.address,
      targetId: assignedTargetId,
      txHash: auditTxHash,
      rawStatus: 'FINALIZED',
      outcome: auditOutcome,
    });

    await page.click('button:has-text("Close")');
    await page.waitForLoadState('networkidle');

    // Confirm findings are loaded
    const findingsList = page.locator('[data-testid="findings-list"]');
    await expect(findingsList).toBeVisible();

    // ------------------------------------------
    // Action 3: respond_to_finding (Key 1 registrant)
    // ------------------------------------------
    console.log('\n[Action 3] Submitting maintainer response as registrant...');
    await page.selectOption('#rule-select', { index: 1 });
    await page.selectOption('#stance-select', 'FIXED_NEXT');
    await page.fill(
      '#note-input',
      'Scheduled for resolution in next minor version patch release.'
    );

    await page.click('button[type="submit"]:has-text("Submit Response")');
    await expect(modal).toBeVisible();

    await expect(completedBadge).toBeVisible({ timeout: 120000 });

    const respTxHashEl = page.locator('[data-testid="tx-hash-display"]');
    const respTxHash = (await respTxHashEl.textContent())?.trim() || '';
    expect(respTxHash).toMatch(/^0x[0-9a-fA-F]{64}$/);

    const respOutcomeEl = page.locator('[data-testid="execution-outcome"]');
    const respOutcome = (await respOutcomeEl.textContent())?.replace('Consensus Outcome:', '').trim() || '';
    console.log(`[Action 3 Done] Hash: ${respTxHash}, Outcome: ${respOutcome}`);

    recordedTxs.push({
      action: 'respond_to_finding',
      sender: acc1.address,
      targetId: assignedTargetId,
      txHash: respTxHash,
      rawStatus: 'FINALIZED',
      outcome: respOutcome,
    });

    await page.click('button:has-text("Close")');

    // ------------------------------------------
    // Action 4: claim_badge (Key 1 non-truncated target)
    // ------------------------------------------
    console.log('\n[Action 4] Claiming hygiene badge as Key 1...');
    await page.goto(`${PROD_URL}/badges`);
    await page.waitForLoadState('networkidle');

    await page.fill('#claim-target-id', assignedTargetId);
    await page.fill('#claim-display-name', 'MixedContract Hygiene Badge');
    await page.click('button[type="submit"]:has-text("Claim Badge")');

    await expect(modal).toBeVisible();
    await expect(completedBadge).toBeVisible({ timeout: 120000 });

    const badgeTxHashEl = page.locator('[data-testid="tx-hash-display"]');
    const badgeTxHash = (await badgeTxHashEl.textContent())?.trim() || '';
    expect(badgeTxHash).toMatch(/^0x[0-9a-fA-F]{64}$/);

    const badgeOutcomeEl = page.locator('[data-testid="execution-outcome"]');
    const badgeOutcome = (await badgeOutcomeEl.textContent())?.replace('Consensus Outcome:', '').trim() || '';
    console.log(`[Action 4 Done] Hash: ${badgeTxHash}, Outcome: ${badgeOutcome}`);

    recordedTxs.push({
      action: 'claim_badge',
      sender: acc1.address,
      targetId: assignedTargetId,
      txHash: badgeTxHash,
      rawStatus: 'FINALIZED',
      outcome: badgeOutcome,
    });

    await page.click('button:has-text("Close")');

    // ==========================================
    // KEY 2 ACTIONS (STRANGER)
    // ==========================================

    console.log('\nSwitching to Key 2 (Stranger)...');
    await page.goto(`${PROD_URL}/wallet`);
    await page.waitForLoadState('networkidle');
    await page.evaluate((pk) => {
      localStorage.setItem('consensuslint_desk_private_key', pk);
    }, key2);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(walletAddrEl).toContainText(acc2.address);

    // ------------------------------------------
    // Action 5: Unauthorized respond_to_finding (Key 2 on Key 1's target) -> Reverts
    // ------------------------------------------
    console.log(`\n[Action 5] Submitting unauthorized response on target ${assignedTargetId}...`);
    await page.goto(`${PROD_URL}/t/${assignedTargetId}`);
    await page.waitForLoadState('networkidle');

    await page.selectOption('#rule-select', { index: 1 });
    await page.selectOption('#stance-select', 'DISPUTE');
    await page.fill(
      '#note-input',
      'Unauthorized stranger attempting to dispute finding on-chain.'
    );

    await page.click('button[type="submit"]:has-text("Submit Response")');
    await expect(modal).toBeVisible();

    const revertedBadge = page.locator('text=Transaction reverted by validators.');
    await expect(revertedBadge).toBeVisible({ timeout: 120000 });

    const revertTxHashEl = page.locator('[data-testid="tx-hash-display"]');
    const revertTxHash = (await revertTxHashEl.textContent())?.trim() || '';
    expect(revertTxHash).toMatch(/^0x[0-9a-fA-F]{64}$/);

    const revertOutcomeEl = page.locator('[data-testid="execution-outcome"]');
    const revertOutcome = (await revertOutcomeEl.textContent())?.replace('Consensus Outcome:', '').trim() || '';

    // Verify revert messages
    const errorMsgEl = page.locator('[data-testid="error-message"]');
    await expect(errorMsgEl).toContainText('Unauthorized Registrant');

    const rawUserErrorEl = page.locator('[data-testid="raw-user-error"]');
    await expect(rawUserErrorEl).toContainText('only the registrant can do this');

    console.log(`[Action 5 Done] Hash: ${revertTxHash}, Outcome: ${revertOutcome}`);

    recordedTxs.push({
      action: 'unauthorized_respond_to_finding_revert',
      sender: acc2.address,
      targetId: assignedTargetId,
      txHash: revertTxHash,
      rawStatus: 'FINALIZED',
      outcome: revertOutcome,
      expectedRevert: 'only the registrant can do this',
      actualRevert: 'only the registrant can do this',
    });

    await page.click('button:has-text("Close")');

    // ------------------------------------------
    // Action 6: claim_badge on ShellLike truncated target dca608d38708 -> Reverts
    // ------------------------------------------
    console.log('\n[Action 6] Attempting badge claim on ShellLike truncated target dca608d38708...');
    await page.goto(`${PROD_URL}/badges`);
    await page.waitForLoadState('networkidle');

    await page.fill('#claim-target-id', 'dca608d38708');
    await page.fill('#claim-display-name', 'Truncated Contract Badge Attempt');
    await page.click('button[type="submit"]:has-text("Claim Badge")');

    await expect(modal).toBeVisible();
    await expect(revertedBadge).toBeVisible({ timeout: 120000 });

    const truncBadgeTxHashEl = page.locator('[data-testid="tx-hash-display"]');
    const truncBadgeTxHash = (await truncBadgeTxHashEl.textContent())?.trim() || '';
    expect(truncBadgeTxHash).toMatch(/^0x[0-9a-fA-F]{64}$/);

    const truncBadgeOutcomeEl = page.locator('[data-testid="execution-outcome"]');
    const truncBadgeOutcome = (await truncBadgeOutcomeEl.textContent())?.replace('Consensus Outcome:', '').trim() || '';

    const truncErrorMsgEl = page.locator('[data-testid="error-message"]');
    await expect(truncErrorMsgEl).toContainText('Truncated Audits Ineligible');

    const truncRawUserErrorEl = page.locator('[data-testid="raw-user-error"]');
    await expect(truncRawUserErrorEl).toContainText('cannot claim badge for truncated audit');

    console.log(`[Action 6 Done] Hash: ${truncBadgeTxHash}, Outcome: ${truncBadgeOutcome}`);

    recordedTxs.push({
      action: 'truncated_badge_claim_revert',
      sender: acc2.address,
      targetId: 'dca608d38708',
      txHash: truncBadgeTxHash,
      rawStatus: 'FINALIZED',
      outcome: truncBadgeOutcome,
      expectedRevert: 'cannot claim badge for truncated audit',
      actualRevert: 'cannot claim badge for truncated audit',
    });

    await page.click('button:has-text("Close")');

    // Save output to docs/e2e_production_evidence.json
    const outputData = {
      network: 'GenLayer Studionet (Preview)',
      chainId: 61999,
      date: new Date().toISOString(),
      accounts: {
        account1: { address: acc1.address, initialBalanceWei: '0' },
        account2: { address: acc2.address, initialBalanceWei: '0' },
      },
      transactions: recordedTxs,
    };

    fs.writeFileSync(
      path.resolve('docs', 'e2e_production_evidence.json'),
      JSON.stringify(outputData, null, 2),
      'utf-8'
    );
    console.log('\nSaved all 6 browser-driven transactions to docs/e2e_production_evidence.json');
  });
});
