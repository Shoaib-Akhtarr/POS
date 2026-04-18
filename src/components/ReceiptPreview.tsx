'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CartItem } from '@/types';
import {
  generateReceiptContent,
  printViaBluetooth,
  printViaUSB,
  discoverBluetoothPrinters,
  isWebBluetoothSupported
} from '@/utils/printerUtils';

interface ReceiptPreviewProps {
  cart: CartItem[];
  customerName: string;
  paymentMethod: 'Cash' | 'Credit';
  total: number;
  discount?: number;
  previousDues?: number;
  amountPaid?: number;
  balanceDue?: number;
  onClose: () => void;
  onPrint: () => void;
  isCompleted?: boolean;
}

export default function ReceiptPreview({
  cart,
  customerName,
  paymentMethod,
  total,
  discount = 0,
  previousDues = 0,
  amountPaid = 0,
  balanceDue = 0,
  onClose,
  onPrint,
  isCompleted = false
}: ReceiptPreviewProps) {
  const { t } = useLanguage();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [printerType, setPrinterType] = useState<'bluetooth' | 'usb' | null>('usb');
  const [bluetoothDevice, setBluetoothDevice] = useState<any | null>(null);

  const receiptId = `RCP-${Date.now()}`;
  const receiptDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Check if Web Bluetooth is supported on component mount
  useEffect(() => {
    if (isWebBluetoothSupported()) {
      setPrinterStatus('idle');
    } else {
      setPrinterStatus('error');
    }
  }, []);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Generate the receipt content in ESC/POS format
      const receiptContent = generateReceiptContent(
        'KAROBAR SAHULAT',
        receiptId,
        receiptDate,
        customerName || null,
        paymentMethod,
        cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.sellingPrice || item.product.price || 0,
          total: (item.product.sellingPrice || item.product.price || 0) * item.quantity
        })),
        total,
        discount,
        previousDues,
        amountPaid,
        balanceDue,
        {
          receiptLabel: t('receiptLabel'),
          dateLabel: t('dateLabel'),
          customerLabel: t('customerLabel'),
          paymentLabel: t('paymentLabel'),
          itemLabel: t('itemLabel'),
          amountLabel: t('amountLabel'),
          discountLabel: t('discountLabel'),
          currentBill: t('currentBill'),
          previousDues: t('previousDues'),
          totalOutstanding: t('totalOutstanding'),
          amountPaid: t('amountPaid'),
          balanceDue: t('balanceDue'),
          balanceClear: t('balanceClear'),
          thankYouPurchase: t('thankYouPurchase'),
          madeBy: t('madeBy')
        }
      );

      // Removed the blocking alert to allow automatic fallback to system print

      let printSuccess = false;

      if (printerType === 'bluetooth' && bluetoothDevice) {
        printSuccess = await printViaBluetooth(receiptContent, bluetoothDevice);
      } else if (printerType === 'usb') {
        printSuccess = await printViaUSB(receiptContent);
      }

      if (printSuccess) {
        console.log('Receipt printed successfully');
        onPrint();
      } else {
        console.error('Failed to print receipt');
        // Still complete the sale even if printing fails
        alert('Failed to print receipt, but sale was completed successfully.');
        onPrint();
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('An error occurred while printing the receipt. Sale was completed successfully.');
      // Still call onPrint to complete the sale
      onPrint();
    } finally {
      setIsPrinting(false);
    }
  };

  const handleConnectBluetooth = async () => {
    if (!isWebBluetoothSupported()) {
      setPrinterStatus('error');
      alert('Web Bluetooth is not supported in your browser. Please use Chrome, Edge, or Opera on a secure connection (HTTPS).');
      return;
    }

    setPrinterStatus('connecting');
    try {
      const devices = await discoverBluetoothPrinters();
      if (devices.length > 0) {
        setBluetoothDevice(devices[0]);
        setPrinterType('bluetooth');
        setPrinterStatus('connected');
        alert(`Connected to Bluetooth printer: ${devices[0].name || 'Unknown'}`);
      } else {
        setPrinterStatus('error');
        alert('No Bluetooth printers found. Make sure your printer is turned on and in pairing mode.');
      }
    } catch (error) {
      console.error('Error connecting to Bluetooth printer:', error);
      setPrinterStatus('error');
      alert('Failed to connect to Bluetooth printer. Make sure your printer is turned on and in pairing mode.');
    }
  };

  const handleSelectUSB = () => {
    setPrinterType('usb');
    setPrinterStatus('connected');
    alert('USB printer selected. Make sure your printer is connected via USB.');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-0 sm:p-4 z-[9999] overflow-hidden">
      <div className="bg-white sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-black">{t('receiptPreview')}</h2>
            <p className="text-xs text-black">{t('reviewPrintReceipt')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-black hover:text-black transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          {/* Printer Connection Status */}
          <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-black">{t('printerStatus')}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${printerStatus === 'connected' || printerType === 'usb' ? 'bg-emerald-100 text-emerald-700' :
                printerStatus === 'connecting' ? 'bg-amber-100 text-amber-700' :
                  printerStatus === 'error' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-black'
                }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${printerStatus === 'connected' || printerType === 'usb' ? 'bg-emerald-500' :
                  printerStatus === 'connecting' ? 'bg-amber-500' :
                    printerStatus === 'error' ? 'bg-rose-500' :
                      'bg-slate-500'
                  }`}></span>
                {t(`${printerStatus}Status` as any)}
                {printerType && ` (${printerType.toUpperCase()})`}
              </span>
            </div>

            {printerStatus !== 'connected' && (
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button
                  onClick={handleConnectBluetooth}
                  disabled={printerStatus === 'connecting' || !isWebBluetoothSupported()}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${(printerStatus === 'connecting' || !isWebBluetoothSupported())
                    ? 'bg-gray-100 text-black cursor-not-allowed'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                    }`}
                >
                  {isWebBluetoothSupported() ? t('connectBluetooth') : t('btNotSupported')}
                </button>
                <button
                  onClick={handleSelectUSB}
                  className="flex-1 py-2.5 px-4 text-sm font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all"
                >
                  {t('connectUSB')}
                </button>
              </div>
            )}

            {printerStatus === 'connected' && (
              <div className="mt-2 text-xs text-black flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {printerType === 'bluetooth' && bluetoothDevice
                  ? `Active: ${bluetoothDevice.name || 'Unknown Device'}`
                  : 'Active: USB Printer'}
              </div>
            )}
          </div>

          {/* Receipt Preview Paper */}
          <div className="bg-white border border-gray-200 shadow-sm p-6 mb-4 font-mono text-sm mx-auto max-w-[320px] relative overflow-hidden">
            {/* Paper texture/effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>

            <div className="text-center mb-6">
              <h3 className="font-bold text-xl tracking-tight text-black mb-1">KAROBAR SAHULAT</h3>
              <p className="text-black">Shop #123, Main Market</p>
              <p className="text-black">Phone: 0300-1234567</p>
            </div>

            <div className="space-y-1 mb-6 py-4 border-y border-dashed border-gray-300">
              <div className="flex justify-between"><span className="text-black">{t('receiptLabel')}:</span> <span className="font-bold">{receiptId}</span></div>
              <div className="flex justify-between"><span className="text-black">{t('dateLabel')}:</span> <span>{receiptDate}</span></div>
              {customerName && <div className="flex justify-between"><span className="text-black">{t('customerLabel')}:</span> <span className="font-bold">{customerName}</span></div>}
              <div className="flex justify-between"><span className="text-black">{t('paymentLabel')}:</span> <span className="font-bold">{paymentMethod}</span></div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between font-bold border-b border-gray-100 pb-1 text-xs uppercase tracking-wider text-black">
                <span>{t('itemLabel')}</span>
                <span>{t('amountLabel')}</span>
              </div>
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <span className="flex-1 truncate">
                    {item.product.name} <span className="text-black">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    Rs. {((item.product.sellingPrice || item.product.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{t('discountLabel')}</span>
                  <span>-Rs. {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-black">
                <span>{t('currentBill')}</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              {customerName && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-1">
                  <div className="flex justify-between text-black">
                    <span>{t('previousDues')}</span>
                    <span className={previousDues < 0 ? 'text-rose-500' : ''}>Rs. {previousDues.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-black pt-1">
                    <span>{t('totalOutstanding')}</span>
                    <span className={(total + previousDues) < 0 ? 'text-rose-600' : ''}>Rs. {(total + previousDues).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 pt-1">
                    <span>{t('amountPaid')}</span>
                    <span>Rs. {amountPaid.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between font-extrabold border-t border-double border-gray-300 pt-2 mt-2 ${balanceDue < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    <span>{balanceDue < 0 ? t('balanceDue') : t('balanceClear')}</span>
                    <span>Rs. {balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-8 pt-6 border-t border-dashed border-gray-300">
              <p className="font-bold text-black mb-1 italic">{t('thankYouPurchase')}</p>
              <p className="text-[10px] text-black font-medium tracking-widest uppercase">{t('madeBy')} Shawaiz & Shoaib</p>
            </div>

            {/* Bottom serrated edge effect (visual only) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 flex">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-1 h-full bg-gray-50 rotate-45 transform translate-y-1/2"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="py-3 px-4 bg-gray-50 text-black font-semibold rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
          >
            {isCompleted ? t('close') : t('cancelSale')}
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${isPrinting
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
              }`}
          >
            {isPrinting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('printing')}
              </span>
            ) : t('printReceipt')}
          </button>
        </div>
      </div>
    </div>
  );
}

