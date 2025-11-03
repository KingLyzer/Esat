import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import SalesChart from '../components/charts/SalesChart';
import type { Sale } from '../types';
import { PaymentMethod } from '../types';

const Reports: React.FC = () => {
    const { state } = useAppContext();
    const { sales, products } = state;
    const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');

    const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

    const getProfit = (sale: Sale) => {
        const costOfGoods = sale.items.reduce((cost, item) => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                return cost + (product.purchasePrice * item.quantity);
            }
            return cost;
        }, 0);

        let discountAmount = 0;
        if (sale.discountType === 'percentage') {
            discountAmount = sale.subTotal * (sale.discountValue / 100);
        } else if (sale.discountType === 'amount') {
            discountAmount = sale.discountValue;
        }
        
        const revenueAfterDiscount = sale.subTotal - discountAmount;
        return revenueAfterDiscount - costOfGoods;
    };

    const dailyReport = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaysSales = sales.filter(s => new Date(s.date) >= todayStart);
        const totalRevenue = todaysSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalProfit = todaysSales.reduce((sum, s) => sum + getProfit(s), 0);
        const totalSalesCount = todaysSales.length;
        const cashSales = todaysSales.filter(s=>s.paymentMethod === PaymentMethod.Cash).reduce((sum,s)=>sum+s.totalAmount,0);
        const cardSales = todaysSales.filter(s=>s.paymentMethod === PaymentMethod.CreditCard).reduce((sum,s)=>sum+s.totalAmount,0);
        
        return { totalRevenue, totalProfit, totalSalesCount, cashSales, cardSales };
    }, [sales, products]);

    const monthlyReport = useMemo(() => {
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);
        const monthlySales = sales.filter(s => new Date(s.date) >= thisMonthStart);
        const totalRevenue = monthlySales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalProfit = monthlySales.reduce((sum, s) => sum + getProfit(s), 0);
        
        const salesByDay = monthlySales.reduce((acc, sale) => {
            const day = new Date(sale.date).getDate().toString();
            acc[day] = (acc[day] || 0) + sale.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(salesByDay).map(([day, ciro]) => ({ name: `${day}`, Ciro: ciro }));

        return { totalRevenue, totalProfit, chartData };
    }, [sales, products]);
    
    const yearlyReport = useMemo(() => {
        const thisYearStart = new Date(new Date().getFullYear(), 0, 1);
        const yearlySales = sales.filter(s => new Date(s.date) >= thisYearStart);
        const totalRevenue = yearlySales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalProfit = yearlySales.reduce((sum, s) => sum + getProfit(s), 0);
        
        const salesByMonth = yearlySales.reduce((acc, sale) => {
            const month = new Date(sale.date).toLocaleString('tr-TR', { month: 'short' });
            acc[month] = (acc[month] || 0) + sale.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        const monthOrder = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        const chartData = monthOrder
            .map(month => ({ name: month, Ciro: salesByMonth[month] || 0 }))
            .filter(d => d.Ciro > 0 || Object.keys(salesByMonth).includes(d.name));


        return { totalRevenue, totalProfit, chartData };
    }, [sales, products]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Raporlar</h2>
            <div className="mb-6">
                <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    <button onClick={() => setView('daily')} className={`w-full py-2 px-4 rounded-lg transition ${view === 'daily' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Günlük</button>
                    <button onClick={() => setView('monthly')} className={`w-full py-2 px-4 rounded-lg transition ${view === 'monthly' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Aylık</button>
                    <button onClick={() => setView('yearly')} className={`w-full py-2 px-4 rounded-lg transition ${view === 'yearly' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Yıllık</button>
                </div>
            </div>

            {view === 'daily' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Bugünün Özeti ({new Date().toLocaleDateString('tr-TR')})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Ciro</p>
                            <p className="text-2xl font-bold">{formatCurrency(dailyReport.totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tahmini Kâr</p>
                            <p className="text-2xl font-bold">{formatCurrency(dailyReport.totalProfit)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Satış</p>
                            <p className="text-2xl font-bold">{dailyReport.totalSalesCount} adet</p>
                        </div>
                         <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Nakit Tahsilat</p>
                            <p className="text-2xl font-bold">{formatCurrency(dailyReport.cashSales)}</p>
                        </div>
                         <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kredi Kartı Tahsilat</p>
                            <p className="text-2xl font-bold">{formatCurrency(dailyReport.cardSales)}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {view === 'monthly' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <SalesChart data={monthlyReport.chartData} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Bu Ayın Özeti</h3>
                         <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aylık Toplam Ciro</p>
                            <p className="text-3xl font-bold">{formatCurrency(monthlyReport.totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aylık Tahmini Kâr</p>
                            <p className="text-3xl font-bold">{formatCurrency(monthlyReport.totalProfit)}</p>
                        </div>
                    </div>
                </div>
            )}

            {view === 'yearly' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <SalesChart data={yearlyReport.chartData} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Bu Yılın Özeti</h3>
                         <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Yıllık Toplam Ciro</p>
                            <p className="text-3xl font-bold">{formatCurrency(yearlyReport.totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Yıllık Tahmini Kâr</p>
                            <p className="text-3xl font-bold">{formatCurrency(yearlyReport.totalProfit)}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Reports;