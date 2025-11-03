import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Product } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

const ProductModal: React.FC<{
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}> = ({ product, onClose, onSave }) => {
    const { state } = useAppContext();
    const { suppliers, settings } = state;

    const [formData, setFormData] = useState<Omit<Product, 'id'>>(
        product || {
            name: '',
            brand: '',
            model: '',
            color: '',
            size: 40,
            purchasePrice: 0,
            sellingPrice: 0,
            stock: 0,
            barcode: '',
            supplierId: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number = value;
        if (name === 'size' || name === 'stock' || name === 'purchasePrice' || name === 'sellingPrice') {
             processedValue = parseFloat(value) || 0;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: product?.id || crypto.randomUUID(), ...(formData as Omit<Product, 'id'>) });
    };

    const sellingPriceWithVAT = formData.sellingPrice * (1 + settings.vatRate / 100);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2 dark:border-gray-700">{product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Ürün Adı <span className="text-red-500">*</span></label>
                            <input type="text" name="name" placeholder="Örn: Spor Ayakkabı" value={formData.name} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Marka <span className="text-red-500">*</span></label>
                            <input type="text" name="brand" placeholder="Örn: Nike" value={formData.brand} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Model</label>
                            <input type="text" name="model" placeholder="Örn: Air Max 270" value={formData.model} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Renk</label>
                            <input type="text" name="color" placeholder="Örn: Siyah-Beyaz" value={formData.color} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Beden <span className="text-red-500">*</span></label>
                            <select name="size" value={formData.size} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required>
                                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Stok Adedi <span className="text-red-500">*</span></label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                    </div>
                    {/* Column 3 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Alış Fiyatı (KDV Hariç) <span className="text-red-500">*</span></label>
                            <input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Satış Fiyatı (KDV Hariç) <span className="text-red-500">*</span></label>
                            <input type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                            <small className="text-gray-500 dark:text-gray-400">KDV Dahil: {sellingPriceWithVAT.toFixed(2)} ₺</small>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tedarikçi</label>
                            <select name="supplierId" value={formData.supplierId} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Seçiniz...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Full width */}
                    <div className="md:col-span-2 lg:col-span-3">
                         <label className="block text-sm font-medium">Barkod No</label>
                        <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">İptal</button>
                        <button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Stock: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { products, settings } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchTerm))
        );
    }, [products, searchTerm]);

    const handleSave = (product: Product) => {
        if (selectedProduct) {
            dispatch({ type: 'UPDATE_PRODUCT', payload: product });
        } else {
            dispatch({ type: 'ADD_PRODUCT', payload: { ...product, id: crypto.randomUUID() } });
        }
        closeModal();
    };

    const openModal = (product: Product | null = null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    };

    const handleDelete = (productId: string) => {
        if(window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            dispatch({ type: 'DELETE_PRODUCT', payload: productId });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Stok Yönetimi</h2>
                <button onClick={() => openModal()} className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                    <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                    Yeni Ürün Ekle
                </button>
            </div>
            
            <input 
                type="text" 
                placeholder="Ürün adı, marka veya barkod ile ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 mb-6 border rounded bg-white dark:bg-gray-800 dark:border-gray-700"
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Ürün Adı</th>
                            <th className="p-3">Marka/Model</th>
                            <th className="p-3">Beden</th>
                            <th className="p-3">Stok</th>
                            <th className="p-3">Alış Fiyatı</th>
                            <th className="p-3">Satış Fiyatı</th>
                            <th className="p-3 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className={product.stock <= settings.lowStockThreshold ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{product.name}</td>
                                <td className="p-3">{product.brand} / {product.model}</td>
                                <td className="p-3">{product.size}</td>
                                <td className="p-3 font-semibold">
                                    {product.stock}
                                    {product.stock <= settings.lowStockThreshold && 
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 ml-2" title="Kritik Stok Seviyesi"/>
                                    }
                                </td>
                                <td className="p-3">{product.purchasePrice.toFixed(2)} ₺</td>
                                <td className="p-3">{product.sellingPrice.toFixed(2)} ₺</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => openModal(product)} className="text-primary-500 hover:text-primary-700 mr-4"><FontAwesomeIcon icon={faEdit}/></button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700"><FontAwesomeIcon icon={faTrash}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredProducts.length === 0 && <p className="text-center p-4 text-gray-500">Ürün bulunamadı.</p>}
            </div>

            {isModalOpen && <ProductModal product={selectedProduct} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};

export default Stock;