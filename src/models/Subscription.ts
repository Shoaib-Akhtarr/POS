import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
    {
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true,
            unique: true
        },
        plan: {
            type: String,
            enum: ['free', 'starter', 'professional'],
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid'],
            default: 'trialing'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true
        },
        cancelAtPeriodEnd: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
