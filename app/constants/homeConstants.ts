/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                 HOME CONSTANTS                                       ║
 * ║                                                                                      ║
 * ║ Constants, default values, and configuration data for the Home screen.              ║
 * ║ Includes health metrics options, training defaults, and UI configurations.          ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import type { 
  HealthMetrics, 
  TrainingMetrics, 
  TrainingSession,
  IllnessStatus,
  InjuryStatus,
  SportType
} from '../types/homeTypes';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_HEALTH_METRICS: HealthMetrics = {
  physicallyFeeling: 3,
  mentallyFeeling: 3,
  sleep: 3,
  weight: '',
  illness: 'None',
  injury: 'None',
};

export const DEFAULT_TRAINING_METRICS: TrainingMetrics = {
  ctl: 75,  // Chronic Training Load (Fitness)
  atl: 65,  // Acute Training Load (Fatigue)
  form: 10, // Training Stress Balance (Freshness)
};

export const DEFAULT_TRAINING_SESSIONS: TrainingSession[] = [
  {
    event_type: 'Swim',
    name: 'Drills & endurance',
    sport: 'Swimming',
    time: '1h',
    description: 'Focus on technique and building aerobic base',
    completed: false,
    id: 'default-swim-1',
  },
  {
    event_type: 'Yoga',
    name: 'Evening recovery',
    sport: 'Yoga',
    time: '30m',
    description: 'Gentle stretching and relaxation',
    completed: false,
    id: 'default-yoga-1',
  },
];

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

export const FEELING_LEVELS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Below Average' },
  { value: 3, label: 'Average' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
];

export const FEELING_LEVEL_LABELS = ['Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];

export const ILLNESS_OPTIONS: IllnessStatus[] = [
  'None',
  'Mild Cold',
  'Severe Cold',
  'Flu',
  'Other',
];

export const INJURY_OPTIONS: InjuryStatus[] = [
  'None',
  'Minor',
  'Major',
  'Not Affecting Training',
];

export const SPORT_TYPES: SportType[] = [
  'Swimming',
  'Cycling',
  'Running',
  'Yoga',
  'Strength',
  'Recovery',
];

// ============================================================================
// METRICS CONFIGURATION
// ============================================================================

export const METRICS_CONFIG = {
  FITNESS: {
    label: 'Fitness',
    key: 'ctl' as const,
    color: '#10B981', // green-500
    icon: 'trending-up',
    description: 'Your chronic training load over time',
    goodRange: { min: 60, max: 120 },
  },
  FATIGUE: {
    label: 'Fatigue',
    key: 'atl' as const,
    color: '#F59E0B', // amber-500
    icon: 'battery-half',
    description: 'Your acute training load from recent sessions',
    goodRange: { min: 40, max: 80 },
  },
  FORM: {
    label: 'Form',
    key: 'form' as const,
    color: '#3B82F6', // blue-500
    icon: 'flash',
    description: 'Your training stress balance and readiness',
    goodRange: { min: -10, max: 25 },
  },
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const ANIMATION_DURATION = 300;

export const CARD_SPACING = 16;

export const SECTION_TITLES = {
  HEALTH_CHECK: 'Daily Health Check',
  TODAYS_TRAINING: "Today's Training",
  TRAINING_METRICS: 'Training Metrics',
  QUICK_ACTIONS: 'Quick Actions',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  LOAD_TRAINING: 'Failed to load training data',
  LOAD_METRICS: 'Failed to load training metrics',
  SAVE_HEALTH: 'Failed to save health metrics',
  COMPLETE_SESSION: 'Failed to update session status',
  NETWORK_ERROR: 'Network connection error',
  INVALID_WEIGHT: 'Please enter a valid weight',
  SAVE_TIMEOUT: 'Save operation timed out',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  HEALTH_SAVED: 'Health metrics saved successfully',
  SESSION_COMPLETED: 'Session marked as completed',
  SESSION_UNDONE: 'Session marked as incomplete',
  DATA_REFRESHED: 'Data refreshed successfully',
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  WEIGHT: {
    MIN: 20,    // kg or lbs
    MAX: 500,   // kg or lbs
    DECIMAL_PLACES: 1,
  },
  FEELING_SCALE: {
    MIN: 1,
    MAX: 5,
  },
} as const;

// ============================================================================
// COLOR SCHEMES
// ============================================================================

export const METRIC_COLORS = {
  FITNESS: {
    low: '#EF4444',      // red-500 (poor fitness)
    medium: '#F59E0B',   // amber-500 (average fitness)
    high: '#10B981',     // green-500 (good fitness)
  },
  FATIGUE: {
    low: '#10B981',      // green-500 (low fatigue, good)
    medium: '#F59E0B',   // amber-500 (moderate fatigue)
    high: '#EF4444',     // red-500 (high fatigue, bad)
  },
  FORM: {
    negative: '#EF4444', // red-500 (negative form, tired)
    neutral: '#F59E0B',  // amber-500 (neutral form)
    positive: '#10B981', // green-500 (positive form, fresh)
  },
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  TRAINING_TODAY: '/training/today',
  HEALTH_METRICS: '/health/metrics',
  TRAINING_METRICS: '/training/metrics',
  COMPLETE_SESSION: '/training/session/complete',
  REFRESH_DATA: '/training/refresh',
} as const;

// ============================================================================
// CACHE KEYS
// ============================================================================

export const CACHE_KEYS = {
  HEALTH_METRICS: 'health_metrics',
  TRAINING_METRICS: 'training_metrics',
  TODAYS_TRAINING: 'todays_training',
  LAST_REFRESH: 'last_refresh',
} as const;

// ============================================================================
// TIME FORMATS
// ============================================================================

export const TIME_FORMATS = {
  DISPLAY: 'h:mm A',
  API: 'HH:mm:ss',
  DURATION: 'mm\'ss"',
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_HEALTH_TRENDS: true,
  ENABLE_SESSION_NOTES: true,
  ENABLE_WORKOUT_ANALYSIS: true,
  ENABLE_REAL_TIME_METRICS: false,
} as const;
