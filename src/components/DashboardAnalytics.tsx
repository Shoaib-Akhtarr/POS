'use client';

import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '@/services/apiService';
import { Info, ExternalLink } from 'lucide-react';
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
                <div className="xl:col-span-3 glass-card rounded-[12px] p-8 space-y-6">
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

                    <div className="h-[350px] w-full mt-4">
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

                {/* Top Partners (Categories) */}
                <div className="xl:col-span-1 glass-card rounded-[12px] p-8 flex flex-col space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <span className="text-xs font-semibold">Top Categories</span>
                            <Info size={14} className="cursor-help" />
                        </div>

                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.categoryData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
                            <span className="text-2xl font-bold text-foreground">Rs. {(data.summary.totalRevenue / 1000000).toFixed(1)}M</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-card-border overflow-y-auto custom-scrollbar max-h-[150px]">
                        {data.categoryData.map((cat: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="font-medium text-muted-foreground">{cat.name}</span>
                                </div>
                                <span className="font-bold text-foreground">Rs.{(cat.value / 1000).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 flex items-center justify-center space-x-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                        <span>Explore all categories</span>
                        <ExternalLink size={12} />
                    </button>
                </div>
            </div>


        </div>
    );
}
