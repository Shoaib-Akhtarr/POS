const fs = require('fs');
const path = require('path');

/**
 * Backup Verification Script
 * Validates the existence and contents of the database-backup.json file.
 */
function testExport() {
  const filePath = path.join(__dirname, '..', 'database-backup.json');
  
  if (!fs.existsSync(filePath)) {
    console.error('\n❌ Error: database-backup.json not found in project root.');
    console.log('Run `node scripts/export-data.js` first.');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    console.log('\n--- Backup Verification Results ---');
    
    // Check for metadata
    if (!data._metadata) {
      console.warn('⚠️ Warning: Backup file is missing metadata (_metadata).');
    } else {
      console.log(`Exported At: ${data._metadata.exportedAt}`);
      console.log(`Database:    ${data._metadata.database}`);
    }

    const collections = Object.keys(data).filter(k => k !== '_metadata');
    console.log(`Total Collections: ${collections.length}`);
    
    let totalRecords = 0;
    collections.forEach(col => {
      const count = Array.isArray(data[col]) ? data[col].length : 0;
      console.log(`  - ${col}: ${count} records`);
      totalRecords += count;
    });

    if (collections.length > 0) {
      console.log('\n✅ Verification successful: JSON is valid and contains data.');
      console.log(`Summary: ${totalRecords} total records exported across ${collections.length} collections.`);
    } else {
      console.log('\n⚠️ Warning: Backup file is valid but contains no actual data collections.');
    }
    
  } catch (err) {
    console.error('\n❌ Error: Failed to parse backup file.', err.message);
    process.exit(1);
  }
}

testExport();
