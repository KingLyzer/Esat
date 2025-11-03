import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { StoreSettings } from '../types';
import { Role } from '../types';

const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { user } = useAuth();
    const [storeSettings, setStoreSettings] = useState<StoreSettings>(state.settings);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setStoreSettings(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSaveSettings = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: storeSettings });
        alert('Ayarlar kaydedildi!');
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({...prev, [name]: value}));
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if(passwordData.new !== passwordData.confirm) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }
        // This is a mock. In a real app, you'd call an API.
        alert(`Şifre başarıyla değiştirildi! (Yeni şifre: ${passwordData.new})`);
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    const handleBackup = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `kubilay_shoes_backup_${new Date().toISOString()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const restoredState = JSON.parse(e.target?.result as string);
                    // Basic validation
                    if (restoredState.products && restoredState.sales && restoredState.settings) {
                        if (window.confirm("Mevcut veriler geri yüklenen yedek ile değiştirilecek. Emin misiniz? Bu işlem geri alınamaz.")) {
                            dispatch({ type: 'RESTORE_DATA', payload: restoredState });
                            alert('Veriler başarıyla geri yüklendi!');
                        }
                    } else {
                       throw new Error("Invalid backup file format.");
                    }
                } catch (error) {
                    alert('Yedek dosyası okunurken bir hata oluştu. Lütfen geçerli bir dosya seçin.');
                    console.error("Restore error:", error);
                }
            };
            reader.readAsText(file);
        }
        // Reset file input to allow restoring the same file again
        event.target.value = '';
    };


    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Ayarlar</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                {user?.role === Role.Admin && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Genel Ayarlar</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mağaza Adı</label>
                                <input type="text" name="storeName" value={storeSettings.storeName} onChange={handleSettingsChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                                <input type="text" name="phone" value={storeSettings.phone} onChange={handleSettingsChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adres</label>
                                <input type="text" name="address" value={storeSettings.address} onChange={handleSettingsChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Varsayılan KDV Oranı (%)</label>
                                <input type="number" name="vatRate" value={storeSettings.vatRate} onChange={handleSettingsChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Düşük Stok Uyarı Seviyesi</label>
                                <input type="number" name="lowStockThreshold" value={storeSettings.lowStockThreshold} onChange={handleSettingsChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maksimum Personel İndirim Limiti (%)</label>
                                <input type="number" name="maxStaffDiscountPercentage" value={storeSettings.maxStaffDiscountPercentage} onChange={handleSettingsChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <button onClick={handleSaveSettings} className="w-full bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">Ayarları Kaydet</button>
                        </div>
                    </div>
                )}

                {/* Password & Data */}
                <div className="space-y-8">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Şifre Değiştir</h3>
                        <form className="space-y-4" onSubmit={handleSavePassword}>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mevcut Şifre</label>
                                <input type="password" name="current" value={passwordData.current} onChange={handlePasswordChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yeni Şifre</label>
                                <input type="password" name="new" value={passwordData.new} onChange={handlePasswordChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yeni Şifre (Tekrar)</label>
                                <input type="password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} className="mt-1 block w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required/>
                            </div>
                            <button type="submit" className="w-full bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">Şifreyi Değiştir</button>
                        </form>
                    </div>

                    {user?.role === Role.Admin && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Veri Yönetimi</h3>
                            <div className="flex space-x-4">
                                <button onClick={handleBackup} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Verileri Yedekle (.json)</button>
                                <label className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer text-center">
                                    Yedekten Geri Yükle
                                    <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;