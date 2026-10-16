import { test, expect } from '@playwright/test';

/**
 * Cravory Website UI Smoke & Navigation Suite.
 *
 * Validates:
 * 1. Homepage loads with accurate title, hero heading, and header navigation.
 * 2. Product catalog page loads via client-side SPA navigation and displays catalog header.
 * 3. Bakery directory page loads via client-side SPA navigation and renders partner bakehouses.
 * 4. Public auth links (Login, Register) lead to their respective entry forms.
 * 5. Protected onboarding links (Become a Baker) enforce route protection by redirecting guests to /login.
 *
 * Uses accessible locators (getByRole, getByPlaceholder) and web-first SPA assertions.
 */
test.describe('Cravory Website - UI Smoke Suite', () => {
  // Allow time for SPA hydration and cloud API queries across all browser engines
  test.setTimeout(45000);

  test.beforeEach(async ({ page }) => {
    // Start each test from the application root
    await page.goto('/');
  });

  test('Homepage should load successfully with correct title, hero banner, and main navigation', async ({ page }) => {
    // 1. Verify Document Title
    await expect(page).toHaveTitle('Cravory — Artisan Bakery & Dessert Marketplace');

    // 2. Verify Primary Hero Heading (h1)
    const heroHeading = page.getByRole('heading', {
      name: /Freshly Baked Delights From Top Local Artisan Bakeries/i,
      level: 1,
    });
    await expect(heroHeading).toBeVisible();

    // 3. Verify Header Navigation & Core Links
    const header = page.locator('header');
    await expect(header).toBeVisible();

    await expect(header.getByRole('link', { name: /Cravory/i }).first()).toBeVisible();
    await expect(header.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Products', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Bakeries', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Register', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: /Become a Baker/i })).toBeVisible();

    // 4. Verify Global Search Input in Navigation
    const searchInput = header.getByPlaceholder(/Search/i);
    await expect(searchInput).toBeVisible();
  });

  test('Product Catalog page should load via navigation and render catalog header', async ({ page }) => {
    const header = page.locator('header');
    const productsLink = header.getByRole('link', { name: 'Products', exact: true });

    // Navigate via client-side routing
    await productsLink.click();
    await expect(page).toHaveURL(/\/products/);

    // Verify Catalog Heading
    const catalogHeading = page.getByRole('heading', {
      name: /Handcrafted Cakes, Cookies & Fresh Bakery Delights/i,
    });
    await expect(catalogHeading).toBeVisible();
  });

  test('Bakery Directory page should load via navigation and render directory header', async ({ page }) => {
    const header = page.locator('header');
    const bakeriesLink = header.getByRole('link', { name: 'Bakeries', exact: true });

    // Navigate via client-side routing
    await bakeriesLink.click();
    await expect(page).toHaveURL(/\/bakeries/);

    // Verify Bakeries Directory Heading (wait for dynamic vendor load)
    const bakeriesHeading = page.getByRole('heading', {
      name: /Meet the Bakers Behind Your Favourite Treats/i,
    });
    await expect(bakeriesHeading).toBeVisible({ timeout: 15000 });
  });

  test('Public authentication links (Login and Register) should lead to their respective forms', async ({ page }) => {
    const header = page.locator('header');

    // 1. Verify Login Destination
    await header.getByRole('link', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/\/login/);
    const loginHeading = page.getByRole('heading', { name: 'Login to Cravory' });
    await expect(loginHeading).toBeVisible();

    // 2. Return to root and verify Register Destination
    await page.goto('/');
    await header.getByRole('link', { name: 'Register', exact: true }).click();
    await expect(page).toHaveURL(/\/register/);
    const registerHeading = page.getByRole('heading', { name: 'Create Cravory Account' });
    await expect(registerHeading).toBeVisible();
  });

  test('Become a Baker link should redirect unauthenticated guests to login', async ({ page }) => {
    const header = page.locator('header');

    // Clicking Become a Baker as a guest redirects to /login per application route guard
    await header.getByRole('link', { name: /Become a Baker/i }).click();
    await expect(page).toHaveURL(/\/login/);

    const loginHeading = page.getByRole('heading', { name: 'Login to Cravory' });
    await expect(loginHeading).toBeVisible();
  });
});
