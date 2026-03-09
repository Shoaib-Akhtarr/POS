import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import TempUser from '@/models/TempUser';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
        }

        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return NextResponse.json({ message: 'Verification session not found' }, { status: 404 });
        }

        // Check expiry
        if (new Date() > tempUser.otpExpires) {
            return NextResponse.json({ message: 'Code expired' }, { status: 400 });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, tempUser.otp);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
        }

        // Success - update step
        tempUser.step = 'otp_verified';
        await tempUser.save();

        return NextResponse.json({ message: 'Code verified successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
