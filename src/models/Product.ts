import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true,
        },
        costPrice: {
            type: Number,
            default: 0,
        },
        sellingPrice: {
            type: Number,
            required: [true, 'Please add a selling price'],
        },
        quantity: {
            type: Number,
            required: [true, 'Please add quantity'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        description: {
            type: String,
            default: '',
        },
        salesCount: {
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

// Compound index for unique product name per user
ProductSchema.index({ name: 1, user: 1 }, { unique: true });

// Force schema refresh in development
if (mongoose.models.Product) {
    delete mongoose.models.Product;
}

export default mongoose.model('Product', ProductSchema);
