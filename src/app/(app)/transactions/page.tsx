'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sale } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getSales } from '@/services/salesService';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import DateRangeFilter from '@/components/DateRangeFilter';

export default function AllTransactionsPage() {
    const { t } = useLanguage();
    const [sales, setSales] = useState<Sale[]>([]);
    const [total, setTotal] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [exportLoading, setExportLoading] = useState(false);
    const router = useRouter();

    const fetchSales = async (currentPage: number) => {
        try {
            setLoading(true);
            const data = await getSales(currentPage, limit, startDate, endDate);
            setSales(data.sales);
            setTotal(data.total);
        } catch (err: any) {
            console.error('Error fetching sales:', err);
            setError(err.message || t('errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales(page);
    }, [page, startDate, endDate]);

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const handleExportCSV = async () => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert(t('errorOccurred'));
            return;
        }

        try {
            setExportLoading(true);
            // Fetch filtered transactions (using a large limit to get all within range)
            const data = await getSales(1, 5000, startDate, endDate);
            const allSales = data.sales;

            if (allSales.length === 0) {
                alert(t('noProductsFound'));
                return;
            }

            // Create CSV content
            const headers = ["Date", "Time", "Receipt ID", "Customer", "Items", "Total Amount", "Amount Paid", "Balance Due", "Payment Method"];
            const csvRows = [headers.join(",")];

            allSales.forEach(sale => {
                const date = new Date(sale.createdAt || "");
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString().replace(/,/g, '');
                const items = sale.cartItems.map(item => `${item.name}(${item.quantity})`).join("; ");

                const row = [
                    dateStr,
                    timeStr,
                    sale.receiptId,
                    `"${sale.customerName || t('walkInCustomer')}"`,
                    `"${items.replace(/"/g, '""')}"`,
                    sale.totalAmount,
                    sale.amountPaid,
                    sale.balanceDue || 0,
                    sale.paymentMethod
                ];
                csvRows.push(row.join(","));
            });

            const csvContent = "\uFEFF" + csvRows.join("\n"); // Add BOM for Excel UTF-8 support
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Transactions_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            console.error('CSV Export Error:', err);
            alert(t('errorOccurred'));
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrintAll = async () => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert(t('errorOccurred'));
            return;
        }

        try {
            setExportLoading(true);
            const data = await getSales(1, 5000, startDate, endDate);
            const allSales = data.sales;

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert("Please allow popups to print.");
                return;
            }

            const html = `
                <html>
                <head>
                    <title>All Transactions - Karobar Sahulat</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
                        th { background-color: #f8f9fa; font-weight: bold; }
                        h1 { text-align: center; margin-bottom: 5px; }
                        p.subtitle { text-align: center; color: #666; margin-bottom: 30px; }
                        .summary { margin-bottom: 20px; font-size: 14px; display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        @media print {
                            button { display: none; }
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Karobar Sahulat - POS</h1>
                    <p class="subtitle">All Transactions Record Report</p>
                    
                    <div class="summary">
                        <span><strong>Total Records:</strong> ${allSales.length}</span>
                        <span><strong>Generated:</strong> ${new Date().toLocaleString()}</span>
                    </div>
 
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date & Time</th>
                                <th>Receipt ID</th>
                                <th>Customer</th>
                                <th>Method</th>
                                <th style="text-align: right;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allSales.map((s, idx) => `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td>${new Date(s.createdAt!).toLocaleString()}</td>
                                    <td style="font-family: monospace;">${s.receiptId}</td>
                                    <td>${s.customerName || 'Walk-in Customer'}</td>
                                    <td>${s.paymentMethod}</td>
                                    <td style="text-align: right;"><strong>Rs. ${s.totalAmount.toLocaleString()}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="5" style="text-align: right;">Grand Total:</th>
                                <th style="text-align: right;">Rs. ${allSales.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}</th>
                            </tr>
                        </tfoot>
                    </table>
                </body>
                </html>
            `;

            printWindow.document.write(html);
            printWindow.document.close();

            // Wait for content to load then print
            printWindow.onload = () => {
                printWindow.print();
            };

            // Fallback if onload doesn't trigger
            setTimeout(() => {
                printWindow.print();
            }, 1000);

        } catch (err: any) {
            console.error('Print Error:', err);
            alert(t('errorOccurred'));
        } finally {
            setExportLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

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

    return (
        <AuthenticatedLayout>
            <div className="h-full bg-background p-4 sm:p-8 flex flex-col overflow-hidden">
                <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-pos-accent/20">🧾</div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">{t('allTransactions')}</h1>
                            <p className="text-[11px] font-bold text-black uppercase tracking-widest mt-1">{t('reviewSaleRecords')}</p>
                        </div>
                    </div>
                    
                    <DateRangeFilter 
                        onRangeChange={(start, end) => {
                            setStartDate(start);
                            setEndDate(end);
                            setPage(1);
                        }}
                        onExportCSV={handleExportCSV}
                        onExportPDF={handlePrintAll}
                        initialStartDate={startDate}
                        initialEndDate={endDate}
                        className="w-full lg:w-auto"
                    />
                </header>

                <div className="bg-card flex-1 min-h-[0] rounded-[32px] shadow-sm overflow-hidden border border-card-border flex flex-col">
                    <div className="overflow-auto flex-1 p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-16 space-y-4">
                                <div className="w-8 h-8 border-4 border-pos-accent border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black">{t('processing')}</p>
                            </div>
                        ) : error ? (
                            <div className="p-16 text-center text-danger">
                                <span className="text-4xl mb-4 opacity-50 block">⚠️</span>
                                <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        ) : sales.length === 0 ? (
                            <div className="p-16 text-center text-black flex flex-col items-center border-2 border-dashed border-card-border rounded-2xl mx-6 mb-6">
                                <span className="text-4xl mb-3 opacity-20">📭</span>
                                <p className="text-[11px] font-black uppercase tracking-widest">{t('noProductsFound')}</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-card-border overflow-hidden">
                                <table className="min-w-full divide-y divide-card-border">
                                    <thead className="bg-sidebar">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-black uppercase tracking-widest">{t('dateTime')}</th>
                                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-black uppercase tracking-widest">{t('receiptId')}</th>
                                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-black uppercase tracking-widest">{t('customerLabel')}</th>
                                            <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-black uppercase tracking-widest">{t('totalAmount')}</th>
                                            <th scope="col" className="px-6 py-4 text-center text-[10px] font-black text-black uppercase tracking-widest">{t('paymentMethod')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-card-border">
                                        {sales.map((sale) => (
                                            <tr
                                                key={sale._id}
                                                onClick={() => setSelectedSale(sale)}
                                                className="hover:bg-pos-accent/5 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-foreground">
                                                    {formatDate(sale.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-black">
                                                    {sale.receiptId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-foreground">
                                                    <div className="group-hover:text-pos-accent transition-colors">{sale.customerName || t('walkInCustomer')}</div>
                                                    {sale.paymentMethod === 'Credit' && (
                                                        <span className="text-[10px] text-danger font-black uppercase tracking-widest mt-1 block">{t('khata')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-foreground">
                                                    Rs. {sale.totalAmount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sale.paymentMethod === 'Cash' ? 'bg-success/10 text-success border border-success/20' : 'bg-[#4D90FE]/10 text-[#4D90FE] border border-[#4D90FE]/20'}`}>
                                                        {sale.paymentMethod === 'Cash' ? t('cash') : t('khata')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-sidebar border-t border-card-border flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-card-border text-[10px] font-black uppercase tracking-widest rounded-lg text-foreground bg-card hover:bg-card-border disabled:opacity-50"
                                >
                                    PREV
                                </button>
                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-card-border text-[10px] font-black uppercase tracking-widest rounded-lg text-foreground bg-card hover:bg-card-border disabled:opacity-50"
                                >
                                    NEXT
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black">
                                        {t('showingXtoY', {
                                            start: ((page - 1) * limit) + 1,
                                            end: Math.min(page * limit, total),
                                            total: total
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm overflow-hidden border border-card-border" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-2 py-2 bg-card text-black hover:bg-card-border disabled:opacity-50 disabled:bg-card"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 text-[10px] font-black border-l border-card-border ${page === i + 1
                                                    ? 'z-10 bg-pos-accent text-white'
                                                    : 'bg-card text-foreground hover:bg-card-border'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 border-l border-card-border bg-card text-black hover:bg-card-border disabled:opacity-50 disabled:bg-card"
                                        >
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedSale && (
                <TransactionDetailsModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

