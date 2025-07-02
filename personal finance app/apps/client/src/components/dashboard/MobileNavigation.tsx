import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Settings, 
  Plus,
  Wallet
} from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/transactions',
    },
    {
      id: 'add',
      label: 'Add',
      icon: <Plus className="w-6 h-6" />,
      path: '/transactions?add=true',
      primary: true,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <PieChart className="w-5 h-5" />,
      path: '/reports',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path.split('?')[0]);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 px-4 py-2 sm:hidden"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              item.primary
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : isActive(item.path)
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
};