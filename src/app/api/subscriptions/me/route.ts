import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Subscription from '@/models/Subscription';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await connectToDatabase();

        if (!user.shop) {
            return NextResponse.json({ message: 'No shop associated with user' }, { status: 404 });
        }

        const subscription = await Subscription.findOne({ shop: user.shop }).populate('shop');

        if (!subscription) {
            return NextResponse.json({ message: 'No subscription found' }, { status: 404 });
        }

        return NextResponse.json(subscription);
    } catch (error: any) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
