import { test, expect } from '@playwright/test';

/**
 * Framework Foundation Smoke & Validation Test.
 *
 * Verifies that:
 * 1. Playwright Test runner launches Chromium successfully.
 * 2. Navigates safely to the configured BASE_URL without data mutations.
 * 3. Asserts the presence of basic application DOM structure.
 */
test.describe('Framework Validation - Smoke Suite', () => {
  test('should launch Chromium and load Cravory home page successfully', async ({ page }) => {
    // Navigate to configured base URL
    const response = await page.goto('/');

    // Verify HTTP status is successful (200 OK or 304 Not Modified)
    expect(response).not.toBeNull();
    expect([200, 304]).toContain(response.status());

    // Verify the page title or primary brand header is rendered
    await expect(page).toHaveTitle(/Cravory/i);

    // Verify root app element or body is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
