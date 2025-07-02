import { useQuery } from '@tanstack/react-query';
import { DashboardInsights } from '@budget-tracker/shared-types';
import { getAuthHeaders, handleApiResponse } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Dashboard API client
export const dashboardApi = {
  async getDashboardInsights(): Promise<DashboardInsights> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/insights/dashboard`, {
      headers,
    });

    return handleApiResponse<DashboardInsights>(response);
  },
};

// Custom hook for dashboard data
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'insights'],
    queryFn: dashboardApi.getDashboardInsights,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry(failureCount, error) {
      // Retry up to 3 times for network errors
      if (failureCount >= 3) return false;
      if (error.message.includes('401') || error.message.includes('403')) return false;
      return true;
    },
  });
};

// Hook for real-time updates (optional - for future WebSocket integration)
export const useDashboardRealtime = () => {
  const queryResult = useDashboard();
  
  // TODO: Add WebSocket connection for real-time updates
  // This would listen for transaction changes and invalidate the query
  
  return queryResult;
};