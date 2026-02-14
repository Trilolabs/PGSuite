const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.duesPackage.count();
        console.log(`Total Packages: ${count}`);

        const packages = await prisma.duesPackage.findMany();
        console.log('--- Packages ---');
        packages.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}, Type: ${p.type}, Active: ${p.active}, Status: ${p.status}`);
            // Check for potential nulls in required fields if any (schema has most as optional or default)
        });
    } catch (e) {
        console.error('Error querying DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
