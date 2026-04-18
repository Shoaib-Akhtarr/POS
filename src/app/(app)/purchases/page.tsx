'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddPurchaseModal from '@/components/AddPurchaseModal';
import PurchaseDetailsModal from '@/components/PurchaseDetailsModal';
import { getPurchases } from '@/services/purchaseService';
import { Purchase } from '@/types';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function PurchasesPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchPurchases = async (currentPage: number) => {
        try {
            setLoading(true);
            const data = await getPurchases(currentPage, limit);
            setPurchases(data.purchases);
            setTotal(data.total);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching purchases:', err);
            setError(err.message || t('errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases(page);
    }, [page, refreshTrigger]);

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
                        <div className="w-14 h-14 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-pos-accent/20">🛒</div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">{t('purchases')}</h1>
                            <p className="text-[11px] font-bold text-black uppercase tracking-widest mt-1">{t('reviewInventoryLogs')}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex-1 lg:flex-none px-6 py-3 bg-pos-accent text-white rounded-xl transition-all font-black text-[11px] uppercase tracking-wider shadow-sm hover:bg-blue-600 hover:-translate-y-0.5 shadow-pos-accent/20 flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">➕</span>
                            {t('logNewPurchase')}
                        </button>
                    </div>
                </header>

                <div className="bg-card rounded-[32px] shadow-sm overflow-hidden border border-card-border flex-1 flex flex-col">
                    <div className="overflow-x-auto p-6 flex-1">
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-16 space-y-4 h-full">
                                <div className="w-8 h-8 border-4 border-pos-accent border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black">{t('processing')}</p>
                            </div>
                        ) : error ? (
                            <div className="p-16 text-center text-danger h-full flex flex-col justify-center">
                                <span className="text-4xl mb-4 opacity-50 block">⚠️</span>
                                <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        ) : purchases.length === 0 ? (
                            <div className="h-full text-center text-black flex flex-col items-center justify-center border-2 border-dashed border-card-border rounded-2xl mx-6 mb-6 py-20">
                                <span className="text-5xl mb-4 opacity-20">📦</span>
                                <p className="text-sm font-black uppercase tracking-widest text-foreground">{t('noProductsFound')}</p>
                                <p className="text-[11px] font-bold text-black mt-2 max-w-xs">{t('selectProductsStart')}</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-card-border overflow-hidden custom-scrollbar">
                                <table className="min-w-full divide-y divide-card-border">
                                    <thead className="bg-sidebar">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-black uppercase tracking-widest">{t('dateTime')}</th>
                                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-black uppercase tracking-widest">{t('supplier')}</th>
                                            <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-black uppercase tracking-widest">{t('productExtracted')}</th>
                                            <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-black uppercase tracking-widest">{t('unitCost')}</th>
                                            <th scope="col" className="px-6 py-4 text-center text-[10px] font-black text-black uppercase tracking-widest">{t('qtyAdded')}</th>
                                            <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-black uppercase tracking-widest">{t('totalInvoice')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-card-border">
                                        {purchases.map((purchase) => (
                                            <tr
                                                key={purchase._id}
                                                onClick={() => setSelectedPurchase(purchase)}
                                                className="hover:bg-pos-accent/5 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-foreground">
                                                    {formatDate(purchase.purchaseDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-sidebar border border-card-border flex items-center justify-center text-[10px]">🏢</span>
                                                        {purchase.supplierName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-foreground">
                                                    <div className="group-hover:text-pos-accent transition-colors">{purchase.productName}</div>
                                                    <span className="text-[9px] text-black uppercase tracking-widest block mt-1">ID: {purchase._id.substring(18)}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-black">
                                                    Rs. {purchase.costPrice.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-success/10 text-success border border-success/20">
                                                        +{purchase.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-foreground">
                                                    Rs. {purchase.totalCost.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-sidebar border-t border-card-border flex items-center justify-between mt-auto">
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
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddPurchaseModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            )}

            {selectedPurchase && (
                <PurchaseDetailsModal
                    purchase={selectedPurchase}
                    onClose={() => setSelectedPurchase(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

