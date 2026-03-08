import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';

import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json([]);
        }

        await connectToDatabase();

        // Search using a regex on the product name or category, scoped to current user
        const products = await Product.find({
            user: user._id,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Error searching products:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
