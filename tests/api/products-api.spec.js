import { test, expect } from '@playwright/test';

/**
 * Backend API Products Contract & Schema Validation Suite.
 *
 * Validates:
 * 1. GET /api/products returns HTTP 200 with JSON content.
 * 2. Response envelope matches the verified schema: { count: number, products: Array }.
 * 3. Individual product records contain required schema fields without assuming
 *    fixed sorting, arbitrary counts, or optional vendor objects.
 */
test.describe('Backend API - Products Endpoint', () => {
  // Render free-tier cold starts may take up to 45-60s on dormant spin-up
  test.setTimeout(60000);

  const apiUrl = process.env.API_URL || 'https://cravory-mern-ecommerce.onrender.com';

  test('GET /api/products should return HTTP 200 with valid schema envelope and products', async ({ request }) => {
    const response = await request.get(`${apiUrl}/api/products`);

    // 1. Verify HTTP Status
    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);

    // 2. Verify Content-Type Header
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');

    // 3. Verify Response Payload Structure
    const data = await response.json();
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
    expect(data).toHaveProperty('products');
    expect(Array.isArray(data.products)).toBe(true);
    expect(data).toHaveProperty('count');
    expect(typeof data.count).toBe('number');
    expect(data.count).toBe(data.products.length);

    // 4. Validate representative product fields if catalog has items
    if (data.products.length > 0) {
      const sampleProduct = data.products[0];

      // Required: Identifier
      expect(sampleProduct).toHaveProperty('_id');
      expect(typeof sampleProduct._id).toBe('string');
      expect(sampleProduct._id.length).toBeGreaterThan(0);

      // Required: Product Name
      expect(sampleProduct).toHaveProperty('name');
      expect(typeof sampleProduct.name).toBe('string');
      expect(sampleProduct.name.trim().length).toBeGreaterThan(0);

      // Required: Price
      expect(sampleProduct).toHaveProperty('price');
      expect(typeof sampleProduct.price).toBe('number');
      expect(sampleProduct.price).toBeGreaterThanOrEqual(0);

      // Required: Category
      expect(sampleProduct).toHaveProperty('category');
      expect(typeof sampleProduct.category).toBe('string');
      expect(sampleProduct.category.trim().length).toBeGreaterThan(0);

      // Required: Stock Count
      expect(sampleProduct).toHaveProperty('stock');
      expect(typeof sampleProduct.stock).toBe('number');
      expect(sampleProduct.stock).toBeGreaterThanOrEqual(0);

      // Required: Availability Flag
      expect(sampleProduct).toHaveProperty('isAvailable');
      expect(typeof sampleProduct.isAvailable).toBe('boolean');
    }
  });
});
