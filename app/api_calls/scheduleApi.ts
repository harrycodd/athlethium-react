import { makeAuthenticatedApiCall } from './apiUtils';

// User schedule API calls
export const scheduleApi = {
  /**
   * Get user schedule for a specific date
   * Maps to: GET /schedule/get
   */
  getSchedule: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: '/schedule/get',
      body: { date }
    });
    return await response.body.json();
  },

  /**
   * Update user schedule for a specific date
   * Maps to: PUT /schedule/update
   */
  updateSchedule: async (date: string, schedule: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: '/schedule/update',
      body: { date, ...schedule }
    });
    return await response.body.json();
  }
};
