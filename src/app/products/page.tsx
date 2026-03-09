'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductSearch from '@/components/ProductSearch';
import { createProduct, getAllProducts, deleteProduct } from '@/services/productService';
import EditProductModal from '@/components/EditProductModal';

type TabType = 'all' | 'add' | 'outofstock';

export default function ProductsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // --- Add Product State ---
    const [formData, setFormData] = useState({
        name: '', costPrice: '', sellingPrice: '', quantity: '', category: '', description: '',
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');

    // --- Out of Stock State ---
    const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
    const [outOfStockLoading, setOutOfStockLoading] = useState(false);

    // Fetch Out of Stock Products
    useEffect(() => {
        if (activeTab === 'outofstock') {
            const fetchOutOfStock = async () => {
                setOutOfStockLoading(true);
                try {
                    const allProducts = await getAllProducts();
                    const emptyProducts = allProducts.filter(p => (p.quantity ?? p.stock ?? 0) <= 0);
                    setOutOfStockProducts(emptyProducts);
                } catch (error) {
                    console.error('Error fetching out of stock products:', error);
                } finally {
                    setOutOfStockLoading(false);
                }
            };
            fetchOutOfStock();
        }
    }, [activeTab, refreshTrigger]);

    // Handle Add Form Change
    const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Add Submit
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        setAddSuccess('');

        try {
            await createProduct({
                name: formData.name,
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice),
                quantity: Number(formData.quantity),
                category: formData.category,
                description: formData.description,
            });
            setAddSuccess('Product added successfully!');
            setFormData({ name: '', costPrice: '', sellingPrice: '', quantity: '', category: '', description: '' });
            setRefreshTrigger(prev => prev + 1);
            // Optionally redirect back to 'all' after short delay
            setTimeout(() => setActiveTab('all'), 1500);
        } catch (err: any) {
            setAddError(err.message || 'Failed to add product');
        } finally {
            setAddLoading(false);
        }
    };

    // Handle Delete Out of Stock
    const handleDeleteOutOfStock = async (product: Product) => {
        if (!window.confirm(`Delete "${product.name}" forever?`)) return;
        try {
            await deleteProduct(product._id);
            setRefreshTrigger(prev => prev + 1); // Triggers re-fetch
        } catch (err: any) {
            alert(err.message || "Failed to delete.");
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background p-4 sm:p-8 flex flex-col">
                <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-pos-accent/20">📦</div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black italic tracking-tighter uppercase text-foreground">Products</h1>
                            <p className="text-[9px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Inventory Management</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-sidebar border border-sidebar-border text-foreground rounded-xl transition-all font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-sm hover:bg-card-border flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to POS
                    </button>
                </header>

                <div className="bg-card rounded-[32px] shadow-sm border border-card-border overflow-hidden flex-1 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-card-border bg-sidebar overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex flex-1 items-center justify-center px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'all' ? 'text-pos-accent border-b-2 border-pos-accent bg-card' : 'text-muted-foreground hover:text-foreground hover:bg-card-border'}`}
                        >
                            <span className="mr-2 text-lg">📋</span> All Products
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex flex-1 items-center justify-center px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'add' ? 'text-pos-accent border-b-2 border-pos-accent bg-card' : 'text-muted-foreground hover:text-foreground hover:bg-card-border'}`}
                        >
                            <span className="mr-2 text-lg">➕</span> Add Product
                        </button>
                        <button
                            onClick={() => setActiveTab('outofstock')}
                            className={`flex flex-1 items-center justify-center px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'outofstock' ? 'text-danger border-b-2 border-danger bg-card' : 'text-muted-foreground hover:text-foreground hover:bg-card-border'}`}
                        >
                            <span className="mr-2 text-lg">⚠️</span> Out of Stock
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Tab 1: All Products */}
                        {activeTab === 'all' && (
                            <div>
                                <ProductSearch
                                    onAddToCart={() => { }} // Not used on this page
                                    onEditProduct={(product) => setEditingProduct(product)}
                                    refreshTrigger={refreshTrigger}
                                    isManagerView={true}
                                />
                            </div>
                        )}

                        {/* Tab 2: Add Product */}
                        {activeTab === 'add' && (
                            <div className="max-w-2xl mx-auto py-8">
                                <div className="bg-sidebar border border-sidebar-border rounded-[32px] p-8">
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-foreground mb-6">Create New Product</h2>

                                    {addError && <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm font-bold">{addError}</div>}
                                    {addSuccess && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-bold">{addSuccess}</div>}

                                    <form onSubmit={handleAddSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Product Name *</label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleAddChange} className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Cost Price *</label>
                                                <input type="number" name="costPrice" required min="0" step="0.01" value={formData.costPrice} onChange={handleAddChange} className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Selling Price *</label>
                                                <input type="number" name="sellingPrice" required min="0" step="0.01" value={formData.sellingPrice} onChange={handleAddChange} className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Initial Stock *</label>
                                                <input type="number" name="quantity" required min="0" value={formData.quantity} onChange={handleAddChange} className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Category *</label>
                                                <input type="text" name="category" required value={formData.category} onChange={handleAddChange} className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Description</label>
                                            <textarea name="description" rows={2} value={formData.description} onChange={handleAddChange} className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold custom-scrollbar"></textarea>
                                        </div>
                                        <div className="flex justify-end pt-4 border-t border-card-border mt-6">
                                            <button type="submit" disabled={addLoading} className={`px-8 py-4 bg-pos-accent text-white rounded-xl transition-all font-black text-[11px] uppercase tracking-wider shadow-lg ${addLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600 shadow-pos-accent/20 hover:-translate-y-0.5'}`}>
                                                {addLoading ? 'Saving...' : 'Save Product'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Out of Stock */}
                        {activeTab === 'outofstock' && (
                            <div className="max-w-5xl mx-auto py-4">
                                {outOfStockLoading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="w-8 h-8 border-4 border-danger border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : outOfStockProducts.length === 0 ? (
                                    <div className="text-center py-20 bg-sidebar rounded-[32px] border border-sidebar-border mt-8">
                                        <span className="text-5xl opacity-40 block mb-4">👍</span>
                                        <p className="font-black text-muted-foreground uppercase tracking-widest text-sm">No products out of stock!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {outOfStockProducts.map(product => (
                                            <div key={product._id} className="bg-sidebar border border-danger/30 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-danger"></div>
                                                <div className="pl-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[9px] font-black text-danger uppercase tracking-widest px-2 py-1 bg-danger/10 rounded-lg">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-black text-sm tracking-tight mb-2 text-foreground">{product.name}</h3>
                                                    <div className="flex items-baseline space-x-1 mb-4 opacity-50">
                                                        <span className="text-[10px] font-bold text-muted-foreground">Rs.</span>
                                                        <span className="text-lg font-black tracking-tighter">
                                                            {(product.sellingPrice || product.price || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-card-border flex justify-end">
                                                    <button
                                                        onClick={() => handleDeleteOutOfStock(product)}
                                                        className="px-4 py-2 bg-danger/10 hover:bg-danger text-danger hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full text-center flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                                    >
                                                        <span>🗑️</span> Delete Permanently
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {editingProduct && (
                    <EditProductModal
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSuccess={() => {
                            setEditingProduct(null);
                            setRefreshTrigger(prev => prev + 1);
                        }}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
