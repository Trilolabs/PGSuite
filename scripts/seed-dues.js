const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

const standardPackages = [
    { name: 'Rent', type: 'Fixed', amount: 8000, frequency: 'Monthly', active: 1, description: 'Monthly room rent' },
    { name: 'Security Deposit', type: 'Variable', amount: null, frequency: 'One-time', active: 1, description: 'Refundable security deposit' },
    { name: 'Electricity Meter', type: 'Variable', amount: null, frequency: 'Monthly', active: 0, description: 'Per unit electricity charge' },
    { name: 'Food', type: 'Fixed', amount: 3500, frequency: 'Monthly', active: 0, description: 'Monthly food/mess charge' },
    { name: 'Joining Fee', type: 'Fixed', amount: 1000, frequency: 'One-time', active: 0, description: 'One-time joining fee' },
    { name: 'Laundry', type: 'Fixed', amount: 500, frequency: 'Monthly', active: 0, description: 'Monthly laundry service' },
    { name: 'Maintenance', type: 'Fixed', amount: 500, frequency: 'Monthly', active: 0, description: 'Monthly maintenance charge' },
    { name: 'Water', type: 'Fixed', amount: 300, frequency: 'Monthly', active: 0, description: 'Monthly water charge' },
    { name: 'Wifi', type: 'Fixed', amount: 200, frequency: 'Monthly', active: 0, description: 'High-speed internet' },
    { name: 'Police Verification', type: 'Fixed', amount: 500, frequency: 'One-time', active: 0, description: 'Police verification charges' },
    { name: 'Automatic Joining Fee', type: 'Variable', amount: null, frequency: 'One-time', active: 0, description: 'Auto-calculated joining fee' },
    { name: 'Automatic Move out Charges', type: 'Variable', amount: null, frequency: 'One-time', active: 0, description: 'Auto-calculated move out charges' },
    { name: 'Mess', type: 'Variable', amount: null, frequency: 'Monthly', active: 0, description: 'Mess charges' },
    { name: 'Electricity Bill', type: 'Variable', amount: null, frequency: 'Monthly', active: 0, description: 'Electricity bill' },
    { name: 'Manual Late Fine', type: 'Variable', amount: null, frequency: 'One-time', active: 0, description: 'Late payment fine' },
    { name: 'Daily Rent Package', type: 'Variable', amount: null, frequency: 'Daily', active: 0, description: 'Daily rent' },
    { name: 'Weekly Rent Package', type: 'Variable', amount: null, frequency: 'Weekly', active: 0, description: 'Weekly rent' },
    { name: 'Yearly Rent Package', type: 'Variable', amount: null, frequency: 'Yearly', active: 0, description: 'Yearly rent' },
    { name: 'Rental Agreement Charges', type: 'Variable', amount: null, frequency: 'One-time', active: 0, description: 'Agreement charges' },
    { name: '3 Months Rent Package', type: 'Variable', amount: null, frequency: 'Quarterly', active: 0, description: 'Quarterly rent' },
    { name: '6 Months Rent Package', type: 'Variable', amount: null, frequency: 'Half-yearly', active: 0, description: 'Half-yearly rent' },
    { name: '9 Months Rent Package', type: 'Variable', amount: null, frequency: '9-Months', active: 0, description: '9-months rent' },
    { name: 'Others', type: 'Variable', amount: null, frequency: 'One-time', active: 0, description: 'Other charges' },
    { name: 'Automatic Late Fine', type: 'Variable', amount: null, frequency: 'Daily', active: 0, description: 'Late payment auto-fine' },
];

try {
    const propertyId = 'PROP001'; // Default property
    const checkStmt = db.prepare('SELECT id FROM DuesPackage WHERE name = ? AND propertyId = ?');
    const insertStmt = db.prepare(`
        INSERT INTO DuesPackage (id, name, type, amount, frequency, deposit, active, description, propertyId, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
        for (const pkg of standardPackages) {
            const existing = checkStmt.get(pkg.name, propertyId);
            if (!existing) {
                const id = crypto.randomUUID();
                insertStmt.run(
                    id,
                    pkg.name,
                    pkg.type,
                    pkg.amount,
                    pkg.frequency,
                    0,
                    pkg.active,
                    pkg.description,
                    propertyId,
                    pkg.active ? 'Active' : 'Inactive'
                );
                console.log(`Created: ${pkg.name}`);
            } else {
                console.log(`Skipped (Exists): ${pkg.name}`);
            }
        }
    })();
} catch (e) {
    console.error('Error seeding DB:', e);
} finally {
    db.close();
}
