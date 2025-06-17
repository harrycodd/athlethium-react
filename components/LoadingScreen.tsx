import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  statusText?: string;
  isDarkMode?: boolean;
  onAuthCheck?: (isAuthenticated: boolean, isRegistered: boolean) => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Athlethium", 
  subtitle = "AI-Powered Training Platform",
  statusText = "Setting up your experience...",
  isDarkMode = false,
  onAuthCheck
}) => {
  console.log('LoadingScreen rendered with:', { message, subtitle, statusText, isDarkMode });
  
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Authentication check logic
  useEffect(() => {
    const checkAuthentication = async () => {
      // Add a minimum delay to show the loading screen
      const minLoadTime = 2000;
      const startTime = Date.now();
      
      try {
        console.log('LoadingScreen: Starting authentication check...');
        
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          console.log('LoadingScreen: User is authenticated, checking registration status...');
          
          try {
            const userDetails = await detailsApi.getUserDetails() as { signUpCompleted?: boolean; email: string };
            console.log('LoadingScreen: User details fetched:', userDetails);
            
            if (userDetails.signUpCompleted !== true) {
              // User is authenticated but not registered
              if (onAuthCheck) {
                // Wait for minimum load time before calling callback
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < minLoadTime) {
                  await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
                }
                onAuthCheck(true, false);
              } else {
                // Wait for minimum load time before navigation
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < minLoadTime) {
                  await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
                }
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'RegisterFlow', params: { email: userDetails.email || "", step: 3 } }],
                });
              }
            } else {
              // User is authenticated and registered
              if (onAuthCheck) {
                // Wait for minimum load time before calling callback
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < minLoadTime) {
                  await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
                }
                onAuthCheck(true, true);
              } else {
                // Wait for minimum load time before navigation
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < minLoadTime) {
                  await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
                }
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            }
          } catch (err) {
            console.error('LoadingScreen: Error fetching user details:', err);
            // If we can't fetch user details but user is authenticated, assume they're registered
            if (onAuthCheck) {
              // Wait for minimum load time before calling callback
              const elapsedTime = Date.now() - startTime;
              if (elapsedTime < minLoadTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
              }
              onAuthCheck(true, true);
            } else {
              const elapsedTime = Date.now() - startTime;
              if (elapsedTime < minLoadTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
              }
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          }
        } else {
          console.log('LoadingScreen: User is not authenticated, redirecting to login...');
          
          // User is not authenticated
          if (onAuthCheck) {
            // Wait for minimum load time before calling callback
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < minLoadTime) {
              await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
            }
            onAuthCheck(false, false);
          } else {
            // Wait for minimum load time before navigation
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < minLoadTime) {
              await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      } catch (error) {
        console.error('LoadingScreen: Error checking authentication:', error);
        
        if (onAuthCheck) {
          // Wait for minimum load time before calling callback
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < minLoadTime) {
            await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
          }
          onAuthCheck(false, false);
        } else {
          // On error, redirect to login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    };

    // Start authentication check after a brief delay to show the loading animation
    const timer = setTimeout(checkAuthentication, 1000);
    
    return () => clearTimeout(timer);
  }, [navigation, onAuthCheck]);

  useEffect(() => {
    // Fade in and scale animation for the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);
  
  return (
    <View 
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
      }}
    >
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        {/* App Name */}
        <Text style={{ 
          fontSize: 32, 
          fontWeight: '700',
          color: isDarkMode ? '#FFFFFF' : '#1F2937',
          marginBottom: 40,
          textAlign: 'center',
        }}>
          {message}
        </Text>

        {/* Loading Circle */}
        <ActivityIndicator 
          size="large" 
          color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
        />
      </Animated.View>
    </View>
  );
};

export default LoadingScreen;
