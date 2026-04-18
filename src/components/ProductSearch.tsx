'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import { getAllProducts, deleteProduct } from '@/services/productService';

interface ProductSearchProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  onEditProduct?: (product: Product) => void;
  refreshTrigger?: number;
  isManagerView?: boolean;
}

export default function ProductSearch({ onAddToCart, onEditProduct, refreshTrigger = 0, isManagerView = false }: ProductSearchProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await getAllProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      if (err.message.includes('Network error')) {
        setError(t('connectionLost'));
      } else {
        setError(t('errorOccurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const handleDeleteProduct = async (product: Product) => {
    const stock = product.quantity || product.stock || 0;
    if (stock > 0) {
      alert(t('errorOccurred')); // Could add specific key
      return;
    }
    if (!window.confirm(`${t('deletePermanent')}?`)) return;
    try {
      setDeleteLoading(product._id);
      await deleteProduct(product._id);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || t('errorOccurred'));
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = products;

      if (searchTerm.trim() !== '') {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(lowerSearch) ||
          product.category.toLowerCase().includes(lowerSearch)
        );
      }

      if (selectedCategory !== 'All') {
        filtered = filtered.filter(product =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      setFilteredProducts(filtered);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, products, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    const qty = product.quantity ?? product.stock ?? 0;
    if (qty > 0) {
      onAddToCart(product, 1);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black">
          <span className="text-xl">🔍</span>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchProductPlace')}
          className="w-full pl-12 pr-4 py-4 bg-card border border-card-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-pos-accent/5 focus:border-pos-accent transition-all text-sm font-medium shadow-sm text-foreground"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2 pt-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black whitespace-nowrap border transition-all duration-200 ${selectedCategory === cat
              ? 'bg-pos-accent text-white border-pos-accent shadow-md shadow-pos-accent/20'
              : 'bg-card text-black border-card-border hover:border-pos-accent hover:text-pos-accent'
              }`}
          >
            {cat === 'All' ? t('allProducts') : cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-pos-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-black uppercase tracking-widest">{t('findingProducts')}</p>
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const stock = product.quantity || product.stock || 0;
            return (
              <div
                key={product._id}
                draggable={stock > 0 && !isManagerView}
                onDragStart={(e) => {
                  if (stock <= 0 || isManagerView) return;
                  e.dataTransfer.setData('product', JSON.stringify(product));
                  e.dataTransfer.effectAllowed = 'copy';
                  // Add a slight transparency to the drag ghost image
                  const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
                  ghost.style.opacity = '0.5';
                }}
                className={`group relative bg-card border border-card-border rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-pos-accent/5 hover:border-pos-accent/30 transition-all duration-300 flex flex-col h-full ${stock > 0 && !isManagerView ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black text-black uppercase tracking-widest px-2 py-1 bg-pos-accent/5 rounded-lg group-hover:bg-pos-accent/10 group-hover:text-pos-accent transition-colors">
                    {product.category}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-black text-sm tracking-tight mb-1 group-hover:text-pos-accent transition-colors text-foreground">{product.name}</h3>
                  <div className="flex items-baseline space-x-1 mb-4">
                    <span className="text-[10px] font-bold text-black">Rs.</span>
                    <span className="text-lg font-black tracking-tighter text-pos-accent">
                      {(product.sellingPrice || product.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-card-border">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-black tracking-widest">{t('stockLeft')}</span>
                    <span className={`text-[11px] font-black ${stock < 5 ? 'text-danger' : 'text-foreground'}`}>
                      {stock} {t('units')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isManagerView && onEditProduct && (
                      <button
                        onClick={() => onEditProduct(product)}
                        className="px-4 py-2 bg-card border border-card-border hover:border-pos-accent text-black hover:text-pos-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        {t('edit')}
                      </button>
                    )}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={stock <= 0 || isManagerView}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isManagerView
                        ? 'hidden'
                        : stock > 0
                          ? 'bg-pos-accent text-white shadow-lg shadow-pos-accent/20 hover:scale-105 active:scale-95'
                          : 'bg-slate-100 text-black cursor-not-allowed'
                        }`}
                    >
                      {stock > 0 ? `+ ${t('add')}` : t('outOfStock')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          !loading && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-5xl opacity-20">🔎</div>
              <div>
                <p className="font-black text-black uppercase tracking-widest text-sm">{t('noProductsFound')}</p>
                <p className="text-xs text-black mt-1">{t('tryAdjustFilters')}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
