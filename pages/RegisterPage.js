import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * RegisterPage - Page Object Model for the Cravory Customer Signup view.
 *
 * Encapsulates accessible locators and interactions for the /register route.
 */
export class RegisterPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Accessible Locators
    this.heading = page.getByRole('heading', { name: 'Create Cravory Account' });
    this.nameInput = page.getByPlaceholder('Enter your name');
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.registerButton = page.getByRole('button', { name: 'Register', exact: true });
    this.loginLink = page.getByRole('link', { name: 'Login here' });
    this.errorBanner = page.locator('div').filter({ hasText: /Please fill all fields|Registration failed/i }).last();
  }

  /**
   * Navigates to the register page via client-side routing.
   */
  async goto() {
    await this.navigateTo('/');
    await this.navigateClientSide('/register');
    await this.expectLoaded();
  }

  /**
   * Asserts the primary registration form elements are rendered.
   */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.registerButton).toBeVisible();
  }

  /**
   * Fills in registration form fields.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  async fillForm(name, email, password) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the register submit button.
   */
  async submit() {
    await this.registerButton.click();
  }
}
