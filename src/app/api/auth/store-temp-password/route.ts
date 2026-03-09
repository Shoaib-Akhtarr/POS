import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import TempUser from '@/models/TempUser';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const tempUser = await TempUser.findOne({ email });

        if (!tempUser || tempUser.step !== 'otp_verified') {
            return NextResponse.json({ message: 'Unauthorized. Please verify your code first.' }, { status: 403 });
        }

        // Hash and store password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        tempUser.password = hashedPassword;
        tempUser.step = 'password_set';
        await tempUser.save();

        return NextResponse.json({ message: 'Password stored. Proceed to final step.' }, { status: 200 });

    } catch (error: any) {
        console.error('Store Temp Password Error:', error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
