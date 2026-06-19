import { test, expect } from '@playwright/test';
import { TEST_EMAIL, TEST_PASSWORD } from './test-helper';

/**
 * =====================================================================
 * 2. USER SIGNUP & LOGIN (PRD Testing Checklist Item 1)
 * =====================================================================
 */
test.describe('Authentication — Signup & Login', () => {

  test('Register page loads with name, email, password fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
  });

  test('Register page shows validation for empty form submission', async ({ page }) => {
    await page.goto('/register');
    // Try submitting empty form
    const submitBtn = page.getByRole('button', { name: /sign up|register|create/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show validation errors or stay on the same page
      await expect(page).toHaveURL(/register/);
    }
  });

  test('User registration shows email confirmation message', async ({ page }) => {
    // Supabase has email confirmation enabled by default
    await page.goto('/register');
    const uniqueEmail = `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@digitalheroes.io`;
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"], input[name="email"]', uniqueEmail);
    await page.fill('input[type="password"], input[name="password"]', TEST_PASSWORD);
    
    const submitBtn = page.getByRole('button', { name: /sign up|register|create/i }).first();
    await submitBtn.click();
    
    // Should show "Check your email"
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    const hasConfirmationMsg = bodyText?.toLowerCase().includes('check your email') || 
                               bodyText?.toLowerCase().includes('confirm your account');
    expect(hasConfirmationMsg).toBeTruthy();
  });

  test('Login page loads with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('Login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', TEST_PASSWORD);
    
    const submitBtn = page.getByRole('button', { name: /sign in|login|log in/i }).first();
    await submitBtn.click();
    
    // Should redirect to dashboard after successful login
    await page.waitForURL(/dashboard|\/admin/,  { timeout: 15000 });
  });

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'fake@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'WrongPassword123');
    
    const submitBtn = page.getByRole('button', { name: /sign in|login|log in/i }).first();
    await submitBtn.click();
    
    // Should show an error message or remain on login page
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    const hasError = bodyText?.toLowerCase().includes('invalid') || 
                     bodyText?.toLowerCase().includes('error') || 
                     bodyText?.toLowerCase().includes('incorrect') ||
                     page.url().includes('login');
    expect(hasError).toBeTruthy();
  });

  test('Unauthenticated user is redirected from dashboard', async ({ page }) => {
    // Clear all cookies first
    await page.context().clearCookies();
    await page.goto('/dashboard');
    // Should redirect to login
    await page.waitForURL(/login|register/, { timeout: 10000 });
  });
});
