import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
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
            return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
        }

        const product = await Product.findOne({ _id: id, user: user._id });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            {
                message: error?.message || 'Server Error',
                detail: error.toString(),
                context: 'GET /api/products/[id]'
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const body = await req.json();

        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, user: user._id },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error('Error updating product:', error);

        // Handle duplicate name collision on update
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
                context: 'PUT /api/products/[id]'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
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
            return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
        }

        // Find product first to check stock
        const product = await Product.findOne({ _id: id, user: user._id });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // Check if stock is 0
        const stock = product.quantity || product.stock || 0;
        if (stock > 0) {
            return NextResponse.json(
                { message: 'Cannot delete product with remaining stock. Please sell or adjust stock to 0 first.' },
                { status: 400 }
            );
        }

        await Product.deleteOne({ _id: id, user: user._id });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            {
                message: error?.message || 'Server Error',
                detail: error.toString(),
                context: 'DELETE /api/products/[id]'
            },
            { status: 500 }
        );
    }
}
