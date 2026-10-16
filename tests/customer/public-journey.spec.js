import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../pages/ProductsPage.js';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage.js';
import { BakeriesPage } from '../../pages/BakeriesPage.js';
import { BakeryPage } from '../../pages/BakeryPage.js';

/**
 * Public Customer Journey Automation Suite.
 *
 * Validates the core end-to-end shopping journeys available to public visitors
 * without requiring authentication or causing server-side data mutations:
 *
 * 1. Homepage to Product Catalog navigation & card information verification.
 * 2. Global search and in-page category filtering.
 * 3. Deep-dive Product Details exploration (gallery, price, reviews).
 * 4. Partner Bakery Directory discovery and storefront inspection.
 * 5. Cross-entity navigation from product details to baker storefront.
 * 6. Guest protection triggers (Add to Cart / Wishlist redirecting to /login).
 */
test.describe('Public Customer Journeys - Read-Only E-Commerce Flows', () => {
  // Bounded timeout for SPA hydration and cloud API queries
  test.setTimeout(35000);

  test('Journey 1: Homepage to Product Catalog navigation and visible information check', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    // 1. Navigate via Header Link (real user UI navigation)
    await productsPage.gotoFromHeader();

    // 2. Verify Catalog Headers & Metadata
    await expect(productsPage.heading).toBeVisible();
    const countText = await productsPage.resultsCount.innerText();
    expect(countText).toMatch(/Showing \d+ artisan bakery goods/i);

    // 3. Verify Product Cards Information
    const cardCount = await productsPage.getProductCardsCount();
    expect(cardCount).toBeGreaterThan(0);

    const firstCard = productsPage.productCards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('span').filter({ hasText: /^₹\d+/ })).toBeVisible();
    await expect(firstCard.getByRole('button', { name: /Add to Cart/i })).toBeVisible();
    await expect(firstCard.getByRole('button', { name: /Wishlist toggle/i })).toBeVisible();
  });

  test('Journey 2: Global Header Search filters products by keyword', async ({ page }) => {
    // Start from Homepage
    await page.goto('/');

    // Perform global search from Header
    const header = page.locator('header');
    const searchInput = header.getByPlaceholder(/Search/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Dream');
    await searchInput.press('Enter');

    // Verify URL transitions to catalog with search parameter
    await expect(page).toHaveURL(/\/products\?search=Dream/);

    // Verify Catalog Heading and filtered products
    const productsPage = new ProductsPage(page);
    await expect(productsPage.heading).toBeVisible();
    await productsPage.waitForProductsLoaded();

    // Verify first card matches the searched keyword
    const firstTitle = await productsPage.productCards.first().locator('h3').innerText();
    expect(firstTitle.toLowerCase()).toContain('dream');
  });

  test('Journey 3: Category filter pills update catalog view', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.gotoFromHeader();

    // Select 'Cookies' category pill
    await productsPage.selectCategory('Cookies');

    // Verify URL query parameter updates
    await expect(page).toHaveURL(/category=Cookies/);

    // Verify active chip state
    const cookieButton = page.getByRole('button', { name: /Cookies/i });
    await expect(cookieButton).toHaveClass(/active/);
  });

  test('Journey 4: Open Product Details and verify real product information', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const detailsPage = new ProductDetailsPage(page);

    // Navigate to catalog
    await productsPage.gotoFromHeader();

    // Capture title of first item
    const expectedTitle = await productsPage.productCards.first().locator('h3').innerText();

    // Click card to open Product Details
    await productsPage.clickProductCard(0);

    // Verify Product Details View Loaded
    await detailsPage.expectLoaded();
    const actualTitle = await detailsPage.getProductTitle();
    expect(actualTitle).toBe(expectedTitle);

    // Verify Price and Customer Reviews section are rendered
    await expect(detailsPage.priceText).toBeVisible();
    await expect(detailsPage.reviewsHeading).toBeVisible();
  });

  test('Journey 5: Bakery Directory discovery and storefront exploration', async ({ page }) => {
    const bakeriesPage = new BakeriesPage(page);
    const bakeryStorefront = new BakeryPage(page);

    // Navigate to Bakeries directory via Header
    await bakeriesPage.gotoFromHeader();

    // Verify Directory Loaded
    const bakeryCount = await bakeriesPage.getBakeryCardsCount();
    expect(bakeryCount).toBeGreaterThan(0);

    // Open first bakery storefront
    await bakeriesPage.clickBakeryCard(0);

    // Verify Storefront Loaded
    await bakeryStorefront.expectLoaded();
    const storefrontName = await bakeryStorefront.getStorefrontTitle();
    expect(storefrontName.trim().length).toBeGreaterThan(0);

    // Verify Fresh Bakery Offerings section
    await expect(bakeryStorefront.offeringsHeading).toBeVisible();
  });

  test('Journey 6: Cross-entity navigation from Product Details to Bakery Storefront', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const detailsPage = new ProductDetailsPage(page);
    const bakeryStorefront = new BakeryPage(page);

    // Navigate to catalog
    await productsPage.gotoFromHeader();

    // Click first product card
    await productsPage.clickProductCard(0);
    await detailsPage.expectLoaded();

    // If product has an associated bakery link, navigate to its storefront
    const hasBakeryLink = await detailsPage.bakeryLink.isVisible();
    if (hasBakeryLink) {
      await detailsPage.clickBakeryLink();
      await bakeryStorefront.expectLoaded();
      await expect(page).toHaveURL(/\/bakery\//);
    }
  });

  test('Journey 7: Guest interaction safety check (Add to Cart & Wishlist redirect to /login)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const detailsPage = new ProductDetailsPage(page);

    // 1. Check guest click on Wishlist button in Catalog
    await productsPage.gotoFromHeader();
    const firstWishlistBtn = productsPage.productCards.first().getByRole('button', { name: /Wishlist toggle/i });
    await firstWishlistBtn.click();
    await expect(page).toHaveURL(/\/login/);

    // 2. Return to catalog and open product details
    await productsPage.gotoFromHeader();
    await productsPage.clickProductCard(0);
    await detailsPage.expectLoaded();

    // 3. Check guest click on Add to Cart button in Product Details
    await detailsPage.clickAddToCart();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login to Cravory' })).toBeVisible();
  });
});
