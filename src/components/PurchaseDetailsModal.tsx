'use client';

import React from 'react';
import { Purchase } from '@/types';

interface PurchaseDetailsModalProps {
    purchase: Purchase;
    onClose: () => void;
}

const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({ purchase, onClose }) => {
    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="bg-sidebar border border-sidebar-border rounded-[32px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-sidebar-border shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-pos-accent/20">🛒</div>
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground mb-1">Purchase Details</h2>
                                <p className="text-[10px] font-bold text-black uppercase tracking-widest">Receipt ID: {purchase._id.substring(18)}</p>
                            </div>
                        </div>

                        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-card-border transition-all text-black hover:text-foreground">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div className="bg-background rounded-2xl p-4 border border-card-border">
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">System ID</p>
                                <p className="text-sm font-mono font-bold text-foreground">{purchase._id}</p>
                            </div>
                            <div className="bg-background rounded-2xl p-4 border border-card-border">
                                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Date & Time</p>
                                <p className="text-sm font-bold text-foreground">{formatDate(purchase.purchaseDate)}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-background rounded-2xl p-4 border border-card-border h-full flex flex-col justify-center">
                                <div>
                                    <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Supplier Name</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-sidebar border border-card-border flex items-center justify-center text-[10px]">🏢</span>
                                        <p className="text-sm font-black text-foreground">{purchase.supplierName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-[11px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pos-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Inventory Extracted
                        </h3>
                        
                        <div className="rounded-2xl border border-card-border overflow-x-auto shadow-sm">
                            <table className="min-w-full divide-y divide-card-border">
                                <thead className="bg-sidebar">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-[10px] font-black text-black uppercase tracking-widest">Product Extracted</th>
                                        <th className="px-5 py-4 text-center text-[10px] font-black text-black uppercase tracking-widest">Qty Added</th>
                                        <th className="px-5 py-4 text-right text-[10px] font-black text-black uppercase tracking-widest">Unit Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-card-border">
                                    <tr className="hover:bg-pos-accent/5 transition-colors">
                                        <td className="px-5 py-4 text-xs font-black text-foreground">{purchase.productName}</td>
                                        <td className="px-5 py-4 text-xs font-bold text-success text-center bg-success/5 border-x border-card-border">+{purchase.quantity} Units</td>
                                        <td className="px-5 py-4 text-xs font-bold text-black text-right">Rs. {purchase.costPrice.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-background p-6 rounded-[24px] border border-card-border flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pos-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="flex justify-between items-center text-sm relative z-10 border-b border-card-border pb-4">
                            <span className="text-[11px] font-black text-black uppercase tracking-widest">Total Invoice Cost:</span>
                            <span className="text-xl font-black text-pos-accent">Rs. {purchase.totalCost.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetailsModal;
