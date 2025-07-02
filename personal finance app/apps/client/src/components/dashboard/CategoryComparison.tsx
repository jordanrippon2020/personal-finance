import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { DashboardInsights } from '@budget-tracker/shared-types';

interface CategoryComparisonProps {
  insights: DashboardInsights;
}

export const CategoryComparison: React.FC<CategoryComparisonProps> = ({ insights }) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Generate comparison data (mock previous month data for demonstration)
  const generateComparisonData = () => {
    const currentCategories = insights.current_month.categories;
    
    // Generate mock previous month data
    const previousMonthData = currentCategories.map(category => ({
      ...category,
      amount_cents: Math.max(0, category.amount_cents * (0.7 + Math.random() * 0.6)), // ±30% variation
    }));

    // Combine current and previous data
    const comparisonData = currentCategories.map(current => {
      const previous = previousMonthData.find(p => p.category === current.category);
      const previousAmount = previous?.amount_cents || 0;
      const change = previousAmount > 0 ? ((current.amount_cents - previousAmount) / previousAmount) * 100 : 0;
      
      return {
        category: current.category,
        current: current.amount_cents,
        previous: previousAmount,
        change: change,
        trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      };
    });

    return comparisonData.sort((a, b) => b.current - a.current);
  };

  const comparisonData = generateComparisonData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-purple-400">
              This Month: {formatCurrency(data.current)}
            </p>
            <p className="text-blue-400">
              Last Month: {formatCurrency(data.previous)}
            </p>
            <p className={`text-sm ${
              data.change > 0 ? 'text-red-400' : data.change < 0 ? 'text-green-400' : 'text-gray-400'
            }`}>
              Change: {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-400';
      case 'down':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  if (comparisonData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Category Comparison</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <p>No data available for comparison</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Category Comparison</h3>
        <span className="text-sm text-gray-400">This month vs last month</span>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={comparisonData.slice(0, 6)}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="category" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="previous" fill="#3B82F6" name="Last Month" radius={[2, 2, 0, 0]} />
            <Bar dataKey="current" fill="#8B5CF6" name="This Month" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category List with Trends */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Category Breakdown</h4>
        {comparisonData.slice(0, 6).map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.05 }}
            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getTrendIcon(category.trend)}
                <span className="text-white font-medium">{category.category}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">
                  {formatCurrency(category.current)}
                </p>
                <p className="text-xs text-gray-400">
                  vs {formatCurrency(category.previous)}
                </p>
              </div>
              
              <div className={`text-right min-w-[60px] ${getTrendColor(category.trend)}`}>
                <p className="text-sm font-medium">
                  {category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%
                </p>
              </div>
              
              <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {comparisonData.filter(c => c.trend === 'up').length}
            </div>
            <div className="text-xs text-gray-400">Increased</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {comparisonData.filter(c => c.trend === 'down').length}
            </div>
            <div className="text-xs text-gray-400">Decreased</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">
              {comparisonData.filter(c => c.trend === 'stable').length}
            </div>
            <div className="text-xs text-gray-400">Stable</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};