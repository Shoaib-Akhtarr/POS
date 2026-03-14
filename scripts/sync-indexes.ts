import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/db';
import Product from '../src/models/Product';
import Customer from '../src/models/Customer';
import Sale from '../src/models/Sale';

async function syncAllIndexes() {
    try {
        console.log('Starting Manual Index Synchronization...');
        await connectToDatabase();
        
        const models = [
            { model: Product, name: 'Product' },
            { model: Customer, name: 'Customer' },
            { model: Sale, name: 'Sale' }
        ];

        for (const { model, name } of models) {
            console.log(`Syncing indexes for ${name}...`);
            await model.syncIndexes();
            console.log(`✅ ${name} indexes synchronized.`);
        }

        console.log('All indexes synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Index Sync Failed:', error);
        process.exit(1);
    }
}

syncAllIndexes();
