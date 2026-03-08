// productService.ts - Service for product-related API operations
import api from './apiService';
import { Product } from '@/types';

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await api.post('/products', productData);
    const product = response.data;
    return {
      ...product,
      sellingPrice: product.sellingPrice || product.price,
      quantity: product.quantity || product.stock,
      price: product.price || product.sellingPrice,
      stock: product.stock || product.quantity,
    };
  } catch (error: any) {
    console.error('Error creating product:', error);

    // Extract message from backend response if available
    const message = error.response?.data?.message || error.message;

    if (typeof window !== 'undefined' && (!navigator.onLine || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Network Error')))) {
      throw new Error('Network error - unable to create product');
    }
    throw new Error(message);
  }
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product:', error);

    // Extract message from backend response if available
    const message = error.response?.data?.message || error.message;

    if (typeof window !== 'undefined' && (!navigator.onLine || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Network Error')))) {
      throw new Error('Network error - unable to delete product');
    }
    throw new Error(message);
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/products');
    // Map the response to ensure consistent field names for the Web POS
    return response.data.map((product: any) => ({
      ...product,
      sellingPrice: product.sellingPrice || product.price,
      quantity: product.quantity || product.stock,
      price: product.price || product.sellingPrice,
      stock: product.stock || product.quantity,
    }));
  } catch (error: any) {
    console.error('Error fetching products:', error);
    // Safer check for network error
    if (typeof window !== 'undefined' && (!navigator.onLine || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Network Error')))) {
      throw new Error('Network error - unable to fetch products');
    }
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get(`/products/${id}`);
    // Map the response to ensure consistent field names for the Web POS
    const product = response.data;
    return {
      ...product,
      sellingPrice: product.sellingPrice || product.price,
      quantity: product.quantity || product.stock,
      price: product.price || product.sellingPrice,
      stock: product.stock || product.quantity,
    };
  } catch (error: any) {
    console.error('Error fetching product:', error);
    // Safer check for network error
    if (typeof window !== 'undefined' && (!navigator.onLine || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Network Error')))) {
      throw new Error('Network error - unable to fetch product');
    }
    throw error;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    // Map the response to ensure consistent field names for the Web POS
    return response.data.map((product: any) => ({
      ...product,
      sellingPrice: product.sellingPrice || product.price,
      quantity: product.quantity || product.stock,
      price: product.price || product.sellingPrice,
      stock: product.stock || product.quantity,
    }));
  } catch (error: any) {
    console.error('Error searching products:', error);
    // Safer check for network error
    if (typeof window !== 'undefined' && (!navigator.onLine || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Network Error')))) {
      throw new Error('Network error - unable to search products');
    }
    throw error;
  }
};

export const updateProductQuantity = async (id: string, quantity: number): Promise<Product> => {
  try {
    console.log(`Updating product ${id} quantity to ${quantity}`); // Debug log
    const response = await api.patch(`/products/${id}/quantity`, { quantity });
    console.log('Product quantity update response:', response); // Debug log
    // Map the response to ensure consistent field names for the Web POS
    const product = response.data;
    return {
      ...product,
      sellingPrice: product.sellingPrice || product.price,
      quantity: product.quantity || product.stock,
      price: product.price || product.sellingPrice,
      stock: product.stock || product.quantity,
    };
  } catch (error: any) {
    console.error('Error updating product quantity:', error);
    console.error(`Failed to update product ${id} quantity to ${quantity}`); // Debug log

    // Safer check for network error
    if (typeof window !== 'undefined' && (!navigator.onLine || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Network Error')))) {
      throw new Error('Network error - unable to update product quantity');
    }
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    const product = response.data;
    return {
      ...product,
      sellingPrice: product.sellingPrice || product.price,
      quantity: product.quantity || product.stock,
      price: product.price || product.sellingPrice,
      stock: product.stock || product.quantity,
    };
  } catch (error: any) {
    console.error('Error updating product:', error);

    // Extract message from backend response if available
    const message = error.response?.data?.message || error.message;

    if (typeof window !== 'undefined' && (!navigator.onLine || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Network Error')))) {
      throw new Error('Network error - unable to update product');
    }
    throw new Error(message);
  }
};