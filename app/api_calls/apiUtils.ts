import { fetchAuthSession } from 'aws-amplify/auth';
import { get, post, put, del } from 'aws-amplify/api';

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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  apiName?: string;
}

export const makeAuthenticatedApiCall = async (options: ApiCallOptions): Promise<any> => {
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
