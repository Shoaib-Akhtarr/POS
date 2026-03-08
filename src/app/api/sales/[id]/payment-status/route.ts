import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sale from '@/models/Sale';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth';

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
            return NextResponse.json({ message: 'Invalid sale ID' }, { status: 400 });
        }

        const { isPaid } = await req.json();

        if (isPaid === undefined || isPaid === null) {
            return NextResponse.json({ message: 'Please provide isPaid status' }, { status: 400 });
        }

        const sale = await Sale.findOne({ _id: id, user: user._id });

        if (!sale) {
            return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
        }

        sale.isPaid = isPaid;
        const updatedSale = await sale.save();

        return NextResponse.json(updatedSale);
    } catch (error: any) {
        console.error('Error updating sale payment status:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
