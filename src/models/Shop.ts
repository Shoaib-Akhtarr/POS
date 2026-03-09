import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a shop name'],
      trim: true
    },
    businessType: {
      type: String,
      required: [true, 'Please add a business type'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional'],
      default: 'free'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'trial'],
      default: 'trial'
    },
    settings: {
      currency: { type: String, default: 'Rs.' },
      taxEnabled: { type: Boolean, default: false },
      taxPercentage: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Force schema refresh in development
if (mongoose.models.Shop) {
  delete mongoose.models.Shop;
}

export default mongoose.model('Shop', ShopSchema);
