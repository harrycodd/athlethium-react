import { makeAuthenticatedApiCall } from './apiUtils';

// User metrics API calls
export const metricsApi = {
  /**
   * Get user metrics for a specific date
   * Maps to: GET /metrics/get
   */
  getMetrics: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: '/metrics/get',
      body: { date }
    });
    return await response.body.json();
  },

  /**
   * Update user metrics for a specific date
   * Maps to: PUT /metrics/update
   */
  updateMetrics: async (date: string, metrics: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: '/metrics/update',
      body: { date, ...metrics }
    });
    return await response.body.json();
  },

  /**
   * Save metrics (alias for updateMetrics for backward compatibility)
   */
  saveMetrics: async (date: string, metrics: any) => {
    return metricsApi.updateMetrics(date, metrics);
  }
};
