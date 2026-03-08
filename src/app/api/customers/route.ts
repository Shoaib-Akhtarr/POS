import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Customer from '@/models/Customer';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await connectToDatabase();

        const customers = await Customer.find({ user: user._id }).sort({ name: 1 });

        return NextResponse.json(customers);
    } catch (error: any) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await connectToDatabase();

        const body = await req.json();
        console.log('Create customer body:', body);
        const { name, phone, address, totalDues } = body;

        if (!name) {
            console.warn('Customer creation failed: Name is missing');
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        const customer = await Customer.create({
            user: user._id,
            name,
            phone: phone || '',
            address: address || '',
            totalDues: totalDues || 0,
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error: any) {
        console.error('Error creating customer:', error);

        // Handle duplicate phone number
        if (error.code === 11000) {
            return NextResponse.json({ message: 'A customer with this phone number already exists' }, { status: 400 });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json({ message: messages.join(', ') }, { status: 400 });
        }

        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
