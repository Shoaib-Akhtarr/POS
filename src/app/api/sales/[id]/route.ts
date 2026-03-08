import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sale from '@/models/Sale';
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
            return NextResponse.json({ message: 'Invalid sale ID' }, { status: 400 });
        }

        const sale = await Sale.findOne({ _id: id, user: user._id })
            .populate('cartItems.product', 'name price');

        if (!sale) {
            return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (error: any) {
        console.error('Error fetching sale:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
