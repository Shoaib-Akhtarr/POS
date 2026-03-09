import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid customer ID' }, { status: 400 });
        }

        const customer = await Customer.findOne({ _id: id, user: user._id });

        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error: any) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid customer ID' }, { status: 400 });
        }

        const updates = await req.json();

        // Find customer and verify shop ownership
        const customer = await Customer.findOne({ _id: id, user: user._id });

        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }

        // Apply updates
        if (updates.name !== undefined) customer.name = updates.name;
        if (updates.phone !== undefined) customer.phone = updates.phone;
        if (updates.address !== undefined) customer.address = updates.address;

        // Use the dedicated 'pay' or similar endpoint for totalDues updates,
        // but allow manual arbitrary adjustment if explicitly passed here in standard management
        if (updates.totalDues !== undefined) customer.totalDues = updates.totalDues;

        await customer.save();

        return NextResponse.json(customer);
    } catch (error: any) {
        console.error('Error updating customer:', error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'A customer with this phone number already exists' }, { status: 400 });
        }
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
