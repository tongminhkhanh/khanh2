const fs = require('fs');
const path = require('path');

const sourceFile = 'admin.html';
const backupPrefix = 'admin_backup_';
const backupExt = '.html';
const dir = __dirname;

// 1. Find existing backups matching admin_backup_N.html
const files = fs.readdirSync(dir);
let maxVersion = 0;

files.forEach(file => {
    // Regex to match exactly admin_backup_1.html, admin_backup_2.html, etc.
    const match = file.match(/^admin_backup_(\d+)\.html$/);
    if (match) {
        const version = parseInt(match[1], 10);
        // Ignore date-based backups (e.g., 20251221)
        if (!isNaN(version) && version < 10000 && version > maxVersion) {
            maxVersion = version;
        }
    }
});

// 2. Determine next version
const nextVersion = maxVersion + 1;
const backupFile = `${backupPrefix}${nextVersion}${backupExt}`;

// 3. Perform copy
try {
    fs.copyFileSync(path.join(dir, sourceFile), path.join(dir, backupFile));
    console.log(`✅ Backup successful: ${backupFile}`);
} catch (err) {
    console.error('❌ Backup failed:', err);
}
