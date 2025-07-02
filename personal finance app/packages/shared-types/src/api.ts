import { Transaction, CategoryRule } from './database';

export interface CreateTransactionRequest {
  merchant: string;
  amount_cents: number;
  date: string;
  description?: string;
}

export interface UpdateTransactionRequest {
  merchant?: string;
  amount_cents?: number;
  category?: string;
  date?: string;
  description?: string;
}

export interface TransactionWithPagination {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface CategorizeTransactionRequest {
  merchant: string;
  amount_cents: number;
  description?: string;
}

export interface CategorizeTransactionResponse {
  category: string;
  confidence: number;
  source: 'ai' | 'rule';
  rule_used?: CategoryRule;
}

export interface BulkImportRequest {
  transactions: Array<{
    merchant: string;
    amount_cents: number;
    date: string;
    description?: string;
  }>;
}

export interface BulkImportResponse {
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
  transactions: Transaction[];
}

export interface DashboardInsights {
  current_month: {
    total_spent: number;
    transaction_count: number;
    categories: Array<{
      category: string;
      amount_cents: number;
      count: number;
      percentage: number;
    }>;
  };
  previous_month: {
    total_spent: number;
    transaction_count: number;
  };
  comparison: {
    spending_change_percent: number;
    transaction_change_percent: number;
  };
  anomalies: Array<{
    transaction_id: string;
    type: 'unusual_amount' | 'unusual_merchant' | 'unusual_category';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  insights: Array<{
    type: 'spending_trend' | 'category_insight' | 'budget_alert';
    title: string;
    description: string;
    action_required: boolean;
  }>;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}