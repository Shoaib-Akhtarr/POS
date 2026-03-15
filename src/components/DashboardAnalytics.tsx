'use client';

import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '@/services/apiService';
import { Info, ExternalLink, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function DashboardAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/analytics');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pos-accent"></div>
            </div>
        );
    }

    if (!data) return null;

    const COLORS = ['#0D9488', '#2563EB', '#D97706', '#E11D48', '#4B5563'];
    const isDark = theme === 'dark';

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Grid: Line Chart and Donut Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Point of Sale Trends */}
                <div className="xl:col-span-4 glass-card rounded-[12px] p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <span className="text-xs font-semibold">Point of Sale Trends</span>
                                <Info size={14} className="cursor-help" />
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+ 2.4% WoW</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                Rs. {(data.summary.totalRevenue / 1000).toFixed(2)}k sold this week, Rs. {((data.summary.totalRevenue * 1.05) / 1000).toFixed(2)}k expected next week
                            </h2>
                        </div>
                        <button className="flex items-center space-x-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group">
                            <span>Explore</span>
                            <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.salesTrend}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                                    tickFormatter={(val) => `Rs.${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        border: '1px solid var(--card-border)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#0D9488"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0D9488' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Premium Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Total Sale',
                        value: `Rs. ${(data.summary.totalRevenue / 1000).toFixed(1)}k`,
                        sub: '+ 7% Growth',
                        icon: <Activity size={20} className="text-primary" />,
                        trend: 'up'
                    },
                    {
                        label: 'Low Selling',
                        value: data.summary.lowSellingCount || 0,
                        sub: 'Unsold this week',
                        icon: <TrendingDown size={20} className="text-danger" />,
                        trend: 'down'
                    },
                    {
                        label: 'Most Selling',
                        value: data.summary.mostSellingCount || 0,
                        sub: 'Sold this week',
                        icon: <TrendingUp size={20} className="text-success" />,
                        trend: 'up'
                    },
                    {
                        label: 'Low in Stock',
                        value: data.summary.lowStockCount || 0,
                        sub: 'Under 5 units',
                        icon: <div className="p-1 rounded bg-amber-500/10"><Info size={20} className="text-amber-500" /></div>,
                        trend: 'neutral'
                    }
                ].map((metric, i) => (
                    <div key={i} className="glass rounded-[20px] p-6 space-y-4 hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl bg-background/50 border border-card-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                    {metric.icon}
                                </div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{metric.label}</span>
                            </div>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted/5 group-hover:bg-primary/10 transition-colors">
                                <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-foreground tracking-tighter">{metric.value}</div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                metric.trend === 'up' ? 'text-success bg-success/10' : 
                                metric.trend === 'down' ? 'text-danger bg-danger/10' : 
                                'text-amber-500 bg-amber-500/10'
                            }`}>
                                {metric.sub}
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
}
