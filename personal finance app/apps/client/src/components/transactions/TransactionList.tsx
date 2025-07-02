import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  Calendar, 
  DollarSign, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { Transaction, DEFAULT_CATEGORIES } from '@budget-tracker/shared-types';
import { useInfiniteTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { clsx } from 'clsx';

interface TransactionListProps {
  searchQuery?: string;
  selectedCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  onEditTransaction?: (transaction: Transaction) => void;
  onTransactionClick?: (transaction: Transaction) => void;
}

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onClick?: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const deleteTransaction = useDeleteTransaction();

  const formatAmount = (amountCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountCents / 100);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food': 'bg-orange-500',
      'Transport': 'bg-blue-500',
      'Shopping': 'bg-pink-500',
      'Entertainment': 'bg-purple-500',
      'Bills': 'bg-red-500',
      'Healthcare': 'bg-green-500',
      'Other': 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getConfidenceIndicator = (confidence: number | null) => {
    if (!confidence) return null;
    if (confidence >= 0.8) return '🎯';
    if (confidence >= 0.6) return '🤔';
    return '❓';
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction.mutateAsync(transaction.id);
    }
    setShowActions(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        {/* Main Transaction Info */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onClick?.(transaction)}
        >
          <div className="flex items-start gap-3">
            {/* Category Indicator */}
            <div 
              className={clsx(
                'w-3 h-3 rounded-full mt-2 flex-shrink-0',
                getCategoryColor(transaction.category)
              )}
            />
            
            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium truncate pr-2">
                  {transaction.merchant}
                </h3>
                <span className="text-lg font-semibold text-white whitespace-nowrap">
                  {formatAmount(transaction.amount_cents)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                
                <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                  {transaction.category}
                </span>
                
                {transaction.ai_confidence && (
                  <>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span 
                      className="text-xs"
                      title={`AI Confidence: ${Math.round(transaction.ai_confidence * 100)}%`}
                    >
                      {getConfidenceIndicator(transaction.ai_confidence)}
                    </span>
                  </>
                )}
              </div>
              
              {transaction.description && (
                <p className="text-sm text-gray-400 mt-1 truncate">
                  {transaction.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>

          <AnimatePresence>
            {showActions && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                
                {/* Actions Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-10 z-20 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 min-w-[120px]"
                >
                  <button
                    onClick={() => {
                      onEdit?.(transaction);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2 touch-manipulation"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteTransaction.isPending}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50 touch-manipulation"
                  >
                    {deleteTransaction.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({
  searchQuery,
  selectedCategory,
  dateFrom,
  dateTo,
  onEditTransaction,
  onTransactionClick,
}) => {
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteTransactions({
    search: searchQuery,
    category: selectedCategory,
    dateFrom,
    dateTo,
    limit: 20,
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten all pages of transactions
  const transactions = data?.pages.flatMap(page => page.transactions) || [];
  const totalTransactions = data?.pages[0]?.total || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg border border-gray-700 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gray-600 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-gray-600 rounded w-32" />
                  <div className="h-4 bg-gray-600 rounded w-16" />
                </div>
                <div className="h-3 bg-gray-600 rounded w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to load transactions</h3>
        <p className="text-gray-400 mb-4">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors touch-manipulation"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
        <p className="text-gray-400">
          {searchQuery || selectedCategory || dateFrom || dateTo
            ? 'Try adjusting your filters or search terms'
            : 'Start by adding your first transaction'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400 px-1">
        <span>
          Showing {transactions.length} of {totalTransactions.toLocaleString()} transactions
        </span>
        {(searchQuery || selectedCategory || dateFrom || dateTo) && (
          <span className="text-purple-400">Filtered results</span>
        )}
      </div>

      {/* Transaction List */}
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onEdit={onEditTransaction}
            onClick={onTransactionClick}
          />
        ))}
      </AnimatePresence>

      {/* Load More Trigger */}
      <div ref={observerRef} className="h-4">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            <span className="ml-2 text-gray-400">Loading more transactions...</span>
          </div>
        )}
      </div>

      {/* End of Results */}
      {!hasNextPage && transactions.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          You've reached the end of your transactions
        </div>
      )}
    </div>
  );
};