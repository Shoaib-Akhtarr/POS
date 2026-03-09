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

        const searchParams = req.nextUrl.searchParams;
        const queryParam = searchParams.get('q'); // Renamed to avoid conflict with query object

        if (!queryParam) {
            return NextResponse.json([]);
        }

        await connectToDatabase();

        // Search by name or phone (case-insensitive), scoped to shop
        const customers = await Customer.find({
            user: user._id,
            $or: [
                { name: { $regex: queryParam, $options: 'i' } },
                { phone: { $regex: queryParam, $options: 'i' } }
            ]
        }).limit(20);

        return NextResponse.json(customers);
    } catch (error: any) {
        console.error('Error searching customers:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
