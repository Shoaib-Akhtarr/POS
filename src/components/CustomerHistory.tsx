'use client';

import { useState, useEffect } from 'react';
import { Sale, Customer } from '@/types';
import { getSalesByCustomer } from '@/services/salesService';
import { searchCustomers } from '@/services/customerService';
import ReceivePaymentModal from './ReceivePaymentModal';

interface CustomerHistoryProps {
  customerName: string;
  onClose: () => void;
  onEditSale?: (sale: Sale) => void;
  onRowClick?: (sale: Sale) => void;
}

export default function CustomerHistory({
  customerName,
  onClose,
  onEditSale,
  onRowClick
}: CustomerHistoryProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customerInfo, setCustomerInfo] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch logic grouped
  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // 1. Fetch exact customer profile to get their ID and current dues
      const fetchedCustomers = await searchCustomers(customerName);
      const exactCustomer = fetchedCustomers.find(c => c.name === customerName);
      setCustomerInfo(exactCustomer || null);

      // 2. Fetch all sales history
      const customerSales = await getSalesByCustomer(customerName);
      const sortedSales = customerSales.sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      setSales(sortedSales);
      setError(null);
    } catch (err) {
      console.error('Error fetching customer sales:', err);
      setError('Failed to load customer history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerName) {
      fetchCustomerData();
    }
  }, [customerName]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const handlePaymentSuccess = (updatedCustomer: Customer) => {
    // 1. Update the local customer info for the UI component
    setCustomerInfo(updatedCustomer);
    // 2. Clear the modal
    setShowPaymentModal(false);
    // 3. Re-fetch the history so the new "payment sale" appears in the timeline
    fetchCustomerData();
    // 4. Show success message
    alert('Payment recorded successfully!');
  };

  return (
    <div className="fixed inset-0 bg-[#07080d]/80 backdrop-blur-sm z-[200] animate-in fade-in duration-300">
      <div className="bg-background w-full h-full flex flex-col relative overflow-hidden">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-card-border bg-card shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pos-accent to-blue-700 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 border border-white/10">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase text-foreground leading-none">{customerName}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${customerInfo && customerInfo.totalDues > 0 ? 'bg-danger/20 text-danger border border-danger/20' : 'bg-success/20 text-success border border-success/20'}`}>
                    {customerInfo && customerInfo.totalDues > 0 ? 'Due' : 'Clear'}
                  </span>
                </div>
                {customerInfo && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-black uppercase tracking-widest leading-none bg-card px-2 py-1 rounded-md border border-card-border">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-pos-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {customerInfo.phone || 'No Phone'}
                    </span>
                    {customerInfo.address && (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-black uppercase tracking-widest leading-none bg-card px-2 py-1 rounded-md border border-card-border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-pos-accent" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {customerInfo.address}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-card border border-card-border text-black hover:text-foreground transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Summary Hero Section */}
          <div className="mb-6">
            <div className="bg-card border border-card-border p-6 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black mb-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${customerInfo && customerInfo.totalDues < 0 ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></span>
                    Outstanding Balance
                  </p>
                  <h3 className={`text-4xl font-black italic tracking-tighter ${customerInfo && customerInfo.totalDues < 0 ? 'text-danger' : 'text-success'}`}>
                    Rs. {customerInfo ? customerInfo.totalDues.toLocaleString() : '0'}
                  </h3>
                </div>

                {customerInfo && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-3 bg-success text-white rounded-xl transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-green-600 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2 border border-white/5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Receive Payment
                  </button>
                )}
              </div>
              <div className={`absolute -right-16 -bottom-16 w-48 h-48 blur-[60px] opacity-10 ${customerInfo && customerInfo.totalDues > 0 ? 'bg-danger' : 'bg-success'}`}></div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 space-y-4">
              <div className="w-10 h-10 border-4 border-pos-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black">Syncing Database...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-card-border rounded-2xl opacity-70">
              <div className="text-3xl mb-4">📭</div>
              <h4 className="text-lg font-black text-foreground italic uppercase tracking-tighter">No Activity</h4>
            </div>
          ) : (
            <div className="rounded-2xl border border-card-border overflow-hidden bg-card">
              <div className="px-6 py-3.5 border-b border-card-border flex justify-between items-center bg-muted/5">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-black italic">Transaction Archives</h4>
                <div className="text-[9px] font-black uppercase text-black tracking-widest bg-background px-2 py-0.5 rounded-md border border-card-border">{sales.length} ENTRIES</div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-card-border">
                  <thead className="bg-muted/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-[8px] font-black text-black uppercase tracking-[0.2em] hidden sm:table-cell">Ref ID</th>
                      <th className="px-6 py-3 text-left text-[8px] font-black text-black uppercase tracking-[0.2em]">Date</th>
                      <th className="px-6 py-3 text-left text-[8px] font-black text-black uppercase tracking-[0.2em]">Activity</th>
                      <th className="px-6 py-3 text-right text-[8px] font-black text-black uppercase tracking-[0.2em] hidden md:table-cell">Debit</th>
                      <th className="px-6 py-3 text-right text-[8px] font-black text-black uppercase tracking-[0.2em] hidden md:table-cell">Credit</th>
                      <th className="px-6 py-3 text-right text-[8px] font-black text-black uppercase tracking-[0.2em]">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {sales.map((sale) => {
                      const isPaymentOnly = sale.totalAmount === 0 && sale.cartItems.length === 0 && (sale.amountPaid || 0) > 0;

                      return (
                        <tr
                          key={sale._id}
                          onClick={() => onRowClick && onRowClick(sale)}
                          className={`group transition-all cursor-pointer ${isPaymentOnly ? "bg-success/[0.02] hover:bg-success/[0.05]" : "hover:bg-pos-accent/[0.03]"}`}
                        >
                          <td className="px-6 py-3.5 whitespace-nowrap font-mono text-[9px] font-bold text-black/50 group-hover:text-foreground transition-colors hidden sm:table-cell">
                            #{sale.receiptId?.slice(-6).toUpperCase() || sale._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-[10px] font-bold text-foreground/70">
                            {formatDate(sale.createdAt)}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${isPaymentOnly ? "bg-success/10 text-success border-success/10" : "bg-pos-accent/10 text-pos-accent border-pos-accent/10"}`}>
                                {isPaymentOnly ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-tight ${isPaymentOnly ? "text-success" : "text-foreground/90"}`}>
                                  {isPaymentOnly ? "Payment" : "Sale"}
                                </span>
                                <span className="text-[8px] font-bold text-black truncate max-w-[100px] sm:max-w-[150px] uppercase">
                                  {isPaymentOnly ? `via ${sale.paymentMethod}` : sale.cartItems.map(i => i.name).join(', ')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-right text-[11px] font-black text-foreground/80 hidden md:table-cell">
                            {isPaymentOnly ? <span className="text-black/20">---</span> : `Rs. ${sale.totalAmount?.toLocaleString()}`}
                          </td>
                          <td className={`px-6 py-3.5 whitespace-nowrap text-right text-[11px] font-black ${isPaymentOnly ? "text-success" : "text-black"} hidden md:table-cell`}>
                            {(sale.amountPaid || 0) > 0 ? `Rs. ${(sale.amountPaid || 0).toLocaleString()}` : <span className="text-black/20">---</span>}
                          </td>
                          <td className={`px-6 py-3.5 whitespace-nowrap text-right text-[12px] font-black ${(sale.balanceDue || 0) < 0 ? "text-danger" : "text-success"}`}>
                            Rs. {(sale.balanceDue || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-muted/5 border-t border-card-border flex justify-between items-center">
                <span className="text-[8px] font-black uppercase tracking-[0.2rem] text-black italic">System Log End</span>
                <div className="text-right">
                  <p className="text-[7px] font-black text-black uppercase tracking-widest leading-none mb-1">Total Outstanding</p>
                  <p className={`text-xl font-black italic tracking-tighter ${customerInfo && customerInfo.totalDues < 0 ? 'text-danger' : 'text-success'}`}>
                    Rs. {customerInfo ? customerInfo.totalDues.toLocaleString() : '0'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && customerInfo && (
        <ReceivePaymentModal
          customer={customerInfo}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
