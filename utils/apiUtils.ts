import { fetchAuthSession } from 'aws-amplify/auth';
import { get, post, put } from 'aws-amplify/api';

// Auth utility to get auth session and token
export const getAuthToken = async (): Promise<string | undefined> => {
  try {
    const authSession = await fetchAuthSession();
    return authSession.tokens?.idToken?.toString();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
};

// Generic API call wrapper with auth
interface ApiCallOptions {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  body?: any;
  apiName?: string;
}

export const makeAuthenticatedApiCall = async (options: ApiCallOptions) => {
  const { method, path, body, apiName = 'trainingApi' } = options;
  
  try {
    const idToken = await getAuthToken();
    const headers = idToken ? { Authorization: idToken } : undefined;
    
    switch (method) {
      case 'GET':
        const getOp = get({
          apiName,
          path,
          options: { headers }
        });
        return await getOp.response;
        
      case 'POST':
        const postOp = post({
          apiName,
          path,
          options: { body, headers }
        });
        return await postOp.response;
        
      case 'PUT':
        const putOp = put({
          apiName,
          path,
          options: { body, headers }
        });
        return await putOp.response;
        
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    console.error(`API call failed (${method} ${path}):`, error);
    throw error;
  }
};

// Common training API calls
export const trainingApi = {
  getTraining: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'POST',
      path: `/training/${date}`,
      body: { date }
    });
    return await response.body.json();
  },
  
  getUserTraining: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: `/users/${date}/training`
    });
    return await response.body.json();
  },
  
  getMetrics: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: `/users/${date}/metrics`
    });
    return await response.body.json();
  },
  
  saveMetrics: async (date: string, metrics: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: `/users/${date}/metrics`,
      body: metrics
    });
    return await response.body.json();
  },
  
  getGoals: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: `/users/${date}/goals`
    });
    return await response.body.json();
  },
  
  addTraining: async (date: string, training: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'POST',
      path: `/users/${date}/addTraining`,
      body: training
    });
    return await response.body.json();
  },
  
  saveUserDetails: async (details: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: `/users/details`,
      body: details
    });
    return await response.body.json();
  },
  
  runTrainingAlgorithm: async (date: string) => {
    const response = await makeAuthenticatedApiCall({
      method: 'POST',
      path: `/users/${date}/run_training_algorithm`
    });
    return await response.body.json();
  },
  
  getUserDetails: async () => {
    const response = await makeAuthenticatedApiCall({
      method: 'GET',
      path: `/users/details`
    });
    return await response.body.json();
  },
  
  updateUserDetails: async (details: any) => {
    const response = await makeAuthenticatedApiCall({
      method: 'PUT',
      path: `/users/details`,
      body: details
    });
    return await response.body.json();
  }
};
