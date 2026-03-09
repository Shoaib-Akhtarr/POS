import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a customer name'],
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        totalDues: {
            // This is the running balance. Positive means the customer owes money (Credit).
            // Negative means advance payment received.
            type: Number,
            default: 0,
        },
        totalDiscount: {
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop'
        },
    },
    {
        timestamps: true,
    }
);

// Create a compound index so that multiple users can have a customer with the same phone number
// but a single user cannot have multiple customers with the same phone number
CustomerSchema.index({ phone: 1, user: 1 }, { unique: true, partialFilterExpression: { phone: { $gt: "" } } });

// Force schema refresh in development
if (mongoose.models.Customer) {
    delete mongoose.models.Customer;
}

export default mongoose.model('Customer', CustomerSchema);
