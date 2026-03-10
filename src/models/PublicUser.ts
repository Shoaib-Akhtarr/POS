import mongoose from 'mongoose';

const PublicUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
            select: false,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            default: 'user',
        }
    },
    {
        timestamps: true,
    }
);

// Force schema refresh in development
if (mongoose.models.PublicUser) {
    delete mongoose.models.PublicUser;
}

export default mongoose.models.PublicUser || mongoose.model('PublicUser', PublicUserSchema, 'public_users');
