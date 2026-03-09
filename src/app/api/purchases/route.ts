import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Purchase from '@/models/Purchase';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const user = await requireAuth(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { productId, productName, supplierName, costPrice, quantity, category, sellingPrice } = body;

        // Validation for existing OR new product
        if (!supplierName || costPrice === undefined || quantity === undefined) {
            return NextResponse.json({ error: 'Missing required fields (supplier, cost, qty)' }, { status: 400 });
        }

        let targetProduct;

        if (productId) {
            // Case 1: Existing Product
            targetProduct = await Product.findOne({ _id: productId, user: user._id });
            if (!targetProduct) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            // Update selling price if provided during purchase
            if (sellingPrice) {
                targetProduct.sellingPrice = sellingPrice;
            }
        } else if (productName && category && sellingPrice !== undefined) {
            // Case 2: New Product Creation
            try {
                targetProduct = await Product.create({
                    name: productName,
                    category,
                    sellingPrice,
                    costPrice, // Store initial cost
                    quantity: 0, // Will be updated by the purchase logic below
                    user: user._id
                });
                console.log('[Purchases API] New product created successfully:', targetProduct._id);
            } catch (err: any) {
                if (err.code === 11000) {
                    return NextResponse.json({ error: 'A product with this name already exists. Please select it from the list.' }, { status: 400 });
                }
                throw err;
            }
        } else {
            return NextResponse.json({ error: 'Provide either an existing Product ID or full details for a New Product' }, { status: 400 });
        }

        // 1. Create Purchase Record
        const totalCost = costPrice * quantity;
        const purchase = await Purchase.create({
            product: targetProduct._id,
            productName: targetProduct.name,
            supplierName,
            costPrice,
            quantity,
            totalCost,
            user: user._id,
        });
        console.log('[Purchases API] Purchase record created successfully:', purchase._id);

        // 2. Update Product Stock
        const newQuantity = (targetProduct.quantity || 0) + quantity;
        targetProduct.quantity = newQuantity;
        targetProduct.quantity = newQuantity; // Already updated above, but keeping for clarity if logic changes
        await targetProduct.save();

        return NextResponse.json(purchase, { status: 201 });
    } catch (error: any) {
        console.error('Create Purchase Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to record purchase' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const user = await requireAuth(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const purchases = await Purchase.find({ user: user._id })
            .sort({ purchaseDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Purchase.countDocuments({ user: user._id });

        return NextResponse.json({
            purchases,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 });

    } catch (error: any) {
        console.error('Get Purchases Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch purchases' },
            { status: 500 }
        );
    }
}
