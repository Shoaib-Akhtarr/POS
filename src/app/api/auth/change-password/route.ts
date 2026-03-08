import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const authUser = await requireAuth(req);
        if (!authUser) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Specifically fetch the user AGAIN but explicitly request the Hidden password field 
        // to bypass the default mongoose `select: false` security parameter.
        const user = await User.findById(authUser._id).select('+password');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid current password' }, { status: 401 });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { message: error.message || 'Error processing request' },
            { status: 500 }
        );
    }
}
