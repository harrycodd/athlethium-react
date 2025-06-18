/*
================================================================================
                             SETTINGS SCREEN
================================================================================
This screen provides a comprehensive settings interface for the training app,
allowing users to configure their profile, training preferences, notifications,
and app behavior. The screen is organized into several main sections:

- User Profile Settings (name, email, units, goals)
- Training Configuration (schedule, activities, focus areas)
- Notification Preferences (uploads, training reminders, chat)
- App Settings (dark mode, integrations)
- Account Management (subscription, sign out, delete account)

The screen maintains local state for all settings and synchronizes with
backend services as needed.
================================================================================
*/

// =============================================================================
//                                IMPORTS
// =============================================================================
import "../../global.css";
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, ScrollView, Modal, Platform, Image, Alert, Linking } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkModeContext } from '../context/DarkModeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkMode } from '../hooks/commonHooks';
import { getContainerStyle, getTextStyle, getInputStyle, getButtonStyle, getCardStyle, getPlaceholderColor, getErrorMessage } from '../utils/commonUtils';
import { getThemedStyles } from '../styling';
import { 
  signOut, 
  deleteUser, 
  updateUserAttribute, 
  confirmUserAttribute, 
  detailsApi, 
  trainingApi, 
  makeAuthenticatedApiCall,
  type UpdateUserAttributeOutput,
  type ConfirmUserAttributeInput 
} from '../utils/mockHelpers';

// =============================================================================
//                                TYPES
// =============================================================================
type MainFocusKey = 'swimming' | 'cycling' | 'running';

// =============================================================================
//                            MAIN COMPONENT
// =============================================================================
const SettingsScreen = () => {
  // -------------------------------------------------------------------------
  //                          HOOKS & CONTEXT
  // -------------------------------------------------------------------------
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { customerInfo, isSubscribed, isPremium, refreshSubscriptionStatus } = useSubscription();
  
  // Dark mode selection state
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'system'>(isDarkMode ? 'dark' : 'light');
  
  // -------------------------------------------------------------------------
  //                      NOTIFICATION SETTINGS STATE
  // -------------------------------------------------------------------------
  const [uploadNotif, setUploadNotif] = useState(true);
  const [dailyTrainingNotif, setDailyTrainingNotif] = useState(true);
  
  // Chat settings
  const [chatHistoryEnabled, setChatHistoryEnabled] = useState(true);
  const [chatMemoryEnabled, setChatMemoryEnabled] = useState(true);
  
  // -------------------------------------------------------------------------
  //                      TRAINING SETTINGS STATE
  // -------------------------------------------------------------------------
  const [schedule, setSchedule] = useState(Array(7).fill({ hours: '' }));
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(null);
  const [mainFocus, setMainFocus] = useState<Record<MainFocusKey, boolean>>({ swimming: false, cycling: false, running: false });
  const [activities, setActivities] = useState({
    running: true,
    swimming: true,
    cycling: true,
    yoga: true,
    strength: true,
  });
  const [intervalType, setIntervalType] = useState('mix');
  
  // -------------------------------------------------------------------------
  //                          MODAL & UI STATE
  // -------------------------------------------------------------------------
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isChangeEmailModalVisible, setIsChangeEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [emailStep, setEmailStep] = useState(1);

  // -------------------------------------------------------------------------
  //                          USER DATA STATE
  // -------------------------------------------------------------------------
  // Details state for user profile
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Track previous details for change detection
  const [prevDetails, setPrevDetails] = useState<any>(null);

  // -------------------------------------------------------------------------
  //                          SAVE STATE MANAGEMENT
  // -------------------------------------------------------------------------
  // Manual save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialSettings, setInitialSettings] = useState<any>(null);

  // Target hours for the entire week (single value)
  const [targetHours, setTargetHours] = useState('7'); // Default to 7 hours/week

  // Name
  const [name, setName] = useState('');
  // Units (Metric/Imperial)
  const [units, setUnits] = useState<'Metric' | 'Imperial'>('Metric');
  // Schedule Days Ahead
  const [scheduleDaysAhead, setScheduleDaysAhead] = useState(1); // Default to 1 day ahead
  // Multi-select for intervalType
  const intervalTypeOptions = [
    { type: 'mix', label: 'Mix' },
    { type: 'structured', label: 'Structured' },
    { type: 'non structured', label: 'Non Structured' },
    { type: 'none', label: 'None' },
  ];

  // API integrations state
  const [stravaWorkoutUpload, setStravaWorkoutUpload] = useState(false);
  const [garminWorkoutUpload, setGarminWorkoutUpload] = useState(false);
  const [garminScheduledWorkouts, setGarminScheduledWorkouts] = useState(false);
  const [wahooWorkoutUpload, setWahooWorkoutUpload] = useState(false);
  const [wahooScheduledWorkouts, setWahooScheduledWorkouts] = useState(false);

  // Section collapse state - all sections collapsed by default
  // -------------------------------------------------------------------------
  //                          UI COLLAPSE STATE
  // -------------------------------------------------------------------------
  const [isGeneralCollapsed, setIsGeneralCollapsed] = useState(true);
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(true);
  const [isSubscriptionCollapsed, setIsSubscriptionCollapsed] = useState(true);
  const [isTrainingCollapsed, setIsTrainingCollapsed] = useState(true);
  const [isTrainingScheduleCollapsed, setIsTrainingScheduleCollapsed] = useState(true);
  const [isTrainingActionsCollapsed, setIsTrainingActionsCollapsed] = useState(true);
  const [isApiIntegrationsCollapsed, setIsApiIntegrationsCollapsed] = useState(true);
  const [isAccountSettingsCollapsed, setIsAccountSettingsCollapsed] = useState(true);

  // -------------------------------------------------------------------------
  //                              CONSTANTS
  // -------------------------------------------------------------------------
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // -------------------------------------------------------------------------
  //                          MODAL HANDLERS
  // -------------------------------------------------------------------------
  const openModal = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedDay(null);
    setIsModalVisible(false);
  };

  const openDeleteModal = () => {
    setIsDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setEmail('');
    setVerificationCode('');
  };

  const openChangeEmailModal = () => {
    setIsChangeEmailModalVisible(true);
    setEmailStep(1);
    setNewEmail('');
    setEmailVerificationCode('');
  };

  const closeChangeEmailModal = () => {
    setIsChangeEmailModalVisible(false);
    setNewEmail('');
    setEmailVerificationCode('');
  };

  // -------------------------------------------------------------------------
  //                        USER ATTRIBUTE HANDLERS
  // -------------------------------------------------------------------------
  const handleChangeAttribute = async (attributeKey: string, value: string) => {
    try {
      const output = await updateUserAttribute({
        userAttribute: {
          attributeKey,
          value,
        },
      });
      handleUpdateUserAttributeNextSteps(output);
    } catch (error) {
      console.log('Error changing attribute:', error);
      alert('Failed to change attribute. Please try again.');
    }
  };

  function handleUpdateUserAttributeNextSteps(output: UpdateUserAttributeOutput) {
    const { nextStep } = output;

    switch (nextStep.updateAttributeStep) {
      case 'CONFIRM_ATTRIBUTE_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(`Confirmation code was sent to ${codeDeliveryDetails?.deliveryMedium}.`);
        // Collect the confirmation code from the user and pass to confirmUserAttribute.
        break;
      case 'DONE':
        console.log(`attribute was successfully updated.`);
        break;
    }
  }

  const handleSendEmailVerification = async () => {
    try {
      await handleChangeAttribute('email', newEmail);
      console.log('Verification code sent to:', newEmail);
      setEmailStep(2);
    } catch (error) {
      console.log('Error sending verification code:', error);
      alert('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyEmailCode = async () => {
    try {
      await handleConfirmUserAttribute({
        userAttributeKey: 'email',
        confirmationCode: emailVerificationCode,
      });
      alert('Email verified successfully!');
      closeChangeEmailModal();
    } catch (error) {
      console.log('Error verifying email code:', error);
      alert('Failed to verify email. Please try again.');
    }
  };

  async function handleConfirmUserAttribute({
    userAttributeKey,
    confirmationCode,
  }: ConfirmUserAttributeInput) {
    try {
      await confirmUserAttribute({ userAttributeKey, confirmationCode });
    } catch (error) {
      console.log(error);
    }
  }

  const handleDarkModeChange = async (mode: 'light' | 'dark' | 'system') => {
    setDarkMode(mode);
    await AsyncStorage.setItem('darkMode', mode);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      closeDeleteModal();
      await deleteUser();
      // Logic to delete the account
      console.log('Account deleted');
      navigation.navigate('Login'); // Navigate back to the login page
    } catch (error) {
      console.log('Error deleting account:', error);
    }
  };

  // Ensure at least one main focus is selected and sync with activities
  const handleMainFocusToggle = (focus: MainFocusKey) => {
    // If toggling off and only one is selected, prevent it
    const selectedCount = Object.values(mainFocus).filter(Boolean).length;
    if (mainFocus[focus] && selectedCount === 1) return; // Prevent deselecting last
    const updated = { ...mainFocus, [focus]: !mainFocus[focus] };
    setMainFocus(updated);
    // If toggled on, ensure it's also in activities
    if (!mainFocus[focus]) {
      setActivities((prev) => ({ ...prev, [focus]: true }));
    }
  };

  // When toggling activities, prevent deselecting if it's a selected main focus
  const handleActivityToggle = (key: string) => {
    if (mainFocus[key as MainFocusKey]) return; // Prevent turning off if main focus
    setActivities((prev) => ({ ...prev, [key]: !prev[key as keyof typeof activities] }));
  };

  // Handle Strava authorization
  const handleStravaAuthorization = async () => {
    try {
      console.log('Starting Strava authorization...');
      
      // Get the authorization URL from the backend
      const response = await makeAuthenticatedApiCall({
        method: 'GET',
        path: '/auth/strava/authorize'
      });
      
      const responseData = await response.body.json() as { authorization_url?: string };
      console.log('Strava auth response:', responseData);
      
      if (responseData?.authorization_url) {
        // Open the Strava authorization URL
        const canOpen = await Linking.canOpenURL(responseData.authorization_url);
        if (canOpen) {
          await Linking.openURL(responseData.authorization_url);
        } else {
          Alert.alert(
            'Cannot Open URL',
            'Unable to open Strava authorization page. Please try again later.'
          );
        }
      } else {
        Alert.alert(
          'Authorization Error',
          'Unable to get Strava authorization URL. Please try again later.'
        );
      }
    } catch (error) {
      console.error('Error during Strava authorization:', error);
      Alert.alert(
        'Authorization Failed',
        'Failed to start Strava authorization. Please check your connection and try again.'
      );
    }
  };

  // Fetch userId and details on mount
  useEffect(() => {
    const fetchUserIdAndDetails = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('[details] Got userId from AsyncStorage:', storedUserId);
        if (storedUserId) {
          setUserId(storedUserId);
          setDetailsLoading(true);
          console.log('[details] GET /details/get');
          const data = await detailsApi.getUserDetails();
          console.log('[details] API response:', data);
          
          // Type-safe handling of API response
          const apiData = data as any;
          
          if (apiData && typeof apiData === 'object') {
            // Map API fields to settings state with type safety
            setUploadNotif(!!apiData.uploadNotif);
            setDailyTrainingNotif(!!apiData.dailyTrainingNotif);
            
            // Chat settings
            setChatHistoryEnabled(apiData.chatHistoryEnabled !== undefined ? !!apiData.chatHistoryEnabled : true);
            setChatMemoryEnabled(apiData.chatMemoryEnabled !== undefined ? !!apiData.chatMemoryEnabled : true);
            
            // API integrations
            setStravaWorkoutUpload(!!apiData.stravaWorkoutUpload);
            setGarminWorkoutUpload(!!apiData.garminWorkoutUpload);
            setGarminScheduledWorkouts(!!apiData.garminScheduledWorkouts);
            setWahooWorkoutUpload(!!apiData.wahooWorkoutUpload);
            setWahooScheduledWorkouts(!!apiData.wahooScheduledWorkouts);
            
            // Set main focus explicitly from API (use lowercase to match API)
            setMainFocus({
              swimming: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('swimming'),
              cycling: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('cycling'),
              running: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('running'),
            });
            
            // Set activities explicitly from API (use lowercase to match API)
            setActivities({
              running: Array.isArray(apiData.sports) && apiData.sports.includes('running'),
              swimming: Array.isArray(apiData.sports) && apiData.sports.includes('swimming'),
              cycling: Array.isArray(apiData.sports) && apiData.sports.includes('cycling'),
              yoga: Array.isArray(apiData.sports) && apiData.sports.includes('yoga'),
              strength: Array.isArray(apiData.sports) && apiData.sports.includes('strength'),
            });
            
            setSchedule(
              Array.isArray(apiData.defaultSchedule)
                ? apiData.defaultSchedule.map((h: number) => ({ hours: h ? String(h) : '' }))
                : Array(7).fill({ hours: '' })
            );
            
            if (typeof apiData.weeklyHours === 'number') {
              setTargetHours(String(apiData.weeklyHours));
            }
            
            setName(apiData.name || '');
            setUnits(apiData.units === 'Imperial' ? 'Imperial' : 'Metric');
            
            // Defensive: intervalType can be string, array, or undefined
            let intervalTypeValue = 'mix';
            if (Array.isArray(apiData.intervalType) && apiData.intervalType.length > 0) {
              intervalTypeValue = apiData.intervalType[0].toLowerCase();
            } else if (typeof apiData.intervalType === 'string') {
              intervalTypeValue = apiData.intervalType.toLowerCase();
            }
            setIntervalType(intervalTypeValue);
            setScheduleDaysAhead(apiData.daysAhead ?? 1); // Set from API
            
            // Store initial settings for change detection
            const loadedSettings = {
              uploadNotif: !!apiData.uploadNotif,
              dailyTrainingNotif: !!apiData.dailyTrainingNotif,
              chatHistoryEnabled: apiData.chatHistoryEnabled !== undefined ? !!apiData.chatHistoryEnabled : true,
              chatMemoryEnabled: apiData.chatMemoryEnabled !== undefined ? !!apiData.chatMemoryEnabled : true,
              stravaWorkoutUpload: !!apiData.stravaWorkoutUpload,
              garminWorkoutUpload: !!apiData.garminWorkoutUpload,
              garminScheduledWorkouts: !!apiData.garminScheduledWorkouts,
              wahooWorkoutUpload: !!apiData.wahooWorkoutUpload,
              wahooScheduledWorkouts: !!apiData.wahooScheduledWorkouts,
              intervalType: intervalTypeValue,
              focusedSports: Array.isArray(apiData.focusedSports) ? apiData.focusedSports.filter((sport: string) => 
                ['swimming', 'cycling', 'running'].includes(sport)
              ) : [],
              sports: Array.isArray(apiData.sports) ? apiData.sports.filter((sport: string) => 
                ['running', 'swimming', 'cycling', 'yoga', 'strength'].includes(sport)
              ) : [],
              defaultSchedule: Array.isArray(apiData.defaultSchedule) 
                ? apiData.defaultSchedule.map((h: number) => h || 0)
                : Array(7).fill(0),
              name: apiData.name || '',

              units: apiData.units === 'Imperial' ? 'Imperial' : 'Metric',
              daysAhead: apiData.daysAhead ?? 1
            };
            setInitialSettings(loadedSettings);
          }
          setDetailsError(null);
        } else {
          setDetailsError('User not authenticated');
        }
      } catch (err) {
        console.error('[details] Error loading details:', err);
        setDetailsError('Could not load details');
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchUserIdAndDetails();
  }, []);

  useEffect(() => {
    // If the schedule is not set or is empty, set all days to 1 hour
    if (schedule.every((d) => !d.hours || d.hours === '')) {
      setSchedule(Array(7).fill({ hours: '1' }));
    }
  }, []);

  // Refresh functionality
  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const apiData = await detailsApi.getUserDetails() as Record<string, any>;
      
      // Type-safe handling of API response
      if (apiData && typeof apiData === 'object' && !Array.isArray(apiData)) {
        // Update state with fresh data using the same logic as the initial fetch
        setUploadNotif(!!apiData.uploadNotif);
        setDailyTrainingNotif(!!apiData.dailyTrainingNotif);
        
        // Chat settings
        setChatHistoryEnabled(apiData.chatHistoryEnabled !== undefined ? !!apiData.chatHistoryEnabled : true);
        setChatMemoryEnabled(apiData.chatMemoryEnabled !== undefined ? !!apiData.chatMemoryEnabled : true);
        
        // API integrations
        setStravaWorkoutUpload(!!apiData.stravaWorkoutUpload);
        setGarminWorkoutUpload(!!apiData.garminWorkoutUpload);
        setGarminScheduledWorkouts(!!apiData.garminScheduledWorkouts);
        setWahooWorkoutUpload(!!apiData.wahooWorkoutUpload);
        setWahooScheduledWorkouts(!!apiData.wahooScheduledWorkouts);
        
        // Set main focus explicitly from API
        setMainFocus({
          swimming: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('swimming'),
          cycling: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('cycling'),
          running: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('running'),
        });
        
        // Set activities explicitly from API
        setActivities({
          running: Array.isArray(apiData.sports) && apiData.sports.includes('running'),
          swimming: Array.isArray(apiData.sports) && apiData.sports.includes('swimming'),
          cycling: Array.isArray(apiData.sports) && apiData.sports.includes('cycling'),
          yoga: Array.isArray(apiData.sports) && apiData.sports.includes('yoga'),
          strength: Array.isArray(apiData.sports) && apiData.sports.includes('strength'),
        });
        
        setSchedule(
          Array.isArray(apiData.defaultSchedule)
            ? apiData.defaultSchedule.map((h: number) => ({ hours: h ? String(h) : '' }))
            : Array(7).fill({ hours: '' })
        );
        
        if (typeof apiData.weeklyHours === 'number') {
          setTargetHours(String(apiData.weeklyHours));
        }
        
        setName(apiData.name || '');
        setUnits(apiData.units === 'Imperial' ? 'Imperial' : 'Metric');
        
        // Handle intervalType
        let intervalTypeValue = 'mix';
        if (Array.isArray(apiData.intervalType) && apiData.intervalType.length > 0) {
          intervalTypeValue = apiData.intervalType[0].toLowerCase();
        } else if (typeof apiData.intervalType === 'string') {
          intervalTypeValue = apiData.intervalType.toLowerCase();
        }
        setIntervalType(intervalTypeValue);
        setScheduleDaysAhead(apiData.daysAhead ?? 1);
        
        // Update initial settings after refresh
        const refreshedSettings = {
          uploadNotif: !!apiData.uploadNotif,
          dailyTrainingNotif: !!apiData.dailyTrainingNotif,
          chatHistoryEnabled: apiData.chatHistoryEnabled !== undefined ? !!apiData.chatHistoryEnabled : true,
          chatMemoryEnabled: apiData.chatMemoryEnabled !== undefined ? !!apiData.chatMemoryEnabled : true,
          stravaWorkoutUpload: !!apiData.stravaWorkoutUpload,
          garminWorkoutUpload: !!apiData.garminWorkoutUpload,
          garminScheduledWorkouts: !!apiData.garminScheduledWorkouts,
          wahooWorkoutUpload: !!apiData.wahooWorkoutUpload,
          wahooScheduledWorkouts: !!apiData.wahooScheduledWorkouts,
          intervalType: intervalTypeValue,
          focusedSports: Array.isArray(apiData.focusedSports) ? apiData.focusedSports.filter((sport: string) => 
            ['swimming', 'cycling', 'running'].includes(sport)
          ) : [],
          sports: Array.isArray(apiData.sports) ? apiData.sports.filter((sport: string) => 
            ['running', 'swimming', 'cycling', 'yoga', 'strength'].includes(sport)
          ) : [],
          defaultSchedule: Array.isArray(apiData.defaultSchedule) 
            ? apiData.defaultSchedule.map((h: number) => h || 0)
            : Array(7).fill(0),
          name: apiData.name || '',
          units: apiData.units === 'Imperial' ? 'Imperial' : 'Metric',
          daysAhead: apiData.daysAhead ?? 1
        };
        setInitialSettings(refreshedSettings);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Helper to get changed fields for details PUT
  const getChangedDetails = (current: any, prev: any) => {
    const changed: any = {};
    if (!prev) return current;
    for (const key in current) {
      if (current[key] !== prev[key]) changed[key] = current[key];
    }
    return changed;
  };

  // Check if current settings differ from initial settings
  const checkForUnsavedChanges = () => {
    if (!initialSettings) return false;
    
    const currentSettings = {
      uploadNotif,
      dailyTrainingNotif,
      chatHistoryEnabled,
      chatMemoryEnabled,
      stravaWorkoutUpload,
      garminWorkoutUpload,
      garminScheduledWorkouts,
      wahooWorkoutUpload,
      wahooScheduledWorkouts,
      intervalType,
      focusedSports: Object.keys(mainFocus).filter((k) => mainFocus[k as MainFocusKey]),
      sports: Object.keys(activities).filter((k) => activities[k as keyof typeof activities]),
      defaultSchedule: schedule.map((d) => {
        const value = parseFloat(d.hours || '0');
        return isNaN(value) ? 0 : Math.round(value * 2) / 2; // Ensure proper 0.5 step precision
      }),
      name,
      units,
      daysAhead: scheduleDaysAhead
    };
    
    return JSON.stringify(currentSettings) !== JSON.stringify(initialSettings);
  };

  // Update unsaved changes status whenever settings change
  useEffect(() => {
    const hasChanges = checkForUnsavedChanges();
    setHasUnsavedChanges(hasChanges);
    if (hasChanges) {
      setSaveSuccess(false);
      setSaveError(null);
    }
  }, [uploadNotif, dailyTrainingNotif, chatHistoryEnabled, chatMemoryEnabled, stravaWorkoutUpload, garminWorkoutUpload, garminScheduledWorkouts, wahooWorkoutUpload, wahooScheduledWorkouts, intervalType, mainFocus, activities, schedule, name, units, scheduleDaysAhead, initialSettings]);

  // Handler to update details (PUT only changed fields)
  const saveDetails = async (updatedFields: any) => {
    if (!userId) return;
    setDetailsLoading(true);
    try {
      console.log('[details] PUT /details/update', updatedFields);
      await detailsApi.updateUserDetails(updatedFields);
      setDetailsError(null);
    } catch (err) {
      console.error('[details] Error updating details:', err);
      setDetailsError('Could not update details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Manual save function
  const handleManualSave = async () => {
    if (!userId || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const update: any = {};
      update.uploadNotif = uploadNotif;
      update.dailyTrainingNotif = dailyTrainingNotif;
      update.chatHistoryEnabled = chatHistoryEnabled;
      update.chatMemoryEnabled = chatMemoryEnabled;
      update.stravaWorkoutUpload = stravaWorkoutUpload;
      update.garminWorkoutUpload = garminWorkoutUpload;
      update.garminScheduledWorkouts = garminScheduledWorkouts;
      update.wahooWorkoutUpload = wahooWorkoutUpload;
      update.wahooScheduledWorkouts = wahooScheduledWorkouts;
      update.intervalType = intervalType;
      update.focusedSports = Object.keys(mainFocus).filter((k) => mainFocus[k as MainFocusKey]);
      update.sports = Object.keys(activities).filter((k) => activities[k as keyof typeof activities]);
      update.defaultSchedule = schedule.map((d) => {
        const value = parseFloat(d.hours || '0');
        const processed = isNaN(value) ? 0 : Math.round(value * 2) / 2; // Ensure proper 0.5 step precision
        console.log(`[settings] Converting schedule hours: "${d.hours}" -> ${processed}`);
        return processed;
      });
      update.name = name;
      update.units = units;
      update.daysAhead = scheduleDaysAhead;
      
      console.log('[manual-save] PUT /details/update', update);
      await detailsApi.updateUserDetails(update);
      
      // Update initial settings to current values
      setInitialSettings({
        uploadNotif,
        dailyTrainingNotif,
        chatHistoryEnabled,
        chatMemoryEnabled,
        stravaWorkoutUpload,
        garminWorkoutUpload,
        garminScheduledWorkouts,
        wahooWorkoutUpload,
        wahooScheduledWorkouts,
        intervalType,
        focusedSports: Object.keys(mainFocus).filter((k) => mainFocus[k as MainFocusKey]),
        sports: Object.keys(activities).filter((k) => activities[k as keyof typeof activities]),
        defaultSchedule: schedule.map((d) => {
          const value = parseFloat(d.hours || '0');
          return isNaN(value) ? 0 : Math.round(value * 2) / 2; // Ensure proper 0.5 step precision
        }),
        name,
        units,
        daysAhead: scheduleDaysAhead
      });
      
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error('[manual-save] Error saving settings:', err);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const data = await detailsApi.getUserDetails();
      
      // Update all state from fetched data with type safety
      const apiData = data as Record<string, any>;
      
      if (apiData && typeof apiData === 'object' && !Array.isArray(apiData)) {
        setName(apiData.name || '');
        setUnits(apiData.units === 'Imperial' ? 'Imperial' : 'Metric');
        setScheduleDaysAhead(apiData.daysAhead ?? 1);
        
        // Chat settings
        setChatHistoryEnabled(apiData.chatHistoryEnabled !== undefined ? !!apiData.chatHistoryEnabled : true);
        setChatMemoryEnabled(apiData.chatMemoryEnabled !== undefined ? !!apiData.chatMemoryEnabled : true);
        
        // Set main focus explicitly from API
        setMainFocus({
          swimming: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('swimming'),
          cycling: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('cycling'),
          running: Array.isArray(apiData.focusedSports) && apiData.focusedSports.includes('running'),
        });
        
        // Set activities explicitly from API
        setActivities({
          running: Array.isArray(apiData.sports) && apiData.sports.includes('running'),
          swimming: Array.isArray(apiData.sports) && apiData.sports.includes('swimming'),
          cycling: Array.isArray(apiData.sports) && apiData.sports.includes('cycling'),
          yoga: Array.isArray(apiData.sports) && apiData.sports.includes('yoga'),
          strength: Array.isArray(apiData.sports) && apiData.sports.includes('strength'),
        });
        
        // Handle intervalType
        let intervalTypeValue = 'mix';
        if (Array.isArray(apiData.intervalType) && apiData.intervalType.length > 0) {
          intervalTypeValue = apiData.intervalType[0].toLowerCase();
        } else if (typeof apiData.intervalType === 'string') {
          intervalTypeValue = apiData.intervalType.toLowerCase();
        }
        setIntervalType(intervalTypeValue);
        
        if (typeof apiData.weeklyHours === 'number') {
          setTargetHours(String(apiData.weeklyHours));
        }
        setUploadNotif(!!apiData.uploadNotif);
        setDailyTrainingNotif(!!apiData.dailyTrainingNotif);
        
        // Store initial settings for fetchUserDetails too
        const fetchedSettings = {
          uploadNotif: !!apiData.uploadNotif,
          dailyTrainingNotif: !!apiData.dailyTrainingNotif,
          chatHistoryEnabled: apiData.chatHistoryEnabled !== undefined ? !!apiData.chatHistoryEnabled : true,
          chatMemoryEnabled: apiData.chatMemoryEnabled !== undefined ? !!apiData.chatMemoryEnabled : true,
          intervalType: intervalTypeValue,
          focusedSports: Array.isArray(apiData.focusedSports) ? apiData.focusedSports.filter((sport: string) => 
            ['swimming', 'cycling', 'running'].includes(sport)
          ) : [],
          sports: Array.isArray(apiData.sports) ? apiData.sports.filter((sport: string) => 
            ['running', 'swimming', 'cycling', 'yoga', 'strength'].includes(sport)
          ) : [],
          defaultSchedule: Array.isArray(apiData.defaultSchedule) 
            ? apiData.defaultSchedule.map((h: number) => h || 0)
            : Array(7).fill(0),
          name: apiData.name || '',
          units: apiData.units === 'Imperial' ? 'Imperial' : 'Metric',
          daysAhead: apiData.daysAhead ?? 1
        };
        setInitialSettings(fetchedSettings);
      }
      
      setDetailsError(null);
    } catch (err) {
      console.error('[details] Error fetching details:', err);
      setDetailsError('Could not load settings');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Set up navigation header with refresh button
  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Fixed Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 24,
        }}
        className={`${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </Text>
        <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Manage your preferences
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-8" style={{ paddingTop: 24 }}>
          
          {/* General Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsGeneralCollapsed(!isGeneralCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-gray-500/20' : 'bg-gray-50'
                }`}>
                  <MaterialIcons 
                    name="settings" 
                    size={20} 
                    color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  General
                </Text>
              </View>
              <MaterialIcons 
                name={isGeneralCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isGeneralCollapsed && (
              <>
                {/* Appearance Card */}
                <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Appearance
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select your preferred theme
              </Text>
              <View className="flex-row justify-between items-center gap-3">
                {[
                  { mode: 'light', icon: 'wb-sunny', label: 'Light' },
                  { mode: 'dark', icon: 'nights-stay', label: 'Dark' },
                  { mode: 'system', icon: 'settings', label: 'System' },
                ].map(({ mode, icon, label }) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => handleDarkModeChange(mode as 'light' | 'dark' | 'system')}
                    className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                      darkMode === mode
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={24}
                      color={darkMode === mode ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                    />
                    <Text
                      className={`mt-2 text-sm font-medium text-center ${
                        darkMode === mode ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notifications Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage what you'd like to be notified about
              </Text>
              <View className="flex-row justify-between items-center gap-3">
                {[
                  { label: 'Workout Upload', state: uploadNotif, setState: setUploadNotif, icon: 'cloud-upload' },
                  { label: 'Daily Training', state: dailyTrainingNotif, setState: setDailyTrainingNotif, icon: 'update' },
                ].map(({ label, state, setState, icon }) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => setState(!state)}
                    className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                      state
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={24}
                      color={state ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                    />
                    <Text
                      className={`mt-2 text-sm font-medium text-center ${
                        state ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chat Settings Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Chat Settings
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure how the AI Coach works for you
              </Text>
              <View className="flex-row justify-between items-center gap-3">
                {[
                  { label: 'Chat History', state: chatHistoryEnabled, setState: setChatHistoryEnabled, icon: 'history' },
                  { label: 'Chat Memory', state: chatMemoryEnabled, setState: setChatMemoryEnabled, icon: 'memory' },
                ].map(({ label, state, setState, icon }) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => setState(!state)}
                    className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                      state
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={24}
                      color={state ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                    />
                    <Text
                      className={`mt-2 text-sm font-medium text-center ${
                        state ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save General Settings */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <TouchableOpacity
                className={`py-3.5 rounded-lg items-center justify-center w-full shadow-md ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-green-600'
                    : isDarkMode
                    ? 'bg-gray-600'
                    : 'bg-gray-400'
                }`}
                style={{ elevation: 3 }}
                onPress={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <View className="flex-row items-center">
                  {isSaving && (
                    <View className="mr-2">
                      <Text className="text-white">⏳</Text>
                    </View>
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save General Settings' : 'General Settings Saved'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>

          {/* Profile Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsProfileCollapsed(!isProfileCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'
                }`}>
                  <MaterialIcons 
                    name="person" 
                    size={20} 
                    color={isDarkMode ? '#818CF8' : '#6366F1'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Profile
                </Text>
              </View>
              <MaterialIcons 
                name={isProfileCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isProfileCollapsed && (
              <>
                {/* Name Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Name
              </Text>
              <Text className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This is the name that will be displayed in the app.
              </Text>
              <TextInput
                className={`px-4 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-slate-800'}`}
                style={Platform.select({
                  android: { minHeight: 38, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 6 },
                  ios: { minHeight: 38, paddingTop: 6, paddingBottom: 6 }
                })}
                value={name}
                onChangeText={setName}
                placeholder="Your Name"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              />
            </View>

            {/* Units Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Units
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose your preferred measurement system for distances and weights.
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                    units === 'Metric'
                      ? isDarkMode
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-blue-500 border-blue-400'
                      : isDarkMode
                      ? 'bg-slate-800 border-gray-600'
                      : 'bg-slate-200 border-gray-300'
                  }`}
                  style={{ elevation: 3 }}
                  onPress={() => setUnits('Metric')}
                >
                  <MaterialIcons name="straighten" size={24} style={{ marginBottom: 4 }} color={units === 'Metric' ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'} />
                  <Text className={`text-sm font-medium text-center ${
                    units === 'Metric' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                  }`}>Metric</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                    units === 'Imperial'
                      ? isDarkMode
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-blue-500 border-blue-400'
                      : isDarkMode
                      ? 'bg-slate-800 border-gray-600'
                      : 'bg-slate-200 border-gray-300'
                  }`}
                  style={{ elevation: 3 }}
                  onPress={() => setUnits('Imperial')}
                >
                  <MaterialIcons name="square-foot" size={24} style={{ marginBottom: 4 }} color={units === 'Imperial' ? '#fff' : isDarkMode ? '#9CA3AF' : '#1E293B'} />
                  <Text className={`text-sm font-medium text-center ${
                    units === 'Imperial' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                  }`}>Imperial</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Schedule Days Ahead Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Schedule Days Ahead
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose how many days ahead to schedule your training.
              </Text>
              <View className="flex-row gap-4">
                {[1, 3, 5].map((days) => (
                  <TouchableOpacity
                    key={days}
                    className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                      scheduleDaysAhead === days
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                    onPress={() => setScheduleDaysAhead(days)}
                  >
                    <Text className={`text-sm font-medium text-center ${
                      scheduleDaysAhead === days ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                    }`}>{days} Day{days > 1 ? 's' : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Profile Settings */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <TouchableOpacity
                className={`py-3.5 rounded-lg items-center justify-center w-full shadow-md ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-green-600'
                    : isDarkMode
                    ? 'bg-gray-600'
                    : 'bg-gray-400'
                }`}
                style={{ elevation: 3 }}
                onPress={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <View className="flex-row items-center">
                  {isSaving && (
                    <View className="mr-2">
                      <Text className="text-white">⏳</Text>
                    </View>
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Profile Settings' : 'Profile Settings Saved'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>

          {/* Subscription Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsSubscriptionCollapsed(!isSubscriptionCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'
                }`}>
                  <MaterialIcons 
                    name="star" 
                    size={20} 
                    color={isDarkMode ? '#A855F7' : '#8B5CF6'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Subscription
                </Text>
              </View>
              <MaterialIcons 
                name={isSubscriptionCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isSubscriptionCollapsed && (
              <>
                {/* Subscription Status Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Current Plan
                </Text>
                <View className={`px-3 py-1 rounded-full ${
                  isSubscribed 
                    ? isDarkMode ? 'bg-green-600/20' : 'bg-green-50'
                    : isDarkMode ? 'bg-red-600/20' : 'bg-red-50'
                }`}>
                  <Text className={`text-xs font-medium ${
                    isSubscribed 
                      ? isDarkMode ? 'text-green-400' : 'text-green-700'
                      : isDarkMode ? 'text-red-400' : 'text-red-700'
                  }`}>
                    {isSubscribed ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              {isSubscribed && customerInfo ? (
                <View>
                  <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Plan Details
                  </Text>
                  {customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0 ? (
                    <View>
                      {customerInfo.activeSubscriptions.map((subscription, index) => {
                        const isYearly = subscription.includes('yearly') || subscription.includes('annual');
                        const planName = isYearly ? 'Premium Yearly' : 'Premium Monthly';
                        const nextBillingDate = customerInfo.latestExpirationDate 
                          ? new Date(customerInfo.latestExpirationDate).toLocaleDateString()
                          : 'Unknown';
                        
                        return (
                          <View key={index} className="mb-3">
                            <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {planName}
                            </Text>
                            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Renews on {nextBillingDate}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Premium Access
                    </Text>
                  )}
                </View>
              ) : (
                <View>
                  <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No active subscription
                  </Text>
                  <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Upgrade to Premium for unlimited access
                  </Text>
                </View>
              )}

              {/* Subscription Action Buttons */}
              <View className="mt-4">
                {isSubscribed ? (
                  <TouchableOpacity
                    className="py-3 bg-blue-500 rounded-lg items-center justify-center w-full shadow-md mb-3"
                    style={{ elevation: 3 }}
                    onPress={() => {
                      // On iOS, this opens the App Store subscription management
                      // On Android, this could open Google Play subscription management
                      if (Platform.OS === 'ios') {
                        const url = 'https://apps.apple.com/account/subscriptions';
                        // You could use Linking.openURL(url) here
                        alert('Please manage your subscription in the App Store settings.');
                      } else {
                        alert('Please manage your subscription in Google Play settings.');
                      }
                    }}
                  >
                    <Text className="text-white font-semibold text-base">Manage Subscription</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="py-3 bg-purple-500 rounded-lg items-center justify-center w-full shadow-md mb-3"
                    style={{ elevation: 3 }}
                    onPress={async () => {
                      // Create a modal/inline subscription flow
                      Alert.alert(
                        'Upgrade to Premium',
                        'Premium gives you unlimited access to all features including AI training plans, analytics, and more.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Learn More', 
                            onPress: () => {
                              // Here you could show more details about premium features
                              Alert.alert(
                                'Premium Features',
                                '• AI-powered training plans\n• Advanced analytics\n• Unlimited workout history\n• Premium chat features\n• Priority support',
                                [{ text: 'OK' }]
                              );
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text className="text-white font-semibold text-base">Upgrade to Premium</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  className={`py-3 rounded-lg border items-center justify-center w-full ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                  onPress={async () => {
                    try {
                      await refreshSubscriptionStatus();
                      alert('Subscription status refreshed!');
                    } catch (error) {
                      alert('Failed to refresh subscription status. Please try again.');
                    }
                  }}
                >
                  <Text className={`font-semibold text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Restore Purchases
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
              </>
            )}
          </View>

          {/* Training Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsTrainingCollapsed(!isTrainingCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
                }`}>
                  <MaterialIcons 
                    name="fitness-center" 
                    size={20} 
                    color={isDarkMode ? '#22C55E' : '#10B981'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Training
                </Text>
              </View>
              <MaterialIcons 
                name={isTrainingCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isTrainingCollapsed && (
              <>
                {/* Target Sports Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Target Sports
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose your sport(s) that you are training for
              </Text>
              <View className="flex-row justify-between items-center gap-3">
                {([
                  { focus: 'swimming', icon: 'pool', label: 'Swimming' },
                  { focus: 'cycling', icon: 'pedal-bike', label: 'Cycling' },
                  { focus: 'running', icon: 'directions-run', label: 'Running' },
                ] as { focus: MainFocusKey; icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string }[]).map(({ focus, icon, label }) => (
                  <TouchableOpacity
                    key={focus}
                    onPress={() => handleMainFocusToggle(focus)}
                    className={`flex-1 items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] ${
                      mainFocus[focus]
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                  >
                    <MaterialIcons
                      name={icon}
                      size={24}
                      color={mainFocus[focus] ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                    />
                    <Text
                      className={`mt-2 text-sm font-medium text-center ${
                        mainFocus[focus] ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* All Activities Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                All Activities
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Toggle the types of workouts you'd like to include, for a variety of training
              </Text>
              <View className="flex-row flex-wrap justify-between items-start gap-3">
                {[
                  { key: 'swimming', icon: 'pool', label: 'Swimming' },
                  { key: 'cycling', icon: 'pedal-bike', label: 'Cycling' },
                  { key: 'running', icon: 'directions-run', label: 'Running' },
                ].map(({ key, icon, label }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => handleActivityToggle(key)}
                    className={`items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] w-[30%] mb-3 ${
                      activities[key as keyof typeof activities]
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={24}
                      color={activities[key as keyof typeof activities] ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                    />
                    <Text
                      className={`mt-2 text-sm font-medium text-center leading-tight ${
                        activities[key as keyof typeof activities] ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View className="w-full flex-row justify-center gap-3">
                  {[
                    { key: 'yoga', icon: 'self-improvement', label: 'Yoga' },
                    { key: 'strength', icon: 'fitness-center', label: 'Strength' },
                  ].map(({ key, icon, label }) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => handleActivityToggle(key)}
                      className={`items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] w-[30%] ${
                        activities[key as keyof typeof activities]
                          ? isDarkMode
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-blue-500 border-blue-400'
                          : isDarkMode
                          ? 'bg-slate-800 border-gray-600'
                          : 'bg-slate-200 border-gray-300'
                      }`}
                      style={{ elevation: 3 }}
                    >
                      <MaterialIcons
                        name={icon as any}
                        size={24}
                        color={activities[key as keyof typeof activities] ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                      />
                      <Text
                        className={`mt-2 text-sm font-medium text-center leading-tight ${
                          activities[key as keyof typeof activities] ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                        }`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Interval Type Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Interval Type
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose your preferred interval training style
              </Text>
              <View className="flex-row flex-wrap justify-between items-start gap-3">
                {[
                  { type: 'mix', icon: 'shuffle', label: 'Mix' },
                  { type: 'structured', icon: 'grid-on', label: 'Structured' },
                  { type: 'non structured', icon: 'grid-off', label: 'Non-Structured' },
                ].map(({ type, icon, label }) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setIntervalType(type)}
                    className={`items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] w-[30%] mb-3 ${
                      intervalType === type
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={24}
                      color={intervalType === type ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                    />
                    <Text
                      className={`mt-2 text-xs font-medium text-center leading-tight ${
                        intervalType === type ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View className="w-full flex-row justify-center gap-3">
                  <TouchableOpacity
                    onPress={() => setIntervalType('none')}
                    className={`items-center justify-center p-4 rounded-xl border shadow-md min-h-[100px] w-[30%] ${
                      intervalType === 'none'
                        ? isDarkMode
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-blue-500 border-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800 border-gray-600'
                        : 'bg-slate-200 border-gray-300'
                    }`}
                    style={{ elevation: 3 }}
                  >
                    <MaterialIcons
                      name="block"
                      size={24}
                      color={intervalType === 'none' ? '#FFFFFF' : isDarkMode ? '#9CA3AF' : '#1E293B'}
                    />
                    <Text
                      className={`mt-2 text-sm font-medium text-center leading-tight ${
                        intervalType === 'none' ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-slate-800'
                      }`}
                    >
                      None
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Save Training Settings */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <TouchableOpacity
                className={`py-3.5 rounded-lg items-center justify-center w-full shadow-md ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-green-600'
                    : isDarkMode
                    ? 'bg-gray-600'
                    : 'bg-gray-400'
                }`}
                style={{ elevation: 3 }}
                onPress={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <View className="flex-row items-center">
                  {isSaving && (
                    <View className="mr-2">
                      <Text className="text-white">⏳</Text>
                    </View>
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Training Settings' : 'Training Settings Saved'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>

          {/* Training Schedule Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsTrainingScheduleCollapsed(!isTrainingScheduleCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                }`}>
                  <MaterialIcons 
                    name="schedule" 
                    size={20} 
                    color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Training Schedule
                </Text>
              </View>
              <MaterialIcons 
                name={isTrainingScheduleCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isTrainingScheduleCollapsed && (
              <>
                {/* Target Weekly Hours Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Target Weekly Hours
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This is the number of hours you would like to train in the week
              </Text>
              <View className="w-full">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm`}>0 hours</Text>
                  <Text className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                    {targetHours || '0'} hours
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-sm`}>30 hours</Text>
                </View>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={30}
                  step={1}
                  value={Number(targetHours) || 0}
                  onValueChange={(value) => setTargetHours(value.toString())}
                  minimumTrackTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                  maximumTrackTintColor={isDarkMode ? '#374151' : '#E5E7EB'}
                  thumbTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                />
              </View>
            </View>

            {/* Max Daily Hours Card */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-6 shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Max Daily Hours
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This is the max hours you can train on a day, the algorithm won't aim to hit it but use it as a limit
              </Text>
              <View className="w-full">  
                {days.map((day, i) => (
                  <View key={day} className="w-full mb-4">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-slate-800'} text-sm`}>
                        {day}
                      </Text>
                      <Text className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-sm`}>
                        {schedule[i].hours || '0'} hours
                      </Text>
                    </View>
                    <View className="w-full">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-xs`}>0</Text>
                        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} text-xs`}>8</Text>
                      </View>
                      <Slider
                        style={{ width: '100%', height: 30 }}
                        minimumValue={0}
                        maximumValue={8}
                        step={0.5}
                        value={Number(schedule[i].hours) || 0}
                        onValueChange={(value) => {
                          const newSchedule = [...schedule];
                          newSchedule[i] = { hours: value.toString() };
                          setSchedule(newSchedule);
                        }}
                        minimumTrackTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                        maximumTrackTintColor={isDarkMode ? '#374151' : '#E5E7EB'}
                        thumbTintColor={isDarkMode ? '#3B82F6' : '#2563EB'}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Save Schedule Settings */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <TouchableOpacity
                className={`py-3.5 rounded-lg items-center justify-center w-full shadow-md ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-green-600'
                    : isDarkMode
                    ? 'bg-gray-600'
                    : 'bg-gray-400'
                }`}
                style={{ elevation: 3 }}
                onPress={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <View className="flex-row items-center">
                  {isSaving && (
                    <View className="mr-2">
                      <Text className="text-white">⏳</Text>
                    </View>
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Schedule Settings' : 'Schedule Settings Saved'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>

          {/* Training Actions Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsTrainingActionsCollapsed(!isTrainingActionsCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'
                }`}>
                  <MaterialIcons 
                    name="update" 
                    size={20} 
                    color={isDarkMode ? '#A855F7' : '#8B5CF6'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Training Actions
                </Text>
              </View>
              <MaterialIcons 
                name={isTrainingActionsCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isTrainingActionsCollapsed && (
              <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Update Training Plan
              </Text>
              <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manually update your training plan based on your current settings and goals.
              </Text>
              <TouchableOpacity
                className="py-3.5 bg-blue-500 rounded-lg items-center justify-center w-full shadow-md"
                style={{ elevation: 3 }}
                onPress={async () => {
                  if (!userId) return;
                  try {
                    setDetailsLoading(true);
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    const dateStr = `${yyyy}-${mm}-${dd}`;
                    
                    try {
                      await trainingApi.runTrainingAlgorithm(dateStr);
                      alert('Training plan updated!');
                    } catch (err) {
                      console.error('Training plan update error:', err);
                      alert('Failed to update training. ' + getErrorMessage(err));
                    }
                  } finally {
                    setDetailsLoading(false);
                  }
                }}
                disabled={detailsLoading}
              >
                <Text className="text-white font-semibold text-base">{detailsLoading ? 'Updating...' : 'Update Training Plan'}</Text>
              </TouchableOpacity>
            </View>
            )}
          </View>

          {/* API Integrations Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsApiIntegrationsCollapsed(!isApiIntegrationsCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
                }`}>
                  <MaterialIcons 
                    name="sync" 
                    size={20} 
                    color={isDarkMode ? '#F97316' : '#EA580C'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  API Integrations
                </Text>
              </View>
              <MaterialIcons 
                name={isApiIntegrationsCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isApiIntegrationsCollapsed && (
              <>
                {/* Strava Integration */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4 shadow-sm`}>
              <View className="flex-row items-center mb-4">
                <View className="mr-3">
                  <Image 
                    source={require('../../assets/images/strava-logo.png')} 
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                  />
                </View>
                <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Strava
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Workout Upload from Strava
                  </Text>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Import completed workouts from Strava
                  </Text>
                </View>
                <Switch
                  value={stravaWorkoutUpload}
                  onValueChange={setStravaWorkoutUpload}
                  trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: isDarkMode ? '#3B82F6' : '#2563EB' }}
                  thumbColor={stravaWorkoutUpload ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
              
              <TouchableOpacity
                className={`py-3 rounded-lg border ${
                  isDarkMode ? 'border-orange-500 bg-orange-500/10' : 'border-orange-500 bg-orange-50'
                }`}
                onPress={handleStravaAuthorization}
              >
                <Text className={`text-center font-semibold ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  Authorize Strava
                </Text>
              </TouchableOpacity>
            </View>

            {/* Garmin Integration */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4 shadow-sm`}>
              <View className="flex-row items-center mb-4">
                <View className="mr-3">
                  <Image 
                    source={require('../../assets/images/garmin-logo.png')} 
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                  />
                </View>
                <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Garmin Connect
                </Text>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Workout Upload from Garmin
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Import completed workouts from Garmin Connect
                    </Text>
                  </View>
                  <Switch
                    value={garminWorkoutUpload}
                    onValueChange={setGarminWorkoutUpload}
                    trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: isDarkMode ? '#3B82F6' : '#2563EB' }}
                    thumbColor={garminWorkoutUpload ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
                
                <View className="h-4" />
                
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Scheduled Workouts
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sync planned workouts to your Garmin device
                    </Text>
                  </View>
                  <Switch
                    value={garminScheduledWorkouts}
                    onValueChange={setGarminScheduledWorkouts}
                    trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: isDarkMode ? '#3B82F6' : '#2563EB' }}
                    thumbColor={garminScheduledWorkouts ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
              </View>
              
              <TouchableOpacity
                className={`mt-4 py-3 rounded-lg border ${
                  isDarkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50'
                }`}
              >
                <Text className={`text-center font-semibold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Authorize Garmin Connect
                </Text>
              </TouchableOpacity>
            </View>

            {/* Wahoo Integration */}
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              <View className="flex-row items-center mb-4">
                <View className="mr-3">
                  <Image 
                    source={require('../../assets/images/wahoo-logo.png')} 
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                  />
                </View>
                <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Wahoo
                </Text>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Workout Upload from Wahoo
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Import completed workouts from Wahoo Cloud
                    </Text>
                  </View>
                  <Switch
                    value={wahooWorkoutUpload}
                    onValueChange={setWahooWorkoutUpload}
                    trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: isDarkMode ? '#3B82F6' : '#2563EB' }}
                    thumbColor={wahooWorkoutUpload ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
                
                <View className="h-4" />
                
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Scheduled Workouts
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sync planned workouts to your Wahoo app
                    </Text>
                  </View>
                  <Switch
                    value={wahooScheduledWorkouts}
                    onValueChange={setWahooScheduledWorkouts}
                    trackColor={{ false: isDarkMode ? '#374151' : '#E5E7EB', true: isDarkMode ? '#3B82F6' : '#2563EB' }}
                    thumbColor={wahooScheduledWorkouts ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
              </View>
              
              <TouchableOpacity
                className={`mt-4 py-3 rounded-lg border ${
                  isDarkMode ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50'
                }`}
              >
                <Text className={`text-center font-semibold ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  Authorize Wahoo
                </Text>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>

          {/* Account Settings Section */}
          <View className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={() => setIsAccountSettingsCollapsed(!isAccountSettingsCollapsed)}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-3 ${
                  isDarkMode ? 'bg-red-500/20' : 'bg-red-50'
                }`}>
                  <MaterialIcons 
                    name="account-circle" 
                    size={20} 
                    color={isDarkMode ? '#EF4444' : '#DC2626'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Account Settings
                </Text>
              </View>
              <MaterialIcons 
                name={isAccountSettingsCollapsed ? "chevron-right" : "keyboard-arrow-down"} 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>

            {!isAccountSettingsCollapsed && (
              <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
              {/* Sign Out */}
              <View className="mb-4">
                <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sign Out
                </Text>
                <Text className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sign out of your account on this device.
                </Text>
                <TouchableOpacity 
                  className="py-3.5 bg-red-600 rounded-lg items-center justify-center w-full shadow-md" 
                  style={{ elevation: 3 }} 
                  onPress={handleSignOut}
                >
                  <Text className="text-white font-semibold text-base text-center">Sign Out</Text>
                </TouchableOpacity>
              </View>

              {/* Change Email */}
              <View className="mb-4">
                <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Change Email
                </Text>
                <Text className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Update your account email address.
                </Text>
                <TouchableOpacity 
                  className="py-3.5 bg-blue-500 rounded-lg items-center justify-center w-full shadow-md" 
                  style={{ elevation: 3 }} 
                  onPress={openChangeEmailModal}
                >
                  <Text className="text-white font-semibold text-base">Change Email</Text>
                </TouchableOpacity>
              </View>

              {/* Delete Account */}
              <View>
                <Text className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete Account
                </Text>
                <Text className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </Text>
                <TouchableOpacity 
                  className="py-3.5 bg-red-600 rounded-lg items-center justify-center w-full shadow-md" 
                  style={{ elevation: 3 }} 
                  onPress={openDeleteModal}
                >
                  <Text className="text-white font-semibold text-base">Delete Account</Text>
                </TouchableOpacity>
              </View>
            </View>
            )}
          </View>
        </View>

        {/* Modals */}
        <Modal
          visible={isModalVisible}
          animationType="fade"
          transparent={true}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className={`w-11/12 rounded-xl p-5 border-2 shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`} style={{ elevation: 5 }}> 
              <Text className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                {selectedDay !== null ? days[selectedDay] : ''}
              </Text>
              {selectedDay !== null && (
                <View className="mb-3 w-full">
                  <Text className={`text-base font-semibold text-center ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>Training Hours</Text>
                  <TextInput
                    placeholder="Enter hours for this day"
                    value={schedule[selectedDay].hours || ''}
                    onChangeText={(text) => {
                      const newSchedule = [...schedule];
                      newSchedule[selectedDay] = { hours: text.replace(/[^0-9]/g, '') };
                      setSchedule(newSchedule);
                    }}
                    className={`px-3 text-lg text-center mt-2 mb-6 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-slate-800'}`}
                    style={Platform.select({
                      android: { minHeight: 44, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 10 },
                      ios: { minHeight: 44, paddingTop: 10, paddingBottom: 10 }
                    })}
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              )}
              <TouchableOpacity className="bg-red-500 p-3 rounded-lg items-center mt-4 w-full shadow-md" style={{ elevation: 3 }} onPress={closeModal}>
                <Text className="text-white font-semibold text-base">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Modals */}
      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className={`rounded-2xl p-6 w-[320px] ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <Text className={`text-xl font-bold mb-2 text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Delete Account
            </Text>
            <Text className={`text-sm mb-6 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Are you sure you want to delete your account? This will permanently delete your account and data. There is no recovery. You can sign up again for a new account.
            </Text>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={closeDeleteModal}
                className={`flex-1 py-3 rounded-xl border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                }`}
              >
                <Text className={`text-center font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl bg-red-600"
              >
                <Text className="text-center font-semibold text-white">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isChangeEmailModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className={`rounded-2xl p-6 w-[320px] ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {emailStep === 1 && (
              <>
                <Text className={`text-xl font-bold mb-2 text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Change Email
                </Text>
                <Text className={`text-sm mb-6 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Enter your new email address to receive a verification code.
                </Text>
                <TextInput
                  placeholder="Enter new email"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  className={`px-3 mb-6 rounded-lg border ${
                    isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-slate-800'
                  }`}
                  style={Platform.select({
                    android: { minHeight: 52, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 14 },
                    ios: { minHeight: 52, paddingTop: 14, paddingBottom: 14 }
                  })}
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                />
                <TouchableOpacity
                  onPress={handleSendEmailVerification}
                  className="w-full py-3 rounded-xl bg-blue-500 mb-3"
                >
                  <Text className="text-center font-semibold text-white">
                    Send Verification Code
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={closeChangeEmailModal}
                  className={`w-full py-3 rounded-xl border ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text className={`text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {emailStep === 2 && (
              <>
                <Text className={`text-xl font-bold mb-2 text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Verify Email
                </Text>
                <Text className={`text-sm mb-6 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Enter the verification code sent to your new email.
                </Text>
                <TextInput
                  placeholder="Enter verification code"
                  value={emailVerificationCode}
                  onChangeText={setEmailVerificationCode}
                  className={`px-3 mb-6 rounded-lg border ${
                    isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-slate-800'
                  }`}
                  style={Platform.select({
                    android: { minHeight: 52, textAlignVertical: 'center', includeFontPadding: false, paddingVertical: 14, textAlign: 'center' },
                    ios: { minHeight: 52, paddingTop: 14, paddingBottom: 14, textAlign: 'center' }
                  })}
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                  maxLength={8}
                />
                <TouchableOpacity
                  onPress={handleVerifyEmailCode}
                  className="w-full py-3 rounded-xl bg-blue-500 mb-3"
                >
                  <Text className="text-center font-semibold text-white">
                    Verify
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={closeChangeEmailModal}
                  className={`w-full py-3 rounded-xl border ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text className={`text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
