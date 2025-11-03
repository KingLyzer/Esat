import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Product, Sale, SaleItem, StockLog, StoreSettings, Supplier, DiscountType } from '../types';
import { PaymentMethod } from '../types';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_STOCK_LOGS, INITIAL_SETTINGS, MOCK_SUPPLIERS } from '../services/mockData';

interface AppState {
  products: Product[];
  sales: Sale[];
  stockLogs: StockLog[];
  settings: StoreSettings;
  suppliers: Supplier[];
}

type AppAction =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_SALE'; payload: { items: SaleItem[]; paymentMethod: PaymentMethod; discountType: DiscountType; discountValue: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<StoreSettings> }
  | { type: 'RESTORE_DATA', payload: AppState }
  | { type: 'ADD_SUPPLIER', payload: Supplier }
  | { type: 'UPDATE_SUPPLIER', payload: Supplier }
  | { type: 'DELETE_SUPPLIER', payload: string };


const initialState: AppState = {
  products: MOCK_PRODUCTS,
  sales: MOCK_SALES,
  stockLogs: MOCK_STOCK_LOGS,
  settings: INITIAL_SETTINGS,
  suppliers: MOCK_SUPPLIERS,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
        stockLogs: [...state.stockLogs, { id: crypto.randomUUID(), productId: action.payload.id, productName: action.payload.name, change: action.payload.stock, date: new Date().toISOString(), reason: 'Stok Girişi' }]
      };
    case 'UPDATE_PRODUCT':
      const oldProduct = state.products.find(p => p.id === action.payload.id);
      const stockChange = oldProduct ? action.payload.stock - oldProduct.stock : 0;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
        stockLogs: stockChange !== 0 ? [...state.stockLogs, { id: crypto.randomUUID(), productId: action.payload.id, productName: action.payload.name, change: stockChange, date: new Date().toISOString(), reason: 'Düzeltme' }] : state.stockLogs
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case 'ADD_SALE': {
        const { items, paymentMethod, discountType, discountValue } = action.payload;
        
        const subTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        let discountAmount = 0;
        if (discountType === 'percentage') {
            discountAmount = subTotal * (discountValue / 100);
        } else if (discountType === 'amount') {
            discountAmount = discountValue;
        }

        const discountedSubTotal = subTotal - discountAmount;
        const vatAmount = discountedSubTotal * (state.settings.vatRate / 100);
        const totalAmount = discountedSubTotal + vatAmount;

        const newSale: Sale = {
            id: crypto.randomUUID(),
            items: action.payload.items,
            subTotal,
            vatAmount,
            discountType,
            discountValue,
            totalAmount,
            paymentMethod,
            date: new Date().toISOString(),
        };

        const updatedProducts = [...state.products];
        const newStockLogs: StockLog[] = [];

        newSale.items.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                updatedProducts[productIndex] = {
                    ...updatedProducts[productIndex],
                    stock: updatedProducts[productIndex].stock - item.quantity,
                };
                newStockLogs.push({
                    id: crypto.randomUUID(),
                    productId: item.productId,
                    productName: updatedProducts[productIndex].name,
                    change: -item.quantity,
                    date: newSale.date,
                    reason: 'Satış',
                });
            }
        });

        return {
            ...state,
            sales: [newSale, ...state.sales],
            products: updatedProducts,
            stockLogs: [...state.stockLogs, ...newStockLogs],
        };
    }
    case 'UPDATE_SETTINGS':
        return {
            ...state,
            settings: { ...state.settings, ...action.payload }
        };
    case 'RESTORE_DATA':
        return action.payload;
    case 'ADD_SUPPLIER':
        return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
        return { ...state, suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SUPPLIER':
        return { ...state, suppliers: state.suppliers.filter(s => s.id !== action.payload) };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};