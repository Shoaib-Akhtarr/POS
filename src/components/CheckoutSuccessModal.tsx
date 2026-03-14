'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/types';

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  selectedCustomer: Customer | null;
}

export default function CheckoutSuccessModal({
  isOpen,
  onClose,
  customerName,
  selectedCustomer
}: CheckoutSuccessModalProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-card w-full max-w-md rounded-[32px] border border-card-border shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground mb-2">
            Transaction Complete!
          </h2>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-8">
            Receipt generated for <span className="text-pos-accent">{customerName}</span>
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                router.push('/customers');
                onClose();
              }}
              className="w-full py-4 bg-pos-accent text-white rounded-2xl font-black uppercase text-[11px] tracking-[2px] shadow-lg shadow-pos-accent/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="text-lg">👥</span>
              Customer Record Book
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-4 bg-card border border-card-border text-foreground rounded-2xl font-black uppercase text-[11px] tracking-[2px] hover:bg-muted/10 transition-all active:scale-95"
            >
              New Sale (POS)
            </button>
          </div>
        </div>
        
        <div className="bg-sidebar p-4 text-center border-t border-card-border">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[3px]">
            Press ESC or click anywhere to dismiss
          </p>
        </div>
      </div>
    </div>
  );
}
