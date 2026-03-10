import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import generateToken from '@/lib/generateToken';
import { ADMIN_EMAILS } from '@/config/adminEmails';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Please provide email and password' },
                { status: 400 }
            );
        }

        // 1. Try to find in Authorized Users collection
        let user: any = await User.findOne({ email }).select('+password');
        let isAuthorized = true;

        if (!user) {
            // 2. Try to find in Public Users collection
            const PublicUser = (await import('@/models/PublicUser')).default;
            user = await PublicUser.findOne({ email }).select('+password');
            isAuthorized = false;
        }

        console.log(`[LOGIN ATTEMPT] Email: ${email}, isAuthorized: ${isAuthorized}`);
        if (!user) {
            console.log(`[LOGIN FAILED] User not found: ${email}`);
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN DEBUG] User found. Password Match: ${isMatch}`);

        if (isMatch) {
            // Check if user is admin via whitelist (Admins are always authorized)
            const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
            const role = isAdmin ? 'admin' : (user.role || 'user');

            // Dashboard access is TRUE only if found in User collection OR is Admin
            const dashboardAccess = isAuthorized || isAdmin;

            const response = NextResponse.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                shopId: isAuthorized ? user.shop : undefined,
                dashboardAccess,
                token: generateToken(user.id, user.email, role),
            });

            // Set a secure cookie for the Proxy (Middleware) to read
            response.cookies.set('dashboardAccess', dashboardAccess.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60, // 7 days
                path: '/',
            });

            return response;
        } else {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
