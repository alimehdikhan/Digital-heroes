import { test, expect, Page } from '@playwright/test';

/**
 * =====================================================================
 * 1. PUBLIC PAGES — Verify marketing pages load, SEO meta, and navigation
 * =====================================================================
 */
test.describe('Public Pages & Navigation', () => {

  test('Homepage loads with correct title and hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Digital Heroes/i);
    // Hero heading should be visible
    await expect(page.locator('h1').first()).toBeVisible();
    // Subscribe CTA should exist
    const ctaButton = page.getByRole('link', { name: /subscribe|get started|become a hero/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('Homepage communicates: what user does, how they win, charity impact', async ({ page }) => {
    await page.goto('/');
    const body = await page.textContent('body');
    // PRD Section 12: Homepage clearly communicates these 3 things
    expect(body?.toLowerCase()).toContain('score');   // what the user does
    expect(body?.toLowerCase()).toContain('draw');     // how they win
    expect(body?.toLowerCase()).toContain('charit');   // charity impact
  });

  test('Charities listing page loads with search and filter', async ({ page }) => {
    await page.goto('/charities');
    await expect(page.locator('h1')).toBeVisible();
    // Search input should exist
    await expect(page.locator('input[name="q"]')).toBeVisible();
    // Filter select should exist
    await expect(page.locator('select[name="filter"]')).toBeVisible();
  });

  test('Pricing page loads with monthly and yearly plans', async ({ page }) => {
    await page.goto('/pricing');
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('month');
    expect(body?.toLowerCase()).toContain('year');
  });

  test('Navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    // Click on charities nav link
    const charitiesLink = page.getByRole('link', { name: /charit/i }).first();
    if (await charitiesLink.isVisible()) {
      await charitiesLink.click();
      await page.waitForURL(/charities/);
      await expect(page).toHaveURL(/charities/);
    }
  });
});
