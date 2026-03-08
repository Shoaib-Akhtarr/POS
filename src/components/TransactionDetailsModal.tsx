'use client';

import React from 'react';
import { Sale } from '@/types';

interface TransactionDetailsModalProps {
    sale: Sale;
    onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ sale, onClose }) => {
    const formatDate = (dateString?: string) => {
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

    const isPaymentOnly = sale.totalAmount === 0 && sale.cartItems.length === 0 && (sale.amountPaid || 0) > 0;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="bg-sidebar border border-sidebar-border rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-sidebar-border Shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-pos-accent/20">🧾</div>
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground mb-1">Transaction Details</h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Receipt: {sale.receiptId}</p>
                            </div>
                        </div>

                        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-card-border transition-all text-muted hover:text-foreground">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div className="bg-background rounded-2xl p-4 border border-card-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Receipt ID</p>
                                <p className="text-sm font-mono font-bold text-foreground">{sale.receiptId}</p>
                            </div>
                            <div className="bg-background rounded-2xl p-4 border border-card-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Date & Time</p>
                                <p className="text-sm font-bold text-foreground">{formatDate(sale.createdAt)}</p>
                            </div>
                            <div className="bg-background rounded-2xl p-4 border border-card-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Payment Method</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sale.paymentMethod === 'Cash' ? 'bg-success/10 text-success border border-success/20' : 'bg-pos-accent/10 text-pos-accent border border-pos-accent/20'}`}>
                                    {sale.paymentMethod}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-background rounded-2xl p-4 border border-card-border h-full flex flex-col justify-center">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Customer Name</p>
                                    <p className="text-sm font-black text-foreground">{sale.customerName || 'Walk-in Customer'}</p>
                                </div>
                                {typeof sale.customer === 'object' && sale.customer && (
                                    <div className="mt-4 space-y-3 pt-4 border-t border-card-border">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
                                            <p className="text-xs font-bold text-muted-foreground">{sale.customer.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Address</p>
                                            <p className="text-xs font-bold text-muted-foreground truncate" title={sale.customer.address}>{sale.customer.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pos-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Items Purchased
                        </h3>
                        {isPaymentOnly ? (
                            <div className="bg-success/5 p-6 rounded-2xl border border-success/20 text-success flex flex-col items-center justify-center gap-3 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-black uppercase tracking-wider">Standard Payment Transaction - No Items</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-card-border overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-card-border">
                                    <thead className="bg-sidebar">
                                        <tr>
                                            <th className="px-5 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Item</th>
                                            <th className="px-5 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Qty</th>
                                            <th className="px-5 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Price</th>
                                            <th className="px-5 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-card-border">
                                        {sale.cartItems.map((item, index) => (
                                            <tr key={index} className="hover:bg-pos-accent/5 transition-colors">
                                                <td className="px-5 py-4 text-xs font-black text-foreground">{item.name}</td>
                                                <td className="px-5 py-4 text-xs font-bold text-muted-foreground text-center bg-background/50 border-x border-card-border">{item.quantity}</td>
                                                <td className="px-5 py-4 text-xs font-bold text-muted-foreground text-right">Rs. {item.price.toLocaleString()}</td>
                                                <td className="px-5 py-4 text-xs font-black text-foreground text-right">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-background p-6 rounded-[24px] border border-card-border flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pos-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="flex justify-between items-center text-sm relative z-10">
                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Subtotal:</span>
                            <span className="font-black text-foreground">Rs. {(sale.totalAmount + (sale.discount || 0)).toLocaleString()}</span>
                        </div>
                        {(sale.discount ?? 0) > 0 && (
                            <div className="flex justify-between items-center text-sm relative z-10">
                                <span className="text-[11px] font-black text-pos-accent uppercase tracking-widest">Discount:</span>
                                <span className="font-black text-pos-accent">- Rs. {(sale.discount ?? 0).toLocaleString()}</span>
                            </div>
                        )}
                        {(sale.previousDues ?? 0) > 0 && (
                            <div className="flex justify-between items-center text-sm relative z-10">
                                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Previous Dues:</span>
                                <span className="font-black text-danger">Rs. {(sale.previousDues ?? 0).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-t border-card-border pt-4 mt-2 relative z-10">
                            <span className="text-xs font-black text-foreground uppercase tracking-widest">Total Bill:</span>
                            <span className="text-lg font-black text-foreground">Rs. {(sale.totalAmount + (sale.previousDues || 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-success relative z-10">
                            <span className="text-[11px] font-black uppercase tracking-widest">Amount Paid:</span>
                            <span className="font-black">Rs. {sale.amountPaid?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-card-border pt-4 mt-2 relative z-10">
                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Remaining Balance Due:</span>
                            <span className={`text-xl font-black ${(sale.balanceDue || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                                Rs. {sale.balanceDue?.toLocaleString() || '0'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsModal;
