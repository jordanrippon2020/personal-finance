import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  ChevronDown,
  Tag,
  DollarSign
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { DEFAULT_CATEGORIES } from '@budget-tracker/shared-types';
import { clsx } from 'clsx';

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  className?: string;
}

interface DatePreset {
  label: string;
  dateFrom: string;
  dateTo: string;
}

const getDatePresets = (): DatePreset[] => {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  
  return [
    {
      label: 'Today',
      dateFrom: today,
      dateTo: today,
    },
    {
      label: 'Last 7 days',
      dateFrom: format(subDays(now, 7), 'yyyy-MM-dd'),
      dateTo: today,
    },
    {
      label: 'Last 30 days',
      dateFrom: format(subDays(now, 30), 'yyyy-MM-dd'),
      dateTo: today,
    },
    {
      label: 'This month',
      dateFrom: format(startOfMonth(now), 'yyyy-MM-dd'),
      dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
    },
    {
      label: 'Last month',
      dateFrom: format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
      dateTo: format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
    },
  ];
};

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  className,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePresets, setShowDatePresets] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const datePresets = getDatePresets();
  const activeFiltersCount = [
    selectedCategory,
    dateFrom,
    dateTo,
    searchQuery,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onSearchChange('');
    onCategoryChange('');
    onDateFromChange('');
    onDateToChange('');
    setShowFilters(false);
  };

  const applyDatePreset = (preset: DatePreset) => {
    onDateFromChange(preset.dateFrom);
    onDateToChange(preset.dateTo);
    setShowDatePresets(false);
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

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={clsx(
            'w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg',
            'text-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
            'text-lg touch-manipulation' // Mobile-friendly
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter Toggle and Active Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors touch-manipulation',
            showFilters
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Active Filters Pills */}
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
              <Search className="h-3 w-3" />
              <span className="truncate max-w-20">{searchQuery}</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:bg-purple-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {selectedCategory && (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
              <div className={clsx('w-2 h-2 rounded-full', getCategoryColor(selectedCategory))} />
              <span>{selectedCategory}</span>
              <button
                onClick={() => onCategoryChange('')}
                className="hover:bg-purple-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {(dateFrom || dateTo) && (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
              <Calendar className="h-3 w-3" />
              <span>
                {dateFrom && dateTo
                  ? `${format(new Date(dateFrom), 'MMM d')} - ${format(new Date(dateTo), 'MMM d')}`
                  : dateFrom
                  ? `From ${format(new Date(dateFrom), 'MMM d')}`
                  : `Until ${format(new Date(dateTo), 'MMM d')}`}
              </span>
              <button
                onClick={() => {
                  onDateFromChange('');
                  onDateToChange('');
                }}
                className="hover:bg-purple-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4"
          >
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg',
                    'text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                    'touch-manipulation'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {selectedCategory ? (
                      <>
                        <div className={clsx('w-3 h-3 rounded-full', getCategoryColor(selectedCategory))} />
                        <span>{selectedCategory}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">All categories</span>
                    )}
                  </div>
                  <ChevronDown className={clsx(
                    'h-4 w-4 transition-transform',
                    showCategoryDropdown && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {showCategoryDropdown && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowCategoryDropdown(false)}
                      />
                      
                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 z-20 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        <button
                          onClick={() => {
                            onCategoryChange('');
                            setShowCategoryDropdown(false);
                          }}
                          className={clsx(
                            'w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors touch-manipulation',
                            !selectedCategory ? 'bg-purple-600 text-white' : 'text-gray-300'
                          )}
                        >
                          All categories
                        </button>
                        {DEFAULT_CATEGORIES.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              onCategoryChange(category);
                              setShowCategoryDropdown(false);
                            }}
                            className={clsx(
                              'w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors touch-manipulation',
                              'flex items-center gap-2',
                              selectedCategory === category ? 'bg-purple-600 text-white' : 'text-gray-300'
                            )}
                          >
                            <div className={clsx('w-3 h-3 rounded-full', getCategoryColor(category))} />
                            {category}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Range
              </label>
              
              {/* Date Presets */}
              <div className="flex flex-wrap gap-2 mb-3">
                {datePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyDatePreset(preset)}
                    className={clsx(
                      'px-3 py-1 text-sm rounded-full border transition-colors touch-manipulation',
                      dateFrom === preset.dateFrom && dateTo === preset.dateTo
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white',
                      'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                      'touch-manipulation'
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                    className={clsx(
                      'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white',
                      'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                      'touch-manipulation'
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors touch-manipulation"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors touch-manipulation"
              >
                Apply filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};