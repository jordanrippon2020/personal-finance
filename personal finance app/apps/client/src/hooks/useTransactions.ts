import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionWithPagination,
  CategorizeTransactionRequest,
  CategorizeTransactionResponse,
} from '@budget-tracker/shared-types';
import { transactionApi } from '../services/api';

// Query keys for React Query
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  categorize: () => [...transactionKeys.all, 'categorize'] as const,
};

// Hook for fetching transactions with infinite scroll
export function useInfiniteTransactions(params: {
  search?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
} = {}) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      transactionApi.getTransactions({
        ...params,
        page: pageParam,
        limit: params.limit || 20,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.has_more ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching transactions with regular pagination
export function useTransactions(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
  options?: UseQueryOptions<TransactionWithPagination>
) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionApi.getTransactions(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

// Hook for fetching a single transaction
export function useTransaction(
  id: string,
  options?: UseQueryOptions<Transaction>
) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionApi.getTransaction(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

// Hook for creating transactions
export function useCreateTransaction(
  options?: UseMutationOptions<Transaction, Error, CreateTransactionRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionApi.createTransaction,
    onSuccess: (newTransaction) => {
      // Invalidate and refetch transaction lists
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      
      // Add the new transaction to the cache optimistically
      queryClient.setQueryData<TransactionWithPagination>(
        transactionKeys.list({}),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            transactions: [newTransaction, ...old.transactions],
            total: old.total + 1,
          };
        }
      );

      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create transaction');
    },
    ...options,
  });
}

// Hook for updating transactions with optimistic updates
export function useUpdateTransaction(
  options?: UseMutationOptions<Transaction, Error, { id: string; data: UpdateTransactionRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => transactionApi.updateTransaction(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.all });

      // Snapshot the previous value
      const previousTransaction = queryClient.getQueryData(transactionKeys.detail(id));

      // Optimistically update the single transaction
      queryClient.setQueryData<Transaction>(transactionKeys.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      // Optimistically update transaction lists
      queryClient.setQueriesData<TransactionWithPagination>(
        { queryKey: transactionKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            transactions: old.transactions.map((transaction) =>
              transaction.id === id ? { ...transaction, ...data } : transaction
            ),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousTransaction, id };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTransaction) {
        queryClient.setQueryData(
          transactionKeys.detail(context.id),
          context.previousTransaction
        );
      }
      toast.error('Failed to update transaction');
    },
    onSuccess: () => {
      toast.success('Transaction updated successfully');
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
    ...options,
  });
}

// Hook for deleting transactions
export function useDeleteTransaction(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionApi.deleteTransaction,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.all });

      // Snapshot the previous value
      const previousTransaction = queryClient.getQueryData(transactionKeys.detail(id));

      // Optimistically remove from lists
      queryClient.setQueriesData<TransactionWithPagination>(
        { queryKey: transactionKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            transactions: old.transactions.filter((transaction) => transaction.id !== id),
            total: old.total - 1,
          };
        }
      );

      // Remove the single transaction cache
      queryClient.removeQueries({ queryKey: transactionKeys.detail(id) });

      return { previousTransaction, id };
    },
    onError: (err, id, context) => {
      // If the mutation fails, restore the previous state
      if (context?.previousTransaction) {
        queryClient.setQueryData(
          transactionKeys.detail(context.id),
          context.previousTransaction
        );
      }
      // Invalidate to refetch actual state
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      toast.error('Failed to delete transaction');
    },
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
    ...options,
  });
}

// Hook for getting AI categorization
export function useCategorizeTransaction(
  options?: UseMutationOptions<CategorizeTransactionResponse, Error, CategorizeTransactionRequest>
) {
  return useMutation({
    mutationFn: transactionApi.categorizeTransaction,
    ...options,
  });
}

// Hook for batch category corrections
export function useBatchUpdateTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: UpdateTransactionRequest }>) => {
      const results = await Promise.all(
        updates.map(({ id, data }) => transactionApi.updateTransaction(id, data))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      toast.success('Transactions updated successfully');
    },
    onError: () => {
      toast.error('Failed to update transactions');
    },
  });
}

// Custom hook for transaction statistics
export function useTransactionStats(params: {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
} = {}) {
  return useQuery({
    queryKey: [...transactionKeys.all, 'stats', params],
    queryFn: async () => {
      const data = await transactionApi.getTransactions({
        ...params,
        limit: 1000, // Get more data for accurate stats
      });

      const transactions = data.transactions;
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount_cents, 0);
      const categoryBreakdown = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount_cents;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalTransactions: transactions.length,
        totalAmount,
        averageAmount: transactions.length > 0 ? totalAmount / transactions.length : 0,
        categoryBreakdown,
        transactions,
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}