import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const stats = await Sale.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(user.id) } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalSales: { $count: {} },
                    totalDues: { $sum: "$balanceDue" }
                }
            }
        ]);

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

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const soldProductIds = await Sale.distinct("cartItems.product", {
            user: new mongoose.Types.ObjectId(user.id),
            createdAt: { $gte: oneWeekAgo }
        });

        const totalProductCount = await Product.countDocuments({ user: user.id });
        const mostSellingCount = soldProductIds.length;
        const lowSellingCount = Math.max(0, totalProductCount - mostSellingCount);
        const lowStockCount = await Product.countDocuments({ user: user.id, quantity: { $lt: 5 } });

        const dashboardData = {
            summary: {
                totalRevenue: stats[0]?.totalRevenue || 0,
                totalSales: stats[0]?.totalSales || 0,
                totalDues: stats[0]?.totalDues || 0,
                mostSellingCount,
                lowSellingCount,
                lowStockCount
            },
            salesTrend: salesTrend.map(item => ({
                day: new Date(item._id).toLocaleDateString("en-US", { weekday: "short" }),
                amount: item.amount
            })),
            categoryData: categoryData.length > 0 ? categoryData : [{ name: "N/A", value: 1 }]
        };

        return NextResponse.json(dashboardData);
    } catch (error: any) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
    }
}
