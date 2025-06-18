/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                              AUTHENTICATION HELPERS                                  ║
 * ║                                                                                      ║
 * ║ Authentication state management, auto-login checking, and navigation routing        ║
 * ║ based on auth status. Uses mock authentication for development.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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
 * Uses AsyncStorage to simulate authentication state
 */
export async function checkAuthState(): Promise<AuthState> {
  try {
    console.log('Checking authentication state...');
    
    // Check if user has authentication data stored
    const userId = await AsyncStorage.getItem('userId');
    const userEmail = await AsyncStorage.getItem('userEmail');
    const isRegistrationComplete = await AsyncStorage.getItem('registrationComplete');
    
    console.log('Auth data from storage:', { userId, userEmail, isRegistrationComplete });
    
    // If no userId, user is not authenticated
    if (!userId) {
      console.log('No userId found - user not authenticated');
      return { 
        isAuthenticated: false, 
        needsRegistration: false 
      };
    }
    
    // User has authentication data
    if (isRegistrationComplete === 'true') {
      // User is fully authenticated and registered
      console.log('User authenticated and registration complete');
      return {
        isAuthenticated: true,
        needsRegistration: false,
        userEmail: userEmail || undefined,
      };
    } else {
      // User is authenticated but hasn't completed registration
      console.log('User authenticated but registration incomplete');
      return {
        isAuthenticated: true,
        needsRegistration: true,
        userEmail: userEmail || undefined,
      };
    }
    
  } catch (error: any) {
    console.error('Error checking auth state:', error);
    
    // Clear any corrupted auth data
    await AsyncStorage.multiRemove(['userId', 'userEmail', 'registrationComplete']);
    
    return { 
      isAuthenticated: false, 
      needsRegistration: false,
      error: error.message,
    };
  }
}

/**
 * Simple function to check if a user is authenticated (without details check)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return !!userId;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

/**
 * Set user as authenticated
 */
export async function setUserAuthenticated(userId: string, email: string, registrationComplete: boolean = false): Promise<void> {
  try {
    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('registrationComplete', registrationComplete.toString());
    console.log('User authentication state saved:', { userId, email, registrationComplete });
  } catch (error) {
    console.error('Error saving auth state:', error);
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
 * Clear all authentication data (logout)
 */
export async function clearAuthState(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(['userId', 'userEmail', 'registrationComplete']);
    console.log('Authentication state cleared');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}

/**
 * Get auth token for API calls (mock implementation)
 */
export async function getAuthToken(): Promise<string | undefined> {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return userId ? `mock-token-${userId}` : undefined;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
}
