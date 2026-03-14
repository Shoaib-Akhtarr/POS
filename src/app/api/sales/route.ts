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

        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const startIndex = (page - 1) * limit;

        const query: any = { user: user._id };
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Set to end of day to include all transactions on that day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const total = await Sale.countDocuments(query);
        const sales = await Sale.find(query)
            .populate('cartItems.product', 'name price')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        return NextResponse.json({ sales, total });
    } catch (error: any) {
        console.error('Error fetching sales:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
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
        const body = await req.json();
        console.log('Sale POST request body:', JSON.stringify(body, null, 2));
        const {
            cartItems,
            totalAmount,
            discount,
            customerName,
            customer,
            previousDues,
            amountPaid,
            balanceDue,
            paymentMethod,
            isPaid,
            receiptId,
            printed,
            receiptNumber,
        } = body;

        const ProductModel = (await import('@/models/Product')).default;
        const enrichedCartItems = await Promise.all(cartItems.map(async (item: any) => {
            const product = await ProductModel.findById(item.product);
            return {
                ...item,
                categoryName: product?.category || 'Uncategorized',
                categoryId: product?.category || 'Uncategorized' // Assuming category name is used as ID for now as per schema
            };
        }));

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ message: 'No items in sale' }, { status: 400 });
        }
        if (totalAmount === undefined || !receiptId) {
            return NextResponse.json(
                { message: 'Total amount and receipt ID are required' },
                { status: 400 }
            );
        }

        console.log(`[Sales API] Creating sale with balanceDue: ${balanceDue}, amountPaid: ${amountPaid}`);

        const sale = await Sale.create({
            user: user._id,
            cartItems: enrichedCartItems,
            totalAmount: Number(totalAmount),
            discount: Number(discount) || 0,
            customerName: customerName || '',
            customer: customer || undefined,
            previousDues: Number(previousDues) || 0,
            amountPaid: Number(amountPaid) || 0,
            balanceDue: Number(balanceDue) || 0,
            paymentMethod: paymentMethod || 'Cash',
            isPaid: isPaid !== undefined ? isPaid : true,
            receiptId,
            printed: printed || false,
            receiptNumber: receiptNumber || '',
        });

        console.log('[Sales API] Sale created successfully. Generated document:', JSON.stringify(sale, null, 2));

        // Automation: If this sale is attached to a registered customer, update their running balance
        if (customer) {
            console.log(`[Sales API] Updating customer ${customer} totalDues to ${balanceDue} and incrementing totalDiscount by ${discount}`);
            const CustomerModel = (await import('@/models/Customer')).default;
            await CustomerModel.findByIdAndUpdate(customer, {
                $set: { totalDues: Number(balanceDue) || 0 },
                $inc: { totalDiscount: Number(discount) || 0 }
            });
        }

        return NextResponse.json(sale, { status: 201 });
    } catch (error: any) {
        console.error('Error creating sale:', error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Receipt ID already exists' }, { status: 400 });
        }
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
