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
    },
    {
        timestamps: true,
    }
);

// Compound index for unique product name per user
ProductSchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
