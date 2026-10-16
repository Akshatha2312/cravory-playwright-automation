import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * ProductsPage - Page Object Model for the Cravory Products Catalog view.
 *
 * Encapsulates accessible locators and interactions for /products,
 * including category filter pills, search input, sorting, and product cards.
 */
export class ProductsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Primary Headers & Metadata
    this.heading = page.getByRole('heading', {
      name: /Handcrafted Cakes, Cookies & Fresh Bakery Delights/i,
    });
    this.resultsCount = page.locator('span').filter({ hasText: /Showing.*artisan bakery goods/i });

    // Filter Controls
    this.searchInput = page.getByPlaceholder(/Search by cake name/i);
    this.sortSelect = page.locator('select.cravory-select').last();
    this.clearFiltersButton = page.getByRole('button', { name: /Clear All Filters/i });

    // Product Cards Grid
    this.productCards = page.locator('.cravory-card-interactive');
  }

  /**
   * Navigates to the products catalog via the header navigation link.
   * Exercises real user navigation rather than direct URL routing.
   */
  async gotoFromHeader() {
    await this.navigateTo('/');
    const productsLink = this.header.getByRole('link', { name: 'Products', exact: true });
    await productsLink.click();
    await expect(this.page).toHaveURL(/\/products/);
    await this.expectLoaded();
  }

  /**
   * Asserts the catalog heading is visible and waits for dynamic products to load.
   */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await this.waitForProductsLoaded();
  }

  /**
   * Waits for the product cards and results counter to finish API loading.
   */
  async waitForProductsLoaded() {
    await expect(this.resultsCount).not.toHaveText(/Showing 0 artisan bakery goods/, { timeout: 15000 });
    await expect(this.productCards.first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Returns the count of currently rendered product cards.
   * @returns {Promise<number>}
   */
  async getProductCardsCount() {
    return this.productCards.count();
  }

  /**
   * Selects a category filter pill (e.g. 'Cakes', 'Cookies', 'Brownies').
   * @param {string} categoryName
   */
  async selectCategory(categoryName) {
    const categoryButton = this.page.getByRole('button', { name: new RegExp(categoryName, 'i') });
    await categoryButton.click();
  }

  /**
   * Types a keyword into the in-page catalog search box.
   * @param {string} keyword
   */
  async searchInCatalog(keyword) {
    await this.searchInput.fill(keyword);
  }

  /**
   * Clicks a product card at the specified index to open its details view.
   * @param {number} index
   */
  async clickProductCard(index = 0) {
    await this.productCards.nth(index).click();
    await expect(this.page).toHaveURL(/\/product\//);
  }
}
