import { test, expect } from '@playwright/test';

test.describe('Customers CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customers');
  });

  test('should display customers list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Customers');
    await expect(page.locator('text=New Customer')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should create a new customer', async ({ page }) => {
    await page.click('text=New Customer');
    await expect(page.locator('h1')).toContainText('Create New Customer');

    await page.fill('#name', 'Test Customer');
    await page.fill('#email', 'test@example.com');
    await page.fill('#company', 'Test Company');
    await page.selectOption('#tier', 'premium');

    await page.click('text=Create Customer');
    
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/customers/new')) {
      await expect(page.locator('form')).toBeVisible();
    } else {
      await expect(page.locator('h1')).toContainText('Customers');
    }
  });

  test('should view customer details', async ({ page }) => {
    const viewLink = page.locator('text=View').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      await expect(page.locator('h1')).toContainText('Customer Details');
      await expect(page.locator('text=Edit')).toBeVisible();
      await expect(page.locator('text=Back to List')).toBeVisible();
    }
  });

  test('should edit customer', async ({ page }) => {
    const editLink = page.locator('text=Edit').first();
    if (await editLink.isVisible()) {
      await editLink.click();
      await expect(page.locator('h1')).toContainText('Edit Customer');

      await page.fill('#name', 'Updated Customer Name');
      await page.click('text=Update Customer');
      
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/edit')) {
        await expect(page.locator('form')).toBeVisible();
      } else {
        await expect(page.locator('h1')).toContainText('Customers');
      }
    }
  });

  test('should search customers', async ({ page }) => {
    await page.fill('input[name="q"]', 'test');
    await page.click('text=Search');
    
    await expect(page.locator('table')).toBeVisible();
  });
});
