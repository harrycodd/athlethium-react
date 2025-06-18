/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                              SETTINGS CONSTANTS                                      ║
 * ║                                                                                      ║
 * ║ Constants, default values, and configuration data for the Settings screen.          ║
 * ║ Includes default states, option lists, validation rules, and static data.           ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import type { 
  ActivitySettings, 
  MainFocusSettings, 
  IntervalTypeOption,
  NotificationSettings,
  ChatSettings,
  ApiIntegrationSettings,
  SectionCollapseState,
  ScheduleDay
} from '../types/settingsTypes';

// ============================================================================
// DEFAULT SETTINGS VALUES
// ============================================================================

export const DEFAULT_ACTIVITY_SETTINGS: ActivitySettings = {
  running: true,
  swimming: true,
  cycling: true,
  yoga: true,
  strength: true,
};

export const DEFAULT_MAIN_FOCUS_SETTINGS: MainFocusSettings = {
  swimming: false,
  cycling: false,
  running: false,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  uploadNotif: true,
  dailyTrainingNotif: true,
};

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  chatHistoryEnabled: true,
  chatMemoryEnabled: true,
};

export const DEFAULT_API_INTEGRATION_SETTINGS: ApiIntegrationSettings = {
  stravaWorkoutUpload: false,
  garminWorkoutUpload: false,
  garminScheduledWorkouts: false,
  wahooWorkoutUpload: false,
  wahooScheduledWorkouts: false,
};

export const DEFAULT_SECTION_COLLAPSE_STATE: SectionCollapseState = {
  isGeneralCollapsed: true,
  isProfileCollapsed: true,
  isSubscriptionCollapsed: true,
  isTrainingCollapsed: true,
  isTrainingScheduleCollapsed: true,
  isTrainingActionsCollapsed: true,
  isApiIntegrationsCollapsed: true,
  isAccountSettingsCollapsed: true,
};

// ============================================================================
// OPTION LISTS AND CONFIGURATIONS
// ============================================================================

export const INTERVAL_TYPE_OPTIONS: IntervalTypeOption[] = [
  { type: 'mix', label: 'Mix' },
  { type: 'structured', label: 'Structured' },
  { type: 'non structured', label: 'Non Structured' },
  { type: 'none', label: 'None' },
];

export const DAYS_OF_WEEK: string[] = [
  'Monday', 
  'Tuesday', 
  'Wednesday', 
  'Thursday', 
  'Friday', 
  'Saturday', 
  'Sunday'
];

export const UNITS_OPTIONS = ['Metric', 'Imperial'] as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_TARGET_HOURS = '7';
export const DEFAULT_SCHEDULE_DAYS_AHEAD = 1;
export const DEFAULT_INTERVAL_TYPE = 'mix';
export const DEFAULT_UNITS = 'Metric' as const;

export const DEFAULT_SCHEDULE: ScheduleDay[] = Array(7).fill({ hours: '' });

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION_RULES = {
  TARGET_HOURS: {
    MIN: 0,
    MAX: 50,
  },
  SCHEDULE_DAYS_AHEAD: {
    MIN: 1,
    MAX: 14,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  VERIFICATION_CODE: {
    LENGTH: 6,
  },
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const SECTION_TITLES = {
  GENERAL: 'General Settings',
  PROFILE: 'Profile Settings',
  SUBSCRIPTION: 'Subscription',
  TRAINING: 'Training Preferences',
  TRAINING_SCHEDULE: 'Training Schedule',
  TRAINING_ACTIONS: 'Training Actions',
  API_INTEGRATIONS: 'API Integrations',
  ACCOUNT_SETTINGS: 'Account Settings',
} as const;

export const MODAL_TYPES = {
  SCHEDULE_DAY: 'scheduleDay',
  DELETE_ACCOUNT: 'deleteAccount',
  CHANGE_EMAIL: 'changeEmail',
} as const;

// ============================================================================
// API INTEGRATION LABELS
// ============================================================================

export const API_INTEGRATION_LABELS = {
  STRAVA: {
    WORKOUT_UPLOAD: 'Strava Workout Upload',
  },
  GARMIN: {
    WORKOUT_UPLOAD: 'Garmin Workout Upload',
    SCHEDULED_WORKOUTS: 'Garmin Scheduled Workouts',
  },
  WAHOO: {
    WORKOUT_UPLOAD: 'Wahoo Workout Upload',
    SCHEDULED_WORKOUTS: 'Wahoo Scheduled Workouts',
  },
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  LOAD_DETAILS: 'Failed to load user details',
  SAVE_SETTINGS: 'Failed to save settings',
  UPDATE_ATTRIBUTE: 'Failed to update user attribute',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_VERIFICATION_CODE: 'Verification code must be 6 digits',
  DELETE_ACCOUNT_FAILED: 'Failed to delete account',
  CHANGE_EMAIL_FAILED: 'Failed to change email',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: 'Settings saved successfully',
  EMAIL_UPDATED: 'Email updated successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
} as const;
