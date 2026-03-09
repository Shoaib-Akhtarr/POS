import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verify(token, JWT_SECRET) as any;

        const user = await User.findById(decoded.id).populate('shop');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectToDatabase();

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verify(token, JWT_SECRET) as any;

        const { name, phoneNumber, address } = await req.json();

        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        user.name = name || user.name;
        user.phoneNumber = phoneNumber;
        user.address = address;

        await user.save();

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address
            }
        });
    } catch (error: any) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
