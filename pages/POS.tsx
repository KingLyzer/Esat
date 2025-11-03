import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import type { Product, SaleItem, DiscountType, Sale } from '../types';
import { PaymentMethod } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlusCircle, faMinusCircle, faPrint, faCamera } from '@fortawesome/free-solid-svg-icons';

type Receipt = {
    sale: Omit<Sale, 'items' | 'date'>;
    items: (SaleItem & { name: string })[];
};

const POS: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user } = useAuth();
  const { products, settings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p =>
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm))) && p.stock > 0
    ).slice(0, 5);
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        if(existingItem.quantity < product.stock) {
            return prevCart.map(item =>
                item.productId === product.id ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice } : item
            );
        }
        return prevCart;
      } else {
        return [...prevCart, { productId: product.id, quantity: 1, unitPrice: product.sellingPrice, totalPrice: product.sellingPrice }];
      }
    });
    setSearchTerm('');
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(prevCart => {
        const product = products.find(p => p.id === productId);
        return prevCart.map(item => {
            if (item.productId === productId) {
                const newQuantity = item.quantity + change;
                if(newQuantity > 0 && product && newQuantity <= product.stock) {
                    return { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice };
                }
                return item;
            }
            return item;
        }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };
  
  const subTotal = useMemo(() => cart.reduce((sum, item) => sum + item.totalPrice, 0), [cart]);

  const discountAmount = useMemo(() => {
      let value = discountValue;
      if (discountType === 'percentage' && user?.role === Role.Staff && value > settings.maxStaffDiscountPercentage) {
          value = settings.maxStaffDiscountPercentage;
      }

      if (discountType === 'percentage') {
          return subTotal * (value / 100);
      }
      if (discountType === 'amount') {
          return value > subTotal ? subTotal : value;
      }
      return 0;
  }, [subTotal, discountType, discountValue, user, settings.maxStaffDiscountPercentage]);

  const vatAmount = useMemo(() => (subTotal - discountAmount) * (settings.vatRate / 100), [subTotal, discountAmount, settings.vatRate]);
  const grandTotal = useMemo(() => subTotal - discountAmount + vatAmount, [subTotal, discountAmount, vatAmount]);

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = parseFloat(e.target.value) || 0;
      if (discountType === 'percentage' && user?.role === Role.Staff && value > settings.maxStaffDiscountPercentage) {
          alert(`Personel en fazla %${settings.maxStaffDiscountPercentage} indirim yapabilir.`);
          value = settings.maxStaffDiscountPercentage;
      }
      setDiscountValue(value);
  }

  const processSale = (paymentMethod: PaymentMethod) => {
      if (cart.length === 0) return;
      
      const receiptItems = cart.map(item => ({
          ...item,
          name: products.find(p => p.id === item.productId)?.name || 'Bilinmeyen'
      }));

      const finalDiscountValue = discountType === 'percentage' && user?.role === Role.Staff && discountValue > settings.maxStaffDiscountPercentage
          ? settings.maxStaffDiscountPercentage
          : discountValue;

      setLastReceipt({
          sale: {
              id: crypto.randomUUID().substring(0,8),
              subTotal,
              vatAmount,
              discountType,
              discountValue: finalDiscountValue,
              totalAmount: grandTotal,
              paymentMethod
          },
          items: receiptItems
      });

      dispatch({ type: 'ADD_SALE', payload: { items: cart, paymentMethod, discountType, discountValue: finalDiscountValue } });
      setCart([]);
      setDiscountType('none');
      setDiscountValue(0);
  };
  
  const handlePrint = () => {
      const printContents = receiptRef.current?.innerHTML;
      if (printContents) {
          const printableWindow = window.open('', '_blank');
          printableWindow?.document.write(`<html><head><title>Fiş</title>`);
          printableWindow?.document.write('</head><body>');
          printableWindow?.document.write(printContents);
          printableWindow?.document.write('</body></html>');
          printableWindow?.document.close();
          printableWindow?.print();
          printableWindow?.close();
      }
  };


  const getProductName = useCallback((productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Bilinmeyen Ürün';
  }, [products]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Left side: Product Search & Cart */}
      <div className="lg:col-span-2 flex flex-col h-full">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Hızlı Satış Ekranı</h2>
        <div className="relative mb-4">
            <input
                type="text"
                placeholder="Ürün adı veya barkod..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-lg"
            />
             <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
                <FontAwesomeIcon icon={faCamera} size="lg" />
            </button>
            {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-b-lg shadow-lg">
                    {searchResults.map(product => (
                        <li key={product.id} onClick={() => addToCart(product)} className="p-3 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between">
                            <span>{product.brand} {product.name} - Beden: {product.size}</span>
                            <span className="font-semibold">{product.sellingPrice.toFixed(2)} ₺</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* Cart */}
        <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Ürün</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Adet</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">Toplam</th>
                <th className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Sil</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.productId} className="border-b dark:border-gray-700">
                  <td className="p-3">{getProductName(item.productId)}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="text-red-500"><FontAwesomeIcon icon={faMinusCircle}/></button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="text-green-500"><FontAwesomeIcon icon={faPlusCircle}/></button>
                    </div>
                  </td>
                  <td className="p-3 text-right font-semibold">{item.totalPrice.toFixed(2)} ₺</td>
                  <td className="p-3 text-center">
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-500 hover:text-red-500"><FontAwesomeIcon icon={faTrash}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && <p className="text-center p-8 text-gray-500">Sepetiniz boş.</p>}
        </div>
      </div>

      {/* Right side: Total & Payment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col h-full">
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Sipariş Özeti</h3>
        <div className="flex-grow space-y-2 text-gray-700 dark:text-gray-300">
          <div className="flex justify-between"><span>Ara Toplam (KDV Hariç)</span><span>{subTotal.toFixed(2)} ₺</span></div>
          
          <div className="flex items-center justify-between border-t pt-2 dark:border-gray-700">
              <div className="flex items-center">
                  <select value={discountType} onChange={e => {setDiscountType(e.target.value as DiscountType); setDiscountValue(0);}} className="p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                      <option value="none">İndirim Yok</option>
                      <option value="percentage">% İndirim</option>
                      <option value="amount">Tutar İndirim</option>
                  </select>
                  {discountType !== 'none' && (
                        <input 
                          type="number" 
                          value={discountValue}
                          onChange={handleDiscountValueChange}
                          className="w-20 ml-2 p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-right"
                      />
                  )}
              </div>
              <span className="text-red-500">- {discountAmount.toFixed(2)} ₺</span>
          </div>

          <div className="flex justify-between"><span>KDV (%{settings.vatRate})</span><span>+ {vatAmount.toFixed(2)} ₺</span></div>
        </div>

        <div className="flex justify-between items-center text-3xl font-bold text-gray-800 dark:text-white border-y-2 dark:border-gray-700 py-4 my-4">
          <span>TOPLAM</span>
          <span>{grandTotal.toFixed(2)} ₺</span>
        </div>
        {lastReceipt && (
            <div className="mb-4 p-4 border border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="font-semibold text-green-700 dark:text-green-300">Satış Tamamlandı!</p>
                <p className="text-sm">Fiş No: #{lastReceipt.sale.id}</p>
                <button onClick={handlePrint} className="mt-2 text-primary-600 dark:text-primary-400 font-semibold inline-flex items-center">
                  <FontAwesomeIcon icon={faPrint} className="mr-2"/>
                  Fişi Yazdır
                </button>
            </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => processSale(PaymentMethod.Cash)} disabled={cart.length === 0} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">NAKİT</button>
          <button onClick={() => processSale(PaymentMethod.CreditCard)} disabled={cart.length === 0} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">KREDİ KARTI</button>
        </div>
      </div>
       {/* Printable Receipt - Hidden */}
       <div className="hidden">
            <div ref={receiptRef} className="p-4 text-black font-mono text-sm">
                <div className="text-center">
                    <h2 className="text-xl font-bold">{settings.storeName}</h2>
                    <p className="text-xs">{settings.address}</p>
                    <p className="text-xs">{settings.phone}</p>
                    <p className="text-xs mt-2">Fiş No: {lastReceipt?.sale.id}</p>
                    <p className="text-xs">Tarih: {new Date().toLocaleString('tr-TR')}</p>
                </div>
                <hr className="my-2 border-dashed border-black"/>
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className="text-left">Ürün</th>
                            <th className="text-right">Adet</th>
                            <th className="text-right">Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lastReceipt?.items.map(item => (
                            <tr key={item.productId}>
                                <td>{item.name}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">{item.totalPrice.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <hr className="my-2 border-dashed border-black"/>
                <div className="text-right text-xs">
                    <p>Ara Toplam: {lastReceipt?.sale.subTotal.toFixed(2)} ₺</p>
                    {lastReceipt && lastReceipt.sale.discountValue > 0 && (
                        <p>İndirim: -{((lastReceipt.sale.discountType === 'percentage' ? lastReceipt.sale.subTotal * lastReceipt.sale.discountValue / 100 : lastReceipt.sale.discountValue) || 0).toFixed(2)} ₺</p>
                    )}
                    <p>KDV (%{settings.vatRate}): +{lastReceipt?.sale.vatAmount.toFixed(2)} ₺</p>
                    <p className="font-bold text-base">TOPLAM: {lastReceipt?.sale.totalAmount.toFixed(2)} ₺</p>
                </div>
                <p className="text-xs text-center mt-4">Ödeme Yöntemi: {lastReceipt?.sale.paymentMethod}</p>
                <p className="text-xs text-center mt-2">Bizi tercih ettiğiniz için teşekkürler!</p>
            </div>
        </div>
    </div>
  );
};

export default POS;