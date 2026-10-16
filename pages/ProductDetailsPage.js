import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * ProductDetailsPage - Page Object Model for the Single Product Details view (/product/:id).
 *
 * Encapsulates accessible locators and interactions for product metadata,
 * image gallery, bakery links, and customer review sections.
 */
export class ProductDetailsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.titleHeading = page.getByRole('heading', { level: 1 });
    this.priceText = page.locator('span').filter({ hasText: /^₹\d+/ }).first();
    this.bakeryLink = page.locator('a[href*="/bakery/"]').first();
    this.addToCartButton = page.getByRole('button', { name: /Add \d+ to Cart/i });
    this.wishlistButton = page.getByRole('button', { name: /Wishlist toggle/i });
    this.reviewsHeading = page.getByRole('heading', { name: /Customer Reviews & Ratings/i });
  }

  /**
   * Asserts the primary elements of the product details page are rendered.
   */
  async expectLoaded() {
    await expect(this.titleHeading).toBeVisible({ timeout: 15000 });
    await expect(this.priceText).toBeVisible();
    await expect(this.reviewsHeading).toBeVisible();
  }

  /**
   * Returns the product's title text.
   * @returns {Promise<string>}
   */
  async getProductTitle() {
    return this.titleHeading.innerText();
  }

  /**
   * Clicks the bakery storefront link associated with this product.
   */
  async clickBakeryLink() {
    await expect(this.bakeryLink).toBeVisible();
    await this.bakeryLink.click();
    await expect(this.page).toHaveURL(/\/bakery\//);
  }

  /**
   * Attempts to click Add to Cart (used to verify guest redirect).
   */
  async clickAddToCart() {
    await expect(this.addToCartButton).toBeVisible();
    await this.addToCartButton.click();
  }

  /**
   * Attempts to click Wishlist toggle (used to verify guest redirect).
   */
  async clickWishlist() {
    await expect(this.wishlistButton).toBeVisible();
    await this.wishlistButton.click();
  }
}
