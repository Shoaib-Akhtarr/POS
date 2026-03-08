import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sale from '@/models/Sale';
import { requireAuth } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ customerName: string }> }
) {
    try {
        const { customerName } = await params;
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await connectToDatabase();

        const decodedCustomerName = decodeURIComponent(customerName);

        const sales = await Sale.find({
            user: user._id,
            customerName: { $regex: new RegExp(`^${decodedCustomerName}$`, 'i') }
        })
            .populate('cartItems.product', 'name price')
            .sort({ createdAt: -1 });

        console.log(`Fetched ${sales.length} sales for customer ${decodedCustomerName}:`, JSON.stringify(sales, null, 2));

        return NextResponse.json(sales);
    } catch (error: any) {
        console.error('Error fetching sales by customer:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
