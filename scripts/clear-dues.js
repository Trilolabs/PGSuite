const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

try {
    const stmt = db.prepare('DELETE FROM DuesPackage');
    const info = stmt.run();
    console.log(`Deleted ${info.changes} rows.`);
} catch (e) {
    console.error('Error clearing DB:', e);
} finally {
    db.close();
}
