import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import TempUser from '@/models/TempUser';
import VerificationLog from '@/models/VerificationLog';
import { sendOTPEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { email } = await req.json();
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        // 1. Rate Limiting Check (3 times in 24 hours per IP)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const requestCount = await VerificationLog.countDocuments({
            ip,
            timestamp: { $gte: twentyFourHoursAgo }
        });

        if (requestCount >= 3) {
            return NextResponse.json({
                message: 'Daily limit exceeded. Please try again after 24 hours.'
            }, { status: 429 });
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // 3. Store in TempUser (upsert)
        await TempUser.findOneAndUpdate(
            { email },
            {
                otp: hashedOtp,
                otpExpires,
                step: 'email_sent'
            },
            { upsert: true, new: true }
        );

        // 4. Log the attempt
        await VerificationLog.create({ ip, email });

        // 5. Send Email
        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return NextResponse.json({ message: 'Failed to send verification email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Verification code sent to your email' }, { status: 200 });

    } catch (error: any) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
