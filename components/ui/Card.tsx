
import React from 'react';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface CardProps {
  title: string;
  value: string | number;
  icon: IconProp;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`flex items-center justify-center h-12 w-12 rounded-full ${color}`}>
        <FontAwesomeIcon icon={icon} className="h-6 w-6 text-white" />
      </div>
    </div>
  );
};

export default Card;
