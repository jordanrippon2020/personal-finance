import { supabase } from '../lib/supabase';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionWithPagination,
  CategorizeTransactionRequest,
  CategorizeTransactionResponse,
  ApiResponse,
} from '@budget-tracker/shared-types';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No active session found');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiResponse = await response.json().catch(() => ({
      success: false,
      error: {
        error: 'NETWORK_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }
    }));

    throw new Error(errorData.error?.message || 'API request failed');
  }

  const data: ApiResponse<T> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data.data!;
}

// Transaction API client
export const transactionApi = {
  // Get transactions with pagination
  async getTransactions(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<TransactionWithPagination> {
    const headers = await getAuthHeaders();
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/transactions?${searchParams.toString()}`,
      { headers }
    );

    return handleApiResponse<TransactionWithPagination>(response);
  },

  // Create new transaction
  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return handleApiResponse<Transaction>(response);
  },

  // Update transaction
  async updateTransaction(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return handleApiResponse<Transaction>(response);
  },

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers,
    });

    await handleApiResponse<void>(response);
  },

  // Get AI categorization for transaction
  async categorizeTransaction(data: CategorizeTransactionRequest): Promise<CategorizeTransactionResponse> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/transactions/categorize`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return handleApiResponse<CategorizeTransactionResponse>(response);
  },

  // Get transaction by ID
  async getTransaction(id: string): Promise<Transaction> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      headers,
    });

    return handleApiResponse<Transaction>(response);
  },
};

// Export utility functions for external use
export { getAuthHeaders, handleApiResponse };