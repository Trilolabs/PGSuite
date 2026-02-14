const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath, { verbose: console.log });

try {
    const stmt = db.prepare('SELECT * FROM DuesPackage');
    const packages = stmt.all();
    console.log(`Total Packages: ${packages.length}`);
    packages.forEach(p => {
        console.log(`ID: ${p.id}, Name: ${p.name}, Type: ${p.type}, Active: ${p.active}, Status: ${p.status}`);
    });
} catch (e) {
    console.error('Error querying DB:', e);
} finally {
    db.close();
}
