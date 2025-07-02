import { Router } from 'express';
import { supabase } from '../index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { ApiResponse, DashboardInsights } from '@budget-tracker/shared-types';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const router = Router();

// GET /api/insights/dashboard - Get dashboard insights
router.get('/dashboard', async (req: AuthenticatedRequest, res) => {
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    // Get current month data
    const { data: currentTransactions, error: currentError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user!.id)
      .gte('date', currentMonthStart.toISOString())
      .lte('date', currentMonthEnd.toISOString());

    if (currentError) {
      logger.error('Failed to fetch current month transactions:', currentError);
      return res.status(500).json({
        success: false,
        error: {
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch current month data',
        },
      });
    }

    // Get previous month data
    const { data: previousTransactions, error: previousError } = await supabase
      .from('transactions')
      .select('amount_cents')
      .eq('user_id', req.user!.id)
      .gte('date', previousMonthStart.toISOString())
      .lte('date', previousMonthEnd.toISOString());

    if (previousError) {
      logger.error('Failed to fetch previous month transactions:', previousError);
      return res.status(500).json({
        success: false,
        error: {
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch previous month data',
        },
      });
    }

    // Calculate current month totals
    const currentTotal = currentTransactions?.reduce((sum, t) => sum + t.amount_cents, 0) || 0;
    const currentCount = currentTransactions?.length || 0;

    // Calculate previous month totals
    const previousTotal = previousTransactions?.reduce((sum, t) => sum + t.amount_cents, 0) || 0;
    const previousCount = previousTransactions?.length || 0;

    // Group current transactions by category
    const categoryTotals = currentTransactions?.reduce((acc: Record<string, { amount: number; count: number }>, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = { amount: 0, count: 0 };
      }
      acc[transaction.category].amount += transaction.amount_cents;
      acc[transaction.category].count += 1;
      return acc;
    }, {}) || {};

    // Convert to array with percentages
    const categories = Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      amount_cents: data.amount,
      count: data.count,
      percentage: currentTotal > 0 ? (data.amount / currentTotal) * 100 : 0,
    })).sort((a, b) => b.amount_cents - a.amount_cents);

    // Calculate comparisons
    const spendingChangePercent = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;
    const transactionChangePercent = previousCount > 0 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : 0;

    // Detect anomalies
    const anomalies = await detectAnomalies(req.user!.id, currentTransactions || []);

    // Generate insights
    const insights = generateInsights(
      currentTotal,
      previousTotal,
      categories,
      spendingChangePercent,
      transactionChangePercent
    );

    const dashboardData: DashboardInsights = {
      current_month: {
        total_spent: currentTotal,
        transaction_count: currentCount,
        categories,
      },
      previous_month: {
        total_spent: previousTotal,
        transaction_count: previousCount,
      },
      comparison: {
        spending_change_percent: spendingChangePercent,
        transaction_change_percent: transactionChangePercent,
      },
      anomalies,
      insights,
    };

    const response: ApiResponse<DashboardInsights> = {
      success: true,
      data: dashboardData,
    };

    res.json(response);
  } catch (error) {
    logger.error('Dashboard insights error:', error);
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// Helper function to detect anomalies
async function detectAnomalies(userId: string, currentTransactions: any[]) {
  const anomalies: DashboardInsights['anomalies'] = [];

  // Get user's historical average spending per category
  const threeMonthsAgo = subMonths(new Date(), 3);
  
  const { data: historicalData } = await supabase
    .from('transactions')
    .select('amount_cents, category, merchant')
    .eq('user_id', userId)
    .gte('date', threeMonthsAgo.toISOString())
    .lt('date', startOfMonth(new Date()).toISOString());

  if (!historicalData || historicalData.length === 0) {
    return anomalies;
  }

  // Calculate average spending per category
  const categoryAverages: Record<string, number> = {};
  const categorySpendCounts: Record<string, number> = {};

  historicalData.forEach(transaction => {
    if (!categoryAverages[transaction.category]) {
      categoryAverages[transaction.category] = 0;
      categorySpendCounts[transaction.category] = 0;
    }
    categoryAverages[transaction.category] += transaction.amount_cents;
    categorySpendCounts[transaction.category] += 1;
  });

  // Calculate monthly averages
  Object.keys(categoryAverages).forEach(category => {
    categoryAverages[category] = categoryAverages[category] / 3; // 3 months
  });

  // Check for unusual amounts
  currentTransactions.forEach(transaction => {
    const categoryAvg = categoryAverages[transaction.category] || 0;
    const deviation = Math.abs(transaction.amount_cents - categoryAvg);
    
    if (categoryAvg > 0 && deviation > categoryAvg * 2) {
      anomalies.push({
        transaction_id: transaction.id,
        type: 'unusual_amount',
        severity: deviation > categoryAvg * 5 ? 'high' : 'medium',
        description: `$${(transaction.amount_cents / 100).toFixed(2)} spent at ${transaction.merchant} is unusually ${transaction.amount_cents > categoryAvg ? 'high' : 'low'} for ${transaction.category}`,
      });
    }
  });

  // Check for new merchants
  const historicalMerchants = new Set(historicalData.map(t => t.merchant.toLowerCase()));
  currentTransactions.forEach(transaction => {
    if (!historicalMerchants.has(transaction.merchant.toLowerCase()) && transaction.amount_cents > 5000) {
      anomalies.push({
        transaction_id: transaction.id,
        type: 'unusual_merchant',
        severity: 'low',
        description: `First time spending at ${transaction.merchant}`,
      });
    }
  });

  return anomalies;
}

// Helper function to generate insights
function generateInsights(
  currentTotal: number,
  previousTotal: number,
  categories: any[],
  spendingChange: number,
  transactionChange: number
): DashboardInsights['insights'] {
  const insights: DashboardInsights['insights'] = [];

  // Spending trend insight
  if (Math.abs(spendingChange) > 10) {
    insights.push({
      type: 'spending_trend',
      title: `Spending ${spendingChange > 0 ? 'increased' : 'decreased'} significantly`,
      description: `You've spent ${Math.abs(spendingChange).toFixed(1)}% ${spendingChange > 0 ? 'more' : 'less'} this month compared to last month.`,
      action_required: spendingChange > 25,
    });
  }

  // Top category insight
  if (categories.length > 0) {
    const topCategory = categories[0];
    if (topCategory.percentage > 40) {
      insights.push({
        type: 'category_insight',
        title: `${topCategory.category} dominates your spending`,
        description: `${topCategory.percentage.toFixed(1)}% of your spending this month was on ${topCategory.category}. Consider if this aligns with your priorities.`,
        action_required: topCategory.percentage > 60,
      });
    }
  }

  // Budget alert (if spending is significantly high)
  const avgMonthlySpending = 250000; // $2,500 in cents - this could be user-configurable
  if (currentTotal > avgMonthlySpending * 1.5) {
    insights.push({
      type: 'budget_alert',
      title: 'High spending detected',
      description: `Your spending this month is ${((currentTotal / avgMonthlySpending) * 100).toFixed(0)}% of your typical monthly spending.`,
      action_required: true,
    });
  }

  // Transaction frequency insight
  if (Math.abs(transactionChange) > 20) {
    insights.push({
      type: 'spending_trend',
      title: `Transaction frequency ${transactionChange > 0 ? 'increased' : 'decreased'}`,
      description: `You made ${Math.abs(transactionChange).toFixed(1)}% ${transactionChange > 0 ? 'more' : 'fewer'} transactions this month.`,
      action_required: false,
    });
  }

  return insights;
}

export default router;