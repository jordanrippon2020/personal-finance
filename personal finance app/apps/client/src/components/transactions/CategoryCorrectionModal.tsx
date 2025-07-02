import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Sparkles, 
  Brain, 
  User, 
  Zap,
  Tag,
  Store,
  DollarSign,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Transaction, DEFAULT_CATEGORIES } from '@budget-tracker/shared-types';
import { useUpdateTransaction } from '../../hooks/useTransactions';
import { clsx } from 'clsx';

interface CategoryCorrectionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CategoryCorrectionModal: React.FC<CategoryCorrectionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const updateTransaction = useUpdateTransaction({
    onSuccess: () => {
      setIsAnimating(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setIsAnimating(false);
        setSelectedCategory('');
      }, 1000);
    },
  });

  React.useEffect(() => {
    if (transaction) {
      setSelectedCategory(transaction.category);
    }
  }, [transaction]);

  const handleCategorySelect = async (category: string) => {
    if (!transaction) return;
    
    setSelectedCategory(category);
    
    await updateTransaction.mutateAsync({
      id: transaction.id,
      data: { category },
    });
  };

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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'Food': () => <span className="text-orange-400">🍽️</span>,
      'Transport': () => <span className="text-blue-400">🚗</span>,
      'Shopping': () => <span className="text-pink-400">🛍️</span>,
      'Entertainment': () => <span className="text-purple-400">🎬</span>,
      'Bills': () => <span className="text-red-400">💡</span>,
      'Healthcare': () => <span className="text-green-400">🏥</span>,
      'Other': () => <span className="text-gray-400">📋</span>,
    };
    const IconComponent = icons[category] || icons['Other'];
    return <IconComponent />;
  };

  const getConfidenceIndicator = (confidence: number | null) => {
    if (!confidence) return null;
    if (confidence >= 0.8) return { icon: '🎯', label: 'High', color: 'text-green-400' };
    if (confidence >= 0.6) return { icon: '🤔', label: 'Medium', color: 'text-yellow-400' };
    return { icon: '❓', label: 'Low', color: 'text-red-400' };
  };

  if (!transaction) return null;

  const confidenceInfo = getConfidenceIndicator(transaction.ai_confidence);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Success Animation Overlay */}
            <AnimatePresence>
              {isAnimating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-green-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm z-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-600 rounded-full p-3"
                  >
                    <Check className="h-8 w-8 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-400" />
                Correct Category
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Transaction Info */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className={clsx('w-3 h-3 rounded-full mt-2', getCategoryColor(transaction.category))} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium">{transaction.merchant}</h3>
                    <span className="text-lg font-semibold text-white">
                      {formatAmount(transaction.amount_cents)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-gray-400 mt-1">{transaction.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current AI Prediction */}
            {transaction.ai_confidence && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">AI Prediction</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(transaction.category)}
                    <span className="text-white font-medium">{transaction.category}</span>
                  </div>
                  {confidenceInfo && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{confidenceInfo.icon}</span>
                      <span className={clsx('text-sm', confidenceInfo.color)}>
                        {confidenceInfo.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({Math.round(transaction.ai_confidence * 100)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Select correct category:</h3>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category;
                  const isOriginal = category === transaction.category;
                  
                  return (
                    <motion.button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      disabled={updateTransaction.isPending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={clsx(
                        'p-3 rounded-lg border transition-all duration-200 touch-manipulation',
                        'flex items-center gap-2 text-left',
                        isSelected && !isOriginal
                          ? 'bg-green-600 border-green-500 text-white'
                          : isOriginal
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500',
                        updateTransaction.isPending && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {getCategoryIcon(category)}
                        <span className="font-medium">{category}</span>
                      </div>
                      
                      {isOriginal && (
                        <div className="flex items-center gap-1 text-xs">
                          <Brain className="h-3 w-3" />
                          <span>AI</span>
                        </div>
                      )}
                      
                      {isSelected && !isOriginal && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-400"
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Smart Learning</p>
                  <p className="text-blue-200">
                    When you correct a category, the AI learns from your preference and will be more accurate for similar transactions in the future.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                disabled={updateTransaction.isPending}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  'bg-gray-600 text-gray-300 hover:bg-gray-500',
                  updateTransaction.isPending && 'opacity-50 cursor-not-allowed'
                )}
              >
                {updateTransaction.isPending ? 'Updating...' : 'Done'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};