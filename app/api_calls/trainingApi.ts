import { makeAuthenticatedApiCall } from './apiUtils';

// Training API calls
export const trainingApi = {
  /**
   * Get user training for a specific date
   * Maps to: GET /training/get
   */
  getUserTraining: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: '/training/get',
      body: { date }
    });
    return await response.body.json();
  },

  /**
   * Run training algorithm
   * Maps to: POST /training/run
   */
  runTrainingAlgorithm: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'POST',
      path: '/training/run',
      body: { date }
    });
    return await response.body.json();
  }
};
