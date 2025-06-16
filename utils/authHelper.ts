import { getCurrentUser } from 'aws-amplify/auth';
import { configureAuth } from '../app/aws/cognito';

/**
 * Simple function to check if a user is authenticated
 * Similar to ionViewCanEnter in Ionic
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    // Make sure auth is configured first
    configureAuth();
    
    // Try to get the current user - if this succeeds, user is authenticated
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.log('Auth check failed:', error);
    return false;
  }
}
