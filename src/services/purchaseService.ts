import api from './apiService';
import { Purchase } from '@/types';

// Interface for new purchase data going to the server
export interface NewPurchaseData {
    productId: string;
    supplierName: string;
    costPrice: number;
    quantity: number;
}

export const getPurchases = async (page = 1, limit = 50) => {
    try {
        const response = await api.get(`/purchases?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching purchases:', error);
        const message = error.response?.data?.error || error.message;
        throw new Error(message || 'Failed to fetch purchases');
    }
};

export const recordPurchase = async (purchaseData: NewPurchaseData) => {
    try {
        const response = await api.post('/purchases', purchaseData);
        return response.data;
    } catch (error: any) {
        console.error('Error recording purchase:', error);
        const message = error.response?.data?.error || error.message;
        throw new Error(message || 'Failed to record purchase');
    }
};
