/**
 * BasePage - Common foundation for all Page Object Models.
 *
 * Encapsulates shared browser actions, URL assertions, and global
 * structural locators such as the navigation header and footer.
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.header = page.locator('header');
  }

  /**
   * Navigates to a specific application route.
   * @param {string} path - Relative URL path (default: '/')
   */
  async navigateTo(path = '/') {
    await this.page.goto(path);
  }

  /**
   * Navigates client-side within the SPA using the History API.
   * Prevents full CDN reloads on platforms where SPA rewrite rules are absent.
   * @param {string} path - Relative route path
   */
  async navigateClientSide(path) {
    await this.page.evaluate((targetPath) => {
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  }

  /**
   * Returns document title.
   * @returns {Promise<string>}
   */
  async getTitle() {
    return this.page.title();
  }

  /**
   * Returns the current page URL.
   * @returns {string}
   */
  getUrl() {
    return this.page.url();
  }
}
