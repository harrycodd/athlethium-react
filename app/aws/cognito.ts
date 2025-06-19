import { Amplify } from "aws-amplify";
import { REGION, API_GATEWAY_URL, AUTH_CONFIG } from './config';

// Track if Cognito has been configured to avoid multiple initializations
let isConfigured = false;

// Configure Amplify auth
export const configureAuth = () => {
  // Skip if already configured to prevent excessive logging and potential issues
  if (isConfigured) {
    console.log('Auth already configured, skipping');
    return;
  }
  
  try {
    console.log('Configuring Cognito with:', {
      userPoolId: AUTH_CONFIG.userPoolId,
      userPoolClientId: AUTH_CONFIG.userPoolClientId,
      identityPoolId: AUTH_CONFIG.identityPoolId,
    });

    // Configure everything in a single call to avoid recursion issues
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: AUTH_CONFIG.userPoolId,
          userPoolClientId: AUTH_CONFIG.userPoolClientId,
          identityPoolId: AUTH_CONFIG.identityPoolId,
          loginWith: {
            email: true,
          },
          signUpVerificationMethod: "code",
          allowGuestAccess: true, // Allow guest access for API testing
        },
      },
      API: {
        REST: {
          trainingApi: {
            endpoint: API_GATEWAY_URL,
            region: REGION,
          },
        }
      }
    });
    
    isConfigured = true;
    console.log('Amplify configured successfully. API endpoint:', API_GATEWAY_URL);
  } catch (error) {
    console.error('Error configuring Amplify:', error);
    // Don't set isConfigured to true on error so we can retry later
  }
};

export default configureAuth;
