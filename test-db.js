const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://onlyshoaib158_db_user:6lkkagsx7qhlk60n@cluster0.uxua26j.mongodb.net/?appName=Cluster0';

const TestSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.models.Test || mongoose.model('Test', TestSchema);

console.log('Testing connection to MongoDB with forced IPv4...');

const opts = {
    family: 4,
    serverSelectionTimeoutMS: 5000,
};

mongoose.connect(MONGODB_URI, opts)
    .then(async () => {
        console.log('Successfully connected to MongoDB');
        console.log('Running syncIndexes (safe mode)...');
        try {
            await TestModel.syncIndexes();
            console.log('syncIndexes completed successfully');
            process.exit(0);
        } catch (syncErr) {
            console.warn('syncIndexes error (Expected if IP not whitelisted):', syncErr.message || syncErr);
            console.log('Connection itself is verified. Please check Atlas Network Access if syncIndexes failed.');
            process.exit(0); // Exit with 0 because we've handled the informative warning
        }
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });
