import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';

export const requireAuth = async (req: NextRequest) => {
    let token;
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'fallback_secret';

            const decoded = jwt.verify(
                token,
                secret
            ) as jwt.JwtPayload;

            await connectToDatabase();
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                console.warn(`[Auth] User not found for ID: ${decoded.id}`);
            }

            return user; // Return the user object if authenticated
        } catch (error: any) {
            console.error(`[Auth] JWT verification failed for token: ${token ? 'PROVIDED' : 'MISSING'}. Error: ${error.message}`);
            return null;
        }
    }

    console.warn('[Auth] No Bearer token found in headers');
    return null;
};
