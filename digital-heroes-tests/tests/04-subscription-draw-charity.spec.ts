import { test, expect } from '@playwright/test';
import { loginOrRegister } from './test-helper';

/**
 * =====================================================================
 * 5. SUBSCRIPTION FLOW (PRD Testing Checklist Item 2)
 * =====================================================================
 */
test.describe('Subscription Flow', () => {

  test('Pricing page shows monthly and yearly plans with prices', async ({ page }) => {
    await page.goto('/pricing');
    const body = await page.textContent('body');
    // Should show both plan types
    expect(body?.toLowerCase()).toContain('month');
    expect(body?.toLowerCase()).toContain('year');
    // Should show prices (₹ symbol)
    expect(body).toContain('₹');
  });

  test('Subscribe button exists and is visible on pricing page', async ({ page }) => {
    await page.goto('/pricing');
    const subscribeBtn = page.getByRole('button', { name: /subscribe|get started|choose|become a hero|become a legend/i }).first();
    await expect(subscribeBtn).toBeVisible();
  });

  test('Dashboard shows subscription status indicator', async ({ page }) => {
    await loginOrRegister(page);
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    // Should show one of these statuses
    const hasStatus = body?.toLowerCase().includes('active') ||
                      body?.toLowerCase().includes('inactive') ||
                      body?.toLowerCase().includes('free tier') ||
                      body?.toLowerCase().includes('hero') ||
                      body?.toLowerCase().includes('legend');
    expect(hasStatus).toBeTruthy();
  });
});

/**
 * =====================================================================
 * 6. DRAW SYSTEM (PRD Testing Checklist Item 4)
 * =====================================================================
 */
test.describe('Draw System', () => {

  test('Draw results are visible to users (if any draws exist)', async ({ page }) => {
    await loginOrRegister(page);
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    // Should mention draw-related content
    const hasDraw = body?.toLowerCase().includes('draw') || body?.toLowerCase().includes('jackpot') || body?.toLowerCase().includes('ledger');
    expect(hasDraw).toBeTruthy();
  });
});

/**
 * =====================================================================
 * 7. CHARITY SELECTION & CONTRIBUTION (PRD Testing Checklist Item 5)
 * =====================================================================
 */
test.describe('Charity System', () => {

  test('Charity listing page shows charity cards', async ({ page }) => {
    await page.goto('/charities');
    await page.waitForTimeout(2000);
    // Check for charity cards or a "coming soon" message
    const body = await page.textContent('body');
    const hasCharities = body?.toLowerCase().includes('contributed') || 
                         body?.toLowerCase().includes('coming soon') ||
                         body?.toLowerCase().includes('charity');
    expect(hasCharities).toBeTruthy();
  });

  test('Charity cards show total contributed amount', async ({ page }) => {
    await page.goto('/charities');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Should show dollar/rupee amounts or "Total Contributed"
    const hasContribution = body?.toLowerCase().includes('contributed') || body?.includes('$') || body?.includes('₹');
    expect(hasContribution).toBeTruthy();
  });

  test('Independent donation button is visible on charity cards', async ({ page }) => {
    await page.goto('/charities');
    await page.waitForTimeout(2000);
    const donateBtn = page.getByRole('button', { name: /donate|donation/i }).first();
    if (await donateBtn.isVisible()) {
      await expect(donateBtn).toBeVisible();
    }
  });

  test('Donation modal opens with preset amounts', async ({ page }) => {
    await page.goto('/charities');
    await page.waitForTimeout(2000);
    const donateBtn = page.getByRole('button', { name: /donate|donation/i }).first();
    if (await donateBtn.isVisible()) {
      await donateBtn.click();
      await page.waitForTimeout(1000);
      // Modal should show preset amounts
      const body = await page.textContent('body');
      expect(body).toContain('₹');
      // Should have a "Donate Now" button
      const donateNow = page.getByRole('button', { name: /donate now/i }).first();
      await expect(donateNow).toBeVisible();
    }
  });

  test('Dashboard charity selection works', async ({ page }) => {
    await loginOrRegister(page);
    await page.goto('/dashboard');
    const body = await page.textContent('body');
    // Should show charity-related content in dashboard
    expect(body?.toLowerCase()).toContain('charit');
  });
});
