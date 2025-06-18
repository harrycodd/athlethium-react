import { makeAuthenticatedApiCall } from './apiUtils';

// Training session API calls
export const sessionApi = {
  /**
   * Add a new training session
   * Maps to: POST /session/add
   */
  addTraining: async (date: string, training: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'POST',
      path: '/session/add',
      body: { date, ...training }
    });
    return await response.body.json();
  },

  /**
   * Get a specific training session by ID
   * Maps to: GET /session/get
   */
  getTrainingSession: async (sessionId: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: '/session/get',
      body: { sessionId }
    });
    return await response.body.json();
  },

  /**
   * Update a training session
   * Maps to: PUT /session/update
   */
  updateSession: async (sessionId: string, sessionData: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: '/session/update',
      body: { sessionId, ...sessionData }
    });
    return await response.body.json();
  },

  /**
   * Delete a training session
   * Maps to: DELETE /session/delete
   */
  deleteSession: async (sessionId: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'DELETE',
      path: '/session/delete',
      body: { sessionId }
    });
    return await response.body.json();
  }
};
