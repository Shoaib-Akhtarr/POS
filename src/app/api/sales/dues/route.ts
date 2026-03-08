import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sale from '@/models/Sale';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Dues are sales where payment is pending (Credit that is not paid)
        const query = {
            user: user._id,
            paymentMethod: 'Credit',
            isPaid: false
        };

        const dues = await Sale.find(query)
            .populate('cartItems.product', 'name price')
            .sort({ createdAt: -1 });

        return NextResponse.json(dues);
    } catch (error: any) {
        console.error('Error fetching dues:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
