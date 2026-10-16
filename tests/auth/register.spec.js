import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage.js';

/**
 * Authentication Test Suite - Registration Form Verification.
 *
 * Validates:
 * 1. Registration form visibility and accessible locators.
 * 2. Client-side required field constraints.
 * 3. Navigation link to existing customer login view.
 *
 * Safety Boundary:
 * Does not submit successful user registrations against production.
 */
test.describe('Authentication - Registration Suite', () => {
  let registerPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should render registration form with name, email, password fields and login link', async ({ page }) => {
    // 1. Verify URL is /register
    await expect(page).toHaveURL(/\/register/);

    // 2. Verify Form Elements via Page Object
    await registerPage.expectLoaded();

    // 3. Verify HTML5 Required Attributes for Form Validation
    await expect(registerPage.nameInput).toHaveAttribute('required', '');
    await expect(registerPage.emailInput).toHaveAttribute('required', '');
    await expect(registerPage.passwordInput).toHaveAttribute('required', '');
    await expect(registerPage.emailInput).toHaveAttribute('type', 'email');
    await expect(registerPage.passwordInput).toHaveAttribute('type', 'password');

    // 4. Verify Link to Existing Login Form
    await expect(registerPage.loginLink).toBeVisible();
    await expect(registerPage.loginLink).toHaveAttribute('href', '/login');
  });

  test('should enforce client-side required field validations on empty submission', async ({ page }) => {
    // Flag to detect if network request was triggered
    let networkRequestTriggered = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/auth/register')) {
        networkRequestTriggered = true;
      }
    });

    // Attempt to submit empty form
    await registerPage.submit();

    // Verify browser HTML5 validity flags prevent submission
    const isNameValid = await registerPage.nameInput.evaluate((el) => el.checkValidity());
    const isEmailValid = await registerPage.emailInput.evaluate((el) => el.checkValidity());
    const isPasswordValid = await registerPage.passwordInput.evaluate((el) => el.checkValidity());

    expect(isNameValid).toBe(false);
    expect(isEmailValid).toBe(false);
    expect(isPasswordValid).toBe(false);

    // Verify no registration API request was dispatched to backend
    expect(networkRequestTriggered).toBe(false);

    // Verify user remains on /register
    await expect(page).toHaveURL(/\/register/);
  });
});
