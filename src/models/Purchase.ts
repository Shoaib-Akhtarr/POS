import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: {
            type: String,
            required: [true, 'Please add a product name'],
        },
        supplierName: {
            type: String,
            required: [true, 'Please add a supplier name'],
            trim: true,
        },
        costPrice: {
            type: Number,
            required: [true, 'Please add a cost price'],
            min: [0, 'Cost price cannot be negative'],
        },
        quantity: {
            type: Number,
            required: [true, 'Please add quantity'],
            min: [1, 'Quantity must be at least 1'],
        },
        totalCost: {
            type: Number,
            required: true,
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
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

// Index for faster queries
PurchaseSchema.index({ user: 1, purchaseDate: -1 });
PurchaseSchema.index({ user: 1, supplierName: 1 });

// Force schema refresh in development
if (mongoose.models.Purchase) {
    delete mongoose.models.Purchase;
}

export default mongoose.model('Purchase', PurchaseSchema);
