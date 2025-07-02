import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ShoppingBag } from 'lucide-react';
import { DashboardInsights } from '@budget-tracker/shared-types';

interface SpendingOverviewProps {
  insights: DashboardInsights;
}

interface OverviewCard {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  color: string;
}

export const SpendingOverview: React.FC<SpendingOverviewProps> = ({ insights }) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-red-400'; // Spending up is typically bad
      case 'down':
        return 'text-green-400'; // Spending down is typically good
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const spendingTrend = 
    insights.comparison.spending_change_percent > 0 ? 'up' :
    insights.comparison.spending_change_percent < 0 ? 'down' : 'neutral';

  const transactionTrend = 
    insights.comparison.transaction_change_percent > 0 ? 'up' :
    insights.comparison.transaction_change_percent < 0 ? 'down' : 'neutral';

  const cards: OverviewCard[] = [
    {
      title: 'Total Spent This Month',
      value: formatCurrency(insights.current_month.total_spent),
      change: {
        value: formatPercentage(insights.comparison.spending_change_percent),
        trend: spendingTrend,
      },
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-purple-600 to-purple-700',
    },
    {
      title: 'Transactions',
      value: insights.current_month.transaction_count.toString(),
      change: {
        value: formatPercentage(insights.comparison.transaction_change_percent),
        trend: transactionTrend,
      },
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-blue-600 to-blue-700',
    },
    {
      title: 'Top Category',
      value: insights.current_month.categories[0]?.category || 'No transactions',
      change: insights.current_month.categories[0] ? {
        value: formatCurrency(insights.current_month.categories[0].amount_cents),
        trend: 'neutral' as const,
      } : undefined,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-green-600 to-green-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${card.color} rounded-lg p-6 text-white shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              {card.icon}
            </div>
            {card.change && (
              <div className={`flex items-center space-x-1 ${getTrendColor(card.change.trend)}`}>
                {getTrendIcon(card.change.trend)}
                <span className="text-sm font-medium">{card.change.value}</span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};