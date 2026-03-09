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

        const user = await User.findOne({ email }).select('+password');

        console.log(`[LOGIN ATTEMPT] Email: ${email}`);
        if (!user) {
            console.log(`[LOGIN FAILED] User not found: ${email}`);
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN DEBUG] User found. Password Match: ${isMatch}`);
        if (!isMatch) {
            console.log(`[LOGIN FAILED] Password mismatch for: ${email}`);
            console.log(`[LOGIN DEBUG] Stored hash prefix: ${user.password.substring(0, 7)}`);
        }

        if (isMatch) {
            // Check if user is admin via whitelist or stored role
            const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : (user.role || 'user');

            return NextResponse.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                token: generateToken(user._id.toString(), user.email, role),
            });
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
