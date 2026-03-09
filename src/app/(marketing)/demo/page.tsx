'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReceiptPreview from '@/components/ReceiptPreview';
import { Product, Customer } from '@/types';

// --- Mock Data ---

const MOCK_PRODUCTS: Product[] = [
    { _id: 'p1', name: 'Premium Tea (Peshawari)', sellingPrice: 450, costPrice: 320, stock: 45, category: 'Beverages', description: 'Authentic green tea', salesCount: 150, user: 'demo', createdAt: '', updatedAt: '' },
    { _id: 'p2', name: 'Fresh Milk Bread', sellingPrice: 160, costPrice: 120, stock: 12, category: 'Bakery', description: 'Oven fresh daily', salesCount: 89, user: 'demo', createdAt: '', updatedAt: '' },
    { _id: 'p3', name: 'Almond Biscuits XL', sellingPrice: 85, costPrice: 60, stock: 120, category: 'Snacks', description: 'Crispy nutty delight', salesCount: 230, user: 'demo', createdAt: '', updatedAt: '' },
    { _id: 'p4', name: 'Whole Wheat Atta (10kg)', sellingPrice: 1250, costPrice: 1100, stock: 8, category: 'Grocery', description: 'Pure wheat flour', salesCount: 45, user: 'demo', createdAt: '', updatedAt: '' },
    { _id: 'p5', name: 'Cooking Oil (5L)', sellingPrice: 2850, costPrice: 2600, stock: 15, category: 'Grocery', description: 'Premium vegetable oil', salesCount: 67, user: 'demo', createdAt: '', updatedAt: '' },
    { _id: 'p6', name: 'Special Rice (Basmati)', sellingPrice: 380, costPrice: 300, stock: 200, category: 'Grocery', description: 'Long grain rice', salesCount: 450, user: 'demo', createdAt: '', updatedAt: '' },
];

const MOCK_CUSTOMERS: Customer[] = [
    { _id: 'c1', name: 'Shoaib Akhtar', phone: '0300-1234567', totalDues: 4500, totalDiscount: 0, address: 'Lahore, PK', user: 'demo', createdAt: '', updatedAt: '' },
    { _id: 'c2', name: 'Ali Ahmed', phone: '0321-7654321', totalDues: 0, totalDiscount: 0, address: 'Karachi, PK', user: 'demo', createdAt: '', updatedAt: '' },
    { _id: 'c3', name: 'Zainab Bibi', phone: '0345-9988776', totalDues: 1250, totalDiscount: 0, address: 'Islamabad, PK', user: 'demo', createdAt: '', updatedAt: '' },
];

const MOCK_PURCHASES = [
    { id: 'pur1', supplier: 'Metro Wholesale', items: 25, total: 45000, date: '2024-03-08', status: 'Received' },
    { id: 'pur2', supplier: 'Local Bakery Hub', items: 12, total: 12000, date: '2024-03-09', status: 'Pending' },
];

// --- Sub-components (Sales, Khata, Purchases) ---

function POSView({ cart, addToCart, removeFromCart, updateQuantity, calculateTotal, onCheckout }: any) {
    return (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 h-full overflow-hidden">
            {/* Left: Products */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {MOCK_PRODUCTS.map(product => (
                        <motion.div
                            key={product._id}
                            whileHover={{ y: -5 }}
                            className="glass p-6 rounded-[2rem] border-white/5 shadow-2xl hover:shadow-primary/10 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-125 transition-transform">
                                {product.category === 'Beverages' ? '☕' : product.category === 'Bakery' ? '🍞' : '📦'}
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">{product.category}</span>
                            <h3 className="text-xl font-black text-white mb-1 italic">{product.name}</h3>
                            <p className="text-white/40 text-xs font-bold mb-6">Stock: {product.stock} units</p>
                            <div className="flex items-center justify-between mt-auto">
                                <p className="text-2xl font-black text-white tracking-tighter">Rs. {product.sellingPrice}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    Add
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right: Cart */}
            <aside className="w-full lg:w-[400px] glass p-8 rounded-[2.5rem] border-white/5 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-8 italic flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Current Order
                </h2>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 mb-8 pr-2">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <span className="text-6xl mb-4">🛒</span>
                            <p className="font-black italic uppercase tracking-widest text-xs">Empty Cart</p>
                        </div>
                    ) : (
                        cart.map((item: any) => (
                            <div key={item.product._id} className="flex justify-between items-center group">
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm">{item.product.name}</h4>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Rs. {item.product.sellingPrice} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all">-</button>
                                    <span className="font-black text-white w-4 text-center text-sm">{item.quantity}</span>
                                    <button onClick={() => addToCart(item.product)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all">+</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Payable</span>
                            <span className="text-4xl font-black text-white tracking-tighter">Rs. {calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">Demo Ready</span>
                        </div>
                    </div>
                    <button
                        disabled={cart.length === 0}
                        onClick={onCheckout}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all transform active:scale-95 text-xs ${cart.length === 0 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-primary hover:shadow-primary/30'}`}
                    >
                        Complete Demo Sale
                    </button>
                </div>
            </aside>
        </div>
    );
}

function KhataView() {
    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_CUSTOMERS.map(cust => (
                    <motion.div key={cust._id} whileHover={{ scale: 1.02 }} className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">👤</div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${cust.totalDues > 0 ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                {cust.totalDues > 0 ? 'Dues Pending' : 'Clear Ledger'}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-white italic mb-1">{cust.name}</h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">{cust.phone}</p>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Balance Due</p>
                            <p className={`text-3xl font-black tracking-tighter ${cust.totalDues > 0 ? 'text-rose-500' : 'text-white'}`}>
                                Rs. {cust.totalDues.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">Report</button>
                            <button className="flex-1 py-3 bg-primary/10 hover:bg-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary transition-all">Add Entry</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function PurchasesView() {
    return (
        <div className="p-6 space-y-8 overflow-y-auto h-full pb-20">
            {/* Stock Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl border-white/5">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Total Inventory Value</p>
                    <p className="text-3xl font-black text-white tracking-tighter">Rs. 1.2M</p>
                </div>
                <div className="glass p-6 rounded-3xl border-white/5 border-rose-500/20 bg-rose-500/5">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Low Stock Alerts</p>
                    <p className="text-3xl font-black text-rose-500 tracking-tighter">04 Items</p>
                </div>
                <div className="glass p-6 rounded-3xl border-white/5">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Monthly Purchases</p>
                    <p className="text-3xl font-black text-white tracking-tighter">Rs. 185,000</p>
                </div>
            </div>

            {/* Recent Purchases Table */}
            <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-black text-white italic tracking-tight">Recent Purchase Orders</h3>
                    <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">New Purchase</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Order ID</th>
                                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Supplier</th>
                                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Items</th>
                                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Total</th>
                                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_PURCHASES.map(pur => (
                                <tr key={pur.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6 text-sm font-black text-white italic">{pur.id}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-white/80">{pur.supplier}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-white/80">{pur.items}</td>
                                    <td className="px-8 py-6 text-sm font-black text-white tracking-tighter">Rs. {pur.total.toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] ${pur.status === 'Received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {pur.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- Main Demo Page Component ---

function DemoContent() {
    const [activeTab, setActiveTab] = useState<'sales' | 'khata' | 'purchases'>('sales');
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [completedSaleData, setCompletedSaleData] = useState<any | null>(null);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            if (existing) {
                return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, q: number) => {
        if (q <= 0) {
            setCart(prev => prev.filter(item => item.product._id !== id));
            return;
        }
        setCart(prev => prev.map(item => item.product._id === id ? { ...item, quantity: q } : item));
    };

    const calculateTotal = () => cart.reduce((total, item) => total + (item.product.sellingPrice || 0) * item.quantity, 0);

    const handleCheckout = () => {
        const total = calculateTotal();
        setCompletedSaleData({
            cartItems: cart.map(item => ({
                product: item.product,
                quantity: item.quantity
            })),
            totalAmount: total,
            customerName: 'Demo Customer',
            paymentMethod: 'Cash',
            discount: 0,
            amountPaid: total,
            receiptId: `DEMO-${Date.now()}`
        });
    };

    const navItems = [
        { id: 'sales', label: 'Point of Sale', icon: '💰' },
        { id: 'khata', label: 'Khata System', icon: '📒' },
        { id: 'purchases', label: 'Purchases', icon: '📦' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-primary/30 selection:text-white" suppressHydrationWarning>
            {/* Premium Header */}
            <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">K</div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight text-white leading-none italic">Karobar</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Demo Suite</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 glass rounded-full border-primary/20">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Interactive Sandbox Mode</span>
                    </div>
                    <Link href="/register" className="px-8 py-3 bg-white text-[#020617] rounded-xl font-black text-[10px] uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-2xl">Start Free Trial</Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {/* Visual Accent Backgrounds */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-500/10 blur-[120px] pointer-events-none" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        {activeTab === 'sales' && (
                            <POSView
                                cart={cart}
                                addToCart={addToCart}
                                removeFromCart={updateQuantity}
                                updateQuantity={updateQuantity}
                                calculateTotal={calculateTotal}
                                onCheckout={handleCheckout}
                            />
                        )}
                        {activeTab === 'khata' && <KhataView />}
                        {activeTab === 'purchases' && <PurchasesView />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Receipt Modal */}
            {completedSaleData && (
                <ReceiptPreview
                    cart={completedSaleData.cartItems}
                    customerName={completedSaleData.customerName}
                    paymentMethod={completedSaleData.paymentMethod}
                    total={completedSaleData.totalAmount}
                    discount={completedSaleData.discount}
                    amountPaid={completedSaleData.amountPaid}
                    onClose={() => { setCompletedSaleData(null); setCart([]); }}
                    onPrint={() => { setCompletedSaleData(null); setCart([]); }}
                />
            )}
        </div>
    );
}

export default function DemoPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-white">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-white/40 italic">Initializing Full Suite Demo...</p>
        </div>}>
            <DemoContent />
        </Suspense>
    );
}
