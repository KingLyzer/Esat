import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon, faUserCircle } from '@fortawesome/free-solid-svg-icons';

// FIX: Add icons to the library so they can be referenced by string names.
library.add(faSun, faMoon, faUserCircle);

const Header: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-end h-16 px-6 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-600 dark:text-gray-300">
          <FontAwesomeIcon icon={theme === 'light' ? 'moon' : 'sun'} className="h-5 w-5" />
        </button>
        <div className="flex items-center">
            <FontAwesomeIcon icon="user-circle" className="h-8 w-8 text-gray-500" />
            <div className="ml-2 text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
