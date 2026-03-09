import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Some routes might allow updating without strict auth in a completely offline
        // trust model, but ideally we check auth:
        const user = await requireAuth(req);
        if (!user) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
        }

        const { quantity } = await req.json();

        if (quantity === undefined || quantity === null) {
            return NextResponse.json({ message: 'Please provide quantity' }, { status: 400 });
        }

        const product = await Product.findOne({ _id: id, user: user._id });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        product.quantity = quantity;
        const updatedProduct = await product.save();

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error('Error updating product quantity:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
