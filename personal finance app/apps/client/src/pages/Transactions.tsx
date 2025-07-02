import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Activity,
  PieChart
} from 'lucide-react';
import { Transaction } from '@budget-tracker/shared-types';
import { 
  TransactionForm, 
  TransactionList, 
  TransactionFilters,
  CategoryCorrectionModal 
} from '../components/transactions';
import { useTransactionStats } from '../hooks/useTransactions';
import { clsx } from 'clsx';

export const Transactions: React.FC = () => {
  // Form state
  const [showForm, setShowForm] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modal state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Transaction stats
  const { data: stats } = useTransactionStats({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    category: selectedCategory || undefined,
  });

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowCategoryModal(true);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowCategoryModal(true);
  };

  const formatAmount = (amountCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountCents / 100);
  };

  const getTopCategories = () => {
    if (!stats?.categoryBreakdown) return [];
    
    return Object.entries(stats.categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / stats.totalAmount) * 100,
      }));
  };

  const topCategories = getTopCategories();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">Transactions</h1>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700',
                'rounded-lg font-medium transition-colors touch-manipulation'
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total Spending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Spending</p>
                  <p className="text-2xl font-bold text-white">
                    {formatAmount(stats.totalAmount)}
                  </p>
                </div>
                <div className="bg-red-600/20 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </motion.div>

            {/* Transaction Count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Transactions</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            {/* Average Transaction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Average</p>
                  <p className="text-2xl font-bold text-white">
                    {formatAmount(stats.averageAmount)}
                  </p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold">Top Categories</h2>
            </div>
            <div className="space-y-3">
              {topCategories.map(({ category, amount, percentage }) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-gray-300">{category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-20 text-right">
                      {formatAmount(amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <TransactionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
          />
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TransactionList
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onEditTransaction={handleEditTransaction}
            onTransactionClick={handleTransactionClick}
          />
        </motion.div>
      </div>

      {/* Add Transaction Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <TransactionForm
                onSuccess={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Correction Modal */}
      <CategoryCorrectionModal
        transaction={editingTransaction}
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          // Modal handles closing itself after success animation
        }}
      />

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className={clsx(
            'w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full',
            'flex items-center justify-center shadow-lg',
            'touch-manipulation'
          )}
        >
          <Plus className="h-6 w-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
};