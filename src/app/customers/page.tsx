'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sale, Customer } from '@/types';
import { getCustomers } from '@/services/customerService';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerHistory from '@/components/CustomerHistory';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import AddCustomerModal from '@/components/AddCustomerModal';

export default function AllCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
    const [viewingSale, setViewingSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'name',
        direction: 'asc'
    });
    const router = useRouter();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const data = await getCustomers();
                setCustomers(data);
                setFilteredCustomers(data);
            } catch (err: any) {
                console.error('Error fetching customers:', err);
                setError(err.message || 'Failed to load customers');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    useEffect(() => {
        let result = [...customers];

        // 1. Filtering
        if (searchTerm.trim() !== '') {
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.phone.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Sorting
        result.sort((a, b) => {
            const aValue = a[sortConfig.key as keyof Customer];
            const bValue = b[sortConfig.key as keyof Customer];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            return 0;
        });

        setFilteredCustomers(result);
    }, [searchTerm, customers, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';

        // If clicking the same key, toggle direction
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (key === 'totalDues' && sortConfig.key !== 'totalDues') {
            // For Total Dues, default to Highest first when first clicked
            direction = 'desc';
        }

        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: string) => {
        if (sortConfig.key !== key) return null;
        return (
            <span className="ml-2 text-pos-accent animate-in fade-in slide-in-from-bottom-1 duration-300">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background p-4 sm:p-8">
                <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-pos-accent rounded-xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-pos-accent/20">👥</div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black italic tracking-tighter uppercase text-foreground">Customers</h1>
                            <p className="text-[9px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Directory & Ledger</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-sidebar border border-sidebar-border text-foreground rounded-xl transition-all font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-sm hover:bg-card-border flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-pos-accent text-white rounded-xl transition-all font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Customer
                        </button>
                    </div>
                </header>

                <div className="bg-card rounded-[32px] shadow-sm overflow-hidden border border-card-border p-6 relative">
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="SEARCH BY NAME OR PHONE..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3 border border-card-border rounded-xl leading-5 bg-background text-foreground font-bold placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent transition-all text-sm uppercase tracking-wider"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-card-border">
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-16 space-y-4 bg-background">
                                <div className="w-8 h-8 border-4 border-pos-accent border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading customers...</p>
                            </div>
                        ) : error ? (
                            <div className="p-16 text-center text-danger bg-background">
                                <span className="text-4xl mb-4 opacity-50 block">⚠️</span>
                                <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="p-16 text-center text-muted-foreground bg-background flex flex-col items-center border-2 border-dashed border-card-border rounded-xl m-4">
                                <span className="text-4xl mb-3 opacity-20">📭</span>
                                <p className="text-[11px] font-black uppercase tracking-widest">
                                    {searchTerm ? 'No customers match your search.' : 'No customers registered yet.'}
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-card-border">
                                <thead className="bg-sidebar">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors group/header"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                Customer Name {getSortIndicator('name')}
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Phone</th>
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden md:table-cell">Address</th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors group/header"
                                            onClick={() => handleSort('totalDues')}
                                        >
                                            <div className="flex items-center justify-end">
                                                Total Dues {getSortIndicator('totalDues')}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-card-border">
                                    {filteredCustomers.map((customer) => (
                                        <tr
                                            key={customer._id}
                                            onClick={() => setSelectedCustomerName(customer.name)}
                                            className="hover:bg-pos-accent/5 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-black text-foreground group-hover:text-pos-accent transition-colors">{customer.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                                                {customer.phone || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-muted-foreground max-w-xs truncate uppercase tracking-widest hidden md:table-cell">
                                                {customer.address || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black">
                                                <span className={customer.totalDues > 0 ? 'text-danger' : 'text-success'}>
                                                    Rs. {customer.totalDues.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="mt-6 flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <span>Total Customers: {filteredCustomers.length}</span>
                    </div>
                </div>

                {selectedCustomerName && (
                    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md p-4 sm:p-10 flex items-center justify-center">
                        <div className="w-full max-w-5xl h-[90vh] sm:h-[80vh] bg-card rounded-[32px] sm:rounded-[40px] border border-card-border overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                            <CustomerHistory
                                customerName={selectedCustomerName}
                                onClose={() => setSelectedCustomerName(null)}
                                onEditSale={(sale) => {
                                    alert('Editing sales from this view is not yet supported. Please use the POS dashboard.');
                                    setSelectedCustomerName(null);
                                }}
                                onRowClick={(sale) => setViewingSale(sale)}
                            />
                        </div>
                    </div>
                )}

                {viewingSale && (
                    <TransactionDetailsModal
                        sale={viewingSale}
                        onClose={() => setViewingSale(null)}
                    />
                )}

                {isAddModalOpen && (
                    <AddCustomerModal
                        onClose={() => setIsAddModalOpen(false)}
                        onSuccess={(newCustomer) => {
                            setCustomers(prev => [...prev, newCustomer]);
                            setIsAddModalOpen(false);
                        }}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
