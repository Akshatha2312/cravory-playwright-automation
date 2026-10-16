import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * BakeryPage - Page Object Model for an Individual Bakery Storefront (/bakery/:id).
 *
 * Encapsulates accessible locators and interactions for the bakery banner,
 * verified bakehouse badge, storefront story, and fresh offerings grid.
 */
export class BakeryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.storefrontTitle = page.getByRole('heading', { level: 1 });
    this.verifiedBadge = page.locator('span').filter({ hasText: /Verified Bakehouse/i });
    this.aboutHeading = page.getByRole('heading', { name: /About/i });
    this.offeringsHeading = page.getByRole('heading', { name: /Fresh Bakery Offerings/i });
    this.productCards = page.locator('.cravory-card-interactive');
  }

  /**
   * Asserts the primary elements of the bakery storefront are rendered.
   */
  async expectLoaded() {
    await expect(this.storefrontTitle).toBeVisible({ timeout: 15000 });
    await expect(this.verifiedBadge).toBeVisible();
    await expect(this.offeringsHeading).toBeVisible();
  }

  /**
   * Returns the bakery storefront title text.
   * @returns {Promise<string>}
   */
  async getStorefrontTitle() {
    return this.storefrontTitle.innerText();
  }

  /**
   * Returns the count of product cards offered by this bakery.
   * @returns {Promise<number>}
   */
  async getOfferingsCount() {
    return this.productCards.count();
  }
}
