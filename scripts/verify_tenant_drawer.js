const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log("Navigating to Add Tenant Page...");
        await page.goto('http://localhost:3000/people/add-tenant');
        await page.waitForLoadState('networkidle');

        // Fill Basic Details
        console.log("Filling Basic Details...");
        await page.fill('input[name="name"]', 'Drawer Test Tenant');
        await page.fill('input[name="phone"]', '9998887776');

        // Check Tenant Type (New Field)
        await page.selectOption('select[name="tenantType"]', 'Professional');

        // Select Room
        // Wait for room options to populate
        await page.waitForTimeout(2000);
        await page.selectOption('select[name="roomId"]', { index: 1 }); // Select first available room

        // Open Drawer
        console.log("Opening Other Details Drawer...");
        await page.click('button:has-text("Add Other Details")');
        await page.waitForSelector('div[role="dialog"]'); // Wait for Drawer

        // Fill Drawer Fields
        console.log("Filling Drawer Fields...");
        // Personal
        await page.click('button:has-text("Personal Details")');
        await page.fill('textarea[name="remarks"]', 'Test Remarks from Playwright');
        await page.fill('input[name="email"]', 'test@drawer.com');
        await page.selectOption('select[name="nationality"]', 'Indian');

        // Bank
        await page.click('button:has-text("Bank Details")');
        await page.fill('input[name="bankName"]', 'HDFC Test Bank');
        await page.fill('input[name="accountNumber"]', '1234567890');

        // Close Drawer
        await page.click('button[aria-label="Close"]'); // Or click overlay

        // Check Booked By / Referred By (New Fields)
        await page.selectOption('select[name="bookedBy"]', 'Agent');
        await page.selectOption('select[name="referredBy"]', 'Friend');

        // Proceed to Next Steps
        console.log("Proceeding to Stay Details...");
        await page.click('button:has-text("Next: Stay Details")');

        await page.fill('input[name="moveIn"]', '2024-01-01');
        await page.selectOption('select[name="floor"]', { index: 1 });
        await page.waitForTimeout(500);
        await page.selectOption('select[name="bed"]', { index: 1 });

        console.log("Proceeding to Rental Terms...");
        await page.click('button:has-text("Next: Rental Terms")');

        await page.fill('input[name="rent"]', '10000');
        await page.fill('input[name="deposit"]', '20000');

        console.log("Proceeding to Confirmation...");
        await page.click('button:has-text("Next: Payment")');

        // Submit
        console.log("Submitting Form...");
        await page.click('button:has-text("Add Tenant")');

        // Wait for success toast or redirect
        await page.waitForURL('**/people/tenants');
        console.log("Successfully redirected to Tenants list!");

    } catch (error) {
        console.error("Test Failed:", error);
        await page.screenshot({ path: 'tenant_drawer_fail.png' });
    } finally {
        await browser.close();
    }
})();
