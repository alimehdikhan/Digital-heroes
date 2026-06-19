import { test, expect } from '@playwright/test';
import { loginOrRegister } from './test-helper';

/**
 * =====================================================================
 * 3. USER DASHBOARD — All Modules Functional (PRD Testing Checklist Item 7)
 * =====================================================================
 */
test.describe('User Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginOrRegister(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(3000); // Wait for framer-motion animations
  });

  test('Dashboard shows subscription status', async ({ page }) => {
    const body = await page.textContent('body');
    const hasSubStatus = body?.toLowerCase().includes('active') || 
                         body?.toLowerCase().includes('inactive') ||
                         body?.toLowerCase().includes('subscription') ||
                         body?.toLowerCase().includes('free tier') ||
                         body?.toLowerCase().includes('hero');
    expect(hasSubStatus).toBeTruthy();
  });

  test('Dashboard shows score entry section', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('score');
  });

  test('Dashboard shows charity selection section', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('charit');
  });

  test('Dashboard shows winnings ledger', async ({ page }) => {
    const body = await page.textContent('body');
    // The section is called "Winnings Ledger" or shows "No winnings yet"
    const hasWinnings = body?.toLowerCase().includes('ledger') || 
                        body?.toLowerCase().includes('winnings') ||
                        body?.toLowerCase().includes('no winnings');
    expect(hasWinnings).toBeTruthy();
  });

  test('Dashboard shows draw participation', async ({ page }) => {
    const body = await page.textContent('body');
    const hasDraw = body?.toLowerCase().includes('draw') || body?.toLowerCase().includes('participation');
    expect(hasDraw).toBeTruthy();
  });
});

/**
 * =====================================================================
 * 4. SCORE ENTRY — 5-Score Rolling Logic (PRD Testing Checklist Item 3)
 * =====================================================================
 */
test.describe('Score Entry System', () => {

  test.beforeEach(async ({ page }) => {
    await loginOrRegister(page);
  });

  test('Score entry page loads with correct form fields', async ({ page }) => {
    await page.goto('/scores/new');
    await page.waitForTimeout(3000);
    // Score input (named "score", type number, 1-45)
    const scoreInput = page.locator('input[name="score"]');
    await expect(scoreInput).toBeVisible();
    // Date input (named "date")
    const dateInput = page.locator('input[name="date"]');
    await expect(dateInput).toBeVisible();
    // Submit button
    const submitBtn = page.getByRole('button', { name: /submit score/i });
    await expect(submitBtn).toBeVisible();
  });

  test('Score input has correct min/max constraints (1-45)', async ({ page }) => {
    await page.goto('/scores/new');
    await page.waitForTimeout(3000);
    const scoreInput = page.locator('input[name="score"]');
    // Check HTML attributes
    const min = await scoreInput.getAttribute('min');
    const max = await scoreInput.getAttribute('max');
    expect(min).toBe('1');
    expect(max).toBe('45');
  });

  test('Dashboard displays scores section', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('score');
  });
});
