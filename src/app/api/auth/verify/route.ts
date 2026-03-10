import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ADMIN_EMAILS } from '@/config/adminEmails';
import generateToken from '@/lib/generateToken';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Determine role based on whitelist or database field
        const role = ADMIN_EMAILS.includes(user.email.toLowerCase()) ? 'admin' : (user.role || 'user');

        // Determine dashboard access
        const canAccessDashboard = role === 'admin' || user.canAccessDashboard || false;

        const response = NextResponse.json(
            {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                shopId: user.shop,
                canAccessDashboard: canAccessDashboard,
                token: generateToken(user.id, user.email, role),
            },
            { status: 200 }
        );

        // Refresh the secure cookie
        response.cookies.set('canAccessDashboard', canAccessDashboard.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('[Verify API ERROR]:', error);
        return NextResponse.json(
            {
                message: 'Server Error during verification',
                error: error?.message,
                detail: error?.stack
            },
            { status: 500 }
        );
    }
}
