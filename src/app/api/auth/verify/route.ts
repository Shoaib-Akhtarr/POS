import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                id: user._id,
                email: user.email,
                name: user.name
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Verify token error:', error);
        return NextResponse.json(
            { message: 'Server Error during verification' },
            { status: 500 }
        );
    }
}
