import mongoose from 'mongoose';

const VerificationLogSchema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        // TTL Index: Cleanup logs older than 24 hours
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 86400, // 24 hours
        }
    }
);

// Index for efficient querying by IP and timestamp
VerificationLogSchema.index({ ip: 1, timestamp: -1 });

export default mongoose.models.VerificationLog || mongoose.model('VerificationLog', VerificationLogSchema);
