import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
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
        await page.locator('.btn_inventory').first().click();
        expect(page.locator('[data-test="shopping-cart-badge"]')).toBeVisible();
    });

    test('[smoke] Checkout flow with valid data - Happy Path', async ({ page }) => {
        // Proceed to checkout
        const nameProductAdded = (await page.locator('.inventory_item_name').first().textContent()) ?? '';
        const priceProductAdded = (await page.locator('.inventory_item_price').first().textContent()) ?? '';
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
        await page.getByRole('button', { name: 'Checkout' }).click();
        
        // Fill in checkout information
        await page.waitForSelector('.checkout_info', { state: 'visible' });
        expect(page.url()).toContain('/checkout-step-one.html');
        await page.getByPlaceholder('First Name').fill('Fulano');
        await page.getByPlaceholder('Last Name').fill('Perez');
        await page.getByPlaceholder('Zip/Postal Code').fill('12345');
        await page.getByRole('button', { name: 'Continue' }).click();
        
        // Finish the checkout process
        await page.waitForSelector('.cart_list', { state: 'visible' });
        expect(page.url()).toContain('/checkout-step-two.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
        expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(nameProductAdded );
        expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(priceProductAdded);
        await page.getByRole('button', { name: 'Finish' }).click();
        
        // Verify the order confirmation message
        const confirmationMessage = await page.locator('.complete-header').textContent();
        expect(confirmationMessage).toContain('Thank you for your order!');
    });

    test('Checkout flow cart validations', async ({ page }) => {
        // Proceed to checkout
        const nameProductAdded = (await page.locator('.inventory_item_name').first().textContent()) ?? '';
        const priceProductAdded = (await page.locator('.inventory_item_price').first().textContent()) ?? '';
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
                
        // Item added to cart validations
        expect(await page.locator('[data-test="inventory-item-name"]').textContent()).toBe(nameProductAdded);        
        expect(await page.locator('[data-test="inventory-item-price"]').textContent()).toBe(priceProductAdded);
        expect(await page.locator('.cart_quantity').textContent()).toBe('1');
        let removeButtonTestID = nameProductAdded.replace(/\s+/g, '-').toLowerCase();
        expect(await page.locator('[data-test="remove-' + removeButtonTestID + '"]')).toBeVisible();

        // Continue Shopping validations from cart page
        expect(await page.locator('[data-test="continue-shopping"]')).toBeVisible();
        await page.getByRole('button', { name: 'Continue Shopping' }).click();
        expect(page.url()).toContain('/inventory.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Products');
        expect(await page.locator('[data-test="shopping-cart-badge"]')).toBeVisible();
        expect(await page.locator('[data-test="remove-' + removeButtonTestID + '"]')).toBeVisible();

        //Checkout click validations from cart page
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        expect(await page.locator('[data-test="checkout"]')).toBeVisible();
        await page.getByRole('button', { name: 'Checkout' }).click();
        expect(page.url()).toContain('/checkout-step-one.html');
    });

    test('Checkout flow step-one validations', async ({ page }) => {    
        // Proceed to checkout
        const nameProductAdded = (await page.locator('.inventory_item_name').first().textContent()) ?? '';
        const priceProductAdded = (await page.locator('.inventory_item_price').first().textContent()) ?? '';
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        await page.getByRole('button', { name: 'Checkout' }).click();
        expect(page.url()).toContain('/checkout-step-one.html');
        
        // Leave fields empty and click continue
        await page.getByRole('button', { name: 'Continue' }).click();
        const firstNameError = await page.locator('[data-test="error"]').textContent();
        expect(firstNameError).toContain('Error: First Name is required');
        
        await page.getByPlaceholder('First Name').fill('Fulano');
        await page.getByRole('button', { name: 'Continue' }).click();
        const lastNameError = await page.locator('[data-test="error"]').textContent();
        expect(lastNameError).toContain('Error: Last Name is required');
        
        await page.getByPlaceholder('Last Name').fill('Perez');
        await page.getByRole('button', { name: 'Continue' }).click();
        const postalCodeError = await page.locator('[data-test="error"]').textContent();
        expect(postalCodeError).toContain('Error: Postal Code is required');

        // Cancel checkout and return to cart with the same item
        await page.getByRole('button', { name: 'Cancel' }).click();
        expect(page.url()).toContain('/cart.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
        expect(await page.locator('[data-test="inventory-item-name"]').textContent()).toBe(nameProductAdded);        
        expect(await page.locator('[data-test="inventory-item-price"]').textContent()).toBe(priceProductAdded);
        expect(await page.locator('.cart_quantity').textContent()).toBe('1');
        expect(await page.locator('[data-test="checkout"]')).toBeVisible();
        await page.getByRole('button', { name: 'Checkout' }).click();
        expect(page.url()).toContain('/checkout-step-one.html');

        // Checkout button click validations
        await page.getByPlaceholder('First Name').fill('Fulano');
        await page.getByPlaceholder('Last Name').fill('Perez');
        await page.getByPlaceholder('Zip/Postal Code').fill('12345');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toContain('/checkout-step-two.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
    });

    test('Checkout flow step-two validations', async ({ page }) => {    
        // Proceed to checkout
        const nameProductAdded = (await page.locator('.inventory_item_name').first().textContent()) ?? '';
        const priceProductAdded = (await page.locator('.inventory_item_price').first().textContent()) ?? '';
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        await page.getByRole('button', { name: 'Checkout' }).click();
        expect(page.url()).toContain('/checkout-step-one.html');
        await page.getByPlaceholder('First Name').fill('Fulano');
        await page.getByPlaceholder('Last Name').fill('Perez');
        await page.getByPlaceholder('Zip/Postal Code').fill('12345');
        
        // Click continue 
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toContain('/checkout-step-two.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
        expect(await page.locator('[data-test="inventory-item-name"]').textContent()).toBe(nameProductAdded);        
        expect(await page.locator('[data-test="inventory-item-price"]').textContent()).toBe(priceProductAdded);
        expect(await page.locator('.cart_quantity').textContent()).toBe('1');
        expect(await page.locator('[data-test="finish"]')).toBeVisible();
        expect(await page.locator('[data-test="cancel"]')).toBeVisible();
        expect(await page.locator('[data-test="payment-info-label"]')).toBeVisible();
        expect(await page.locator('[data-test="shipping-info-label"]')).toBeVisible();
        expect(await page.locator('[data-test="total-info-label"]')).toBeVisible();
        expect(await page.locator('[data-test="subtotal-label"]')).toBeVisible();
        expect(await page.locator('[data-test="subtotal-label"]')).toContainText(priceProductAdded);
        expect(await page.locator('[data-test="tax-label"]')).toBeVisible();
        expect(await page.locator('[data-test="total-label"]')).toBeVisible();

        // Cancel button click validations
        await page.getByRole('button', { name: 'Cancel' }).click();
        expect(page.url()).toContain('/inventory.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Products');
        expect(await page.locator('[data-test="shopping-cart-badge"]')).toBeVisible();

        // Finish button click validations
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        await page.getByRole('button', { name: 'Checkout' }).click();
        expect(page.url()).toContain('/checkout-step-one.html');
        await page.getByPlaceholder('First Name').fill('Fulano');
        await page.getByPlaceholder('Last Name').fill('Perez');
        await page.getByPlaceholder('Zip/Postal Code').fill('12345');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toContain('/checkout-step-two.html');
        await page.getByRole('button', { name: 'Finish' }).click();
        expect(page.url()).toContain('/checkout-complete.html');
        await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Complete!');
    });

    test('Checkout flow complete validations', async ({ page }) => {
        // Proceed to checkout
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        await page.getByRole('button', { name: 'Checkout' }).click();
        expect(page.url()).toContain('/checkout-step-one.html');
        await page.getByPlaceholder('First Name').fill('Fulano');
        await page.getByPlaceholder('Last Name').fill('Perez');
        await page.getByPlaceholder('Zip/Postal Code').fill('12345');
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toContain('/checkout-step-two.html');
        await page.getByRole('button', { name: 'Finish' }).click();
        expect(page.url()).toContain('/checkout-complete.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Complete!');
        const confirmationMessage = await page.locator('.complete-header').textContent();
        expect(confirmationMessage).toContain('Thank you for your order!');
        expect(await page.locator('[data-test="back-to-products"]')).toBeVisible();
        expect(await page.locator('[data-test="back-to-products"]').textContent()).toContain('Back Home');
        await page.getByRole('button', { name: 'Back Home' }).click();
        expect(page.url()).toContain('/inventory.html');
        await expect(page.locator('[data-test="title"]')).toHaveText('Products');
        await expect(page.locator('[data-test="shopping-cart-badge"]')).not.toBeVisible();
    });

    test('Checkout flow more than 1 item validations - Remove option', async ({ page }) => {
        // Add more than 1 item to the cart
        const nameProductAdded = (await page.locator('.inventory_item_name').first().textContent()) ?? '';
        const priceProductAdded = (await page.locator('.inventory_item_price').first().textContent()) ?? '';
        await page.locator('.btn_inventory').nth(1).click();
        const name2ndProductAdded = (await page.locator('.inventory_item_name').nth(1).textContent()) ?? '';
        const price2ndProductAdded = (await page.locator('.inventory_item_price').nth(1).textContent()) ?? '';
        expect(await page.locator('[data-test="shopping-cart-badge"]')).toBeVisible();
        let removeButtonTestID = nameProductAdded.replace(/\s+/g, '-').toLowerCase();
        expect(await page.locator('[data-test="remove-' + removeButtonTestID + '"]')).toBeVisible();
        let remove2ndButtonTestID = name2ndProductAdded.replace(/\s+/g, '-').toLowerCase();
        expect(await page.locator('[data-test="remove-' + remove2ndButtonTestID + '"]')).toBeVisible();

        // Proceed to checkout
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.waitForSelector('.cart_item', { state: 'visible' });
        expect(page.url()).toContain('/cart.html');
        expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
                
        // Items added to cart validations
        expect(await page.locator('[data-test="inventory-item-name"]').first().textContent()).toBe(nameProductAdded);        
        expect(await page.locator('[data-test="inventory-item-price"]').first().textContent()).toBe(priceProductAdded);
        expect(await page.locator('.cart_quantity').first().textContent()).toBe('1');
        expect(await page.locator('[data-test="remove-' + removeButtonTestID + '"]').first()).toBeVisible();
        expect(await page.locator('[data-test="inventory-item-name"]').nth(1).textContent()).toBe(name2ndProductAdded);        
        expect(await page.locator('[data-test="inventory-item-price"]').nth(1).textContent()).toBe(price2ndProductAdded);
        expect(await page.locator('.cart_quantity').nth(1).textContent()).toBe('1');
        expect(await page.locator('[data-test="remove-' + remove2ndButtonTestID + '"]')).toBeVisible();

        // Fill in checkout information
        await page.getByRole('button', { name: 'Checkout' }).click();
        expect(page.url()).toContain('/checkout-step-one.html');
        await page.getByPlaceholder('First Name').fill('Fulano');
        await page.getByPlaceholder('Last Name').fill('Perez');
        await page.getByPlaceholder('Zip/Postal Code').fill('12345');
        
        // Click continue and verify the number of items in the cart
        await page.getByRole('button', { name: 'Continue' }).click();
        expect(page.url()).toContain('/checkout-step-two.html');
        const itemCount = await page.locator('.cart_quantity').count();
        expect(itemCount).toBe(2);

        //Remove one item from the cart and verify the number of items in the cart
        await page.goBack();
        expect(page.url()).toContain('/checkout-step-one.html');
        await page.goBack();
        expect(page.url()).toContain('/cart.html');
        await page.locator('[data-test="remove-' + removeButtonTestID + '"]').first().click();
        const itemCountAfterRemove = await page.locator('.cart_quantity').count();
        expect(itemCountAfterRemove).toBe(1);
        expect(await page.locator('[data-test="inventory-item-name"]').first().textContent()).toBe(name2ndProductAdded);
        expect(await page.locator('[data-test="inventory-item-price"]').first().textContent()).toBe(price2ndProductAdded);
    });
    
});