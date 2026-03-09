import mongoose from 'mongoose';

const TempUserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
        },
        otp: {
            type: String, // Hashed OTP
            required: true,
        },
        otpExpires: {
            type: Date,
            required: true,
        },
        password: {
            type: String, // Hashed password, stored after OTP verification
            select: false,
        },
        step: {
            type: String,
            enum: ['email_sent', 'otp_verified', 'password_set'],
            default: 'email_sent',
        },
        // TTL Index: Automatically delete the document after it expires (e.g., 1 hour)
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 3600, // 1 hour
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.TempUser || mongoose.model('TempUser', TempUserSchema);
