import { test, expect } from '@playwright/test';

/**
 * Backend API Health Check Suite.
 *
 * Validates:
 * 1. The backend host is reachable and responds with HTTP 200.
 * 2. The health response body confirms API status.
 *
 * Accounts for Render free-tier cold-starts using bounded test timeouts.
 */
test.describe('Backend API - Health & Availability', () => {
  // Render free-tier cold starts may take up to 45-60s on dormant spin-up
  test.setTimeout(60000);

  const apiUrl = process.env.API_URL || 'https://cravory-mern-ecommerce.onrender.com';

  test('GET / should return HTTP 200 and confirm backend service status', async ({ request }) => {
    const response = await request.get(`${apiUrl}/`);

    // Verify HTTP status
    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);

    // Verify content-type and body confirmation message
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('text/html');

    const bodyText = await response.text();
    expect(bodyText).toContain('Cravory Backend API is running');
  });
});
