import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  DollarSign,
  Store,
  Tag,
  X,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { DashboardInsights } from '@budget-tracker/shared-types';

interface AnomalyAlertsProps {
  insights: DashboardInsights;
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ insights }) => {
  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-500/10 border-red-500',
          text: 'text-red-400',
          icon: 'text-red-400',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500',
          text: 'text-yellow-400',
          icon: 'text-yellow-400',
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500',
          text: 'text-blue-400',
          icon: 'text-blue-400',
        };
    }
  };

  const getAnomalyTypeIcon = (type: string) => {
    switch (type) {
      case 'unusual_amount':
        return <DollarSign className="w-4 h-4" />;
      case 'unusual_merchant':
        return <Store className="w-4 h-4" />;
      case 'unusual_category':
        return <Tag className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAnomalyTypeLabel = (type: string) => {
    switch (type) {
      case 'unusual_amount':
        return 'Unusual Amount';
      case 'unusual_merchant':
        return 'New Merchant';
      case 'unusual_category':
        return 'Category Change';
      default:
        return 'Anomaly';
    }
  };

  // Sort anomalies by severity
  const sortedAnomalies = [...insights.anomalies].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  if (sortedAnomalies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Anomaly Detection</h3>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No anomalies detected</p>
            <p className="text-sm mt-1">Your spending patterns look normal</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Anomaly Detection</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {sortedAnomalies.length} anomal{sortedAnomalies.length !== 1 ? 'ies' : 'y'} detected
          </span>
          <div className="flex items-center space-x-1">
            {sortedAnomalies.filter(a => a.severity === 'high').length > 0 && (
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
            )}
            {sortedAnomalies.filter(a => a.severity === 'medium').length > 0 && (
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            )}
            {sortedAnomalies.filter(a => a.severity === 'low').length > 0 && (
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedAnomalies.slice(0, 5).map((anomaly, index) => {
          const colors = getSeverityColor(anomaly.severity);
          
          return (
            <motion.div
              key={anomaly.transaction_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`p-4 rounded-lg border ${colors.bg} hover:scale-[1.02] transition-all cursor-pointer group`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${colors.icon} bg-current/20`}>
                  {getSeverityIcon(anomaly.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-400">
                        {getAnomalyTypeIcon(anomaly.type)}
                        <span className="text-xs">{getAnomalyTypeLabel(anomaly.type)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-white text-sm font-medium mb-1">
                    {anomaly.description}
                  </p>
                  
                  <p className="text-gray-400 text-xs">
                    Transaction ID: {anomaly.transaction_id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {sortedAnomalies.filter(a => a.severity === 'high').length}
            </div>
            <div className="text-xs text-gray-400">High</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              {sortedAnomalies.filter(a => a.severity === 'medium').length}
            </div>
            <div className="text-xs text-gray-400">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {sortedAnomalies.filter(a => a.severity === 'low').length}
            </div>
            <div className="text-xs text-gray-400">Low</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">
              {new Set(sortedAnomalies.map(a => a.type)).size}
            </div>
            <div className="text-xs text-gray-400">Types</div>
          </div>
        </div>
      </div>

      {/* Show More Button */}
      {sortedAnomalies.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
            View {sortedAnomalies.length - 5} more anomalies
          </button>
        </div>
      )}
    </motion.div>
  );
};