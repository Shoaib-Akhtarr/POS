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

        // 1. Get original product to compare stock
        const originalProduct = await Product.findOne({ _id: id, user: user._id });
        if (!originalProduct) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // 2. Perform Update
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, user: user._id },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // 3. Automated Purchase Logging (ONLY if stock increased)
        const oldQty = originalProduct.quantity || 0;
        const newQty = updatedProduct.quantity || 0;

        if (newQty > oldQty) {
            const diff = newQty - oldQty;
            try {
                // Import Purchase model inside to avoid circular deps if any
                const Purchase = mongoose.models.Purchase || (await import('@/models/Purchase')).default;

                await Purchase.create({
                    product: updatedProduct._id,
                    productName: updatedProduct.name,
                    supplierName: 'Manual Adjustment',
                    costPrice: 0,
                    quantity: diff,
                    totalCost: 0,
                    user: user.id
                });
            } catch (purchaseErr) {
                console.error('Failed to auto-log purchase improvement:', purchaseErr);
                // We don't fail the product update if purchase logging fails, but we log it.
            }
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
        const stock = product.quantity || 0;
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
