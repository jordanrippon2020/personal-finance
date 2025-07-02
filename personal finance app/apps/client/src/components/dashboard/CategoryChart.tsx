import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardInsights } from '@budget-tracker/shared-types';

interface CategoryChartProps {
  insights: DashboardInsights;
}

// Colors for different categories
const COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5A2B', // Brown
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#84CC16', // Lime
  '#06B6D4', // Cyan
];

export const CategoryChart: React.FC<CategoryChartProps> = ({ insights }) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Prepare data for the chart
  const chartData = insights.current_month.categories.map((category, index) => ({
    name: category.category,
    value: category.amount_cents,
    percentage: category.percentage,
    count: category.count,
    color: COLORS[index % COLORS.length],
  }));

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-purple-400">
            Amount: {formatCurrency(data.value)}
          </p>
          <p className="text-gray-300">
            {data.count} transaction{data.count !== 1 ? 's' : ''}
          </p>
          <p className="text-gray-300">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = (entry: any) => {
    return entry.percentage > 5 ? `${entry.percentage.toFixed(1)}%` : '';
  };

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No transactions this month</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }} className="text-sm">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category List */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Top Categories</h4>
        {chartData.slice(0, 5).map((category, index) => (
          <div key={category.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-white text-sm">{category.name}</span>
            </div>
            <div className="text-right">
              <p className="text-white text-sm font-medium">
                {formatCurrency(category.value)}
              </p>
              <p className="text-gray-400 text-xs">
                {category.count} transaction{category.count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};