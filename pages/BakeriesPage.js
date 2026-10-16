import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * BakeriesPage - Page Object Model for the Partner Bakeries Directory (/bakeries).
 *
 * Encapsulates accessible locators and interactions for discovering
 * verified local artisan bakehouses.
 */
export class BakeriesPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.heading = page.getByRole('heading', {
      name: /Meet the Bakers Behind Your Favourite Treats/i,
    });
    this.bakeryCards = page.locator('.cravory-card-interactive');
  }

  /**
   * Navigates to the Bakeries directory from the homepage navigation.
   */
  async gotoFromHeader() {
    await this.navigateTo('/');
    const bakeriesLink = this.header.getByRole('link', { name: 'Bakeries', exact: true });
    await bakeriesLink.click();
    await expect(this.page).toHaveURL(/\/bakeries/);
    await this.expectLoaded();
  }

  /**
   * Asserts the page heading is visible and waits for bakery cards to finish loading.
   */
  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    await this.waitForBakeriesLoaded();
  }

  /**
   * Waits for bakery cards to be populated from the API.
   */
  async waitForBakeriesLoaded() {
    await expect(this.bakeryCards.first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Returns the count of currently rendered bakery cards.
   * @returns {Promise<number>}
   */
  async getBakeryCardsCount() {
    return this.bakeryCards.count();
  }

  /**
   * Clicks a bakery card at the specified index to open its storefront.
   * @param {number} index
   */
  async clickBakeryCard(index = 0) {
    await this.bakeryCards.nth(index).click();
    await expect(this.page).toHaveURL(/\/bakery\//);
  }
}
