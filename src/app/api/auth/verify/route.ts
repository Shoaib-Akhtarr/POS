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

        return NextResponse.json(
            {
                _id: user.id, // Changed from user._id to user.id as per instruction snippet
                name: user.name,
                email: user.email,
                role: role,
                shopId: user.shop,
                // Assuming generateToken function is available in scope
                // Cache-buster: Forced build at 2026-03-10
                token: generateToken(user.id, user.email, role),
            },
            { status: 200 }
        );
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
