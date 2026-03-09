import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop'
        },
        cartItems: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        customerName: {
            type: String,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
        },
        previousDues: {
            type: Number,
            default: 0,
        },
        amountPaid: {
            type: Number,
            default: 0,
        },
        balanceDue: {
            type: Number,
            default: 0,
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Credit'],
            default: 'Cash',
        },
        isPaid: {
            type: Boolean,
            default: true,
        },
        receiptId: {
            type: String,
            required: true,
            unique: true,
        },
        printed: {
            type: Boolean,
            default: false,
        },
        receiptNumber: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure the model matches the latest schema even in dev mode with hot reloading
if (mongoose.models.Sale) {
    delete mongoose.models.Sale;
}

export default mongoose.model('Sale', SaleSchema);
