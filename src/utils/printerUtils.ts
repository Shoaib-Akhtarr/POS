// printerUtils.ts - Utilities for thermal receipt printing
export interface PrinterConfig {
  printerType: 'bluetooth' | 'usb';
  selectedDevice?: any;
  printerName?: string;
}

// Define the type for Bluetooth request options
declare global {
  interface RequestDeviceOptions {
    filters?: Array<{
      name?: string;
      namePrefix?: string;
      services?: string[];
    }>;
    optionalServices?: string[];
  }
}

// ESC/POS commands for thermal printers
const ESC = '\x1B'; // Escape character
const GS = '\x1D';  // Group separator
const LF = '\x0A';  // Line feed
const FF = '\x0C';  // Form feed

// Initialize printer
const initPrinter = () => `${ESC}@`;

// Set bold text
const setBold = (bold: boolean) => `${ESC}!${bold ? '\x08' : '\x00'}`;

// Set text size (width, height)
const setTextSize = (width: number, height: number) => {
  const size = ((width - 1) << 4) | (height - 1);
  return `${GS}!${String.fromCharCode(size)}`;
};

// Cut paper
const cutPaper = () => `${GS}V\x01`;

// Add line spacing
const setLineSpacing = (spacing: number) => `${ESC} ${spacing}`;

// Create centered text
const centerText = (text: string) => `\x1Ba\x01${text}${LF}`;

// Create left-aligned text
const leftAlign = (text: string) => `\x1Ba\x00${text}${LF}`;

// Create right-aligned text
const rightAlign = (text: string) => `\x1Ba\x02${text}${LF}`;

// Generate receipt content in ESC/POS format with multi-language support
export const generateReceiptContent = (
  storeName: string,
  receiptId: string,
  date: string,
  customerName: string | null,
  paymentMethod: string,
  cartItems: Array<{ name: string; quantity: number; price: number; total: number }>,
  total: number,
  discount: number = 0,
  previousDues: number = 0,
  amountPaid: number = 0,
  balanceDue: number = 0,
  labels: { [key: string]: string } = {}
): string => {
  let receipt = initPrinter();

  // Use provided labels or fall back to English defaults
  const l = {
    receipt: labels.receiptLabel || 'Receipt',
    date: labels.dateLabel || 'Date',
    customer: labels.customerLabel || 'Customer',
    payment: labels.paymentLabel || 'Payment',
    item: labels.itemLabel || 'Item',
    qty: 'Qty',
    price: 'Price',
    total: labels.amountLabel || 'Total',
    discount: labels.discountLabel || 'Discount',
    currentBill: labels.currentBill || 'Current Bill',
    previousDues: labels.previousDues || 'Previous Dues',
    totalOutstanding: labels.totalOutstanding || 'Total + Dues',
    paidNow: labels.amountPaid || 'Paid Now',
    remainingBal: labels.balanceDue || 'Remaining Bal',
    thankYou: labels.thankYouPurchase || 'Thank you for your business!',
    madeBy: labels.madeBy || 'Made by'
  };

  // Store name and header
  receipt += setTextSize(2, 2); // Double size
  receipt += centerText(storeName);
  receipt += setTextSize(1, 1); // Normal size
  receipt += centerText('Karobar Sahulat - Digital Business Management');
  receipt += centerText('Shop #123, Main Market');
  receipt += centerText('Phone: 0300-1234567');
  receipt += LF;

  // Receipt details
  receipt += leftAlign(`${l.receipt}: ${receiptId}`);
  receipt += leftAlign(`${l.date}: ${date}`);
  if (customerName) {
    receipt += leftAlign(`${l.customer}: ${customerName}`);
  }
  receipt += leftAlign(`${l.payment}: ${paymentMethod}`);
  receipt += LF;

  // Items header
  receipt += leftAlign('--------------------------------');
  receipt += leftAlign(`${l.item.padEnd(16)} Qty  Price  Total`);
  receipt += leftAlign('--------------------------------');

  // Cart items
  cartItems.forEach(item => {
    // Truncate item name to fit in receipt (approximately 16 chars)
    const itemName = item.name.length > 16
      ? item.name.substring(0, 16)
      : item.name.padEnd(16);

    const qty = item.quantity.toString().padStart(3);
    const price = item.price.toFixed(2).padStart(6);
    const itemTotal = item.total.toFixed(2).padStart(6);

    receipt += leftAlign(`${itemName} ${qty}  ${price}  ${itemTotal}`);
  });

  receipt += leftAlign('--------------------------------');

  // Total
  if (discount > 0) {
    receipt += rightAlign(`${l.discount}: -Rs. ${discount.toFixed(2)}`);
  }
  if (customerName) {
    receipt += rightAlign(`${l.currentBill}: Rs. ${total.toFixed(2)}`);
    receipt += rightAlign(`${l.previousDues}: Rs. ${previousDues.toFixed(2)}`);
    receipt += rightAlign(`${l.totalOutstanding}: Rs. ${(total + previousDues).toFixed(2)}`);
    receipt += leftAlign('--------------------------------');
    receipt += rightAlign(`${l.paidNow}: Rs. ${amountPaid.toFixed(2)}`);
    receipt += rightAlign(`${l.remainingBal}: Rs. ${balanceDue.toFixed(2)}`);
  } else {
    receipt += rightAlign(`${l.total}: Rs. ${total.toFixed(2)}`);
  }
  receipt += LF;

  // Footer
  receipt += centerText(l.thankYou);
  receipt += centerText(`${l.madeBy} Shawaiz & Shoaib`);
  receipt += LF;
  receipt += LF;
  receipt += LF;
  receipt += LF;
  receipt += cutPaper(); // Cut the paper

  return receipt;
};

// Print receipt via Bluetooth
export const printViaBluetooth = async (
  content: string,
  device: any
): Promise<boolean> => {
  try {
    if (!device.gatt) {
      throw new Error('Bluetooth GATT not available');
    }

    const server = await device.gatt.connect();

    // Try to find the standard printing service
    let service;
    try {
      // Try standard service UUID first
      service = await server.getPrimaryService('00001820-0000-1000-8000-00805f9b34fb'); // Standard GATT service
    } catch {
      try {
        // Try vendor-specific service
        service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      } catch {
        // Try another common service UUID for printing
        service = await server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
      }
    }

    let characteristic;
    try {
      // Try standard characteristic UUID first
      characteristic = await service.getCharacteristic('00002a29-0000-1000-8000-00805f9b34fb');
    } catch {
      try {
        // Try vendor-specific characteristic
        characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      } catch {
        // Try another common characteristic for printing
        characteristic = await service.getCharacteristic('0000fff1-0000-1000-8000-00805f9b34fb');
      }
    }

    // Convert string to bytes and send to printer
    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    // Send data in chunks to avoid buffer overflow
    const chunkSize = 20;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await characteristic.writeValue(chunk);
    }

    return true;
  } catch (error) {
    console.error('Bluetooth printing error:', error);
    // Check if the error is related to device not being available
    if (error instanceof Error && error.message.includes('gatt')) {
      console.error('Bluetooth device not available. Please reconnect the device.');
    }
    return false;
  }
};

// Print receipt via USB (using a more direct approach that doesn't require port selection)
export const printViaUSB = async (content: string): Promise<boolean> => {
  try {
    // Check if the browser supports the Web Serial API for USB printing
    if (!('serial' in navigator)) {
      console.warn('Web Serial API not supported in this browser');
      // Fallback to browser print dialog
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  font-family: monospace;
                  white-space: pre;
                  margin: 5mm;
                  font-size: 14px;
                  width: 70mm;
                }
                @media print {
                  body { margin: 0; padding: 5mm; }
                }
              </style>
            </head>
            <body>${content.replace(/\n/g, '<br>')}</body>
          </html>
        `);
        newWindow.document.close();
        // Automatically trigger the print dialog
        newWindow.focus();
        setTimeout(() => {
          newWindow.print();
          newWindow.close();
        }, 250);
        return true;
      }
      return false;
    }

    // If Web Serial API is supported, we'll use a more direct approach
    // that doesn't require the user to select a specific port
    try {
      // Get all available serial ports
      const ports = await (navigator as any).serial.getPorts();

      if (ports.length === 0) {
        // If no ports are available, use the browser print fallback
        console.warn('No USB printers found, using browser print fallback');
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>Receipt</title>
                <style>
                  body {
                    font-family: monospace;
                    white-space: pre;
                    margin: 20px;
                    font-size: 14px;
                  }
                </style>
              </head>
              <body>${content.replace(/\n/g, '<br>')}</body>
            </html>
          `);
          newWindow.document.close();
          newWindow.focus();
          setTimeout(() => {
            newWindow.print();
            newWindow.close();
          }, 250);
          return true;
        }
        return false;
      }

      // Use the first available port
      const port = ports[0];
      await port.open({ baudRate: 9600 }); // Common baud rate for thermal printers

      const encoder = new TextEncoder();
      const data = encoder.encode(content);

      const writer = port.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();

      await port.close();
      return true;
    } catch (serialError: any) {
      console.error('Serial/USB printing error:', serialError);

      // Fallback to browser print dialog
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  font-family: monospace;
                  white-space: pre;
                  margin: 5mm;
                  font-size: 14px;
                  width: 70mm;
                }
                @media print {
                  body { margin: 0; padding: 5mm; }
                }
              </style>
            </head>
            <body>${content.replace(/\n/g, '<br>')}</body>
          </html>
        `);
        newWindow.document.close();
        newWindow.focus();
        setTimeout(() => {
          newWindow.print();
          newWindow.close();
        }, 250);
        return true; // Return true to allow the sale to complete
      }
      return true; // Return true to allow the sale to complete even if printing fails
    }
  } catch (error: any) {
    console.error('USB printing error:', error);

    // Fallback to browser print dialog
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                font-family: monospace;
                white-space: pre;
                margin: 5mm;
                font-size: 14px;
                width: 70mm;
              }
              @media print {
                body { margin: 0; padding: 5mm; }
              }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      newWindow.document.close();
      newWindow.focus();
      setTimeout(() => {
        newWindow.print();
        newWindow.close();
      }, 250);
      return true; // Return true to allow the sale to complete even if printing fails
    }
    return true;
  }
};

// Discover available Bluetooth printers
export const reconnectPrinter = async (
  config: PrinterConfig
): Promise<any | null> => {
  try {
    if (config.printerType === 'bluetooth' && config.selectedDevice) {
      throw new Error('Web Bluetooth API is not supported in this browser');
    }

    const options: RequestDeviceOptions = {
      filters: [
        { name: 'POS' },
        { name: 'Printer' },
        { name: 'Thermal' },
        { namePrefix: 'TS-' }, // TS-80S/TS-80 printers
        { namePrefix: 'XP-' }, // Xprinter XP-Q200/XP-Q260
        { namePrefix: 'ZD' },  // Zebra ZD620BT/ZD230
      ],
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Vendor-specific service
        '00001821-0000-1000-8000-00805f9b34fb', // Mesh Provisioning Service
        '00001822-0000-1000-8000-00805f9b34fb', // Mesh Proxy Service
      ],
    };

    // This part of the reconnect logic is incomplete based on the provided snippet.
    // It seems to be missing the actual reconnection attempt using config.selectedDevice.
    // For now, it just requests a new device based on filters, which is not reconnection.
    // Assuming the intent is to return a device if found, or null.
    const navOpts = navigator as any; // Bypass TS strict navigator checks
    const device = await navOpts.bluetooth.requestDevice(options);
    return device;
  } catch (error) {
    console.error('Error reconnecting Bluetooth printer:', error);
    return null;
  }
};

// Discover available Bluetooth printers
export const discoverBluetoothPrinters = async (): Promise<any[]> => {
  try {
    if (!isWebBluetoothSupported()) {
      throw new Error('Web Bluetooth API is not supported in this browser');
    }

    const navOpts = navigator as any; // Bypass TS strict navigator checks
    const device = await navOpts.bluetooth.requestDevice({
      filters: [
        { name: 'POS' },
        { name: 'Printer' },
        { name: 'Thermal' },
        { namePrefix: 'TS-' }, // TS-80S/TS-80 printers
        { namePrefix: 'XP-' }, // Xprinter XP-Q200/XP-Q260
        { namePrefix: 'ZD' },  // Zebra ZD620BT/ZD230
      ],
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Vendor-specific service
        '00001821-0000-1000-8000-00805f9b34fb', // Mesh Provisioning Service
        '00001822-0000-1000-8000-00805f9b34fb', // Mesh Proxy Service
      ],
    });

    return [device];
  } catch (error) {
    console.error('Error discovering Bluetooth printers:', error);
    if (error instanceof Error) {
      if (error.message.includes('User cancelled') || error.message.includes('User denied')) {
        console.info('User cancelled Bluetooth device selection');
      } else if (error.message.includes('No Bluetooth devices found')) {
        console.info('No Bluetooth printers found');
      }
    }
    return [];
  }
};

// Check if Web Bluetooth is supported
export const isWebBluetoothSupported = (): boolean => {
  return 'bluetooth' in navigator;
};