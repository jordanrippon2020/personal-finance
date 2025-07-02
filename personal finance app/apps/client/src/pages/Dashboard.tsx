import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getInitials } from '../lib/utils';
import { useDashboard } from '../hooks/useDashboard';
import {
  SpendingOverview,
  CategoryChart,
  SpendingTrends,
  InsightsCards,
  AnomalyAlerts,
  CategoryComparison,
  QuickActions,
} from '../components/dashboard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { MobileNavigation } from '../components/dashboard/MobileNavigation';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: insights, isLoading, error, refetch } = useDashboard();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/login');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Dashboard refreshed');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-bold text-white">Budget Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="Refresh dashboard"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </span>
                </div>
                <span className="text-gray-300 text-sm hidden sm:block">{user?.email}</span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white 
                         hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-500/10 border border-red-500 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Failed to load dashboard data</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error.message}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && <DashboardSkeleton />}

        {/* Dashboard Content */}
        {insights && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, {user?.email?.split('@')[0] || 'User'}!
              </h2>
              <p className="text-gray-400">
                Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Spending Overview Cards */}
            <SpendingOverview insights={insights} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <CategoryChart insights={insights} />
              <SpendingTrends insights={insights} />
            </div>

            {/* Insights and Anomalies */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <InsightsCards insights={insights} />
              <AnomalyAlerts insights={insights} />
            </div>

            {/* Category Comparison */}
            <CategoryComparison insights={insights} />

            {/* Quick Actions */}
            <QuickActions />
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && insights && 
         insights.current_month.transaction_count === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-400 mb-6">
              Add your first transaction to start tracking your spending
            </p>
            <button
              onClick={() => navigate('/transactions')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Transaction
            </button>
          </motion.div>
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};