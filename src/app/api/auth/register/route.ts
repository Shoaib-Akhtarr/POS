import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import generateToken from '@/lib/generateToken';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            return NextResponse.json(
                {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                },
                { status: 201 }
            );
        } else {
            return NextResponse.json(
                { message: 'Invalid user data' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
