import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add an account name'],
            trim: true
        },
        type: {
            type: String,
            enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
            required: true
        },
        balance: {
            type: Number,
            default: 0
        },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true
        }
    },
    { timestamps: true }
);

// Prevent duplicate account names within the same shop
AccountSchema.index({ name: 1, shop: 1 }, { unique: true });

export default mongoose.models.Account || mongoose.model('Account', AccountSchema);
