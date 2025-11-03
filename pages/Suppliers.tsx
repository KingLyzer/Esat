import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Supplier } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// SupplierModal component
const SupplierModal: React.FC<{
    supplier: Supplier | null;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
}> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>(
        supplier || {
            companyName: '',
            contactPerson: '',
            phone: '',
            email: '',
            address: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: supplier?.id || crypto.randomUUID(), ...formData });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">{supplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Firma Adı <span className="text-red-500">*</span></label>
                        <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Yetkili Kişi</label>
                        <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Telefon</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">E-posta</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Adres</label>
                        <textarea name="address" value={formData.address} onChange={handleChange as any} rows={3} className="mt-1 p-2 w-full border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">İptal</button>
                        <button type="submit" className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Suppliers: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { suppliers, products } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => 
            s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    const handleSave = (supplier: Supplier) => {
        if (selectedSupplier) {
            dispatch({ type: 'UPDATE_SUPPLIER', payload: supplier });
        } else {
            dispatch({ type: 'ADD_SUPPLIER', payload: supplier });
        }
        closeModal();
    };

    const openModal = (supplier: Supplier | null = null) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedSupplier(null);
        setIsModalOpen(false);
    };

    const handleDelete = (supplierId: string) => {
        const isSupplierInUse = products.some(p => p.supplierId === supplierId);
        if (isSupplierInUse) {
            alert('Bu tedarikçi ürünlerle ilişkili olduğu için silinemez. Lütfen önce ilgili ürünleri düzenleyin.');
            return;
        }
        if(window.confirm('Bu tedarikçiyi silmek istediğinizden emin misiniz?')) {
            dispatch({ type: 'DELETE_SUPPLIER', payload: supplierId });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Tedarikçi Yönetimi</h2>
                <button onClick={() => openModal()} className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                    <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                    Yeni Tedarikçi Ekle
                </button>
            </div>
            
            <input 
                type="text" 
                placeholder="Firma adı veya yetkili kişi ile ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 mb-6 border rounded bg-white dark:bg-gray-800 dark:border-gray-700"
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Firma Adı</th>
                            <th className="p-3">Yetkili Kişi</th>
                            <th className="p-3">Telefon</th>
                            <th className="p-3">E-posta</th>
                            <th className="p-3 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredSuppliers.map(supplier => (
                            <tr key={supplier.id}>
                                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{supplier.companyName}</td>
                                <td className="p-3">{supplier.contactPerson}</td>
                                <td className="p-3">{supplier.phone}</td>
                                <td className="p-3">{supplier.email}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => openModal(supplier)} className="text-primary-500 hover:text-primary-700 mr-4"><FontAwesomeIcon icon={faEdit}/></button>
                                    <button onClick={() => handleDelete(supplier.id)} className="text-red-500 hover:text-red-700"><FontAwesomeIcon icon={faTrash}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredSuppliers.length === 0 && <p className="text-center p-4 text-gray-500">Tedarikçi bulunamadı.</p>}
            </div>

            {isModalOpen && <SupplierModal supplier={selectedSupplier} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};

export default Suppliers;