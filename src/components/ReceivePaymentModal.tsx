import React, { useState } from 'react';
import { Customer } from '@/types';
import { receiveCustomerPayment } from '@/services/customerService';

interface ReceivePaymentModalProps {
    customer: Customer;
    onClose: () => void;
    onSuccess: (updatedCustomer: Customer) => void;
}

export default function ReceivePaymentModal({ customer, onClose, onSuccess }: ReceivePaymentModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer'>('Cash');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await receiveCustomerPayment(customer._id, paymentAmount, paymentMethod);
            onSuccess(response.customer);
        } catch (err: any) {
            setError(err.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[210] p-4">
            <div className="bg-card border border-card-border rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="flex justify-between items-center mb-4 leading-none">
                    <h2 className="text-xl font-bold text-foreground">Receive Payment</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">&times;</button>
                </div>

                <div className="bg-pos-accent/5 border border-pos-accent/10 rounded-xl p-4 mb-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Customer</p>
                    <p className="font-black text-pos-accent italic uppercase tracking-tighter text-lg leading-none mb-3">{customer.name}</p>
                    <div className="flex justify-between items-end border-t border-pos-accent/10 pt-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Dues:</span>
                        <span className="font-black text-danger text-lg tracking-tighter">Rs. {customer.totalDues.toLocaleString()}</span>
                    </div>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Payment Amount (Rs) *</label>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-3 bg-background border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all font-black text-xl text-foreground tracking-tighter"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Payment Method</label>
                        <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest mt-1">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('Cash')}
                                className={`flex-1 py-3 rounded-xl border transition-all ${paymentMethod === 'Cash' ? 'bg-success/10 border-success text-success shadow-sm' : 'border-card-border text-muted-foreground hover:bg-muted/5'}`}
                            >
                                Cash
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('Bank Transfer')}
                                className={`flex-1 py-3 rounded-xl border transition-all ${paymentMethod === 'Bank Transfer' ? 'bg-pos-accent/10 border-pos-accent text-pos-accent shadow-sm' : 'border-card-border text-muted-foreground hover:bg-muted/5'}`}
                            >
                                Bank Transfer
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 pt-4 border-t border-card-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-card-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/5 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount || parseFloat(amount) <= 0}
                            className={`flex-1 py-3 bg-pos-accent text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-pos-accent/20 active:scale-95 ${loading || !amount || parseFloat(amount) <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pos-accent/90'}`}
                        >
                            {loading ? 'Processing...' : 'Receive Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
