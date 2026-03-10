import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';

export const requireAuth = async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

    if (!authHeader) {
        console.warn('[Auth] No Authorization header found');
        return null;
    }

    if (authHeader.toLowerCase().startsWith('bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const secret = process.env.JWT_SECRET;

            if (!secret) {
                console.error('[Auth] CRITICAL: JWT_SECRET is not defined in environment variables!');
                // Fallback to a hardcoded one ONLY if allowed, but better to fail or use the existing fallback
            }

            const decoded = jwt.verify(
                token,
                secret || 'fallback_secret'
            ) as jwt.JwtPayload;

            await connectToDatabase();
            let user = await User.findById(decoded.id).select('-password');

            if (!user) {
                // Check in Public Users if not found in Authorized Users
                const PublicUser = (await import('@/models/PublicUser')).default;
                user = await PublicUser.findById(decoded.id).select('-password');
            }

            if (!user) {
                console.warn(`[Auth] User not found in any collection for ID: ${decoded.id}`);
                return null;
            }

            return user;
        } catch (error: any) {
            console.error(`[Auth] JWT Verification Failed. Error: ${error.message} | Token provided: ${token ? 'YES' : 'NO'}`);
            return null;
        }
    }

    console.warn('[Auth] Authorization header does not start with "Bearer "');
    return null;
};
