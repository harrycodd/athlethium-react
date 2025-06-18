import { makeAuthenticatedApiCall } from './apiUtils';

// User details API calls
export const detailsApi = {
  /**
   * Get user details
   * Maps to: GET /details/get
   */
  getUserDetails: async () => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: '/details/get'
    });
    return await response.body.json();
  },

  /**
   * Update user details
   * Maps to: PUT /details/update
   */
  updateUserDetails: async (details: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: '/details/update',
      body: details
    });
    return await response.body.json();
  },

  /**
   * Save user details (alias for updateUserDetails for backward compatibility)
   */
  saveUserDetails: async (details: any) => {
    return detailsApi.updateUserDetails(details);
  },

  /**
   * Delete user details
   * Maps to: DELETE /details/delete
   */
  deleteUserDetails: async () => {
    const response = await makeAuthenticatedApiCall({
      method: 'DELETE',
      path: '/details/delete'
    });
    return await response.body.json();
  }
};
