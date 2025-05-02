# Playwright Tests for Swag Labs

This project contains automated tests to validate the main flows of the [Swag Labs](https://www.saucedemo.com) application using Playwright.

## Project Structure

- **`tests/`**: Folder containing the test files.
  - **`login_flow.spec.ts`**: Tests related to the login flow. According to the type of credentials present
      Login with valid credentials.
      Login with invalid credentials.
      Login with a valid user but invalid password.
      Login with a locked out user.
      Login with empty credentials validation.
  - **`logout_flow.spec.ts`**: Tests related to the logout flow.
      Logout successfully.
      Try to navigate inside the app after a successful logout.
  - **`checkout_flow.spec.ts`**: Tests related to the checkout flow. After a successful login verify
      Checkout flow with valid data - Happy path.
      Checkout flow steps validation.
      Checout flow after remove items from the cart.
- **`playwright.config.ts`**: Playwright configuration file.

## Prerequisites

1. **Node.js**: Make sure you have Node.js installed (version 16 or higher). You can verify it with:
   node -v

## How to run tests

Navigate to the main folder /Playwright-tests

1. Run all tests:
  npx playwright test
2. Run a specific flow:
  npx playwright test tests/<file_name>.spec.ts
2. Run a specific test:
  npx playwright test tests/<file_name>.spec.ts -g "<test_name>"
3. Run smoke test:
  npx playwright test --grep "\[smoke\]"
