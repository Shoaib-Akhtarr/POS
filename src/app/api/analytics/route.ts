import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // 1. Get Today's Stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await Sale.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(user.id) } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalSales: { $count: {} },
                    totalDues: { $sum: '$balanceDue' }
                }
            }
        ]);

        // 2. Daily Sales Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesTrend = await Sale.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(user.id),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    amount: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Category Distribution (Optimized: No $lookup)
        const categoryData = await Sale.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(user.id) } },
            { $unwind: "$cartItems" },
            {
                $group: {
                    _id: "$cartItems.categoryName",
                    value: { $sum: { $multiply: ["$cartItems.quantity", "$cartItems.price"] } }
                }
            },
            { $project: { name: { $ifNull: ["$_id", "Uncategorized"] }, value: 1, _id: 0 } }
        ]);

        // 4. Low Stock Alert
        const lowStockCount = await Product.countDocuments({
            user: user._id,
            quantity: { $lt: 10 }
        });

        const dashboardData = {
            summary: {
                totalRevenue: stats[0]?.totalRevenue || 0,
                totalSales: stats[0]?.totalSales || 0,
                totalDues: stats[0]?.totalDues || 0,
                lowStockCount
            },
            salesTrend: salesTrend.map(item => ({
                day: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
                amount: item.amount
            })),
            categoryData: categoryData.length > 0 ? categoryData : [{ name: 'N/A', value: 1 }]
        };

        return NextResponse.json(dashboardData);
    } catch (error: any) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
    }
}
