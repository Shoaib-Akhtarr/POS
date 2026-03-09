import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { getAllProducts } from '@/services/productService';
import { recordPurchase } from '@/services/purchaseService';

interface AddPurchaseModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddPurchaseModal({ onClose, onSuccess }: AddPurchaseModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [selectedProductId, setSelectedProductId] = useState('');
    const [newProductName, setNewProductName] = useState('');
    const [category, setCategory] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const fetchedProducts = await getAllProducts();
                setProducts(fetchedProducts);
            } catch (err: any) {
                setError('Failed to load products list.');
            } finally {
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, []);

    // Also populate category/selling price when an existing product is selected
    useEffect(() => {
        if (selectedProductId && selectedProductId !== 'new') {
            const product = products.find(p => p._id === selectedProductId);
            if (product) {
                setCategory(product.category || '');
                setSellingPrice((product.sellingPrice || product.price || 0).toString());
            }
        } else if (selectedProductId === 'new') {
            setCategory('');
            setSellingPrice('');
        }
    }, [selectedProductId, products]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedProductId) {
            setError('Please select an existing product or choose "Add New"');
            return;
        }

        const isNew = selectedProductId === 'new';
        if (isNew && !newProductName) {
            setError('Product Name is required for new products');
            return;
        }

        setLoading(true);

        try {
            await recordPurchase({
                productId: isNew ? undefined : selectedProductId,
                productName: isNew ? newProductName : undefined,
                category: isNew ? category : undefined,
                sellingPrice: Number(sellingPrice),
                supplierName,
                costPrice: Number(costPrice),
                quantity: Number(quantity),
            } as any);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to record purchase log');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="bg-sidebar border border-sidebar-border rounded-[32px] shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pos-accent/20">📥</div>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Log Purchase</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-card-border transition-all text-muted hover:text-foreground">
                        ✕
                    </button>
                </div>

                {error && <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Select Product *</label>
                        <div className="space-y-3">
                            <select
                                required
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                                disabled={loadingProducts}
                            >
                                <option value="">{loadingProducts ? 'Loading products...' : '-- Choose a product --'}</option>
                                <option value="new" className="text-pos-accent font-black">+ Create New Product</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                                ))}
                            </select>

                            {selectedProductId === 'new' && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">New Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter product name..."
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {(selectedProductId === 'new' || selectedProductId !== '') && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Category *</label>
                                <input
                                    type="text"
                                    required
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Selling Price *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Supplier Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Ali Traders, Ahmed & Co"
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Unit Cost Price *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={costPrice}
                                onChange={(e) => setCostPrice(e.target.value)}
                                className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Quantity *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                            />
                        </div>
                    </div>

                    {costPrice && quantity && (
                        <div className="p-4 bg-pos-accent/5 rounded-xl border border-pos-accent/10 flex justify-between items-center mt-2">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Invoice Cost</span>
                            <span className="text-pos-accent font-black text-lg tracking-tighter">
                                Rs. {(Number(costPrice) * Number(quantity)).toLocaleString()}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-card-border mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-card-border rounded-xl text-foreground hover:bg-card-border transition-colors font-black text-[11px] uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 bg-pos-accent text-white rounded-xl transition-all font-black text-[11px] uppercase tracking-wider shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600 shadow-pos-accent/20 hover:shadow-pos-accent/40 hover:-translate-y-0.5'}`}
                        >
                            {loading ? 'Logging...' : 'Log Purchase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
