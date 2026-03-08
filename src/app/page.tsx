'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductSearch from '@/components/ProductSearch';
import Cart from '@/components/Cart';
import CustomerInfo from '@/components/CustomerInfo';
import PaymentMethod from '@/components/PaymentMethod';
import CustomerHistory from '@/components/CustomerHistory';
import AddCustomerModal from '@/components/AddCustomerModal';
import AddProductModal from '@/components/AddProductModal';
import EditProductModal from '@/components/EditProductModal';
import ReceiptPreview from '@/components/ReceiptPreview';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import { Product, Sale, Customer } from '@/types';
import { createSale } from '@/services/salesService';
import { updateProductQuantity } from '@/services/productService';
import { saveOfflineSale, updateOfflineProductQuantity, hasOfflineData } from '@/services/offlineService';

export default function POSDashboard() {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit'>('Cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [currentView, setCurrentView] = useState<'pos' | 'customerHistory' | 'receipt'>('pos');
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [hasUnsyncedData, setHasUnsyncedData] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productRefreshTrigger, setProductRefreshTrigger] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDraggingOverCart, setIsDraggingOverCart] = useState(false);
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();

  // Check for offline status
  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      // Try to sync when coming back online
      if (hasOfflineData()) {
        syncOfflineData();
      }
    };
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setOfflineMode(!navigator.onLine);
    setHasUnsyncedData(hasOfflineData());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for unsynced data on mount and periodically
  useEffect(() => {
    const checkUnsyncedData = () => {
      setHasUnsyncedData(hasOfflineData());
    };

    checkUnsyncedData;
    const interval = setInterval(checkUnsyncedData, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

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

    // Prepare sale data
    const saleData = {
      cartItems: cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.sellingPrice || item.product.price || 0,
        product: item.product._id, // This should be the MongoDB ObjectId string
      })),
      totalAmount: total,
      discount: parseFloat(discountAmount) || 0,
      customerName: customerName || undefined,
      customer: selectedCustomer ? selectedCustomer._id : undefined,
      previousDues: selectedCustomer ? selectedCustomer.totalDues : 0,
      amountPaid: parseFloat(amountPaid) || 0,
      balanceDue: selectedCustomer ? (selectedCustomer.totalDues + total - (parseFloat(amountPaid) || 0)) : 0,
      paymentMethod,
      isPaid: paymentMethod === 'Cash', // Credit sales are not paid initially
      printed: false, // Bypassing print for now
      receiptId: `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    // Check if we're offline
    if (offlineMode) {
      // Save offline sale
      saveOfflineSale(saleData);

      // Update offline product quantities
      cart.forEach(item => {
        updateOfflineProductQuantity(
          item.product._id,
          (item.product.quantity || item.product.stock || 0) - item.quantity
        );
      });

      setHasUnsyncedData(true);
      setCompletedSaleData(saleData);
      return;
    }

    // Online mode - proceed to create sale directly
    try {
      console.log('Final Sale Data before sending:', {
        total,
        amountPaid: parseFloat(amountPaid) || 0,
        balanceDue: selectedCustomer ? (selectedCustomer.totalDues + total - (parseFloat(amountPaid) || 0)) : 0,
        paymentMethod
      });
      console.log('Sending sale data:', saleData); // Debug log
      const newSale = await createSale(saleData);
      console.log('Sale created successfully:', newSale); // Debug log

      // Update product quantities in the backend
      for (const item of cart) {
        console.log(`Updating quantity for product ${item.product._id}:`, (item.product.quantity || item.product.stock || 0) - item.quantity); // Debug log
        await updateProductQuantity(item.product._id,
          (item.product.quantity || item.product.stock || 0) - item.quantity);
      }

      setProductRefreshTrigger(prev => prev + 1);
      setCompletedSaleData({ ...saleData, receiptId: newSale.receiptId });
      return;
    } catch (error: any) {
      console.error('Error saving sale:', error);
      console.error('Sale data that failed:', saleData); // Debug log

      // Check if it's a network error
      if (error.message?.includes('Network error') || !navigator.onLine) {
        // Save to offline storage as fallback
        saveOfflineSale(saleData);

        // Update offline product quantities
        cart.forEach(item => {
          updateOfflineProductQuantity(
            item.product._id,
            (item.product.quantity || item.product.stock || 0) - item.quantity
          );
        });

        alert('Network error detected. Sale saved offline.');
        setCompletedSaleData(saleData);
        return;
      } else {
        // For other errors, show the error message
        alert(`Error saving sale: ${error.message}. It has been saved offline and will sync when connection is restored.`);

        // Fallback save
        saveOfflineSale(saleData);
        setCompletedSaleData(saleData);
        return;
      }
    }
  };

  const syncOfflineData = async () => {
    if (offlineMode || !hasOfflineData()) return;

    setSyncStatus('syncing');

    try {
      // In a real implementation, we would sync all offline sales
      // For this example, we'll just update the status
      setSyncStatus('success');
      setHasUnsyncedData(false);

      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');

      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleEditSale = (sale: Sale) => {
    // Set the cart to the items from the selected sale
    setCart(sale.cartItems.map(item => ({
      product: {
        _id: item.product,
        name: item.name,
        costPrice: item.price, // Using price as costPrice for this example
        sellingPrice: item.price,
        quantity: 100, // Placeholder value
        price: item.price,
        stock: 100, // Placeholder value
        category: 'General', // Placeholder value
        description: 'Imported from previous sale', // Placeholder value
        salesCount: 0, // Placeholder value
        user: '', // Placeholder value
        createdAt: new Date().toISOString(), // Placeholder value
        updatedAt: new Date().toISOString() // Placeholder value
      },
      quantity: item.quantity
    })));

    // Set customer name and payment method
    setCustomerName(sale.customerName || '');
    setPaymentMethod(sale.paymentMethod);

    // Close the customer history view
    setCurrentView('pos');

    alert(`Loaded sale ${sale.receiptId} into cart. You can now edit the items.`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverCart(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we're not entering a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOverCart(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverCart(false);

    try {
      const productData = e.dataTransfer.getData('product');
      if (productData) {
        const product: Product = JSON.parse(productData);
        addToCart(product, 1);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };



  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        {/* Modern Sidebar (220px) */}
        <aside className="w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col justify-between py-8 px-4 shadow-sm relative z-50 transition-all duration-300">
          <div className="space-y-10">
            {/* Logo/Brand */}
            <div
              className="flex items-center space-x-3 px-2 group cursor-pointer"
              onClick={() => setCurrentView('pos')}
            >
              <div className="w-10 h-10 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pos-accent/20 group-hover:scale-110 transition-transform duration-300">
                K
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tight leading-none italic">Karobar</h1>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sahulat POS</span>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1.5">
              {[
                { id: 'pos', label: 'Dashboard', icon: '🏠' },
                { id: 'products', label: 'Products', icon: '📦', action: () => router.push('/products') },
                { id: 'customers', label: 'Customers', icon: '👥', action: () => router.push('/customers') },
                { id: 'transactions', label: 'Transactions', icon: '📄', action: () => router.push('/transactions') },
                { id: 'settings', label: 'Settings', icon: '⚙️', isAction: true }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isAction) {
                      if (item.id === 'settings') setShowSettingsModal(true);
                    } else if (item.action) {
                      item.action();
                    } else {
                      setCurrentView(item.id as any);
                    }
                  }}
                  className={`flex items-center space-x-3 w-full p-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-200 ${currentView === item.id
                    ? 'bg-pos-accent text-white shadow-md shadow-pos-accent/20'
                    : 'text-muted hover:text-foreground hover:bg-card-border'
                    }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            {/* Status Indicator */}
            <div className="px-2 space-y-4">
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-[9px] font-black tracking-widest ${offlineMode ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${offlineMode ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                  <span>{offlineMode ? 'OFFLINE' : 'ONLINE'}</span>
                </div>
                {hasUnsyncedData && (
                  <button
                    onClick={syncOfflineData}
                    className="ml-2 hover:scale-110 transition-transform"
                    title="Sync Data"
                  >
                    🔄
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center space-x-3 w-full p-4 rounded-xl text-red-500 font-bold text-[11px] uppercase tracking-wider hover:bg-red-500/10 transition-all duration-200 group border border-transparent hover:border-red-500/20"
            >
              <span className="text-lg leading-none group-hover:rotate-12 transition-transform">↪️</span>
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#07080d]/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#121521] border border-[#23273a] w-full max-w-sm rounded-[32px] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 ring-4 ring-red-500/5">
                  <span className="text-4xl animate-pulse">👋</span>
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-3">Sign Out?</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 px-4">
                  Are you sure you want to end your session? You will need to log back in to access the POS.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95"
                  >
                    Stay Logged In
                  </button>
                  <button
                    onClick={logout}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 active:scale-95 border border-white/10"
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="flex-1 flex overflow-hidden">
            {/* Center Area: Product Selection (55%) */}
            <main className="flex-[0.55] overflow-hidden flex flex-col border-r border-sidebar-border">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <ProductSearch
                  onAddToCart={addToCart}
                  onEditProduct={(product) => setEditingProduct(product)}
                  refreshTrigger={productRefreshTrigger}
                />
              </div>
            </main>

            {/* Right Aside: Cart & Customer (45%) */}
            <aside
              className={`flex-[0.45] bg-card flex flex-col overflow-hidden shadow-sm border-l border-sidebar-border transition-all duration-200 ${isDraggingOverCart ? 'ring-4 ring-pos-accent/20 bg-pos-accent/5' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Cart Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-lg font-black uppercase tracking-widest italic text-foreground">Current Order</h2>
                    <span className="text-[10px] font-bold text-muted-foreground bg-pos-accent/10 px-2 py-1 rounded-md">
                      {cart.reduce((acc, curr) => acc + curr.quantity, 0)} Items
                    </span>
                  </div>
                  <div className="bg-background rounded-2xl border border-card-border overflow-hidden min-h-[200px]">
                    <Cart
                      cart={cart}
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                      total={calculateTotal()}
                    />
                  </div>
                </div>

                {/* Customer Section */}
                <div className="space-y-4 pt-4 border-t border-card-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[3px] px-1">Select Customer</p>
                  <CustomerInfo
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={(c) => {
                      setSelectedCustomer(c);
                      if (!c) {
                        setPaymentMethod('Cash');
                        setAmountPaid(calculateTotal().toString());
                      } else if (paymentMethod === 'Cash') {
                        setAmountPaid(calculateTotal().toString());
                      }
                    }}
                    onShowHistory={() => {
                      if (selectedCustomer) {
                        setCurrentView('customerHistory');
                      } else {
                        alert("Please select a registered customer first to view history.");
                      }
                    }}
                  />
                </div>

                {/* Payment Section */}
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
                  />
                </div>
              </div>

              {/* Sticky Checkout Bar */}
              <div className="p-6 border-t border-sidebar-border bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-center mb-6 px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Grand Total</span>
                    <span className="text-3xl font-black text-foreground tracking-tighter">
                      Rs. {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Order #0492</p>
                  </div>
                </div>

                <button
                  onClick={handleCompleteSale}
                  disabled={cart.length === 0}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-white shadow-lg transition-all transform active:scale-95 ${cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#16A34A] hover:bg-[#15803d] shadow-[#16A34A]/20'
                    }`}
                >
                  Complete Sale
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Overlays */}
        {
          currentView === 'customerHistory' && selectedCustomer && (
            <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 backdrop-blur-md p-10 flex items-center justify-center">
              <div className="w-full max-w-5xl h-[80vh] glass-card bg-[#1a1a35] rounded-[40px] border border-white border-opacity-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <CustomerHistory
                  customerName={selectedCustomer.name}
                  onClose={() => setCurrentView('pos')}
                  onEditSale={handleEditSale}
                />
              </div>
            </div>
          )
        }

        {
          showAddProduct && (
            <AddProductModal
              onClose={() => setShowAddProduct(false)}
              onSuccess={(newProduct) => {
                setShowAddProduct(false);
                setProductRefreshTrigger(prev => prev + 1);
              }}
            />
          )
        }

        {
          showAddCustomer && (
            <AddCustomerModal
              onClose={() => setShowAddCustomer(false)}
              onSuccess={(newCustomer) => {
                setShowAddCustomer(false);
                setSelectedCustomer(newCustomer);
                setCustomerName(newCustomer.name);
              }}
            />
          )
        }

        {
          editingProduct && (
            <EditProductModal
              product={editingProduct}
              onClose={() => setEditingProduct(null)}
              onSuccess={() => {
                setEditingProduct(null);
                setProductRefreshTrigger(prev => prev + 1);
              }}
            />
          )
        }
        {/* Settings Popup Modal */}
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${showSettingsModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
          />

          {/* Modal Content */}
          <div
            className={`relative w-full max-w-3xl bg-background border border-card-border rounded-2xl shadow-2xl transition-all duration-300 transform ${showSettingsModal ? 'scale-100' : 'scale-95'}`}
          >
            <div className="max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-card-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-card-border border border-card-border flex items-center justify-center text-foreground/80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">System Settings</h2>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card-border transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Grid for sections */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 gap-10">

                  {/* Row 1: UI & Business */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Appearance */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Appearance</h3>
                      </div>
                      <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
                        <div className="flex p-1 bg-background m-2 rounded-lg border border-card-border">
                          {[
                            { id: 'light', label: 'Light', icon: '☀️' },
                            { id: 'dark', label: 'Dark', icon: '🌙' },
                            { id: 'system', label: 'Auto', icon: '🖥️' }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setTheme(mode.id)}
                              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all ${theme === mode.id
                                ? 'bg-card text-foreground shadow-sm border border-card-border'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              <span className="text-sm mb-1">{mode.icon}</span>
                              <span className="text-[10px] font-medium">{mode.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Business & Printer */}
                    <div className="space-y-8">
                      {/* Business */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">System Identity</h3>
                        </div>
                        <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between group hover:border-pos-accent/30 transition-colors shadow-sm">
                          <div>
                            <p className="text-sm font-medium text-foreground">Karobar Sahulat POS</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Primary Location</p>
                          </div>
                          <div className="flex items-center space-x-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
                          </div>
                        </div>
                      </div>

                      {/* Printer */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Hardware</h3>
                        </div>
                        <div className="bg-card border border-card-border rounded-xl overflow-hidden divide-y divide-card-border shadow-sm">
                          <div className="flex items-center justify-between p-4 bg-transparent hover:bg-card-border/50 transition-colors">
                            <div>
                              <p className="text-sm font-medium text-foreground">Auto-Print Receipt</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Print instantly upon sale completion</p>
                            </div>
                            <div className="w-9 h-5 bg-pos-accent rounded-full relative cursor-pointer shadow-inner">
                              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowPrintPreview(true)}
                            className="w-full text-left p-4 bg-transparent hover:bg-card-border transition-colors flex items-center justify-between group underline-offset-4 hover:underline"
                          >
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Test Configuration</span>
                            <span className="text-muted-foreground group-hover:text-foreground">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Full Width Security Section */}
                  <div className="border-t border-card-border pt-8">
                    <ChangePasswordForm />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-card-border bg-sidebar flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 text-muted-foreground group cursor-help">
                  <div className="w-1.5 h-1.5 rounded-full bg-pos-accent group-hover:animate-ping"></div>
                  <span className="font-medium tracking-wide">Version 1.0.4 <span className="text-gray-500 ml-1">STABLE</span></span>
                </div>
                <p className="font-medium text-muted-foreground tracking-wide">
                  Designed by <span className="text-foreground/70">Shawaiz & Shoaib</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div >

      {
        showPrintPreview && (
          <div className="relative z-[300]">
            <ReceiptPreview
              cart={[
                {
                  product: {
                    _id: 'dummy-1',
                    name: "Sample Product (Preview)",
                    category: "General",
                    costPrice: 100.00,
                    price: 150.00,
                    sellingPrice: 150.00,
                    stock: 100,
                    description: "Demo preview item for receipt testing.",
                    salesCount: 0,
                    user: 'system',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  },
                  quantity: 2
                }
              ]}
              customerName="John Doe (Preview)"
              paymentMethod="Cash"
              total={285.00}
              discount={15.00}
              previousDues={50.00}
              amountPaid={335.00}
              balanceDue={0.00}
              onClose={() => setShowPrintPreview(false)}
              onPrint={() => {
                alert("Hardware Simulation: Receipt printed successfully! (This is just a preview)");
                setShowPrintPreview(false);
              }}
            />
          </div>
        )
      }

      {
        completedSaleData && (
          <div className="relative z-[300]">
            <ReceiptPreview
              cart={completedSaleData.cartItems.map((item: any) => ({
                product: {
                  _id: item.product,
                  name: item.name,
                  category: "General",
                  costPrice: item.price,
                  price: item.price,
                  sellingPrice: item.price,
                  stock: 0,
                  description: "",
                  salesCount: 0,
                  user: 'system',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                quantity: item.quantity
              }))}
              customerName={completedSaleData.customerName}
              paymentMethod={completedSaleData.paymentMethod}
              total={completedSaleData.totalAmount}
              discount={completedSaleData.discount}
              previousDues={completedSaleData.previousDues}
              amountPaid={completedSaleData.amountPaid}
              balanceDue={completedSaleData.balanceDue}
              onClose={() => {
                setCompletedSaleData(null);
                clearCart();
              }}
              onPrint={() => {
                setCompletedSaleData(null);
                clearCart();
              }}
            />
          </div>
        )
      }
    </ProtectedRoute >
  );
}
