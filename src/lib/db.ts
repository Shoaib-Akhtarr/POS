import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      family: 4, // Force IPv4 to avoid SSL handshake issues on some Windows setups
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB Connected successfully');

    // Ensure models are registered and indexes are synchronized
    // This is important for unique constraints to be applied correctly in MongoDB
    if (typeof window === 'undefined') {
      const Product = (await import('@/models/Product')).default;
      const Customer = (await import('@/models/Customer')).default;
      const Sale = (await import('@/models/Sale')).default;

      // Wrap syncIndexes in a safe handler to prevent SSL errors from causing pool cleared errors
      const safeSync = async (model: any, name: string) => {
        try {
          await model.syncIndexes();
        } catch (err: any) {
          if (err.name === 'MongoPoolClearedError' || err.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') {
            console.warn(`${name} syncIndexes skipped (SSL/IP Whitelist issue). Please check Atlas Network Access.`);
          } else {
            console.error(`${name} syncIndexes error:`, err);
          }
        }
      };

      // We don't await these to avoid blocking every connection request
      safeSync(Product, 'Product');
      safeSync(Customer, 'Customer');
      safeSync(Sale, 'Sale');
    }
  } catch (e) {
    console.error('MongoDB Connection Error:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
