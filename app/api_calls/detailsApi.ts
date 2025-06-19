import { makeAuthenticatedApiCall } from './apiUtils';

// ============================================================================
//                          SIGNUP API FUNCTION
// ============================================================================

/**
 * Complete user signup with profile details
 * Maps to: PUT https://api.athlethium.com/signup
 */
export const signupUser = async (userDetails: any, fitnessProfile: any) => {
  try {
    const response = await fetch('https://api.athlethium.com/signup', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        userDetails,
        fitnessProfile
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Signup API call failed:', error);
    throw error;
  }
};

// Helper function to get auth token
const getAuthToken = async (): Promise<string | undefined> => {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const authSession = await fetchAuthSession();
    return authSession.tokens?.idToken?.toString();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
};

// ============================================================================
//                          EXISTING API FUNCTIONS
// ============================================================================

// User details API calls
export const detailsApi = {
  /**
   * Get user details
   * Maps to: GET /details
   */
  getUserDetails: async () => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: '/details'
    });
    return await response.body.json();
  },

  /**
   * Update user details
   * Maps to: PUT /details
   */
  updateUserDetails: async (details: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: '/details',
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
   * Maps to: DELETE /details
   */
  deleteUserDetails: async () => {
    const response = await makeAuthenticatedApiCall({
      method: 'DELETE',
      path: '/details'
    });
    return await response.body.json();
  }
};
