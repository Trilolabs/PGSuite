const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    const browser = await chromium.launch({ headless: true }); // headless: true for CI environment
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Starting Tenant Gap Fill Verification...');

    try {
        // 1. Navigate to Add Tenant Page
        await page.goto('http://localhost:3000/people/add-tenant');
        await page.waitForTimeout(1000);

        // 2. Step 1: Tenant Details
        console.log('Filling Step 1: Tenant Details...');
        await page.fill('input[name="name"]', 'Gap Fill Tenant');
        await page.fill('input[name="phone"]', '9876543299'); // Unique phone
        await page.selectOption('select[name="roomId"]', { index: 1 }); // Select first available room
        await page.click('button:has-text("Add Other Details")');
        await page.waitForSelector('text=Other Details');

        // Fill Mother's Details in Drawer
        await page.click('button:has-text("Parent Details")');
        await page.fill('input[name="motherName"]', 'Mother Gap');
        await page.fill('input[name="motherPhone"]', '9876543298');
        await page.click('button[aria-label="Close"]'); // Close drawer (adjust selector if needed)

        await page.click('button:has-text("Next: Stay Details")');

        // 3. Step 2: Stay Details
        console.log('Filling Step 2: Stay Details...');
        await page.selectOption('select[name="stayType"]', 'Long Stay (Monthly)');
        await page.fill('input[name="moveIn"]', '2024-01-01');
        await page.fill('input[name="moveOut"]', '2024-12-31'); // New field
        await page.selectOption('select[name="lockIn"]', '6'); // 6 Months
        await page.selectOption('select[name="agreementPeriod"]', '11'); // 11 Months

        // Helper to find Next button if text varies slightly
        await page.click('button:has-text("Next: Rental Terms")');

        // 4. Step 3: Rental Terms
        console.log('Filling Step 3: Rental Terms...');
        await page.fill('input[name="rent"]', '10000');
        await page.fill('input[name="deposit"]', '20000');
        await page.selectOption('select[name="rentStartDate"]', '5'); // Rent starts on 5th
        await page.selectOption('select[name="electricityType"]', 'Submeter');
        await page.fill('input[name="electricityRate"]', '12'); // Rs 12/unit

        await page.click('button:has-text("Next: Payment")');

        // 5. Step 4: Payment - Verify Table
        console.log('Verifying Step 4: Payment Table...');
        await page.waitForSelector('text=Opening Balance');
        const tableContent = await page.textContent('table');
        if (!tableContent.includes('Security Deposit') || !tableContent.includes('Rent')) {
            throw new Error('Payment Table rows missing!');
        }
        console.log('Payment Table Verified.');

        // Submit
        await page.click('button:has-text("Add Tenant")');
        await page.waitForURL('**/people/tenants');
        console.log('Form Submitted.');

        // 6. Verify Database
        console.log('Verifying Database...');
        const tenant = await prisma.tenant.findFirst({
            where: { phone: '9876543299' }
        });

        if (!tenant) throw new Error('Tenant not found in DB');

        console.log('Tenant Found:', tenant.name);

        if (tenant.motherName !== 'Mother Gap') throw new Error(`Mother Name mismatch: ${tenant.motherName}`);
        if (tenant.moveOut !== '2024-12-31') throw new Error(`Move Out mismatch: ${tenant.moveOut}`);
        if (tenant.lockIn !== 6) throw new Error(`Lock In mismatch: ${tenant.lockIn}`);
        if (tenant.agreementPeriod !== 11) throw new Error(`Agreement Period mismatch: ${tenant.agreementPeriod}`);
        if (tenant.rentStartDate !== '5') throw new Error(`Rent Start Date mismatch: ${tenant.rentStartDate}`);
        if (tenant.electricityType !== 'Submeter') throw new Error(`Electricity Type mismatch: ${tenant.electricityType}`);
        if (tenant.electricityRate !== 12) throw new Error(`Electricity Rate mismatch: ${tenant.electricityRate}`);

        console.log('Gap Fill Verification PASSED!');

    } catch (error) {
        console.error('Verification FAILED:', error);
        await page.screenshot({ path: 'gap_fill_failure.png' });
        process.exit(1);
    } finally {
        await browser.close();
        await prisma.$disconnect();
    }
})();
