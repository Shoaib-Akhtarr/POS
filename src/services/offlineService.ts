// offlineService.ts - Service for offline storage and sync
import { Sale, Product } from '@/types';

const OFFLINE_SALES_KEY = 'offline_sales';
const OFFLINE_PRODUCTS_KEY = 'offline_products';

// Offline Sales Management
export const saveOfflineSale = (sale: Omit<Sale, '_id'> & { _id?: string }): string => {
  const offlineSales = getOfflineSales();
  const saleId = sale._id || `offline-${Date.now()}`;
  // Ensure we're not duplicating receiptId in offline storage
  const newSale = {
    ...sale,
    _id: saleId,
    createdAt: new Date().toISOString(),
    // Make sure receiptId exists for offline sales
    receiptId: sale.receiptId || `RCP-${Date.now()}`
  };

  offlineSales.push(newSale);
  localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(offlineSales));

  return saleId;
};

export const getOfflineSales = (): (Omit<Sale, '_id'> & { _id?: string })[] => {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem(OFFLINE_SALES_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const removeOfflineSale = (saleId: string) => {
  const offlineSales = getOfflineSales();
  const updatedSales = offlineSales.filter(sale => sale._id !== saleId);
  localStorage.setItem(OFFLINE_SALES_KEY, JSON.stringify(updatedSales));
};

// Offline Product Management
export const saveOfflineProduct = (product: Product) => {
  const offlineProducts = getOfflineProducts();
  const existingIndex = offlineProducts.findIndex(p => p._id === product._id);

  if (existingIndex !== -1) {
    offlineProducts[existingIndex] = product;
  } else {
    offlineProducts.push(product);
  }

  localStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify(offlineProducts));
};

export const getOfflineProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem(OFFLINE_PRODUCTS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const updateOfflineProductQuantity = (productId: string, newQuantity: number) => {
  const offlineProducts = getOfflineProducts();
  const productIndex = offlineProducts.findIndex(p => p._id === productId);

  if (productIndex !== -1) {
    const product = offlineProducts[productIndex];
    offlineProducts[productIndex] = {
      ...product,
      // Ensure both field naming conventions are updated
      quantity: newQuantity,
      stock: newQuantity,
      sellingPrice: product.sellingPrice || product.price,
      price: product.price || product.sellingPrice
    };
    localStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify(offlineProducts));
  }
};

// Sync Management
export const hasOfflineData = (): boolean => {
  return getOfflineSales().length > 0;
};

// Clear offline data after successful sync
export const clearOfflineData = () => {
  localStorage.removeItem(OFFLINE_SALES_KEY);
  localStorage.removeItem(OFFLINE_PRODUCTS_KEY);
};