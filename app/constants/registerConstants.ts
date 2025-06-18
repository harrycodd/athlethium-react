/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                             REGISTER CONSTANTS                                       ║
 * ║                                                                                      ║
 * ║ Constants, configuration, and default values for the Registration screen.           ║
 * ║ Includes step definitions, form defaults, and validation rules.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import type {
  RegistrationState,
  StepConfig,
  UserProfile,
  SportFocus,
  Activities,
  WeeklySchedule,
  ScheduleDay
} from '../types/registerTypes';

// ============================================================================
// REGISTRATION STEPS CONFIGURATION
// ============================================================================

export const REGISTRATION_STEPS: StepConfig[] = [
  {
    id: 1,
    title: 'Verify Email',
    description: 'Enter the verification code sent to your email',
    component: 'VerificationStep',
    validationRequired: true,
  },
  {
    id: 2,
    title: 'Personal Info',
    description: 'Tell us about yourself',
    component: 'NameStep',
    validationRequired: true,
  },
  {
    id: 3,
    title: 'Preferences',
    description: 'Choose your units and settings',
    component: 'UnitsStep',
    validationRequired: false,
  },
  {
    id: 4,
    title: 'Sports Focus',
    description: 'What sports do you focus on?',
    component: 'TargetSportsStep',
    validationRequired: true,
  },
  {
    id: 5,
    title: 'All Activities',
    description: 'Select all activities you do',
    component: 'AllActivitiesStep',
    validationRequired: true,
  },
  {
    id: 6,
    title: 'Weekly Schedule',
    description: 'How many hours per day?',
    component: 'WeeklyScheduleStep',
    validationRequired: true,
  },
  {
    id: 7,
    title: 'Fitness Level',
    description: 'What\'s your current fitness level?',
    component: 'FitnessStep',
    validationRequired: true,
  },
  {
    id: 8,
    title: 'Notifications',
    description: 'How would you like to be notified?',
    component: 'NotificationsStep',
    validationRequired: false,
  },
];

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  units: 'Metric',
  intervalType: 'mix',
  uploadNotif: true,
  dailyTrainingNotif: true,
  weeklyHours: 12,
  fitnessLevel: 'Beginner',
  fitnessMode: 'level',
  ctl: '',
};

export const DEFAULT_SPORT_FOCUS: SportFocus = {
  swimming: false,
  cycling: false,
  running: false,
};

export const DEFAULT_ACTIVITIES: Activities = {
  swimming: true,
  cycling: true,
  running: true,
  yoga: true,
  strength: true,
};

export const DEFAULT_SCHEDULE_DAY: ScheduleDay = {
  hours: '3',
};

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = Array(7).fill(DEFAULT_SCHEDULE_DAY);

export const DEFAULT_REGISTRATION_STATE: RegistrationState = {
  step: 1,
  email: '',
  verificationCode: '',
  loading: false,
  error: '',
  profile: DEFAULT_USER_PROFILE,
  sportFocus: DEFAULT_SPORT_FOCUS,
  activities: DEFAULT_ACTIVITIES,
  schedule: DEFAULT_WEEKLY_SCHEDULE,
};

// ============================================================================
// SPORT OPTIONS
// ============================================================================

export const SPORT_OPTIONS = [
  { key: 'swimming', label: 'Swimming', icon: 'water' },
  { key: 'cycling', label: 'Cycling', icon: 'bicycle' },
  { key: 'running', label: 'Running', icon: 'footsteps' },
  { key: 'yoga', label: 'Yoga', icon: 'body' },
  { key: 'strength', label: 'Strength Training', icon: 'barbell' },
] as const;

export const FOCUS_SPORTS = SPORT_OPTIONS.slice(0, 3); // Swimming, Cycling, Running
export const ALL_ACTIVITIES = SPORT_OPTIONS; // All sports including Yoga and Strength

// ============================================================================
// FITNESS LEVEL OPTIONS
// ============================================================================

export const FITNESS_LEVELS = [
  { 
    key: 'Beginner', 
    label: 'Beginner', 
    description: 'New to structured training',
    ctlRange: '20-40'
  },
  { 
    key: 'Intermediate', 
    label: 'Intermediate', 
    description: 'Some training experience',
    ctlRange: '40-80'
  },
  { 
    key: 'Advanced', 
    label: 'Advanced', 
    description: 'Experienced athlete',
    ctlRange: '80-120+'
  },
] as const;

// ============================================================================
// UNITS OPTIONS
// ============================================================================

export const UNITS_OPTIONS = [
  { key: 'Metric', label: 'Metric (km, kg, °C)' },
  { key: 'Imperial', label: 'Imperial (mi, lb, °F)' },
] as const;

// ============================================================================
// INTERVAL TYPE OPTIONS
// ============================================================================

export const INTERVAL_TYPE_OPTIONS = [
  { key: 'mix', label: 'Mix of intervals' },
  { key: 'steady', label: 'Steady state focus' },
  { key: 'intervals', label: 'Interval focus' },
] as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_LENGTH: 3,
    MAX_LENGTH: 254,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  VERIFICATION_CODE: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 8,
    PATTERN: /^\d+$/,
  },
  HOURS: {
    MIN: 0.5,
    MAX: 8,
    STEP: 0.5,
  },
  WEEKLY_HOURS: {
    MIN: 1,
    MAX: 50,
  },
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_NAME: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name must be less than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`,
  INVALID_CODE: 'Please enter a valid verification code',
  NO_SPORT_FOCUS: 'Please select at least one sport to focus on',
  NO_ACTIVITIES: 'Please select at least one activity',
  INVALID_HOURS: 'Please enter valid hours (0.5 - 8 per day)',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  VERIFICATION_FAILED: 'Verification failed. Please check your code.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// ============================================================================
// WEEKDAY LABELS
// ============================================================================

export const WEEKDAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
