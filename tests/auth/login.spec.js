import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';

/**
 * Authentication Test Suite - Login Verification.
 *
 * Validates:
 * 1. Login form visibility, input accessibility, and HTML5 required attributes.
 * 2. Invalid credentials display the verified server error banner ("Invalid credentials").
 * 3. Navigation link to registration works correctly.
 *
 * Safety Boundary:
 * Purely read-only / negative authentication checks.
 * Does not create production accounts or attempt credential guessing.
 */
test.describe('Authentication - Login Suite', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should render login form with all required accessible fields and links', async ({ page }) => {
    // 1. Verify URL is /login
    await expect(page).toHaveURL(/\/login/);

    // 2. Verify Form Elements via Page Object
    await loginPage.expectLoaded();

    // 3. Verify HTML5 Required Attributes for Form Validation
    await expect(loginPage.emailInput).toHaveAttribute('required', '');
    await expect(loginPage.passwordInput).toHaveAttribute('required', '');
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    // 4. Verify Link to Register Form
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.registerLink).toHaveAttribute('href', '/register');
  });

  test('should reject invalid credentials with HTTP 400 and display error banner', async ({ page }) => {
    const invalidEmail = `qa_guest_${Date.now()}@example.com`;
    const invalidPassword = 'WrongTestPassword123!';

    // Intercept backend login API response
    const loginResponsePromise = page.waitForResponse((res) =>
      res.url().includes('/api/auth/login')
    );

    // Perform login with non-existent credentials
    await loginPage.login(invalidEmail, invalidPassword);

    // Verify backend rejects with HTTP 400 (or 401)
    const loginResponse = await loginResponsePromise;
    expect([400, 401]).toContain(loginResponse.status());

    const responseBody = await loginResponse.json();
    expect(responseBody).toHaveProperty('message');

    // Verify UI displays the error banner
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toMatch(/Invalid credentials/i);

    // Verify user remains on /login without session token
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
