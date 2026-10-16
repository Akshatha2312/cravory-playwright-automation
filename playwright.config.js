import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

/**
 * Playwright Test Configuration for Cravory Marketplace Automation.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI if needed */
  workers: process.env.CI ? 1 : undefined,
  /* Maximum time one test can run */
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
  expect: {
    /* Maximum time expect() should wait for condition to be met */
    timeout: 5000,
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'https://cravory-beta.vercel.app',

    /* Record traces only on first retry for debugging */
    trace: 'on-first-retry',

    /* Automatic failure screenshots for post-mortem analysis */
    screenshot: 'only-on-failure',

    /* Retain video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      /* Scope auxiliary browser runs to safe smoke and API suites to prevent excessive production traffic */
      testMatch: process.env.BROWSER_FULL ? undefined : ['**/tests/smoke/**/*.spec.js', '**/tests/api/**/*.spec.js'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      /* Scope auxiliary browser runs to safe smoke and API suites to prevent excessive production traffic */
      testMatch: process.env.BROWSER_FULL ? undefined : ['**/tests/smoke/**/*.spec.js', '**/tests/api/**/*.spec.js'],
    },
  ],
});
