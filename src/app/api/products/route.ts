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

        await connectToDatabase();

        const products = await Product.find({ user: user._id }).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            {
                message: error?.message || 'Server Error',
                detail: error.toString(),
                context: 'GET /api/products'
            },
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
        const { name, costPrice, sellingPrice, quantity, category, description } = await req.json();

        if (!name || !costPrice || !sellingPrice || !quantity || !category) {
            return NextResponse.json(
                { message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        const product = await Product.create({
            user: user._id,
            name,
            costPrice,
            sellingPrice,
            quantity,
            category,
            description: description || '',
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);

        // Handle duplicate product name for this user
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'A product with this name already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                message: error?.message || 'Server Error',
                detail: error.toString(),
                context: 'POST /api/products'
            },
            { status: 500 }
        );
    }
}
