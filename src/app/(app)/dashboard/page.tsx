'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import ProductSearch from '@/components/ProductSearch';
import Cart from '@/components/Cart';
import CustomerInfo from '@/components/CustomerInfo';
import PaymentMethod from '@/components/PaymentMethod';
import CustomerHistory from '@/components/CustomerHistory';
import AddCustomerModal from '@/components/AddCustomerModal';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';
import ReceiptPreview from '@/components/ReceiptPreview';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import CheckoutSuccessModal from '@/components/CheckoutSuccessModal';
import { Product, Sale, Customer } from '@/types';
import { createSale } from '@/services/salesService';
import { updateProductQuantity } from '@/services/productService';
import { saveOfflineSale, updateOfflineProductQuantity } from '@/services/offlineService';

function POSContent() {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit'>('Cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productRefreshTrigger, setProductRefreshTrigger] = useState(0);
  const [isDraggingOverCart, setIsDraggingOverCart] = useState(false);
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [showHistory, setShowHistory] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') === 'pos' ? 'pos' : 'analytics';

  // Auto-fill amountPaid when total changes
  useEffect(() => {
    if (currentView === 'pos') {
      const total = calculateTotal();
      // Default to the amount needed to clear the debt: current bill + absolute value of negative dues
      const pendingDebt = selectedCustomer && selectedCustomer.totalDues < 0 ? Math.abs(selectedCustomer.totalDues) : 0;
      const totalRequested = total + pendingDebt;
      setAmountPaid(totalRequested > 0 ? totalRequested.toString() : '');
    }
  }, [cart, discountAmount, currentView, selectedCustomer]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => String(item.product._id) === String(product._id));
      if (existingItem) {
        return prevCart.map(item =>
          String(item.product._id) === String(product._id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => String(item.product._id) !== String(productId)));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        String(item.product._id) === String(productId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setSelectedCustomer(null);
    setPaymentMethod('Cash');
    setAmountPaid('');
    setDiscountAmount('');
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (total, item) => total + (item.product.sellingPrice || item.product.price || 0) * item.quantity,
      0
    );
    const discount = parseFloat(discountAmount) || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    const total = calculateTotal();
    
    // Logic: selectedCustomer.totalDues is negative if they owe money.
    // balanceDue = previousDues - currentBill + amountPaid
    // If result > 0 (they paid extra), clamp to 0 (no advance).
    const previousDues = selectedCustomer ? selectedCustomer.totalDues : 0;
    const paid = parseFloat(amountPaid) || 0;
    const balanceDue = selectedCustomer ? Math.min(0, previousDues - total + paid) : 0;

    const saleData = {
      cartItems: cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.sellingPrice || item.product.price || 0,
        product: item.product._id,
      })),
      totalAmount: total,
      discount: parseFloat(discountAmount) || 0,
      customerName: customerName || (selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'),
      customer: selectedCustomer ? selectedCustomer._id : undefined,
      previousDues: previousDues,
      amountPaid: paid,
      balanceDue: balanceDue,
      paymentMethod,
      isPaid: paymentMethod === 'Cash',
      printed: false,
      receiptId: `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    try {
      setSaleLoading(true);
      let finalReceiptId = saleData.receiptId;

      if (offlineMode) {
        saveOfflineSale(saleData);
        // Optimistically update stock locally
        cart.forEach(item => {
          const newQty = (item.product.quantity || item.product.stock || 0) - item.quantity;
          updateOfflineProductQuantity(item.product._id, newQty);
        });
        alert('Sale saved locally (Offline).');
      } else {
        const response = await createSale(saleData);
        finalReceiptId = response.receiptId || saleData.receiptId;
        
        // Update stock in DB
        for (const item of cart) {
          const newQty = (item.product.quantity || item.product.stock || 0) - item.quantity;
          await updateProductQuantity(item.product._id, newQty);
        }
      }

      setProductRefreshTrigger(prev => prev + 1);
      setCompletedSaleData({ ...saleData, receiptId: finalReceiptId });
      // alert('Sale completed successfully!'); - Removed immediate alert
    } catch (error: any) {
      console.error('Error saving sale:', error);
      if (error.message.includes('Network Error') || !navigator.onLine) {
        saveOfflineSale(saleData);
        alert('Connection lost. Sale saved locally.');
        setCompletedSaleData({ ...saleData });
      } else {
        alert(error.message || 'Error saving sale.');
      }
    } finally {
      setSaleLoading(false);
    }
  };

  const handleEditSale = (sale: Sale) => {
    setCart(sale.cartItems.map(item => ({
      product: {
        _id: item.product,
        name: item.name,
        costPrice: item.price,
        sellingPrice: item.price,
        quantity: 100,
        price: item.price,
        stock: 100,
        category: 'General',
        description: 'Imported from previous sale',
        salesCount: 0,
        user: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      quantity: item.quantity
    })));
    setCustomerName(sale.customerName || '');
    setPaymentMethod(sale.paymentMethod);
    setShowHistory(false);
  };

  return (
    <AuthenticatedLayout
      cartCount={cart.reduce((acc, curr) => acc + curr.quantity, 0)}
      onCartToggle={() => setMobileTab(mobileTab === 'products' ? 'cart' : 'products')}
      showCartToggle={currentView === 'pos'}
    >
      {currentView === 'analytics' ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <DashboardAnalytics />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden animate-in fade-in duration-500">
          <div className={`flex-1 lg:flex-[0.55] overflow-hidden flex flex-col border-r border-sidebar-border bg-background ${mobileTab === 'products' ? 'flex' : 'hidden lg:flex'}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
              <ProductSearch onAddToCart={addToCart} onEditProduct={setEditingProduct} refreshTrigger={productRefreshTrigger} />
            </div>
          </div>
          <aside
            className={`flex-1 lg:flex-[0.45] bg-sidebar flex flex-col overflow-hidden shadow-sm border-l border-sidebar-border transition-all duration-200 ${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'} ${isDraggingOverCart ? 'ring-4 ring-pos-accent/20 bg-pos-accent/5' : ''}`}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
            onDragEnter={(e) => { e.preventDefault(); setIsDraggingOverCart(true); }}
            onDragLeave={(e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDraggingOverCart(false); }}
            onDrop={(e) => {
              e.preventDefault(); setIsDraggingOverCart(false);
              const data = e.dataTransfer.getData('product');
              if (data) addToCart(JSON.parse(data), 1);
            }}
          >
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-lg font-bold uppercase tracking-widest text-foreground italic">Current Order</h2>
                  <span className="text-[10px] font-bold text-pos-accent bg-pos-accent/10 px-2 py-1 rounded-md">{cart.reduce((acc, curr) => acc + curr.quantity, 0)} Items</span>
                </div>
                <div className="bg-background rounded-2xl border border-card-border overflow-hidden min-h-[200px] shadow-sm">
                  <Cart cart={cart} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} total={calculateTotal()} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-card-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] px-1">Select Customer</p>
                <CustomerInfo
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={(c) => {
                    setSelectedCustomer(c);
                    if (!c) { setPaymentMethod('Cash'); setAmountPaid(calculateTotal().toString()); }
                    else if (paymentMethod === 'Cash') setAmountPaid(calculateTotal().toString());
                  }}
                  onShowHistory={() => selectedCustomer ? setShowHistory(true) : alert("Please select a customer first.")}
                />
              </div>
              <div className="space-y-4 pt-4 border-t border-card-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] px-1">Payment Method</p>
                <PaymentMethod 
                  paymentMethod={paymentMethod} 
                  setPaymentMethod={setPaymentMethod} 
                  amountPaid={amountPaid} 
                  setAmountPaid={setAmountPaid} 
                  discountAmount={discountAmount} 
                  setDiscountAmount={setDiscountAmount} 
                  total={calculateTotal()} 
                  isCustomerSelected={!!selectedCustomer} 
                  previousDues={selectedCustomer?.totalDues || 0}
                />
              </div>
            </div>
            <div className="p-4 lg:p-6 border-t border-sidebar-border bg-sidebar shadow-[0_-4px_32px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex flex-col"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Grand Total</span><span className="text-3xl font-black text-foreground tracking-tighter">Rs. {calculateTotal().toLocaleString()}</span></div>
              </div>
              <button 
                onClick={handleCompleteSale} 
                disabled={cart.length === 0 || saleLoading} 
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-white shadow-lg transition-all transform active:scale-95 ${cart.length === 0 || saleLoading ? 'bg-muted/10 text-muted cursor-not-allowed border border-card-border' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/40'}`}
              >
                {saleLoading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {showHistory && selectedCustomer && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md p-4 lg:p-10 flex items-center justify-center">
          <div className="w-full max-w-5xl h-[90vh] glass-card bg-card rounded-[32px] border border-card-border overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <CustomerHistory customerName={selectedCustomer.name} onClose={() => setShowHistory(false)} onEditSale={handleEditSale} />
          </div>
        </div>
      )}

      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onSuccess={() => { setShowAddProduct(false); setProductRefreshTrigger(prev => prev + 1); }} />}
      {showAddCustomer && <AddCustomerModal onClose={() => setShowAddCustomer(false)} onSuccess={(newCustomer) => { setShowAddCustomer(false); setSelectedCustomer(newCustomer); setCustomerName(newCustomer.name); }} />}
      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSuccess={() => { setEditingProduct(null); setProductRefreshTrigger(prev => prev + 1); }} />}

      {showPrintPreview && (
        <ReceiptPreview cart={cart} customerName={customerName} paymentMethod={paymentMethod} total={calculateTotal()} discount={parseFloat(discountAmount) || 0} onClose={() => setShowPrintPreview(false)} onPrint={() => setShowPrintPreview(false)} />
      )}
      {completedSaleData && (
        <ReceiptPreview
          cart={completedSaleData.cartItems.map((item: any) => ({
            product: { _id: item.product, name: item.name, costPrice: item.price, sellingPrice: item.price, price: item.price, category: 'General', description: '', salesCount: 0, user: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            quantity: item.quantity
          }))}
          customerName={completedSaleData.customerName || ''}
          paymentMethod={completedSaleData.paymentMethod}
          total={completedSaleData.totalAmount}
          discount={completedSaleData.discount}
          previousDues={completedSaleData.previousDues}
          amountPaid={completedSaleData.amountPaid}
          balanceDue={completedSaleData.balanceDue}
          isCompleted={true}
          onClose={() => { 
            setShowSuccessModal(true);
          }}
          onPrint={() => { 
            setShowSuccessModal(true);
          }}
        />
      )}

      {showSuccessModal && (
        <CheckoutSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setCompletedSaleData(null);
            clearCart();
          }}
          customerName={completedSaleData?.customerName || 'Walk-in Customer'}
          selectedCustomer={completedSaleData?.customer ? ({ _id: completedSaleData.customer, name: completedSaleData.customerName } as Customer) : null}
        />
      )}
    </AuthenticatedLayout>
  );
}

export default function POSDashboard() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pos-accent"></div></div>}>
      <POSContent />
    </Suspense>
  );
}
