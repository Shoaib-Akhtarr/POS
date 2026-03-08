import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Customer from '@/models/Customer';
import Sale from '@/models/Sale';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth';

export async function POST(
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
            return NextResponse.json({ message: 'Invalid customer ID' }, { status: 400 });
        }

        const { amount, paymentMethod } = await req.json();

        if (amount === undefined || amount <= 0) {
            return NextResponse.json({ message: 'Please provide a valid payment amount' }, { status: 400 });
        }

        const customer = await Customer.findOne({ _id: id, user: user._id });

        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }

        // 1. Calculate the new balance
        const previousDues = customer.totalDues;
        customer.totalDues -= amount;

        // 2. Save the customer's new balance
        await customer.save();

        // 3. Optional but highly recommended: Create a "Payment" record 
        // We will repurpose the Sale model as a general transaction ledger for simplicity 
        // by creating a zero-item sale that represents only a payment against dues.
        const paymentRecord = await Sale.create({
            user: user._id,
            customer: customer._id,
            customerName: customer.name,
            cartItems: [], // No items bought
            totalAmount: 0, // No new charges
            previousDues: previousDues,
            amountPaid: amount,
            balanceDue: customer.totalDues,
            paymentMethod: paymentMethod || 'Cash',
            isPaid: true,
            receiptId: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            printed: true,
        });

        return NextResponse.json({
            message: 'Payment received successfully',
            customer,
            paymentRecord
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error processing customer payment:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
