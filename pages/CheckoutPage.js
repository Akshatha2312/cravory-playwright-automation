import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * CheckoutPage - Page Object Model for Cravory Checkout & Address Management.
 *
 * Models both the live client-side checkout view and the isolated component
 * fixture. Encapsulates locators and user interactions for:
 * - Guest route protection verification
 * - Delivery address selection & form validation
 * - Multi-vendor order items review
 * - Order summary calculations & coupon application
 * - Payment hand-off trigger & failure error state handling
 */
export class CheckoutPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Header & Stage Indicators
    this.headerBanner = page.locator('h1').filter({ hasText: /Complete Your Cravory Order/i });
    this.progressIndicator = page.locator('text=2. Address & Review');
    this.emptyCartHeading = page.getByRole('heading', { name: /Your Cart is Empty/i });
    this.browseProductsButton = page.getByRole('link', { name: /Browse Marketplace Products/i });

    // Address Management Section
    this.addressSectionHeading = page.getByRole('heading', { name: /Delivery Address/i });
    this.addNewAddressButton = page.getByRole('button', { name: /\+ Add New Address/i });

    // Address Form Inputs
    this.addressForm = page.locator('form#address-form, form');
    this.fullNameInput = page.locator('input[name="fullName"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.addressLine1Input = page.locator('input[name="addressLine1"]');
    this.addressLine2Input = page.locator('input[name="addressLine2"]');
    this.cityInput = page.locator('input[name="city"]');
    this.stateInput = page.locator('input[name="state"]');
    this.pincodeInput = page.locator('input[name="pincode"]');
    this.landmarkInput = page.locator('input[name="landmark"]');
    this.labelSelect = page.locator('select[name="label"]');
    this.isDefaultCheckbox = page.locator('input[name="isDefault"]');
    this.saveAddressButton = page.getByRole('button', { name: /Save Address/i });
    this.cancelAddressButton = page.getByRole('button', { name: /Cancel/i });

    // Address Card Radio Selectors
    this.deliveryAddressRadios = page.locator('input[name="deliveryAddress"]');

    // Order Items Review Section
    this.reviewItemsHeading = page.getByRole('heading', { name: /Review Order Items/i });

    // Order Summary & Coupon Section
    this.summaryHeading = page.getByRole('heading', { name: /Order Summary/i });
    this.couponInput = page.getByPlaceholder(/e\.g\.\s*CRAVORY10/i);
    this.applyCouponButton = page.getByRole('button', { name: /Apply/i });
    this.couponMessage = page.locator('#coupon-message, .cravory-coupon-msg');
    this.totalAmount = page.locator('#total-amount, [data-testid="total-amount"]');
    this.proceedToPaymentButton = page.getByRole('button', { name: /Proceed to Secure Payment/i });

    // Status Messages & Error Banners
    this.errorBanner = page.locator('.cravory-error-state, #error-banner');
    this.successAlert = page.locator('.cravory-success-alert, #success-banner');
  }

  /**
   * Navigates to /checkout via the SPA client router.
   * Exercises client-side route guard redirection to /login for unauthenticated users.
   */
  async gotoCheckoutClientSide() {
    await this.navigateClientSide('/checkout');
  }

  /**
   * Loads the isolated checkout & address component fixture via Playwright route interception.
   * Guarantees complete network isolation from deployed backend mutation endpoints.
   * @param {string} fixtureHtmlContent
   */
  async loadIsolatedFixture(fixtureHtmlContent) {
    await this.page.route('**/isolated-checkout-fixture', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: fixtureHtmlContent,
      });
    });
    await this.page.goto('/isolated-checkout-fixture');
  }

  /**
   * Opens the delivery address form if closed.
   */
  async openAddressForm() {
    if (await this.addNewAddressButton.isVisible()) {
      await this.addNewAddressButton.click();
    }
    await expect(this.saveAddressButton).toBeVisible();
  }

  /**
   * Populates the address form with provided values.
   * @param {Object} details
   */
  async fillAddressForm(details) {
    if (details.fullName !== undefined) await this.fullNameInput.fill(details.fullName);
    if (details.phone !== undefined) await this.phoneInput.fill(details.phone);
    if (details.addressLine1 !== undefined) await this.addressLine1Input.fill(details.addressLine1);
    if (details.addressLine2 !== undefined) await this.addressLine2Input.fill(details.addressLine2);
    if (details.city !== undefined) await this.cityInput.fill(details.city);
    if (details.state !== undefined) await this.stateInput.fill(details.state);
    if (details.pincode !== undefined) await this.pincodeInput.fill(details.pincode);
    if (details.landmark !== undefined) await this.landmarkInput.fill(details.landmark);
    if (details.label !== undefined) await this.labelSelect.selectOption(details.label);
    if (details.isDefault) await this.isDefaultCheckbox.check();
  }

  /**
   * Submits the address form.
   */
  async submitAddressForm() {
    await this.saveAddressButton.click();
  }

  /**
   * Selects a delivery address by index.
   * @param {number} index
   */
  async selectDeliveryAddress(index = 0) {
    const radio = this.deliveryAddressRadios.nth(index);
    await radio.check();
  }

  /**
   * Applies a promo coupon code.
   * @param {string} code
   */
  async applyCoupon(code) {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
  }

  /**
   * Clicks the Proceed to Secure Payment button.
   */
  async proceedToPayment() {
    await this.proceedToPaymentButton.click();
  }
}
