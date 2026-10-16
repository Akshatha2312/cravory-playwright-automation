import { test, expect } from '@playwright/test';

/**
 * Role-Based Access Control (RBAC) & Route Guard Protection Suite.
 *
 * Validates:
 * 1. Unauthenticated requests to protected Admin routes are blocked and redirected to /login.
 * 2. Unauthenticated requests to protected Vendor routes are blocked and redirected to /login.
 * 3. Unauthenticated requests to Customer Checkout are blocked and redirected to /login.
 * 4. Unauthenticated requests to Vendor Onboarding are blocked and redirected to /login.
 * 5. Browser session storage confirms absence of authentication tokens for guest sessions.
 */
test.describe('Authentication - Route Guards & Session Security', () => {
  test.beforeEach(async ({ page }) => {
    // Start at application root
    await page.goto('/');
  });

  test('should redirect unauthenticated access to /admin/dashboard to /login', async ({ page }) => {
    // Attempt navigation to admin dashboard as unauthenticated guest
    await page.evaluate(() => {
      window.history.pushState({}, '', '/admin/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login to Cravory' })).toBeVisible();
  });

  test('should redirect unauthenticated access to /vendor/dashboard to /login', async ({ page }) => {
    // Attempt navigation to vendor dashboard as unauthenticated guest
    await page.evaluate(() => {
      window.history.pushState({}, '', '/vendor/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login to Cravory' })).toBeVisible();
  });

  test('should redirect unauthenticated access to /checkout to /login', async ({ page }) => {
    // Attempt navigation to checkout as unauthenticated guest
    await page.evaluate(() => {
      window.history.pushState({}, '', '/checkout');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login to Cravory' })).toBeVisible();
  });

  test('should redirect unauthenticated access to /become-a-baker to /login', async ({ page }) => {
    // Attempt navigation to baker onboarding as unauthenticated guest
    await page.evaluate(() => {
      window.history.pushState({}, '', '/become-a-baker');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login to Cravory' })).toBeVisible();
  });

  test('should verify guest session has null authentication tokens in localStorage', async ({ page }) => {
    // Inspect browser localStorage keys verified from AuthContext
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));

    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});
