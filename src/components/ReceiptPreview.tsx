'use client';

import { useState, useEffect } from 'react';
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
  onPrint
}: ReceiptPreviewProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [printerType, setPrinterType] = useState<'bluetooth' | 'usb' | null>(null);
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
        balanceDue
      );

      // If no printer type is selected, show a message and complete the sale without printing
      if (!printerType) {
        alert('No printer selected. Sale will be completed without printing receipt.');
        onPrint();
        return;
      }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Receipt Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Printer Connection Status */}
          <div className="mb-4 p-3 rounded-md border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Printer Connection:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${printerStatus === 'connected' ? 'bg-green-100 text-green-800' :
                printerStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                  printerStatus === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {printerStatus.charAt(0).toUpperCase() + printerStatus.slice(1)}
                {printerType && ` - ${printerType.toUpperCase()}`}
              </span>
            </div>

            {printerStatus !== 'connected' && (
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleConnectBluetooth}
                  disabled={printerStatus === 'connecting' || !isWebBluetoothSupported()}
                  className={`flex-1 py-1 px-2 text-xs rounded ${(printerStatus === 'connecting' || !isWebBluetoothSupported())
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                >
                  {isWebBluetoothSupported() ? 'Connect Bluetooth' : 'Bluetooth Not Supported'}
                </button>
                <button
                  onClick={handleSelectUSB}
                  className="flex-1 py-1 px-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Select USB
                </button>
              </div>
            )}

            {printerStatus === 'connected' && (
              <div className="mt-2 text-xs text-gray-600">
                {printerType === 'bluetooth' && bluetoothDevice
                  ? `Connected to: ${bluetoothDevice.name || 'Unknown Device'}`
                  : 'USB printer selected'}
              </div>
            )}
          </div>

          {/* Receipt Content */}
          <div className="border border-gray-300 p-4 mb-4 font-mono text-sm">
            <div className="text-center mb-2">
              <h3 className="font-bold text-lg">KAROBAR SAHULAT</h3>
              <p>Shop #123, Main Market</p>
              <p>Phone: 0300-1234567</p>
            </div>

            <div className="border-t border-b border-gray-300 py-2 my-2">
              <p>Receipt #: {receiptId}</p>
              <p>Date: {receiptDate}</p>
              {customerName && <p>Customer: {customerName}</p>}
              <p>Payment: {paymentMethod}</p>
            </div>

            <div className="my-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.product.name} ({item.quantity}x)
                  </span>
                  <span>
                    Rs. {((item.product.sellingPrice || item.product.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-2 mt-2">
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold mb-1">
                  <span>Discount:</span>
                  <span>-Rs. {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Current Bill:</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>

              {customerName && (
                <>
                  <div className="flex justify-between text-gray-600 mt-1">
                    <span>Previous Dues:</span>
                    <span>Rs. {previousDues.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1 border-t border-dashed border-gray-300 pt-1">
                    <span>Total with Dues:</span>
                    <span>Rs. {(total + previousDues).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mt-1">
                    <span>Paid Now:</span>
                    <span>Rs. {amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1 border-t border-dashed border-gray-300 pt-1">
                    <span>Remaining Balance:</span>
                    <span>Rs. {balanceDue.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center mt-4 pt-2 border-t border-gray-300">
              <p>Thank you for your Purchase!</p>
              <p className="text-xs mt-2 font-bold italic">Made by Shawaiz & Shoaib</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`flex-1 py-2 px-4 rounded-md text-white ${isPrinting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isPrinting ? 'Printing...' : 'Print Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}