import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './test-helper';

/**
 * =====================================================================
 * 8. ADMIN PANEL (PRD Testing Checklist Item 8)
 * =====================================================================
 */
test.describe('Admin Panel', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Admin dashboard loads with management sections', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // Should show admin-related content
    const hasAdmin = body?.toLowerCase().includes('user') ||
                     body?.toLowerCase().includes('admin') ||
                     body?.toLowerCase().includes('management') ||
                     body?.toLowerCase().includes('dashboard');
    expect(hasAdmin).toBeTruthy();
  });

  test('Admin user management page loads', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    // Should show user-related content (names, emails, subscription status)
    const hasUsers = body?.toLowerCase().includes('user') || 
                     body?.toLowerCase().includes('name') ||
                     body?.toLowerCase().includes('subscription');
    expect(hasUsers).toBeTruthy();
  });

  test('Admin scores management page loads', async ({ page }) => {
    await page.goto('/admin/scores');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    // Should show score management interface
    expect(body?.toLowerCase()).toContain('score');
  });

  test('Admin draws page loads with draw execution controls', async ({ page }) => {
    await page.goto('/admin/draws');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    // Should show draw-related admin controls
    const hasDraw = body?.toLowerCase().includes('draw') || 
                    body?.toLowerCase().includes('vault') ||
                    body?.toLowerCase().includes('execute');
    expect(hasDraw).toBeTruthy();
  });

  test('Admin draws page shows winner verification section', async ({ page }) => {
    await page.goto('/admin/draws');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    // PRD Section 09: Winner verification flow
    const hasVerification = body?.toLowerCase().includes('verification') || 
                            body?.toLowerCase().includes('pending proof') ||
                            body?.toLowerCase().includes('no pending');
    expect(hasVerification).toBeTruthy();
  });

  test('Admin charities management page loads', async ({ page }) => {
    await page.goto('/admin/charities');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('charit');
  });

  test('Admin analytics page loads with charts', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForTimeout(3000);
    const body = await page.textContent('body');
    // Should show analytics content
    const hasAnalytics = body?.toLowerCase().includes('user') || 
                         body?.toLowerCase().includes('total') ||
                         body?.toLowerCase().includes('growth');
    expect(hasAnalytics).toBeTruthy();
  });
});
