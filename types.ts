import { IconProp } from "@fortawesome/fontawesome-svg-core";

export enum Role {
  Admin = 'Yönetici',
  Staff = 'Personel',
}

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  size: number;
  purchasePrice: number; // KDV Hariç
  sellingPrice: number; // KDV Hariç
  stock: number;
  barcode?: string;
  supplierId?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number; // KDV Hariç sellingPrice
  totalPrice: number; // KDV Hariç (quantity * unitPrice)
}

export enum PaymentMethod {
    Cash = 'Nakit',
    CreditCard = 'Kredi Kartı'
}

export type DiscountType = 'percentage' | 'amount' | 'none';

export interface Sale {
  id: string;
  items: SaleItem[];
  subTotal: number; // KDV Hariç, indirimsiz
  vatAmount: number;
  discountType: DiscountType;
  discountValue: number;
  totalAmount: number; // KDV Dahil, indirimli
  paymentMethod: PaymentMethod;
  date: string; // ISO 8601 format
}


export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  change: number; // positive for addition, negative for sale
  date: string; // ISO 8601 format
  reason: 'Satış' | 'Stok Girişi' | 'Düzeltme';
}

export interface StoreSettings {
    storeName: string;
    phone: string;
    address: string;
    vatRate: number; // as percentage, e.g., 20
    lowStockThreshold: number;
    maxStaffDiscountPercentage: number;
}