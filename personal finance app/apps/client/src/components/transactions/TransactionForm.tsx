import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar, Store, FileText, Sparkles, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  CreateTransactionRequest, 
  DEFAULT_CATEGORIES,
  CategorizeTransactionResponse 
} from '@budget-tracker/shared-types';
import { useCreateTransaction, useCategorizeTransaction } from '../../hooks/useTransactions';
import { clsx } from 'clsx';

const transactionSchema = z.object({
  merchant: z.string().min(1, 'Merchant name is required').max(255),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<TransactionFormData>;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
}) => {
  const [aiPreview, setAiPreview] = useState<CategorizeTransactionResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showManualCategory, setShowManualCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const createTransaction = useCreateTransaction({
    onSuccess: () => {
      reset();
      setAiPreview(null);
      setSelectedCategory('');
      setShowManualCategory(false);
      onSuccess?.();
    },
  });

  const categorizeTransaction = useCategorizeTransaction();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      merchant: initialData?.merchant || '',
      amount: initialData?.amount || '',
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
      description: initialData?.description || '',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Debounced AI categorization
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedValues.merchant && watchedValues.amount && isValid) {
        getAiCategorization();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedValues.merchant, watchedValues.amount, watchedValues.description, isValid]);

  const getAiCategorization = async () => {
    if (!watchedValues.merchant || !watchedValues.amount) return;

    setIsLoadingPreview(true);
    try {
      const result = await categorizeTransaction.mutateAsync({
        merchant: watchedValues.merchant,
        amount_cents: Math.round(Number(watchedValues.amount) * 100),
        description: watchedValues.description,
      });
      setAiPreview(result);
      if (!selectedCategory) {
        setSelectedCategory(result.category);
      }
    } catch (error) {
      console.error('Failed to get AI categorization:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    const transactionData: CreateTransactionRequest = {
      merchant: data.merchant,
      amount_cents: Math.round(Number(data.amount) * 100),
      date: new Date(data.date).toISOString(),
      description: data.description || undefined,
    };

    await createTransaction.mutateAsync(transactionData);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowManualCategory(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-purple-400" />
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Merchant Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Store className="inline h-4 w-4 mr-1" />
            Merchant
          </label>
          <input
            {...register('merchant')}
            type="text"
            placeholder="Where did you spend?"
            className={clsx(
              'w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'text-lg touch-manipulation', // Mobile-friendly
              errors.merchant ? 'border-red-500' : 'border-gray-600'
            )}
          />
          {errors.merchant && (
            <p className="mt-1 text-sm text-red-400">{errors.merchant.message}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
              $
            </span>
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={clsx(
                'w-full pl-8 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                'text-lg touch-manipulation', // Mobile-friendly
                errors.amount ? 'border-red-500' : 'border-gray-600'
              )}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
          )}
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date
          </label>
          <input
            {...register('date')}
            type="date"
            className={clsx(
              'w-full px-4 py-3 bg-gray-700 border rounded-lg text-white',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'text-lg touch-manipulation', // Mobile-friendly
              errors.date ? 'border-red-500' : 'border-gray-600'
            )}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Description (Optional)
          </label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Additional details..."
            className={clsx(
              'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'text-lg touch-manipulation resize-none' // Mobile-friendly
            )}
          />
        </div>

        {/* AI Categorization Preview */}
        <AnimatePresence>
          {(aiPreview || isLoadingPreview) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  AI Categorization
                </h3>
                {isLoadingPreview && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400" />
                )}
              </div>

              {aiPreview && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{aiPreview.category}</span>
                      <span className={clsx('text-xs font-medium', getConfidenceColor(aiPreview.confidence))}>
                        {getConfidenceText(aiPreview.confidence)} ({Math.round(aiPreview.confidence * 100)}%)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowManualCategory(!showManualCategory)}
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      Change
                    </button>
                  </div>

                  {aiPreview.source === 'rule' && aiPreview.rule_used && (
                    <p className="text-xs text-gray-400">
                      Based on your previous transactions with {aiPreview.rule_used.merchant}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Category Selection */}
        <AnimatePresence>
          {showManualCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <h3 className="text-sm font-medium text-gray-300 mb-3">Select Category</h3>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation',
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createTransaction.isPending || !isValid}
            className={clsx(
              'flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800',
              'touch-manipulation text-lg', // Mobile-friendly
              createTransaction.isPending || !isValid
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            {createTransaction.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5" />
                Add Transaction
              </div>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={clsx(
                'py-3 px-4 rounded-lg font-medium transition-colors',
                'bg-gray-600 text-gray-300 hover:bg-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800',
                'touch-manipulation text-lg' // Mobile-friendly
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};