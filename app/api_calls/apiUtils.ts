import { fetchAuthSession } from 'aws-amplify/auth';
import { get, post, put, del } from 'aws-amplify/api';

// Auth utility to get auth session and token
export const getAuthToken = async (): Promise<string | undefined> => {
  try {
    const authSession = await fetchAuthSession();
    const idToken = authSession.tokens?.idToken?.toString();
    
    if (!idToken) {
      console.warn('No ID token available in auth session');
      return undefined;
    }
    
    console.log('Auth token retrieved successfully, length:', idToken.length);
    return idToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
};

// Generic API call wrapper with auth
interface ApiCallOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  apiName?: string;
}

export const makeAuthenticatedApiCall = async (options: ApiCallOptions): Promise<any> => {
  const { method, path, body, apiName = 'trainingApi' } = options;
  
  try {
    const authSession = await fetchAuthSession();
    const idToken = authSession.tokens?.idToken?.toString();
    
    if (!idToken) {
      throw new Error('No authentication token available');
    }
    
    // For AWS API Gateway with Cognito User Pools, use just the token without "Bearer "
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': idToken  // Remove "Bearer " prefix
    };
    
    console.log(`Making ${method} request to ${path} with authorization token length:`, idToken.length);
    
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

      case 'DELETE':
        const delOp = del({
          apiName,
          path,
          options: { headers }
        });
        return await delOp.response;
        
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    console.error(`API call failed (${method} ${path}):`, error);
    throw error;
  }
};
