import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * VendorAdminPage - Page Object Model for Vendor Portal and Admin Governance.
 *
 * Encapsulates navigation, accessible locators, and route protection checks for:
 * - Public "Become a Baker" onboarding entry point
 * - Vendor portal subroutes (/vendor/orders, /vendor/products, /vendor/products/add)
 * - Admin governance subroutes (/admin/vendors, /admin/products, /admin/orders, /admin/analytics, /admin/users)
 */
export class VendorAdminPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Public Header Onboarding Links
    this.becomeABakerLink = this.header.getByRole('link', { name: /Become a Baker/i });

    // Login Form Heading (Target of Guest Route Guard Redirections)
    this.loginHeading = page.getByRole('heading', { name: /Login to Cravory/i });
  }

  /**
   * Clicks the "Become a Baker" link in the global navigation header.
   */
  async clickBecomeABakerFromHeader() {
    await this.navigateTo('/');
    await expect(this.becomeABakerLink).toBeVisible();
    await this.becomeABakerLink.click();
  }

  /**
   * Navigates client-side to a protected vendor subroute.
   * @param {string} subpath - Subpath under /vendor (e.g., 'orders', 'products', 'products/add')
   */
  async gotoVendorSubroute(subpath) {
    const fullPath = subpath.startsWith('/') ? `/vendor${subpath}` : `/vendor/${subpath}`;
    await this.navigateClientSide(fullPath);
  }

  /**
   * Navigates client-side to a protected admin governance subroute.
   * @param {string} subpath - Subpath under /admin (e.g., 'vendors', 'products', 'orders', 'analytics', 'users')
   */
  async gotoAdminSubroute(subpath) {
    const fullPath = subpath.startsWith('/') ? `/admin${subpath}` : `/admin/${subpath}`;
    await this.navigateClientSide(fullPath);
  }
}
