'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { searchCustomers } from '@/services/customerService';
import AddCustomerModal from './AddCustomerModal';

interface CustomerInfoProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  onShowHistory?: () => void;
}

export default function CustomerInfo({ customerName, setCustomerName, selectedCustomer, setSelectedCustomer, onShowHistory }: CustomerInfoProps) {
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  // Debounced search
  useEffect(() => {
    const fetchCustomers = async () => {
      if (customerName.trim() === '') {
        setSuggestions([]);
        return;
      }

      // If we just selected a customer, don't search again
      if (selectedCustomer && selectedCustomer.name === customerName) {
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchCustomers(customerName);
        setSuggestions(results);
      } catch (error) {
        console.error('Failed to search customers:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [customerName, selectedCustomer]);

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setSelectedCustomer(customer);
    setShowSuggestions(false);
  };

  const clearSelection = () => {
    setCustomerName('');
    setSelectedCustomer(null);
  };

  const handleCustomerAdded = (newCustomer: Customer) => {
    setShowAddCustomer(false);
    handleSelectCustomer(newCustomer);
  };

  return (
    <div className="space-y-4">
      {/* Customer Search / Selection */}
      <div className="relative">
        {!selectedCustomer ? (
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black">
              <span className="text-xl">👤</span>
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search customer by name or phone..."
              className="w-full pl-12 pr-4 py-4 bg-card border border-card-border rounded-xl focus:outline-none focus:ring-4 focus:ring-pos-accent/5 focus:border-pos-accent transition-all text-sm font-medium shadow-sm text-foreground"
            />
            {showSuggestions && customerName.trim() !== '' && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-card-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {isSearching ? (
                  <div className="p-4 text-center text-[10px] font-black uppercase text-black tracking-widest">Searching...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto">
                    {suggestions.map((customer) => (
                      <li
                        key={customer._id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="p-4 border-b border-card-border hover:bg-pos-accent/5 cursor-pointer transition-colors group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-black text-sm tracking-tight group-hover:text-pos-accent text-foreground">{customer.name}</p>
                            <p className="text-[10px] font-bold text-black">{customer.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-black">Status</p>
                            <p className={`text-xs font-black ${customer.totalDues < 0 ? 'text-danger' : 'text-success'}`}>
                              {customer.totalDues < 0 ? `Rs. ${Math.abs(customer.totalDues).toLocaleString()} (Due)` : 'Clear'}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-black italic text-xs">
                    No customers found matching "{customerName}"
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Selected Customer Card */
          <div className="bg-pos-accent/5 border border-pos-accent/20 rounded-2xl p-4 flex items-center justify-between group animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-pos-accent rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-pos-accent/20">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight text-foreground">{selectedCustomer.name}</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[10px] font-bold text-black">{selectedCustomer.phone || 'No phone'}</span>
                  <span className="text-[8px] text-black/30">•</span>
                  <span className={`text-[10px] font-black ${selectedCustomer.totalDues < 0 ? 'text-danger' : 'text-success'}`}>
                    {selectedCustomer.totalDues < 0 ? `Due: Rs. ${Math.abs(selectedCustomer.totalDues).toLocaleString()}` : 'Balance Clear'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onShowHistory}
                className="p-2 text-pos-accent hover:bg-pos-accent/10 rounded-lg transition-all"
                title="View History"
              >
                📜
              </button>
              <button
                onClick={clearSelection}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                title="Deselect"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onSuccess={handleCustomerAdded}
          initialName={customerName}
        />
      )}
    </div>
  );
}
