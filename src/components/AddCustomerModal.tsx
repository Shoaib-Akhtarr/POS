import React, { useState } from 'react';
import { Customer } from '@/types';
import { createCustomer } from '@/services/customerService';

interface AddCustomerModalProps {
    onClose: () => void;
    onSuccess: (customer: Customer) => void;
    initialName?: string;
}

export default function AddCustomerModal({ onClose, onSuccess, initialName = '' }: AddCustomerModalProps) {
    const [formData, setFormData] = useState({
        name: initialName,
        phone: '',
        address: '',
        totalDues: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const newCustomer = await createCustomer({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                totalDues: Number(formData.totalDues),
            });
            onSuccess(newCustomer);
        } catch (err: any) {
            console.error('AddCustomerModal Error:', err);
            if (err.response) {
                console.error('AddCustomerModal Error Data:', err.response.data);
                console.error('AddCustomerModal Error Status:', err.response.status);
            }
            const errorMsg = err.response?.data?.message || err.message || 'Failed to add customer';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="bg-sidebar border border-sidebar-border rounded-[32px] shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pos-accent/20">👤</div>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Register Customer</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-card-border transition-all text-muted hover:text-foreground">
                        ✕
                    </button>
                </div>

                {error && <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Customer Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="03XXXXXXXXX"
                            className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Address</label>
                        <textarea
                            name="address"
                            rows={2}
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold custom-scrollbar"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[2px] mb-2">Previous/Opening Dues (Rs)</label>
                        <input
                            type="number"
                            name="totalDues"
                            min="0"
                            step="0.01"
                            value={formData.totalDues}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-foreground font-bold"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-card-border mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-card-border rounded-xl text-foreground hover:bg-card-border transition-colors font-black text-[11px] uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 bg-pos-accent text-white rounded-xl transition-all font-black text-[11px] uppercase tracking-wider shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600 shadow-pos-accent/20 hover:shadow-pos-accent/40 hover:-translate-y-0.5'}`}
                        >
                            {loading ? 'Registering...' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
