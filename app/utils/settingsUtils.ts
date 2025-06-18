/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                              SETTINGS UTILITIES                                      ║
 * ║                                                                                      ║
 * ║ Business logic and utility functions for the Settings screen.                       ║
 * ║ Handles data processing, validation, API interactions, and state management.        ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  mockHelpers,
  userApi,
  type UpdateUserAttributeOutput,
  type ConfirmUserAttributeInput 
} from './mockHelpers';
import { getErrorMessage } from './commonUtils';
import type { 
  UserProfileDetails, 
  SettingsState,
  ActivitySettings,
  MainFocusSettings,
  ApiIntegrationSettings 
} from '../types/settingsTypes';
import { 
  VALIDATION_RULES, 
  ERROR_MESSAGES,
  DEFAULT_ACTIVITY_SETTINGS,
  DEFAULT_MAIN_FOCUS_SETTINGS,
  DEFAULT_API_INTEGRATION_SETTINGS
} from '../constants/settingsConstants';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates an email address format
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
};

/**
 * Validates verification code format
 */
export const validateVerificationCode = (code: string): boolean => {
  return code.length === VALIDATION_RULES.VERIFICATION_CODE.LENGTH && /^\d+$/.test(code);
};

/**
 * Validates target hours value
 */
export const validateTargetHours = (hours: string): boolean => {
  const numHours = parseFloat(hours);
  return !isNaN(numHours) && 
         numHours >= VALIDATION_RULES.TARGET_HOURS.MIN && 
         numHours <= VALIDATION_RULES.TARGET_HOURS.MAX;
};

/**
 * Validates schedule days ahead value
 */
export const validateScheduleDaysAhead = (days: number): boolean => {
  return days >= VALIDATION_RULES.SCHEDULE_DAYS_AHEAD.MIN && 
         days <= VALIDATION_RULES.SCHEDULE_DAYS_AHEAD.MAX;
};

// ============================================================================
// SETTINGS DATA PROCESSING
// ============================================================================

/**
 * Transforms API response data to settings state format
 */
export const transformApiDataToSettings = (apiData: any): Partial<SettingsState> => {
  if (!apiData) return {};

  return {
    name: apiData.name || '',
    units: apiData.units || 'Metric',
    targetHours: apiData.targetHours?.toString() || '7',
    scheduleDaysAhead: apiData.scheduleDaysAhead || 1,
    intervalType: apiData.intervalType || 'mix',
    activities: {
      ...DEFAULT_ACTIVITY_SETTINGS,
      ...apiData.activities,
    },
    mainFocus: {
      ...DEFAULT_MAIN_FOCUS_SETTINGS,
      ...apiData.mainFocus,
    },
    apiIntegrations: {
      ...DEFAULT_API_INTEGRATION_SETTINGS,
      ...apiData.apiIntegrations,
    },
    schedule: apiData.schedule || Array(7).fill({ hours: '' }),
  };
};

/**
 * Transforms settings state to API format for saving
 */
export const transformSettingsToApiFormat = (settings: Partial<SettingsState>): any => {
  return {
    name: settings.name,
    units: settings.units,
    targetHours: parseFloat(settings.targetHours || '7'),
    scheduleDaysAhead: settings.scheduleDaysAhead,
    intervalType: settings.intervalType,
    activities: settings.activities,
    mainFocus: settings.mainFocus,
    apiIntegrations: settings.apiIntegrations,
    schedule: settings.schedule,
  };
};

/**
 * Checks if settings have been modified from initial state
 */
export const hasSettingsChanged = (current: any, initial: any): boolean => {
  if (!initial) return true;
  
  return JSON.stringify(current) !== JSON.stringify(initial);
};

// ============================================================================
// API INTERACTION UTILITIES
// ============================================================================

/**
 * Loads user details from API
 */
export const loadUserDetails = async (userId?: string): Promise<UserProfileDetails> => {
  try {
    const response = await userApi.getUser(userId || 'demo-user');
    
    // Transform the API response to match UserProfileDetails interface
    return {
      name: response.name,
      email: response.email,
      units: 'Metric' as 'Metric' | 'Imperial',
      targetHours: '7',
      scheduleDaysAhead: 1, // Default value since not in API response
    };
  } catch (error) {
    throw new Error(getErrorMessage(error) || ERROR_MESSAGES.LOAD_DETAILS);
  }
};

/**
 * Saves user settings to API
 */
export const saveUserSettings = async (userId: string, settings: any): Promise<void> => {
  try {
    const apiData = transformSettingsToApiFormat(settings);
    await userApi.updateUser(userId, apiData);
  } catch (error) {
    throw new Error(getErrorMessage(error) || ERROR_MESSAGES.SAVE_SETTINGS);
  }
};

/**
 * Updates a specific user attribute
 */
export const updateUserAttributeValue = async (
  attributeKey: string, 
  value: string
): Promise<UpdateUserAttributeOutput> => {
  try {
    return await mockHelpers.updateUserAttribute({
      userAttribute: {
        attributeKey,
        value,
      },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error) || ERROR_MESSAGES.UPDATE_ATTRIBUTE);
  }
};

/**
 * Confirms user attribute update with verification code
 */
export const confirmUserAttributeValue = async (
  attributeKey: string, 
  confirmationCode: string
): Promise<void> => {
  try {
    const input: ConfirmUserAttributeInput = {
      userAttributeKey: attributeKey,
      confirmationCode,
    };
    
    await mockHelpers.confirmUserAttribute(input);
  } catch (error) {
    throw new Error(getErrorMessage(error) || ERROR_MESSAGES.UPDATE_ATTRIBUTE);
  }
};

// ============================================================================
// ACCOUNT MANAGEMENT UTILITIES
// ============================================================================

/**
 * Signs out the current user and clears local storage
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await mockHelpers.signOut();
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error during sign out:', error);
    // Still clear storage even if API call fails
    await AsyncStorage.clear();
  }
};

/**
 * Deletes the user account after verification
 */
export const deleteUserAccount = async (email: string, verificationCode: string): Promise<void> => {
  try {
    if (!validateEmail(email)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }
    
    if (!validateVerificationCode(verificationCode)) {
      throw new Error(ERROR_MESSAGES.INVALID_VERIFICATION_CODE);
    }
    
    await mockHelpers.deleteUser();
    await AsyncStorage.clear();
  } catch (error) {
    throw new Error(getErrorMessage(error) || ERROR_MESSAGES.DELETE_ACCOUNT_FAILED);
  }
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Saves settings to local storage
 */
export const saveSettingsToStorage = async (settings: Partial<SettingsState>): Promise<void> => {
  try {
    await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
};

/**
 * Loads settings from local storage
 */
export const loadSettingsFromStorage = async (): Promise<Partial<SettingsState> | null> => {
  try {
    const stored = await AsyncStorage.getItem('userSettings');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading settings from storage:', error);
    return null;
  }
};

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Generates a summary of changed settings for display
 */
export const getChangedSettingsSummary = (current: any, initial: any): string[] => {
  const changes: string[] = [];
  
  if (!initial) return changes;
  
  if (current.name !== initial.name) {
    changes.push(`Name: ${initial.name} → ${current.name}`);
  }
  
  if (current.units !== initial.units) {
    changes.push(`Units: ${initial.units} → ${current.units}`);
  }
  
  if (current.targetHours !== initial.targetHours) {
    changes.push(`Target Hours: ${initial.targetHours} → ${current.targetHours}`);
  }
  
  return changes;
};

/**
 * Merges activity settings with validation
 */
export const mergeActivitySettings = (
  current: ActivitySettings, 
  updates: Partial<ActivitySettings>
): ActivitySettings => {
  const merged = { ...current };
  
  // Only apply defined values from updates
  Object.keys(updates).forEach(key => {
    if (updates[key as keyof ActivitySettings] !== undefined) {
      merged[key as keyof ActivitySettings] = updates[key as keyof ActivitySettings]!;
    }
  });
  
  return merged;
};

/**
 * Toggles a specific activity setting
 */
export const toggleActivitySetting = (
  activities: ActivitySettings,
  activityKey: keyof ActivitySettings
): ActivitySettings => {
  return {
    ...activities,
    [activityKey]: !activities[activityKey],
  };
};
