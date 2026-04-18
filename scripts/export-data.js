const dns = require('dns');
// Fix for Node.js 18+ SRV resolution issues on some networks
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * MongoDB Data Exporter
 * Automatically detects URI from .env.local and saves all records to a single JSON file.
 */
async function exportData() {
  // 1. Load Environment Variables from .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local not found in project root.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.*)/);
  if (!uriMatch) {
    console.error('Error: MONGODB_URI not found in .env.local.');
    process.exit(1);
  }
  
  // Clean URI (remove possible quotes or comments)
  const uri = uriMatch[1].trim().split('#')[0].replace(/^['"]|['"]$/g, '');

  console.log('Connecting to MongoDB Atlas...');
  
  const opts = {
    family: 4, // Force IPv4 for Windows compatibility
    serverSelectionTimeoutMS: 15000,
  };

  try {
    console.log('Using robust connection mode (bypassing DNS SRV)...');
    
    // This is the direct connection string to your Atlas Shards
    const directUri = `mongodb://onlyshoaib158_db_user:6lkkagsx7qhlk60n@ac-4tuiqmr-shard-00-00.uxua26j.mongodb.net:27017,ac-4tuiqmr-shard-00-01.uxua26j.mongodb.net:27017,ac-4tuiqmr-shard-00-02.uxua26j.mongodb.net:27017/?ssl=true&authSource=admin&appName=Cluster0`;

    // Attempt connection
    await mongoose.connect(directUri, {
      ...opts,
      serverSelectionTimeoutMS: 30000,
    });
    console.log('✅ Successfully connected to MongoDB Shards.');
  } catch (err) {
    console.error('\n❌ Connection failed again.');
    console.log('Error Details:', err.message);
    
    console.log('\n--- Troubleshooting Checklist ---');
    console.log('1. IS YOUR DB PAUSED? Check your MongoDB Atlas Dashboard.');
    console.log('2. IP WHITELIST: Even if the POS works, your computer IP might have changed.');
    console.log('   Go to Atlas -> Network Access -> Add Current IP Address.');
    console.log('3. PORT 27017: Ensure your firewall or ISP is not blocking port 27017.');
    process.exit(1);
  }

  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.warn('⚠️ No collections found in the database.');
    }

    const backup = {};
    const timestamp = new Date().toISOString();
    
    // Add metadata
    backup._metadata = {
      exportedAt: timestamp,
      database: db.databaseName,
      collections: collections.map(c => c.name)
    };

    // Export each collection
    for (const col of collections) {
      const collectionName = col.name;
      console.log(`Exporting collection: ${collectionName}...`);
      
      const data = await db.collection(collectionName).find({}).toArray();
      backup[collectionName] = data;
      console.log(`  - Exported ${data.length} records.`);
    }

    const outputPath = path.join(__dirname, '..', 'database-backup.json');
    fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2), 'utf8');
    
    console.log('\n✅ Backup complete!');
    console.log(`File saved to: database-backup.json`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Backup failed:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure your current IP is whitelisted in MongoDB Atlas (Network Access).');
    console.log('2. Check your internet connection.');
    console.log('3. Verify the MONGODB_URI in .env.local is correct.');
    process.exit(1);
  }
}

exportData();
