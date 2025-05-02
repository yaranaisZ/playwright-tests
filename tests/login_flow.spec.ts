import { test, expect } from '@playwright/test';

const INVALID_CREDENTIALS_ERROR = 'Epic sadface: Username and password do not match any user in this service';
const EMPTY_CREDENTIALS_ERROR = 'Epic sadface: Username is required';
const EMPTY_PASSWORD_ERROR = 'Epic sadface: Password is required';
const LOCKED_OUT_USER_ERROR = 'Epic sadface: Sorry, this user has been locked out.';

test.describe('Login Flow', () => {
    test('[smoke] Login with valid credentials', async ({ page }) => {
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
        await expect(page.locator('button[name="Login"]')).toHaveCount(0);
    });

    test ('[smoke] Login with invalid credentials', async ({ page }) => {
        await page.goto('/');
        expect(await page.title()).toBe('Swag Labs');
        const loginButton = page.getByRole('button', { name: 'Login' });
        expect(loginButton).toBeVisible();
        await page.getByPlaceholder('Username').fill('not_a_user');
        await page.getByPlaceholder('Password').fill('any_password');
        await page.getByRole('button', { name: 'Login' }).click();
        const errorMessage = await page.locator('.error-message-container.error').textContent();
        expect(errorMessage).toContain(INVALID_CREDENTIALS_ERROR);
        console.log('Error message text invalid credentials:', errorMessage);
    });

    test ('Login with a valid user but invalid password', async ({ page }) => {
        await page.goto('/');
        expect(await page.title()).toBe('Swag Labs');
        const loginButton = page.getByRole('button', { name: 'Login' });
        expect(loginButton).toBeVisible();
        await page.getByPlaceholder('Username').fill('standard_user');
        await page.getByPlaceholder('Password').fill('any_password');
        await page.getByRole('button', { name: 'Login' }).click();
        const errorMessage = await page.locator('.error-message-container.error').textContent();
        expect(errorMessage).toContain(INVALID_CREDENTIALS_ERROR);
        console.log('Error message text invalid password:', errorMessage);
    });

    test ('Login with a locked out user', async ({ page }) => {
        await page.goto('/');
        expect(await page.title()).toBe('Swag Labs');
        const loginButton = page.getByRole('button', { name: 'Login' });
        expect(loginButton).toBeVisible();
        await page.getByPlaceholder('Username').fill('locked_out_user');
        await page.getByPlaceholder('Password').fill('secret_sauce');
        await page.getByRole('button', { name: 'Login' }).click();
        const errorMessage = await page.locator('.error-message-container.error').textContent();
        expect(errorMessage).toContain(LOCKED_OUT_USER_ERROR);
        console.log('Error message login with a locked user:', errorMessage);
    });   

    test ('Login with empty credentials', async ({ page }) => {
        await page.goto('/');
        let errorMessageText = '';
        expect(await page.title()).toBe('Swag Labs');
        const loginButton = page.getByRole('button', { name: 'Login' });
        expect(loginButton).toBeVisible();

        //No credentials
        await page.getByRole('button', { name: 'Login' }).click();
        await page.waitForSelector('.error-message-container.error', { timeout: 5000 });
        const errorMessage = page.locator('.error-message-container.error');
        errorMessageText = (await errorMessage.textContent()) ?? '';
        await expect(errorMessage).toBeVisible();
        expect(errorMessageText).toBe(EMPTY_CREDENTIALS_ERROR);
        console.log('Error message text no credentials:', await errorMessage.textContent());
        await page.locator('.error-button').click();
        expect(errorMessage).toBeHidden();

        //Empty password
        await page.getByPlaceholder('Username').fill('standard_user');
        await page.getByRole('button', { name: 'Login' }).click();
        errorMessageText = (await errorMessage.textContent()) ?? '';
        await expect(errorMessage).toBeVisible();
        expect(errorMessageText).toBe(EMPTY_PASSWORD_ERROR);
        console.log('Error message text empty password:', await errorMessage.textContent());
        await page.locator('.error-button').click();
        expect(errorMessage).toBeHidden();

        //Empty username
        await page.getByPlaceholder('Username').fill('');
        await page.getByPlaceholder('Password').fill('secret_sauce');
        await page.getByRole('button', { name: 'Login' }).click();  
        await expect(errorMessage).toBeVisible();
        errorMessageText = (await errorMessage.textContent()) ?? '';
        expect(errorMessageText).toBe(EMPTY_CREDENTIALS_ERROR);
        console.log('Error message text empty user:', await errorMessage.textContent());
    });
});