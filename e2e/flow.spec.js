const { test, expect } = require('@playwright/test');

test.describe('Carbon Footprint App User Journey', () => {
  const testEmail = `e2e_${Date.now()}@test.com`;

  test('Signup -> Calculate -> View Analytics -> Logout', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/Carbon Footprint/);

    // 2. Signup
    await page.click('text=Get Started Now');
    await page.click('button[role="tab"]:has-text("Sign Up")');
    await page.fill('#signupFirst', 'E2E');
    await page.fill('#signupLast', 'TestUser');
    await page.fill('#signupEmail', testEmail);
    await page.fill('#signupPassword', 'SecureP@ss123');
    await page.click('text=Create Account');

    // Wait for Dashboard to appear
    await expect(page.locator('#dashboard')).toHaveClass(/active/);
    await expect(page.locator('#sidebarUser')).toContainText('E2E');

    // 3. Navigate to Calculator
    await page.click('[data-page="calculator"]');
    await expect(page.locator('#calculator')).toHaveClass(/active/);

    // 4. Input calculations
    await page.fill('#carKm', '100');
    await page.selectOption('#carType', 'petrol');
    
    // Check that footprint updates dynamically (Assertive ARIA live region)
    await expect(page.locator('#sum-transport')).not.toHaveText('0.0');
    await expect(page.locator('#totalCO2Big')).not.toHaveText('0.0');

    // Save Data
    await page.click('#logBtn');
    
    // Ensure success toast appears
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toHaveText(/Log saved successfully/i);

    // 5. Check Analytics (Validates Lazy Loading of Chart.js)
    await page.click('[data-page="analytics"]');
    await expect(page.locator('#analytics')).toHaveClass(/active/);
    
    // Ensure chart canvas exists
    await expect(page.locator('#trendChart')).toBeVisible();

    // 6. Logout
    await page.click('#btn-nav-logout');
    
    // Wait for landing page
    await expect(page.locator('#landing')).toHaveClass(/active/);
  });
});
