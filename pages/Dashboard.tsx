
import React from 'react';
import Card from '../components/ui/Card';
import SalesChart from '../components/charts/SalesChart';
import { useAppContext } from '../context/AppContext';
import type { Sale } from '../types';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLiraSign, faBoxes, faExclamationTriangle, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

library.add(faLiraSign, faBoxes, faExclamationTriangle, faShoppingCart);

const Dashboard: React.FC = () => {
  const { state } = useAppContext();
  const { products, sales, settings } = state;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysSales = sales.filter(sale => new Date(sale.date) >= today);
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todaysSalesCount = todaysSales.flatMap(s => s.items).reduce((sum, item) => sum + item.quantity, 0);

  const totalProductTypes = products.length;
  const lowStockProducts = products.filter(p => p.stock <= settings.lowStockThreshold).length;

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  }

  const getWeeklySalesData = () => {
      const data: { name: string; Ciro: number }[] = [];
      for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toLocaleDateString('tr-TR', { weekday: 'short' });
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dailyTotal = sales
              .filter(s => {
                  const saleDate = new Date(s.date);
                  return saleDate >= dayStart && saleDate <= dayEnd;
              })
              .reduce((sum, s) => sum + s.totalAmount, 0);
          
          data.push({ name: dateString, Ciro: dailyTotal });
      }
      return data;
  }
  
  const weeklySalesData = getWeeklySalesData();

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Kontrol Paneli</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Bugünkü Ciro" value={formatCurrency(todaysRevenue)} icon="lira-sign" color="bg-green-500" />
        <Card title="Bugünkü Satış" value={`${todaysSalesCount} Adet`} icon="shopping-cart" color="bg-blue-500" />
        <Card title="Toplam Ürün Çeşidi" value={totalProductTypes} icon="boxes" color="bg-purple-500" />
        <Card title="Kritik Stok" value={lowStockProducts} icon="exclamation-triangle" color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesChart data={weeklySalesData} />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Son Satışlar</h3>
              <ul className="space-y-4">
                  {sales.slice(0, 5).map(sale => (
                      <li key={sale.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                          <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200">#{sale.id.substring(0,6)}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(sale.date).toLocaleString('tr-TR')}</p>
                          </div>
                          <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(sale.totalAmount)}</span>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
