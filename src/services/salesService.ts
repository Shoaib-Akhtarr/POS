// salesService.ts - Service for sales-related API operations
import api from './apiService';
import { Sale } from '@/types';

export const createSale = async (saleData: Partial<Sale>): Promise<Sale> => {
  try {
    console.log('Sending sale data to API:', saleData); // Debug log
    const response = await api.post('/sales', saleData);
    console.log('Sale creation response:', response); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('Error creating sale:', error);
    console.error('Sale data that failed:', saleData); // Debug log

    // Check if it's a network error
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - please check your internet connection');
    }

    throw error;
  }
};

export const getSales = async (page: number = 1, limit: number = 10): Promise<{ sales: Sale[]; total: number }> => {
  try {
    const response = await api.get(`/sales?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    // Check if it's a network error
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - unable to fetch sales');
    }
    throw error;
  }
};

export const getSaleById = async (id: string): Promise<Sale> => {
  try {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sale:', error);
    // Check if it's a network error
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - unable to fetch sale');
    }
    throw error;
  }
};

export const getSalesByCustomer = async (customerName: string): Promise<Sale[]> => {
  try {
    const response = await api.get(`/sales/customer/${encodeURIComponent(customerName)}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sales by customer:', error);
    // Check if it's a network error
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - unable to fetch sales by customer');
    }
    throw error;
  }
};

export const updateSalePaymentStatus = async (id: string, isPaid: boolean): Promise<Sale> => {
  try {
    const response = await api.patch(`/sales/${id}/payment-status`, { isPaid });
    return response.data;
  } catch (error: any) {
    console.error('Error updating sale payment status:', error);
    // Check if it's a network error
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - unable to update payment status');
    }
    throw error;
  }
};

export const getDues = async (): Promise<Sale[]> => {
  try {
    const response = await api.get('/sales/dues');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dues:', error);
    // Check if it's a network error
    if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Network error - unable to fetch dues');
    }
    throw error;
  }
};