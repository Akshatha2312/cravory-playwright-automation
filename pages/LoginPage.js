import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * LoginPage - Page Object Model for the Cravory Customer & Vendor Login view.
 *
 * Encapsulates accessible locators and interactions for the /login route.
 */
export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Accessible Locators
    this.heading = page.getByRole('heading', { name: 'Login to Cravory' });
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.registerLink = page.getByRole('link', { name: 'Register here' });
    this.errorBanner = page.locator('div').filter({ hasText: /Invalid credentials|Please fill all fields/i }).last();
  }

  /**
   * Navigates to the login page via client-side routing.
   */
  async goto() {
    await this.navigateTo('/');
    await this.navigateClientSide('/login');
    await this.expectLoaded();
  }

  /**
   * Asserts the primary login form elements are rendered.
   */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Fills in the email and password fields.
   * @param {string} email
   * @param {string} password
   */
  async fillCredentials(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the login submit button.
   */
  async submit() {
    await this.loginButton.click();
  }

  /**
   * Combined action to fill credentials and submit form.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  /**
   * Retrieves visible error message text from the error alert.
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    await expect(this.errorBanner).toBeVisible();
    return this.errorBanner.innerText();
  }
}
