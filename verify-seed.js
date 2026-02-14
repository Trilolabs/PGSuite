const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    const counts = {
        Property: await prisma.property.count(),
        Room: await prisma.room.count(),
        Tenant: await prisma.tenant.count(),
        Due: await prisma.due.count(),
        Collection: await prisma.collection.count(),
        Expense: await prisma.expense.count(),
        DuesPackage: await prisma.duesPackage.count(),
        Booking: await prisma.booking.count(),
        OldTenant: await prisma.oldTenant.count(),
        Staff: await prisma.staff.count(),
        Complaint: await prisma.complaint.count(),
        Lead: await prisma.lead.count(),
    };
    console.log(JSON.stringify(counts, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
