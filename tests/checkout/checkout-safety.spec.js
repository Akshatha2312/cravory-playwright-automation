import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { CheckoutPage } from '../../pages/CheckoutPage.js';

// Read isolated component fixture HTML mirroring real Checkout.jsx
const fixturePath = path.resolve('fixtures/checkout-address-fixture.html');
const fixtureHtml = fs.readFileSync(fixturePath, 'utf8');

/**
 * Phase 5: Address Management & Safe Checkout Automation Suite.
 *
 * Safety Matrix Classification:
 * - SAFE_PUBLIC: Read-only public guest route protection checks against the deployed application.
 * - SAFE_LOCAL: Isolated component testing using Playwright network interception (page.route())
 *   where mutation endpoints are strictly mocked and unmocked network calls are aborted.
 * - DEFERRED_AUTH: Live customer address fetching requiring an authenticated customer test account.
 * - DEFERRED_MUTATION: Live address creation and order creation against production MongoDB.
 * - DEFERRED_PAYMENT: Live Razorpay gateway checkout and server-side payment verification.
 */
test.describe('Phase 5: Address Management & Safe Checkout Suite', () => {
  // Safe timeout for network interception and SPA navigation
  test.setTimeout(35000);

  // ============================================================================
  // SECTION 1: SAFE_PUBLIC - Guest Access & Route Guard Security
  // ============================================================================

  test('SAFE_PUBLIC: Guest navigating to /checkout is redirected to /login by route guard', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // 1. Start at application root
    await checkoutPage.navigateTo('/');

    // 2. Attempt client-side navigation to protected /checkout
    await checkoutPage.gotoCheckoutClientSide();

    // 3. Verify client route guard redirects immediately to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login to Cravory' })).toBeVisible();
  });

  test('SAFE_PUBLIC: Guest accessing non-existent /addresses route does not expose address UI', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // 1. Start at application root
    await checkoutPage.navigateTo('/');

    // 2. Navigate client-side to /addresses (which does not exist in App.jsx)
    await checkoutPage.navigateClientSide('/addresses');

    // 3. Verify no delivery address management forms or customer records are leaked
    await expect(checkoutPage.addressSectionHeading).not.toBeVisible();
    await expect(checkoutPage.saveAddressButton).not.toBeVisible();
  });

  // ============================================================================
  // SECTION 2: SAFE_LOCAL - Isolated Address Form Field Validation
  // ============================================================================

  test('SAFE_LOCAL: Address form enforces client-side required field validations on empty submission', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Load isolated component fixture in zero-network environment
    await checkoutPage.loadIsolatedFixture(fixtureHtml);

    // Verify checkout page elements are rendered
    await expect(checkoutPage.headerBanner).toBeVisible();
    await expect(checkoutPage.addressSectionHeading).toBeVisible();

    // Open delivery address form
    await checkoutPage.openAddressForm();

    // Assert all required fields have HTML5 'required' attribute
    await expect(checkoutPage.fullNameInput).toHaveAttribute('required', '');
    await expect(checkoutPage.phoneInput).toHaveAttribute('required', '');
    await expect(checkoutPage.addressLine1Input).toHaveAttribute('required', '');
    await expect(checkoutPage.cityInput).toHaveAttribute('required', '');
    await expect(checkoutPage.stateInput).toHaveAttribute('required', '');
    await expect(checkoutPage.pincodeInput).toHaveAttribute('required', '');

    // Assert optional fields do NOT have 'required' attribute
    await expect(checkoutPage.addressLine2Input).not.toHaveAttribute('required', '');
    await expect(checkoutPage.landmarkInput).not.toHaveAttribute('required', '');

    // Attempt form submission while empty and assert browser validation prevents submission
    let addressEndpointHit = false;
    await page.route('**/api/addresses', async (route) => {
      addressEndpointHit = true;
      await route.fulfill({ status: 201, body: '{}' });
    });

    await checkoutPage.submitAddressForm();

    // Client-side HTML5 validation halts submission before dispatching any network request
    expect(addressEndpointHit).toBe(false);
    await expect(checkoutPage.successAlert).not.toBeVisible();
  });

  test('SAFE_LOCAL: Address form successfully submits valid address payload via mocked endpoint', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Intercept address creation endpoint - guarantees ZERO live database mutation
    let interceptedPayload = null;
    await page.route('**/api/addresses', async (route) => {
      if (route.request().method() === 'POST') {
        interceptedPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Delivery address created successfully',
            address: { _id: 'mock_addr_999', ...interceptedPayload },
          }),
        });
      } else {
        await route.abort();
      }
    });

    // Load isolated fixture
    await checkoutPage.loadIsolatedFixture(fixtureHtml);
    await checkoutPage.openAddressForm();

    // Fill valid address details
    const testAddress = {
      fullName: 'Aarav Mehta',
      phone: '9876543210',
      addressLine1: '42 Baker Street, Near City Park',
      addressLine2: 'Apt 3B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      landmark: 'Opposite Metro Station',
      label: 'Home',
      isDefault: true,
    };

    await checkoutPage.fillAddressForm(testAddress);
    await checkoutPage.submitAddressForm();

    // Verify intercepted payload matches form inputs
    expect(interceptedPayload).not.toBeNull();
    expect(interceptedPayload.fullName).toBe(testAddress.fullName);
    expect(interceptedPayload.phone).toBe(testAddress.phone);
    expect(interceptedPayload.city).toBe(testAddress.city);
    expect(interceptedPayload.pincode).toBe(testAddress.pincode);

    // Verify UI displays success confirmation banner
    await expect(checkoutPage.successAlert).toBeVisible();
    await expect(checkoutPage.successAlert).toHaveText(/New address added successfully/i);
  });

  // ============================================================================
  // SECTION 3: SAFE_LOCAL - Order Summary & Promotional Coupon Calculation
  // ============================================================================

  test('SAFE_LOCAL: Order Summary calculates totals and updates discount on coupon application', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Intercept coupon application endpoint
    await page.route('**/api/coupons/apply', async (route) => {
      const payload = route.request().postDataJSON();
      if (payload.code === 'CRAVORY10') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'CRAVORY10',
            discountAmount: 50,
            finalTotal: 600,
          }),
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid or expired coupon code' }),
        });
      }
    });

    // Load isolated fixture
    await checkoutPage.loadIsolatedFixture(fixtureHtml);

    // Initial Order Summary validation
    await expect(checkoutPage.summaryHeading).toBeVisible();
    await expect(page.locator('#items-total')).toHaveText('₹650');
    await expect(checkoutPage.totalAmount).toHaveText('₹650');

    // Apply valid coupon code
    await checkoutPage.applyCoupon('CRAVORY10');

    // Verify discount row and updated total
    await expect(checkoutPage.couponMessage).toBeVisible();
    await expect(checkoutPage.couponMessage).toContainText("Coupon 'CRAVORY10' applied! Saved ₹50");
    await expect(page.locator('#coupon-discount-row')).toBeVisible();
    await expect(page.locator('#coupon-discount-amount')).toHaveText('-₹50');
    await expect(checkoutPage.totalAmount).toHaveText('₹600');
  });

  // ============================================================================
  // SECTION 4: SAFE_LOCAL - Payment Hand-Off Simulation & Error States
  // ============================================================================

  test('SAFE_LOCAL: Handles customer payment cancellation gracefully without live payment calls', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    let orderCreated = false;
    let paymentOrderCreated = false;
    let failureReported = false;
    let reportedReason = null;

    // 1. Mock Order Creation
    await page.route('**/api/orders', async (route) => {
      orderCreated = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'mock_order_12345',
          totalPrice: 650,
        }),
      });
    });

    // 2. Mock Razorpay Order Creation simulating modal cancellation
    await page.route('**/api/payment/create-order', async (route) => {
      paymentOrderCreated = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'order_mock_rzp_999',
          amount: 65000,
          currency: 'INR',
          simulateDismiss: true, // triggers modal.ondismiss
        }),
      });
    });

    // 3. Mock Payment Failure Reporting Endpoint
    await page.route('**/api/payment/failed', async (route) => {
      failureReported = true;
      const data = route.request().postDataJSON();
      reportedReason = data.reason;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Payment failure recorded' }),
      });
    });

    // Strictly abort any attempt to call payment verification or external gateway
    await page.route('**/api/payment/verify', async (route) => {
      await route.abort('blockedbyclient');
    });

    // Load isolated fixture and trigger payment flow
    await checkoutPage.loadIsolatedFixture(fixtureHtml);
    await checkoutPage.proceedToPayment();

    // Await the asynchronous cancellation UI banner matching real Checkout.jsx specification
    await expect(checkoutPage.errorBanner).toBeVisible();
    await expect(checkoutPage.errorBanner).toContainText(
      'Payment was cancelled. Your order has been saved and can be retried anytime from My Orders.'
    );

    // Verify flow sequence of intercepted network requests
    expect(orderCreated).toBe(true);
    expect(paymentOrderCreated).toBe(true);
    expect(failureReported).toBe(true);
    expect(reportedReason).toBe('Modal closed by customer');

    // Verify proceed button returns to enabled state
    await expect(checkoutPage.proceedToPaymentButton).toBeEnabled();
  });

  test('SAFE_LOCAL: Handles gateway payment decline and presents retry banner', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    let failureReported = false;

    // 1. Mock Order Creation
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ _id: 'mock_order_declined', totalPrice: 650 }),
      });
    });

    // 2. Mock Razorpay Order Creation simulating bank decline
    await page.route('**/api/payment/create-order', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'order_mock_rzp_decline',
          amount: 65000,
          currency: 'INR',
          simulateFailure: true,
          failureReason: 'Transaction declined by issuing bank',
        }),
      });
    });

    // 3. Mock Payment Failure Reporting Endpoint
    await page.route('**/api/payment/failed', async (route) => {
      failureReported = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Payment failure recorded' }),
      });
    });

    // Strictly abort payment verification
    await page.route('**/api/payment/verify', async (route) => {
      await route.abort('blockedbyclient');
    });

    // Load isolated fixture and proceed to payment
    await checkoutPage.loadIsolatedFixture(fixtureHtml);
    await checkoutPage.proceedToPayment();

    // Await decline error banner matching real Checkout.jsx specification
    await expect(checkoutPage.errorBanner).toBeVisible();
    await expect(checkoutPage.errorBanner).toContainText('Payment failed: Transaction declined by issuing bank');
    await expect(checkoutPage.errorBanner).toContainText('You can retry payment from My Orders.');

    // Verify failure report was received
    expect(failureReported).toBe(true);
  });

  // ============================================================================
  // SECTION 5: DEFERRED TESTS - Explicit Technical Documentation & Rationale
  // ============================================================================

  test('DEFERRED_AUTH: Persistent address retrieval from production backend', async () => {
    test.skip(
      true,
      'DEFERRED_AUTH: Requires a dedicated customer test account (JWT token). Calling GET /api/addresses against production without auth returns HTTP 401.'
    );
  });

  test('DEFERRED_MUTATION: Live address creation and order creation in MongoDB', async () => {
    test.skip(
      true,
      'DEFERRED_MUTATION: Creating live delivery addresses (POST /api/addresses) or MongoDB orders (POST /api/orders) causes persistent mutations in production database.'
    );
  });

  test('DEFERRED_PAYMENT: Live Razorpay gateway checkout and server-side payment verification', async () => {
    test.skip(
      true,
      'DEFERRED_PAYMENT: Live payment execution triggers real Razorpay orders and POST /api/payment/verify which mutates stock and clears user cart.'
    );
  });
});
