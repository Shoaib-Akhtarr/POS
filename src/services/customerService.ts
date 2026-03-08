import api from './apiService';
import { Customer } from '@/types';

export const getCustomers = async (): Promise<Customer[]> => {
    try {
        const response = await api.get('/customers');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching customers:', error);
        if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            throw new Error('Network error - unable to fetch customers');
        }
        throw error;
    }
};

export const searchCustomers = async (query: string): Promise<Customer[]> => {
    try {
        const response = await api.get(`/customers/search?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error: any) {
        console.error('Error searching customers:', error);
        if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            throw new Error('Network error - unable to search customers');
        }
        throw error;
    }
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
    try {
        const response = await api.post('/customers', data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating customer:', error);

        // Extract message from backend response if available
        const message = error.response?.data?.message || error.message;

        if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            throw new Error('Network error - unable to create customer');
        }
        throw new Error(message);
    }
};

export const getCustomerById = async (id: string): Promise<Customer> => {
    try {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching customer ${id}:`, error);
        if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            throw new Error('Network error - unable to fetch customer');
        }
        throw error;
    }
};

export const receiveCustomerPayment = async (id: string, amount: number, paymentMethod: string = 'Cash') => {
    try {
        const response = await api.post(`/customers/${id}/pay`, { amount, paymentMethod });
        return response.data;
    } catch (error: any) {
        console.error(`Error processing payment for customer ${id}:`, error);
        if (!navigator.onLine || error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            throw new Error('Network error - unable to process payment');
        }
        throw error;
    }
};
