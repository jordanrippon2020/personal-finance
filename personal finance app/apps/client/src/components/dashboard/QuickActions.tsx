import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  List, 
  Download, 
  Upload, 
  Filter,
  Calendar,
  Search,
  Settings,
  Target,
  Bell,
  TrendingUp,
  PieChart
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'add-transaction',
      title: 'Add Transaction',
      description: 'Quick add with AI categorization',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      textColor: 'text-white',
      action: () => navigate('/transactions?add=true'),
      priority: 'high',
    },
    {
      id: 'view-transactions',
      title: 'View All Transactions',
      description: 'Browse and manage transactions',
      icon: <List className="w-5 h-5" />,
      color: 'bg-gray-700 hover:bg-gray-600 border border-gray-600',
      textColor: 'text-white',
      action: () => navigate('/transactions'),
      priority: 'high',
    },
    {
      id: 'filter-transactions',
      title: 'Filter & Search',
      description: 'Find specific transactions',
      icon: <Search className="w-5 h-5" />,
      color: 'bg-gray-700 hover:bg-gray-600 border border-gray-600',
      textColor: 'text-white',
      action: () => navigate('/transactions?filter=true'),
      priority: 'medium',
    },
    {
      id: 'monthly-report',
      title: 'Monthly Report',
      description: 'View detailed spending analysis',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      textColor: 'text-white',
      action: () => {
        // TODO: Navigate to reports page when implemented
        console.log('Monthly report clicked');
      },
      priority: 'medium',
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download your transaction data',
      icon: <Download className="w-5 h-5" />,
      color: 'bg-gray-700 hover:bg-gray-600 border border-gray-600',
      textColor: 'text-white',
      action: () => {
        // TODO: Implement export functionality
        console.log('Export data clicked');
      },
      priority: 'low',
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Upload transactions from CSV',
      icon: <Upload className="w-5 h-5" />,
      color: 'bg-gray-700 hover:bg-gray-600 border border-gray-600',
      textColor: 'text-white',
      action: () => {
        // TODO: Implement import functionality
        console.log('Import data clicked');
      },
      priority: 'low',
    },
    {
      id: 'set-budgets',
      title: 'Set Budgets',
      description: 'Create spending limits by category',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      textColor: 'text-white',
      action: () => {
        // TODO: Navigate to budget page when implemented
        console.log('Set budgets clicked');
      },
      priority: 'medium',
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Manage alerts and preferences',
      icon: <Bell className="w-5 h-5" />,
      color: 'bg-gray-700 hover:bg-gray-600 border border-gray-600',
      textColor: 'text-white',
      action: () => {
        // TODO: Navigate to settings page when implemented
        console.log('Notifications clicked');
      },
      priority: 'low',
    },
  ];

  // Sort actions by priority
  const sortedActions = quickActions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <span className="text-sm text-gray-400">
          {sortedActions.filter(a => a.priority === 'high').length} priority actions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.05 }}
            onClick={action.action}
            className={`${action.color} ${action.textColor} p-4 rounded-lg transition-all duration-200 hover:scale-105 group text-left`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                {action.icon}
              </div>
              {action.priority === 'high' && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-1">{action.title}</h4>
              <p className="text-sm opacity-80">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Action Categories */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
            {sortedActions.filter(a => a.priority === 'high').length} High Priority
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            {sortedActions.filter(a => a.priority === 'medium').length} Medium Priority
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            {sortedActions.filter(a => a.priority === 'low').length} Low Priority
          </span>
        </div>
      </div>

      {/* Recently Used Actions (mock data) */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Recently Used</h4>
        <div className="flex space-x-2">
          {sortedActions.slice(0, 3).map((action) => (
            <button
              key={`recent-${action.id}`}
              onClick={action.action}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              {action.icon}
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};