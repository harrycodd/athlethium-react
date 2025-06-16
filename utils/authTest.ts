/**
 * Authentication Test Utility
 * 
 * This file contains functions to test the auth flow, particularly the auto-login functionality.
 * It can be imported and used in development to verify that auth sessions persist correctly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { configureAuth } from '../app/aws/cognito';

/**
 * Test the current authentication state and provide detailed diagnostic info
 */
export const testAuthState = async (): Promise<{
  isLoggedIn: boolean;
  hasValidSession: boolean;
  hasStoredUserId: boolean;
  diagnostics: Record<string, any>;
}> => {
  // Ensure Cognito is properly configured
  configureAuth();
  
  const diagnostics: Record<string, any> = {};
  
  // Check AsyncStorage
  const storedUserId = await AsyncStorage.getItem('userId');
  const storedEmail = await AsyncStorage.getItem('userEmail');
  const storedTokenExpiry = await AsyncStorage.getItem('tokenExpiry');
  
  diagnostics.storedUserId = !!storedUserId;
  diagnostics.storedEmail = !!storedEmail;
  diagnostics.tokenExpiryStored = !!storedTokenExpiry;
  
  if (storedTokenExpiry) {
    const expiryTime = parseInt(storedTokenExpiry, 10);
    const now = Date.now();
    diagnostics.tokenExpired = now > expiryTime;
  }
  
  // Check Cognito session
  let hasValidSession = false;
  try {
    const session = await fetchAuthSession();
    hasValidSession = !!session?.tokens?.idToken;
    diagnostics.hasTokens = hasValidSession;
    diagnostics.tokenDetails = hasValidSession ? {
      issuedAt: new Date().toISOString(),
    } : null;
  } catch (error: any) {
    diagnostics.sessionError = {
      name: error.name,
      message: error.message,
    };
  }
  
  // Check current user
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
    diagnostics.hasCurrentUser = !!currentUser;
    if (currentUser) {
      diagnostics.userIdMatch = currentUser.userId === storedUserId;
    }
  } catch (error: any) {
    diagnostics.currentUserError = {
      name: error.name,
      message: error.message,
    };
  }
  
  // Final determination of logged-in state
  const isLoggedIn = !!currentUser && hasValidSession;
  const hasStoredUserId = !!storedUserId;
  
  return {
    isLoggedIn,
    hasValidSession,
    hasStoredUserId,
    diagnostics,
  };
};

/**
 * Force refresh the auth session
 */
export const refreshAuthSession = async (): Promise<boolean> => {
  try {
    // Ensure Cognito is configured
    configureAuth();
    
    // Try to refresh the session
    const session = await fetchAuthSession({ forceRefresh: true });
    return !!session?.tokens?.idToken;
  } catch (error) {
    console.error('Failed to refresh auth session:', error);
    return false;
  }
};

/**
 * Completely reset the authentication state
 */
export const resetAuth = async (): Promise<void> => {
  try {
    // Sign out from Cognito
    await signOut();
  } catch (error) {
    console.log('Error during sign out (may be expected if not signed in):', error);
  }
  
  // Clear all auth-related storage
  await AsyncStorage.multiRemove([
    'userId',
    'userEmail',
    'tokenExpiry'
  ]);
  
  console.log('Authentication state has been reset');
};
