import { test, expect } from '@playwright/test';
import { VendorAdminPage } from '../../pages/VendorAdminPage.js';

/**
 * Phase 6: Vendor Portal & Admin Governance Safety Suite.
 *
 * Validates role-based route guard architecture and backend authorization boundaries:
 * 1. Public "Become a Baker" onboarding entry point in header is visible to guests and navigates to the intended route.
 * 2. Unauthenticated guest attempts to access protected vendor subroutes (/vendor/orders, /vendor/products, /vendor/products/add)
 *    are intercepted by <VendorRoute> and redirected to /login.
 * 3. Unauthenticated guest attempts to access protected admin subroutes (/admin/vendors, /admin/products, /admin/orders, /admin/analytics, /admin/users)
 *    are intercepted by <AdminRoute> and redirected to /login.
 * 4. Backend protected vendor endpoints reject unauthenticated requests with HTTP 401.
 * 5. Backend protected admin endpoints reject unauthenticated requests with HTTP 401.
 * 6. Public vendor marketplace API endpoint returns sanitized schemas without leaking private credentials or internal secrets.
 * 7. Explicitly documents and defers authenticated and destructive vendor/admin workflows.
 */
test.describe('Phase 6: Vendor Portal & Admin Governance Safety Suite', () => {
  test.setTimeout(35000);

  // ============================================================================
  // SECTION 1: Public Vendor Onboarding Entry Point
  // ============================================================================

  test('SAFE_PUBLIC: Public "Become a Baker" onboarding link is visible to guest and navigates correctly', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    // 1. Navigate to application root as guest
    await vendorAdminPage.navigateTo('/');

    // 2. Assert onboarding link is visible in global navigation header with expected target href
    await expect(vendorAdminPage.becomeABakerLink).toBeVisible();
    await expect(vendorAdminPage.becomeABakerLink).toHaveAttribute('href', '/become-a-baker');

    // 3. Click link to navigate to the intended public route
    await vendorAdminPage.becomeABakerLink.click();

    // 4. In Cravory architecture, /become-a-baker enforces unauthenticated route protection,
    // safely redirecting unauthenticated guests to /login with the login heading.
    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  // ============================================================================
  // SECTION 2: Vendor Subroute Route Guard Protection (Authentication Barrier)
  // ============================================================================

  test('SAFE_PUBLIC: Unauthenticated access to /vendor/orders redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoVendorSubroute('orders');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  test('SAFE_PUBLIC: Unauthenticated access to /vendor/products redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoVendorSubroute('products');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  test('SAFE_PUBLIC: Unauthenticated access to /vendor/products/add redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoVendorSubroute('products/add');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  // ============================================================================
  // SECTION 3: Admin Governance Subroute Route Guard Protection
  // ============================================================================

  test('SAFE_PUBLIC: Unauthenticated access to /admin/vendors redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoAdminSubroute('vendors');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  test('SAFE_PUBLIC: Unauthenticated access to /admin/products redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoAdminSubroute('products');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  test('SAFE_PUBLIC: Unauthenticated access to /admin/orders redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoAdminSubroute('orders');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  test('SAFE_PUBLIC: Unauthenticated access to /admin/analytics redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoAdminSubroute('analytics');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  test('SAFE_PUBLIC: Unauthenticated access to /admin/users redirects to /login', async ({ page }) => {
    const vendorAdminPage = new VendorAdminPage(page);

    await vendorAdminPage.navigateTo('/');
    await vendorAdminPage.gotoAdminSubroute('users');

    await expect(page).toHaveURL(/\/login/);
    await expect(vendorAdminPage.loginHeading).toBeVisible();
  });

  // ============================================================================
  // SECTION 4: Backend API Role Authorization & Privacy Protection
  // ============================================================================

  test('SAFE_API: GET /api/products/vendor/my-products rejects unauthenticated requests with HTTP 401', async ({ request }) => {
    const backendUrl = process.env.VITE_BACKEND_URL || 'https://cravory-mern-ecommerce.onrender.com';
    const response = await request.get(`${backendUrl}/api/products/vendor/my-products`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toMatch(/Not authorized, (no token|token failed)/i);
  });

  test('SAFE_API: GET /api/admin/dashboard rejects unauthenticated requests with HTTP 401', async ({ request }) => {
    const backendUrl = process.env.VITE_BACKEND_URL || 'https://cravory-mern-ecommerce.onrender.com';
    const response = await request.get(`${backendUrl}/api/admin/dashboard`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toMatch(/Not authorized, (no token|token failed)/i);
  });

  test('SAFE_API: GET /api/vendors returns public bakery directory without leaking sensitive data', async ({ request }) => {
    const backendUrl = process.env.VITE_BACKEND_URL || 'https://cravory-mern-ecommerce.onrender.com';
    const response = await request.get(`${backendUrl}/api/vendors`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Verify envelope shape matches actual Cravory API contract
    expect(typeof body.count).toBe('number');
    expect(Array.isArray(body.vendors)).toBe(true);
    expect(body.count).toBeGreaterThan(0);

    // Verify public vendor fields and assert privacy protection
    const sampleVendor = body.vendors[0];
    expect(sampleVendor).toHaveProperty('_id');
    expect(sampleVendor).toHaveProperty('bakeryName');
    expect(sampleVendor).toHaveProperty('city');
    expect(sampleVendor).toHaveProperty('state');
    expect(sampleVendor).toHaveProperty('isApproved', true);
    expect(sampleVendor).toHaveProperty('isActive', true);

    // Assert sensitive personal, authentication, and financial fields are NOT leaked in public payload
    expect(sampleVendor).not.toHaveProperty('password');
    expect(sampleVendor).not.toHaveProperty('bankAccount');
    expect(sampleVendor).not.toHaveProperty('taxId');
    expect(sampleVendor).not.toHaveProperty('user');
    expect(sampleVendor).not.toHaveProperty('phone');
    expect(sampleVendor).not.toHaveProperty('email');
    expect(sampleVendor).not.toHaveProperty('address');
  });

  // ============================================================================
  // SECTION 5: Explicitly Deferred Authenticated & Destructive Workflows
  // ============================================================================

  test('DEFERRED_AUTH: Vendor portal login and private dashboard metric retrieval', async () => {
    test.skip(
      true,
      'DEFERRED_AUTH: Requires dedicated approved vendor credentials (role: vendor, isApproved: true). Cannot test without live vendor test account.'
    );
  });

  test('DEFERRED_AUTH: Admin portal login and private governance dashboard access', async () => {
    test.skip(
      true,
      'DEFERRED_AUTH: Requires dedicated administrative credentials (role: admin). Cannot test without live admin test account.'
    );
  });

  test('DEFERRED_AUTHZ: Cross-role authorization protection (Customer attempting Vendor/Admin access)', async () => {
    test.skip(
      true,
      'DEFERRED_AUTHZ: Validates that an authenticated customer (role: user) is redirected to /become-a-baker for vendor routes and / for admin routes, and receives HTTP 403 on protected APIs. Requires customer test account.'
    );
  });

  test('DEFERRED_MUTATION: Vendor product creation, catalog modification, and stock adjustments', async () => {
    test.skip(
      true,
      'DEFERRED_MUTATION: Calling POST /api/products/vendor or PATCH /api/products/vendor/:id/stock mutates live catalog and inventory in production MongoDB.'
    );
  });

  test('DEFERRED_MUTATION: Admin vendor approval, user account suspension, and governance toggles', async () => {
    test.skip(
      true,
      'DEFERRED_MUTATION: Calling PATCH /api/vendors/:id/approve or PATCH /api/admin/users/:id/status alters user roles and permissions in production database.'
    );
  });
});
