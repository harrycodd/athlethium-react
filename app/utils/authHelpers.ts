/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                              AUTHENTICATION HELPERS                                  ║
 * ║                                                                                      ║
 * ║ Authentication state management using AWS Amplify. Properly validates               ║
 * ║ authentication state with AWS Cognito instead of relying on local storage.         ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { detailsApi } from '../api_calls/detailsApi';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  needsRegistration: boolean;
  userEmail?: string;
  error?: string;
}

// ============================================================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================================================

/**
 * Check if user is authenticated and determine next route
 * Uses AWS Amplify to validate authentication state with Cognito
 */
export async function checkAuthState(): Promise<AuthState> {
  try {
    console.log('Checking authentication state with AWS Amplify...');
    
    // Check authentication with AWS Amplify/Cognito
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return { 
        isAuthenticated: false, 
        needsRegistration: false 
      };
    }
    
    console.log('User authenticated with Cognito:', {
      userId: user.userId,
      username: user.username
    });
    
    // Check if user has completed registration by fetching user details
    try {
      const userDetails = await detailsApi.getUserDetails();
      
      if (userDetails && userDetails.signUpCompleted) {
        console.log('User authenticated and registration complete');
        return {
          isAuthenticated: true,
          needsRegistration: false,
          userEmail: user.username,
        };
      } else {
        console.log('User authenticated but registration incomplete');
        return {
          isAuthenticated: true,
          needsRegistration: true,
          userEmail: user.username,
        };
      }
    } catch (detailsError) {
      console.log('Error fetching user details, assuming registration incomplete:', detailsError);
      return {
        isAuthenticated: true,
        needsRegistration: true,
        userEmail: user.username,
      };
    }
    
  } catch (error: any) {
    console.log('User not authenticated with Amplify:', error.message);
    
    return { 
      isAuthenticated: false, 
      needsRegistration: false,
      error: error.message,
    };
  }
}

/**
 * Simple function to check if a user is authenticated using AWS Amplify
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.log('User not authenticated:', error);
    return false;
  }
}

/**
 * Set user as authenticated - stores minimal data locally for convenience
 * Primary authentication state is managed by AWS Amplify
 */
export async function setUserAuthenticated(userId: string, email: string, registrationComplete: boolean = false): Promise<void> {
  try {
    // Store minimal data locally for convenience (not used for auth validation)
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('registrationComplete', registrationComplete.toString());
    console.log('User authentication convenience data saved:', { email, registrationComplete });
  } catch (error) {
    console.error('Error saving auth convenience data:', error);
  }
}

/**
 * Mark registration as complete
 */
export async function markRegistrationComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem('registrationComplete', 'true');
    console.log('Registration marked as complete');
  } catch (error) {
    console.error('Error marking registration complete:', error);
  }
}

/**
 * Clear all local storage data (used alongside AWS Amplify signOut)
 */
export async function clearAuthState(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(['userEmail', 'registrationComplete']);
    console.log('Local auth convenience data cleared');
  } catch (error) {
    console.error('Error clearing local auth data:', error);
  }
}

/**
 * Get auth token for API calls using AWS Amplify
 */
export async function getAuthToken(): Promise<string | undefined> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return undefined;
    }
    
    // AWS Amplify handles token management automatically for API calls
    // This function is kept for compatibility but tokens are managed by Amplify
    return `amplify-managed-${user.userId}`;
  } catch (error) {
    console.log('Error getting user for token:', error);
    return undefined;
  }
}
