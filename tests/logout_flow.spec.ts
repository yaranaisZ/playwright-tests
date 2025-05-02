import { test, expect } from '@playwright/test';

const internalPages = [
    '/inventory.html',
    '/cart.html',
    '/checkout-step-one.html',
    '/checkout-step-two.html',
];

test.describe('Logout Flow', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        expect(await page.title()).toBe('Swag Labs');
        const loginButton = page.getByRole('button', { name: 'Login' });
        expect(loginButton).toBeVisible();
        await page.getByPlaceholder('Username').fill('standard_user');
        await page.getByPlaceholder('Password').fill('secret_sauce');
        await page.getByRole('button', { name: 'Login' }).click();
        expect(await page.title()).toBe('Swag Labs');
        const productsTitle = await page.getByText('Products').textContent();
        expect(productsTitle).toContain('Products');
    });

    for (const pagePath of internalPages) {
        test(`Logout successfully from ${pagePath} page`, async ({ page }) => {
            await page.goto(`${pagePath}`);
            await page.getByRole('button', { name: 'Open Menu' }).click();
            await page.locator('[data-test="logout-sidebar-link"]').click();
            expect(page.url()).toBe('https://www.saucedemo.com/');
            await page.waitForSelector('[data-test="login-button"]', { state: 'visible' });
            await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
            console.log(`Logout successfully from ${pagePath} page`);
        });

        test(`Internal URL navigation after logout successfully from ${pagePath} page`, async ({ page }) => {
            await page.goto(`${pagePath}`);
            await page.getByRole('button', { name: 'Open Menu' }).click();
            await page.locator('[data-test="logout-sidebar-link"]').click();
            expect(page.url()).toBe('https://www.saucedemo.com/');
            await page.waitForSelector('[data-test="login-button"]', { state: 'visible' });
            expect(await page.getByRole('button', { name: 'Login' })).toBeVisible();
            console.log(`Logout successfully from ${pagePath} page`);
            await page.goto(`${pagePath}`);
            const errorMessage = await page.locator('.error-message-container.error').textContent();
            expect(errorMessage).toContain(`Epic sadface: You can only access '${pagePath}' when you are logged in.`);
            console.log('Expected error message login with a locked user:', errorMessage);
        });
    }
    
});