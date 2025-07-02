import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  Info,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { DashboardInsights } from '@budget-tracker/shared-types';

interface InsightsCardsProps {
  insights: DashboardInsights;
}

export const InsightsCards: React.FC<InsightsCardsProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_trend':
        return <TrendingUp className="w-5 h-5" />;
      case 'category_insight':
        return <Lightbulb className="w-5 h-5" />;
      case 'budget_alert':
        return <Target className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string, actionRequired: boolean) => {
    if (actionRequired) {
      return 'border-yellow-500 bg-yellow-500/10';
    }
    
    switch (type) {
      case 'spending_trend':
        return 'border-blue-500 bg-blue-500/10';
      case 'category_insight':
        return 'border-purple-500 bg-purple-500/10';
      case 'budget_alert':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getInsightTextColor = (type: string, actionRequired: boolean) => {
    if (actionRequired) {
      return 'text-yellow-400';
    }
    
    switch (type) {
      case 'spending_trend':
        return 'text-blue-400';
      case 'category_insight':
        return 'text-purple-400';
      case 'budget_alert':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Generate automatic insights based on data
  const generateAutomaticInsights = (): Array<{
    type: 'spending_trend' | 'category_insight' | 'budget_alert';
    title: string;
    description: string;
    action_required: boolean;
  }> => {
    const autoInsights = [];
    
    // Spending trend insight
    const spendingChange = insights.comparison.spending_change_percent;
    if (Math.abs(spendingChange) > 15) {
      autoInsights.push({
        type: 'spending_trend' as const,
        title: spendingChange > 0 ? 'Spending Increased' : 'Spending Decreased',
        description: `Your spending has ${spendingChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(spendingChange).toFixed(1)}% compared to last month.`,
        action_required: spendingChange > 25,
      });
    }

    // Top category insight
    const topCategory = insights.current_month.categories[0];
    if (topCategory && topCategory.percentage > 40) {
      autoInsights.push({
        type: 'category_insight' as const,
        title: 'Category Concentration',
        description: `${topCategory.category} represents ${topCategory.percentage.toFixed(1)}% of your spending. Consider diversifying your expenses.`,
        action_required: topCategory.percentage > 60,
      });
    }

    // Transaction frequency insight
    const transactionChange = insights.comparison.transaction_change_percent;
    if (Math.abs(transactionChange) > 20) {
      autoInsights.push({
        type: 'spending_trend' as const,
        title: 'Transaction Frequency Changed',
        description: `You made ${transactionChange > 0 ? 'more' : 'fewer'} transactions this month (${Math.abs(transactionChange).toFixed(1)}% change).`,
        action_required: false,
      });
    }

    return autoInsights;
  };

  const allInsights = [...insights.insights, ...generateAutomaticInsights()];

  if (allInsights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No insights available yet. Add more transactions to see personalized recommendations.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        <span className="text-sm text-gray-400">
          {allInsights.filter(i => i.action_required).length} require attention
        </span>
      </div>

      <div className="space-y-4">
        {allInsights.slice(0, 5).map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type, insight.action_required)} transition-all hover:scale-[1.02] cursor-pointer group`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 p-2 rounded-lg ${getInsightTextColor(insight.type, insight.action_required)} bg-current/20`}>
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    {insight.action_required && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        Action Required
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {allInsights.length}
            </div>
            <div className="text-xs text-gray-400">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              {allInsights.filter(i => i.action_required).length}
            </div>
            <div className="text-xs text-gray-400">Need Action</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {allInsights.filter(i => !i.action_required).length}
            </div>
            <div className="text-xs text-gray-400">Informational</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};