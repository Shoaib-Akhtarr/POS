export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  totalDues: number;
  totalDiscount: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  costPrice: number;
  sellingPrice?: number;  // Backend field name (optional for flexibility)
  quantity?: number;      // Backend field name (optional for flexibility)
  price?: number;         // Mapped field name for mobile app
  stock?: number;         // Mapped field name for mobile app
  category: string;
  description: string;
  salesCount: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  _id: string;
  user?: string;
  cartItems: {
    name: string;
    quantity: number;
    price: number;
    product: string;
  }[];
  totalAmount: number;
  discount?: number;
  customerName?: string;
  customer?: string | Customer;
  previousDues?: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentMethod: 'Cash' | 'Credit';
  isPaid: boolean;
  receiptId: string;
  printed: boolean;
  receiptNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  _id: string;
  product: string;
  productName: string;
  supplierName: string;
  costPrice: number;
  quantity: number;
  totalCost: number;
  purchaseDate: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}
