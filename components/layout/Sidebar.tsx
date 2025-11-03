import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../constants';
import type { NavItem } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTachometerAlt, faBoxOpen, faCashRegister, faChartLine, faCog, faSignOutAlt, faShoePrints, faTruck } from '@fortawesome/free-solid-svg-icons';

library.add(faTachometerAlt, faBoxOpen, faCashRegister, faChartLine, faCog, faSignOutAlt, faShoePrints, faTruck);

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    setActivePage(path);
  };

  const filteredNavItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex items-center justify-center h-20 shadow-md">
        <FontAwesomeIcon icon="shoe-prints" className="text-3xl text-primary-500 transform -rotate-12" />
        <h1 className="text-2xl font-bold ml-2 text-gray-800 dark:text-white">Kubilay Shoes</h1>
      </div>
      <ul className="flex flex-col py-4 space-y-1">
        {filteredNavItems.map((item: NavItem) => (
          <li key={item.path}>
            <button
              onClick={() => handleNavigation(item.path)}
              className={`relative flex flex-row items-center h-11 focus:outline-none hover:bg-primary-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-l-4 border-transparent hover:border-primary-500 pr-6 w-full text-left ${
                activePage === item.path ? 'bg-primary-50 dark:bg-gray-700 border-primary-500 text-gray-800 dark:text-white' : ''
              }`}
            >
              <span className="inline-flex justify-center items-center ml-4">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className="ml-2 text-sm tracking-wide truncate">{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto p-4">
         <button
            onClick={logout}
            className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-red-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border-l-4 border-transparent hover:border-red-500 pr-6 w-full text-left"
        >
            <span className="inline-flex justify-center items-center ml-4">
                <FontAwesomeIcon icon="sign-out-alt" />
            </span>
            <span className="ml-2 text-sm tracking-wide truncate">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;