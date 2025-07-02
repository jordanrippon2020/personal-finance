import React from 'react';
import { motion } from 'framer-motion';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-16 h-6 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-32 h-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Category Chart Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="w-40 h-6 bg-gray-700 rounded animate-pulse mb-6"></div>
          <div className="h-80 bg-gray-700 rounded-lg animate-pulse mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trends Chart Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-80 bg-gray-700 rounded-lg animate-pulse mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-16 h-3 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-20 h-5 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Insights Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-full h-3 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-3/4 h-3 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Anomalies Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-36 h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-28 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-5 bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-24 h-3 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-28 h-6 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div className="w-32 h-3 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};