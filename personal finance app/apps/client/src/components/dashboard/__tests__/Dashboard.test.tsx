import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { SpendingOverview, CategoryChart, InsightsCards } from '../index';
import { DashboardInsights } from '@budget-tracker/shared-types';

// Mock dashboard insights data
const mockInsights: DashboardInsights = {
  current_month: {
    total_spent: 250000, // $2,500.00
    transaction_count: 45,
    categories: [
      {
        category: 'Food & Dining',
        amount_cents: 120000,
        count: 20,
        percentage: 48,
      },
      {
        category: 'Transportation',
        amount_cents: 80000,
        count: 15,
        percentage: 32,
      },
      {
        category: 'Entertainment',
        amount_cents: 50000,
        count: 10,
        percentage: 20,
      },
    ],
  },
  previous_month: {
    total_spent: 220000, // $2,200.00
    transaction_count: 40,
  },
  comparison: {
    spending_change_percent: 13.6,
    transaction_change_percent: 12.5,
  },
  anomalies: [
    {
      transaction_id: 'tx_123',
      type: 'unusual_amount',
      severity: 'high',
      description: 'Unusually high spending at Restaurant ABC',
    },
  ],
  insights: [
    {
      type: 'spending_trend',
      title: 'Spending Increased',
      description: 'Your spending has increased by 13.6% compared to last month.',
      action_required: true,
    },
  ],
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Components', () => {
  describe('SpendingOverview', () => {
    it('renders spending overview with correct data', () => {
      render(
        <TestWrapper>
          <SpendingOverview insights={mockInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('Total Spent This Month')).toBeInTheDocument();
      expect(screen.getByText('$2,500.00')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    });

    it('displays trend indicators correctly', () => {
      render(
        <TestWrapper>
          <SpendingOverview insights={mockInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('+13.6%')).toBeInTheDocument();
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });
  });

  describe('CategoryChart', () => {
    it('renders category chart with title', () => {
      render(
        <TestWrapper>
          <CategoryChart insights={mockInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Top Categories')).toBeInTheDocument();
    });

    it('displays category list with amounts', () => {
      render(
        <TestWrapper>
          <CategoryChart insights={mockInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      const emptyInsights = {
        ...mockInsights,
        current_month: {
          ...mockInsights.current_month,
          categories: [],
        },
      };

      render(
        <TestWrapper>
          <CategoryChart insights={emptyInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('No transactions this month')).toBeInTheDocument();
    });
  });

  describe('InsightsCards', () => {
    it('renders insights with correct titles', () => {
      render(
        <TestWrapper>
          <InsightsCards insights={mockInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('Spending Increased')).toBeInTheDocument();
    });

    it('shows action required indicators', () => {
      render(
        <TestWrapper>
          <InsightsCards insights={mockInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('Action Required')).toBeInTheDocument();
    });

    it('handles empty insights', () => {
      const emptyInsights = {
        ...mockInsights,
        insights: [],
      };

      render(
        <TestWrapper>
          <InsightsCards insights={emptyInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('No insights available yet')).toBeInTheDocument();
    });
  });
});