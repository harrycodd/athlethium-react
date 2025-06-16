import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          setError('User not authenticated');
        }
      } catch (err) {
        setError('Error retrieving user information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserId();
  }, []);
  
  return { userId, loading, error };
};
