/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                LOADING SCREEN                                        ║
 * ║                                                                                      ║
 * ║ Initial loading screen that checks authentication status and routes users           ║
 * ║ to the appropriate screen based on their auth and registration status.              ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getThemedStyles } from '../styling';
import { checkAuthState } from '../utils/authHelpers';
import { configureAuth } from '../aws/cognito';

// ============================================================================
// INTERFACES
// ============================================================================

interface LoadingScreenProps {
  onAuthCheck: (isAuthenticated: boolean, isRegistered: boolean) => void;
  isDarkMode: boolean;
  setDarkMode?: (mode: 'light' | 'dark' | 'system') => void;
}

// ============================================================================
// LOADING SCREEN COMPONENT
// ============================================================================

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onAuthCheck, 
  isDarkMode, 
  setDarkMode 
}) => {
  
  // =====================================
  // NAVIGATION
  // =====================================
  
  const navigation = useNavigation<any>();
  
  // =====================================
  // STYLING
  // =====================================
  
  const styles = getThemedStyles(isDarkMode);
  
  // =====================================
  // AUTHENTICATION CHECK LOGIC
  // =====================================
  
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Configure AWS Amplify before checking authentication
        configureAuth();
        
        // Simulate loading time for splash effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check authentication state
        const authState = await checkAuthState();
        
        console.log('Auth state result:', authState);
        
        // Navigate based on authentication and registration status
        if (authState.isAuthenticated) {
          if (authState.needsRegistration) {
            // User is signed in but hasn't completed registration
            console.log('User authenticated but needs to complete registration');
            onAuthCheck(true, false);
          } else {
            // User is fully authenticated and registered - go to home
            console.log('User fully authenticated and registered - navigating to home');
            onAuthCheck(true, true);
          }
        } else {
          // User is not authenticated - go to login
          console.log('User not authenticated - navigating to login');
          onAuthCheck(false, false);
        }
        
      } catch (error) {
        console.error('Error during authentication check:', error);
        // Default to login screen on error
        onAuthCheck(false, false);
      }
    };

    checkAuthAndNavigate();
  }, [onAuthCheck, navigation]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  
  const backgroundColor = isDarkMode ? '#0F172A' : '#F1F5F9';
  const textColor = isDarkMode ? '#FFFFFF' : '#1E293B';
  const loadingColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <View 
      className={styles.layout.screenContainer}
      style={{ backgroundColor, flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      
      {/* ========================================
          APP LOGO SECTION
          ======================================== */}
      <View className="mb-8 shadow-lg">
        <Image
          source={require('../../assets/images/icon.png')}
          className="w-32 h-32 rounded-lg"
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default LoadingScreen;
