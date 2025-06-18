/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                  APP LAYOUT                                          ║
 * ║                                                                                      ║
 * ║ Main application layout with navigation setup, authentication flow,                 ║
 * ║ and subscription management integration.                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useContext, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen Imports
import HomeScreen from './screens/home';
import CalendarScreen from './screens/calendar';
import StatsScreen from './screens/stats';
import ChatScreen from './screens/chats';
import SettingsScreen from './screens/settings';
import LoginScreen from './screens/login';
import RegisterFlow from './screens/register';
import AddTrainingScreen from './screens/AddTraining';
import AnalysisScreen from './screens/analysis';
import SessionDetailsScreen from './screens/SessionDetails';
import LoadingScreen from './screens/LoadingScreen';

// Context and Provider Imports
import { DarkModeContext } from './context/DarkModeContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// ============================================================================
// NAVIGATION SETUP
// ============================================================================

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ============================================================================
// MAIN APP COMPONENT - TAB NAVIGATION
// ============================================================================

function MainApp() {
  const { darkMode } = useContext(DarkModeContext); // Use context for dark mode
  const systemColorScheme = useColorScheme();
  const isDarkMode = darkMode === 'dark' || (darkMode === 'system' && systemColorScheme === 'dark');
  const backgroundColor = isDarkMode ? '#0F172A' : '#F1F5F9'; // Changed to match chat screen background

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: backgroundColor,
          borderBottomWidth: 0, // Remove header border
          shadowOpacity: 0, // Remove iOS shadow
          elevation: 0, // Remove Android shadow
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: isDarkMode ? '#FFFFFF' : '#1E293B',
        },
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopWidth: 0, // Remove tab bar border
          shadowOpacity: 0, // Remove iOS shadow
          elevation: 0, // Remove Android shadow
        },
        tabBarActiveTintColor: isDarkMode ? '#0A84FF' : '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Calendar':
              iconName = 'calendar';
              break;
            case 'Stats':
              iconName = 'bar-chart';
              break;
            case 'Chat':
              iconName = 'chatbox-ellipses';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ============================================================================
// APP WITH SUBSCRIPTION - AUTHENTICATION & ROUTING LOGIC
// ============================================================================

// Component that handles subscription logic
function AppWithSubscription() {
  console.log('AppWithSubscription component initialized');
  
  // -------------------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------------------
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'system'>('system');
  const isDarkMode = darkMode === 'dark' || (darkMode === 'system' && systemColorScheme === 'dark');

  // -------------------------------------------------------------------------
  // DARK MODE INITIALIZATION
  // -------------------------------------------------------------------------
  //dark mode context to provide dark mode setting across the app
  useEffect(() => {
    const fetchDarkModeSetting = async () => {
      const storedMode = await AsyncStorage.getItem('darkMode');
      if (storedMode) {
        setDarkMode(storedMode as 'light' | 'dark' | 'system');
      }
    };
    fetchDarkModeSetting();
  }, []);

  // -------------------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // -------------------------------------------------------------------------
  // Handle authentication check result from LoadingScreen
  const handleAuthCheck = (isAuthenticated: boolean, isRegistered: boolean) => {
    console.log('Auth check result:', { isAuthenticated, isRegistered });
    setIsAuthenticated(isAuthenticated);
    setIsRegistered(isRegistered);
    setShowLoadingScreen(false);
  };

  // -------------------------------------------------------------------------
  // LOADING SCREEN LOGIC
  // -------------------------------------------------------------------------
  // Show loading screen initially
  if (showLoadingScreen) {
    console.log('Showing loading screen with auth check');
      
    return (
      <LoadingScreen 
        onAuthCheck={handleAuthCheck} 
        isDarkMode={isDarkMode} 
        setDarkMode={setDarkMode} 
      />
    );
  }

  // -------------------------------------------------------------------------
  // ROUTE DETERMINATION
  // -------------------------------------------------------------------------
  // Determine the initial route based on authentication status
  let initialRouteName = "Login"; // Default to login
  if (isAuthenticated && isRegistered) {
    initialRouteName = "MainTabs";
  } else if (isAuthenticated && !isRegistered) {
    initialRouteName = "RegisterFlow";
  }

  console.log('Setting initial route to:', initialRouteName, { isAuthenticated, isRegistered });

  // -------------------------------------------------------------------------
  // NAVIGATION STACK SETUP
  // -------------------------------------------------------------------------
  // After loading screen is dismissed, show the full navigation stack
  // The LoadingScreen will handle initial routing to the appropriate screen
  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false, // Disable swipe to go back gesture
        }} 
        initialRouteName={initialRouteName}
      >
        {/* ===== AUTHENTICATION SCREENS ===== */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterFlow" component={RegisterFlow} initialParams={{email: "", step: 3}} />
        
        {/* ===== MAIN APP SCREENS ===== */}
        <Stack.Screen name="MainTabs" component={MainApp} />
        <Stack.Screen name="AddTraining" component={AddTrainingScreen} />
        <Stack.Screen name="analysis" component={AnalysisScreen} />
        <Stack.Screen name="SessionDetails" component={SessionDetailsScreen} />
      </Stack.Navigator>
    </DarkModeContext.Provider>
  );
}

// ============================================================================
// MAIN APP COMPONENT - ROOT ENTRY POINT
// ============================================================================

export default function App() {
  // -------------------------------------------------------------------------
  // REVENUCAT CONFIGURATION
  // -------------------------------------------------------------------------
  // Configure RevenueCat when the component mounts
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === 'ios') {
      Purchases.configure({apiKey: "appl_hVkbAGbVpiaIyEPyXHYScRfjWxe"});
    } else if (Platform.OS === 'android') {
      Purchases.configure({apiKey: "goog_HafNWKciJMlpuaIsAFQKTYdYuYl"});
    }
  }, []);

  // -------------------------------------------------------------------------
  // COGNITO CONFIGURATION
  // -------------------------------------------------------------------------
  // Configure Cognito when the component mounts
  useEffect(() => {
    // Import and configure auth when app starts
    import('./aws/cognito').then(({ configureAuth }) => {
      configureAuth();
    }).catch(error => {
      console.error('Failed to configure auth:', error);
    });
  }, []);

  // -------------------------------------------------------------------------
  // APP RENDER
  // -------------------------------------------------------------------------
  return (
    <SubscriptionProvider>
      <AppWithSubscription />
    </SubscriptionProvider>
  );
}
