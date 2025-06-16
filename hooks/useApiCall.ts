import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import { get, post, put } from 'aws-amplify/api';

interface UseApiCallProps<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export const useApiCall = <T = any>({ onSuccess, onError }: UseApiCallProps<T> = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  const makeRequest = useCallback(async (
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    body?: any,
    requireAuth = true
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      let headers = {};
      
      if (requireAuth) {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
          headers = { Authorization: idToken };
        }
      }
      
      let apiCall;
      switch (method) {
        case 'GET':
          apiCall = get({
            apiName: 'trainingApi',
            path,
            options: { headers }
          });
          break;
        case 'POST':
          apiCall = post({
            apiName: 'trainingApi',
            path,
            options: { 
              headers,
              body: body ? JSON.stringify(body) : undefined
            }
          });
          break;
        case 'PUT':
          apiCall = put({
            apiName: 'trainingApi',
            path,
            options: { 
              headers,
              body: body ? JSON.stringify(body) : undefined
            }
          });
          break;
      }
      
      const response = await apiCall.response;
      const responseData = await response.body.json();
      
      setData(responseData);
      onSuccess?.(responseData);
      
      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);
  
  const get = useCallback((path: string) => makeRequest('GET', path), [makeRequest]);
  const post = useCallback((path: string, body?: any) => makeRequest('POST', path, body), [makeRequest]);
  const put = useCallback((path: string, body?: any) => makeRequest('PUT', path, body), [makeRequest]);
  
  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    clearError: () => setError(null),
    clearData: () => setData(null),
  };
};
