import { defineConfig, devices } from '@playwright/test';

/**
 * Digital Heroes — End-to-End Test Configuration
 * Tests run against the live Vercel deployment.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Sequential for auth-dependent tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker to avoid race conditions on shared test user
  reporter: 'html',
  timeout: 60_000, // 60s per test (Vercel cold starts can be slow)
  
  use: {
    baseURL: process.env.BASE_URL || 'https://digital-heroes-indol.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile responsive test
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
