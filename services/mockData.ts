import type { Product, Sale, StockLog, StoreSettings, Supplier } from '../types';
import { PaymentMethod } from '../types';

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup1', companyName: 'Ayakkabı Dünyası A.Ş.', contactPerson: 'Ahmet Yılmaz', phone: '0212 555 1122', email: 'ahmet@ad.com', address: 'Güngören, İstanbul'},
    { id: 'sup2', companyName: 'Spor Giyim Ltd.', contactPerson: 'Fatma Kaya', phone: '0216 444 3344', email: 'fatma.kaya@sporltd.com', address: 'Kadıköy, İstanbul'},
    { id: 'sup3', companyName: 'Deri Mamülleri Co.', contactPerson: 'Mehmet Öztürk', phone: '0312 222 5566', email: 'mehmet@derico.com', address: 'Çankaya, Ankara'},
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Koşu Ayakkabısı', brand: 'Nike', model: 'Air Max', color: 'Siyah', size: 42, purchasePrice: 800, sellingPrice: 1500, stock: 15, barcode: '8691234567890', supplierId: 'sup2' },
  { id: '2', name: 'Sneaker', brand: 'Adidas', model: 'Superstar', color: 'Beyaz', size: 41, purchasePrice: 600, sellingPrice: 1200, stock: 25, barcode: '8691234567891', supplierId: 'sup2' },
  { id: '3', name: 'Bot', brand: 'Caterpillar', model: 'Colorado', color: 'Kahverengi', size: 43, purchasePrice: 1200, sellingPrice: 2200, stock: 8, barcode: '8691234567892', supplierId: 'sup1' },
  { id: '4', name: 'Sandalet', brand: 'Birkenstock', model: 'Arizona', color: 'Mavi', size: 38, purchasePrice: 400, sellingPrice: 850, stock: 3, barcode: '8691234567893', supplierId: 'sup1' },
  { id: '5', name: 'Klasik Ayakkabı', brand: 'Derimod', model: 'Oxford', color: 'Siyah', size: 44, purchasePrice: 900, sellingPrice: 1750, stock: 12, barcode: '8691234567894', supplierId: 'sup3' },
  { id: '6', name: 'Basketbol Ayakkabısı', brand: 'Jordan', model: 'Retro 4', color: 'Kırmızı/Siyah', size: 45, purchasePrice: 1500, sellingPrice: 3000, stock: 5, barcode: '8691234567895', supplierId: 'sup2' },
];

export const INITIAL_SETTINGS: StoreSettings = {
    storeName: 'Kubilay Shoes',
    phone: '0212 123 45 67',
    address: 'İstiklal Cad. No:1, Beyoğlu/İstanbul',
    vatRate: 20,
    lowStockThreshold: 5,
    maxStaffDiscountPercentage: 20,
};

const today = new Date();
const salesData: { product: Product; quantity: number; daysAgo: number, payment: PaymentMethod }[] = [
    { product: MOCK_PRODUCTS[0], quantity: 2, daysAgo: 1, payment: PaymentMethod.CreditCard },
    { product: MOCK_PRODUCTS[1], quantity: 1, daysAgo: 1, payment: PaymentMethod.Cash },
    { product: MOCK_PRODUCTS[2], quantity: 1, daysAgo: 2, payment: PaymentMethod.CreditCard },
    { product: MOCK_PRODUCTS[4], quantity: 3, daysAgo: 3, payment: PaymentMethod.CreditCard },
    { product: MOCK_PRODUCTS[0], quantity: 1, daysAgo: 4, payment: PaymentMethod.Cash },
    { product: MOCK_PRODUCTS[5], quantity: 1, daysAgo: 5, payment: PaymentMethod.CreditCard },
    { product: MOCK_PRODUCTS[1], quantity: 2, daysAgo: 6, payment: PaymentMethod.Cash },
    { product: MOCK_PRODUCTS[3], quantity: 1, daysAgo: 7, payment: PaymentMethod.CreditCard },
];

export const MOCK_SALES: Sale[] = salesData.map((sale, index) => {
    const saleDate = new Date(today);
    saleDate.setDate(today.getDate() - sale.daysAgo);
    const subTotal = sale.product.sellingPrice * sale.quantity;
    const vatAmount = subTotal * (INITIAL_SETTINGS.vatRate / 100);
    const totalAmount = subTotal + vatAmount;
    return {
        id: `sale-${index + 1}`,
        items: [{
            productId: sale.product.id,
            quantity: sale.quantity,
            unitPrice: sale.product.sellingPrice,
            totalPrice: subTotal,
        }],
        subTotal: subTotal,
        vatAmount: vatAmount,
        discountType: 'none',
        discountValue: 0,
        totalAmount: totalAmount,
        paymentMethod: sale.payment,
        date: saleDate.toISOString(),
    };
});

export const MOCK_STOCK_LOGS: StockLog[] = [
    ...MOCK_SALES.flatMap(sale => sale.items.map(item => ({
        id: `log-${sale.id}-${item.productId}`,
        productId: item.productId,
        productName: MOCK_PRODUCTS.find(p => p.id === item.productId)?.name || 'Bilinmeyen Ürün',
        change: -item.quantity,
        date: sale.date,
        reason: 'Satış' as 'Satış' | 'Stok Girişi' | 'Düzeltme',
    }))),
    { id: 'log-add-1', productId: '1', productName: MOCK_PRODUCTS[0].name, change: 20, date: new Date(new Date().setDate(today.getDate() - 30)).toISOString(), reason: 'Stok Girişi' },
    { id: 'log-add-2', productId: '2', productName: MOCK_PRODUCTS[1].name, change: 30, date: new Date(new Date().setDate(today.getDate() - 30)).toISOString(), reason: 'Stok Girişi' },
];