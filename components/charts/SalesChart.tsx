
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface SalesChartProps {
  data: { name: string; Ciro: number }[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#A0AEC0' : '#4A5568';
  const barColor = '#3b82f6';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-96">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Satış Grafiği</h3>
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={data}
            margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4A5568' : '#E2E8F0'}/>
            <XAxis dataKey="name" stroke={tickColor} />
            <YAxis stroke={tickColor} />
            <Tooltip
            contentStyle={{
                backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
                borderColor: theme === 'dark' ? '#4A5568' : '#E2E8F0',
            }}
            />
            <Legend wrapperStyle={{ color: tickColor }} />
            <Bar dataKey="Ciro" fill={barColor} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
