import { Page, expect } from '@playwright/test';

// Use the existing verified user for tests
export const TEST_EMAIL = 'alimehdikhan123@gmail.com';
export const TEST_PASSWORD = 'Test@123';

export async function loginOrRegister(page: Page) {
  // Use existing admin/verified user for all tests
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL);
  await page.fill('input[type="password"], input[name="password"]', TEST_PASSWORD);
  
  const submitBtn = page.getByRole('button', { name: /sign in|login|log in/i }).first();
  await submitBtn.click();
  
  // Wait for redirect
  await page.waitForURL(/dashboard|\/admin/, { timeout: 15000 });
}

export async function loginAsAdmin(page: Page) {
  // Same user is admin
  await loginOrRegister(page);
}
