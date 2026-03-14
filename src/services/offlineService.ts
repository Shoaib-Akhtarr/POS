// offlineService.ts - Service for handling offline data storage and synchronization
import { Sale, Product } from '@/types';

const SALES_STORE = 'offline-sales';
const PRODUCTS_STORE = 'cached-products';

export const saveOfflineSale = (sale: Partial<Sale>): void => {
  if (typeof window === 'undefined') return;
  
  const offlineSales = JSON.parse(localStorage.getItem(SALES_STORE) || '[]');
  const newSale = {
    ...sale,
    _id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    isOffline: true,
    createdAt: new Date().toISOString()
  };
  
  offlineSales.push(newSale);
  localStorage.setItem(SALES_STORE, JSON.stringify(offlineSales));
  console.log('Sale saved offline:', newSale);
};

export const updateOfflineProductQuantity = (productId: string, newQuantity: number): void => {
  if (typeof window === 'undefined') return;
  
  const cachedProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORE) || '[]');
  const productIndex = cachedProducts.findIndex((p: Product) => p._id === productId);
  
  if (productIndex !== -1) {
    cachedProducts[productIndex].quantity = newQuantity;
    localStorage.setItem(PRODUCTS_STORE, JSON.stringify(cachedProducts));
  }
};

export const hasOfflineData = (): boolean => {
  if (typeof window === 'undefined') return false;
  const offlineSales = JSON.parse(localStorage.getItem(SALES_STORE) || '[]');
  return offlineSales.length > 0;
};

export const getOfflineSales = (): any[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(SALES_STORE) || '[]');
};

export const clearOfflineSales = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SALES_STORE);
};

export const cacheProducts = (products: Product[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_STORE, JSON.stringify(products));
};

export const getCachedProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(PRODUCTS_STORE) || '[]');
};
