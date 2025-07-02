import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DashboardInsights } from '@budget-tracker/shared-types';

interface SpendingTrendsProps {
  insights: DashboardInsights;
}

export const SpendingTrends: React.FC<SpendingTrendsProps> = ({ insights }) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Generate mock monthly data for demonstration
  // In a real app, this would come from the API
  const generateTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Create sample data based on current and previous month
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = new Date(currentYear, monthIndex).toLocaleDateString('en-US', { month: 'short' });
      
      let amount: number;
      if (i === 0) {
        // Current month
        amount = insights.current_month.total_spent;
      } else if (i === 1) {
        // Previous month
        amount = insights.previous_month.total_spent;
      } else {
        // Generate realistic mock data
        const baseAmount = insights.previous_month.total_spent || 200000; // $2000 default
        const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
        amount = Math.max(0, baseAmount * (1 + variation));
      }
      
      data.push({
        month: monthName,
        amount: amount,
        transactions: Math.floor((amount / 5000) + Math.random() * 20), // Rough estimate
      });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-purple-400">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-blue-400">
            Transactions: {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate trend direction
  const currentAmount = trendData[trendData.length - 1]?.amount || 0;
  const previousAmount = trendData[trendData.length - 2]?.amount || 0;
  const trendDirection = currentAmount > previousAmount ? 'up' : currentAmount < previousAmount ? 'down' : 'stable';
  const trendPercentage = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-red-400';
      case 'down':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendText = () => {
    const absPercentage = Math.abs(trendPercentage).toFixed(1);
    switch (trendDirection) {
      case 'up':
        return `↗ ${absPercentage}% increase`;
      case 'down':
        return `↘ ${absPercentage}% decrease`;
      default:
        return '→ No change';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Spending Trends</h3>
        <div className={`text-sm font-medium ${getTrendColor()}`}>
          {getTrendText()}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div>
          <p className="text-gray-400 text-xs mb-1">6-Month Average</p>
          <p className="text-white font-medium">
            {formatCurrency(trendData.reduce((sum, d) => sum + d.amount, 0) / trendData.length)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Highest Month</p>
          <p className="text-white font-medium">
            {formatCurrency(Math.max(...trendData.map(d => d.amount)))}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Lowest Month</p>
          <p className="text-white font-medium">
            {formatCurrency(Math.min(...trendData.map(d => d.amount)))}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">This Month</p>
          <p className="text-white font-medium">
            {formatCurrency(currentAmount)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};