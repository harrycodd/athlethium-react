/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                 HOME UTILITIES                                       ║
 * ║                                                                                      ║
 * ║ Business logic and utility functions for the Home screen.                           ║
 * ║ Handles data processing, validation, formatting, and API interactions.              ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentDateString, capitalizeFirst, getErrorMessage, normalizeTrainingSession } from './commonUtils';

import type {
  HealthMetrics,
  TrainingMetrics,
  TrainingSession,
  HealthMetricsFormData,
  ValidationError,
  FormValidationResult,
  NormalizedTrainingSession,
  TrainingDataResponse,
  HealthMetricsResponse,
  SessionCompletionRequest
} from '../types/homeTypes';

import {
  DEFAULT_HEALTH_METRICS,
  DEFAULT_TRAINING_METRICS,
  DEFAULT_TRAINING_SESSIONS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  CACHE_KEYS,
  METRICS_CONFIG,
  METRIC_COLORS
} from '../constants/homeConstants';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates weight input
 */
export const validateWeight = (weight: string): boolean => {
  if (!weight.trim()) return true; // Empty weight is allowed
  
  const numWeight = parseFloat(weight);
  return !isNaN(numWeight) && 
         numWeight >= VALIDATION_RULES.WEIGHT.MIN && 
         numWeight <= VALIDATION_RULES.WEIGHT.MAX;
};

/**
 * Validates feeling scale values (1-5)
 */
export const validateFeelingScale = (value: number): boolean => {
  return value >= VALIDATION_RULES.FEELING_SCALE.MIN && 
         value <= VALIDATION_RULES.FEELING_SCALE.MAX;
};

/**
 * Validates complete health metrics form
 */
export const validateHealthMetrics = (metrics: HealthMetricsFormData): FormValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validate weight
  if (metrics.weight && !validateWeight(metrics.weight)) {
    errors.push({
      field: 'weight',
      message: ERROR_MESSAGES.INVALID_WEIGHT
    });
  }
  
  // Validate feeling scales
  if (!validateFeelingScale(metrics.physicallyFeeling)) {
    errors.push({
      field: 'physicallyFeeling',
      message: 'Physical feeling must be between 1 and 5'
    });
  }
  
  if (!validateFeelingScale(metrics.mentallyFeeling)) {
    errors.push({
      field: 'mentallyFeeling',
      message: 'Mental feeling must be between 1 and 5'
    });
  }
  
  if (!validateFeelingScale(metrics.sleep)) {
    errors.push({
      field: 'sleep',
      message: 'Sleep quality must be between 1 and 5'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// DATA FORMATTING UTILITIES
// ============================================================================

/**
 * Formats weight value for display
 */
export const formatWeight = (weight: string, units: 'metric' | 'imperial' = 'metric'): string => {
  if (!weight) return '';
  
  const numWeight = parseFloat(weight);
  if (isNaN(numWeight)) return weight;
  
  const suffix = units === 'metric' ? ' kg' : ' lbs';
  return `${numWeight.toFixed(1)}${suffix}`;
};

/**
 * Formats training duration for display
 */
export const formatDuration = (duration: string): string => {
  if (!duration) return '';
  
  // Handle various duration formats
  if (duration.includes('h') || duration.includes('m')) {
    return duration; // Already formatted
  }
  
  // Convert minutes to hours and minutes
  const minutes = parseInt(duration);
  if (isNaN(minutes)) return duration;
  
  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
};

/**
 * Gets the appropriate color for a metric value
 */
export const getMetricColor = (metricType: keyof typeof METRICS_CONFIG, value: number): string => {
  const config = METRICS_CONFIG[metricType];
  
  if (metricType === 'FORM') {
    const formColors = METRIC_COLORS.FORM;
    if (value < -10) return formColors.negative;
    if (value > 10) return formColors.positive;
    return formColors.neutral;
  }
  
  if (metricType === 'FATIGUE') {
    const fatigueColors = METRIC_COLORS.FATIGUE;
    if (value < config.goodRange.min) return fatigueColors.low;
    if (value > config.goodRange.max) return fatigueColors.high;
    return fatigueColors.medium;
  }
  
  // FITNESS metric
  const fitnessColors = METRIC_COLORS.FITNESS;
  if (value < config.goodRange.min) return fitnessColors.low;
  if (value > config.goodRange.max) return fitnessColors.high;
  return fitnessColors.medium;
};

/**
 * Normalizes training session data
 */
export const normalizeTrainingSessionData = (session: TrainingSession): NormalizedTrainingSession => {
  return {
    id: session.id || `session-${Date.now()}`,
    name: session.name || 'Untitled Session',
    sport: capitalizeFirst(session.sport || session.event_type || 'Training'),
    duration: formatDuration(session.time || session.duration || ''),
    description: session.description || '',
    completed: session.completed || false,
    intensity: session.intensity,
    focus: session.session_focus,
    scheduledTime: session.time,
  };
};

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculates training stress balance (Form)
 */
export const calculateForm = (ctl: number, atl: number): number => {
  return ctl - atl;
};

/**
 * Calculates load ratio (ATL/CTL)
 */
export const calculateLoadRatio = (ctl: number, atl: number): number => {
  return ctl > 0 ? atl / ctl : 0;
};

/**
 * Gets readiness indicator based on training metrics
 */
export const getReadinessIndicator = (metrics: TrainingMetrics): {
  level: 'poor' | 'fair' | 'good' | 'excellent';
  message: string;
  color: string;
} => {
  const form = calculateForm(metrics.ctl, metrics.atl);
  const loadRatio = calculateLoadRatio(metrics.ctl, metrics.atl);
  
  if (form > 20) {
    return {
      level: 'excellent',
      message: 'Peak readiness - great time for hard training',
      color: METRIC_COLORS.FORM.positive
    };
  } else if (form > 5) {
    return {
      level: 'good',
      message: 'Good readiness - ready for moderate training',
      color: METRIC_COLORS.FORM.positive
    };
  } else if (form > -10) {
    return {
      level: 'fair',
      message: 'Moderate readiness - focus on recovery',
      color: METRIC_COLORS.FORM.neutral
    };
  } else {
    return {
      level: 'poor',
      message: 'Low readiness - prioritize rest and recovery',
      color: METRIC_COLORS.FORM.negative
    };
  }
};

// ============================================================================
// DATA PERSISTENCE UTILITIES
// ============================================================================

/**
 * Saves health metrics to local storage
 */
export const saveHealthMetricsToCache = async (metrics: HealthMetrics): Promise<void> => {
  try {
    const data = {
      metrics,
      timestamp: Date.now(),
      date: getCurrentDateString()
    };
    await AsyncStorage.setItem(CACHE_KEYS.HEALTH_METRICS, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving health metrics to cache:', error);
  }
};

/**
 * Loads health metrics from local storage
 */
export const loadHealthMetricsFromCache = async (): Promise<HealthMetrics | null> => {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEYS.HEALTH_METRICS);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const today = getCurrentDateString();
    
    // Only return cached data if it's from today
    if (data.date === today) {
      return data.metrics;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading health metrics from cache:', error);
    return null;
  }
};

/**
 * Saves training data to cache
 */
export const saveTrainingDataToCache = async (
  sessions: TrainingSession[], 
  metrics: TrainingMetrics
): Promise<void> => {
  try {
    const data = {
      sessions,
      metrics,
      timestamp: Date.now(),
      date: getCurrentDateString()
    };
    await AsyncStorage.setItem(CACHE_KEYS.TODAYS_TRAINING, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.TRAINING_METRICS, JSON.stringify({
      metrics,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving training data to cache:', error);
  }
};

/**
 * Loads training data from cache
 */
export const loadTrainingDataFromCache = async (): Promise<{
  sessions: TrainingSession[];
  metrics: TrainingMetrics;
} | null> => {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEYS.TODAYS_TRAINING);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const today = getCurrentDateString();
    
    // Only return cached data if it's from today
    if (data.date === today) {
      return {
        sessions: data.sessions || DEFAULT_TRAINING_SESSIONS,
        metrics: data.metrics || DEFAULT_TRAINING_METRICS
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading training data from cache:', error);
    return null;
  }
};

// ============================================================================
// API HELPER UTILITIES
// ============================================================================

/**
 * Transforms API response to training data format
 */
export const transformTrainingDataResponse = (response: any): TrainingDataResponse => {
  return {
    sessions: Array.isArray(response.sessions) ? response.sessions : DEFAULT_TRAINING_SESSIONS,
    metrics: response.metrics || DEFAULT_TRAINING_METRICS,
    healthData: response.healthData,
    lastUpdated: response.lastUpdated || new Date().toISOString()
  };
};

/**
 * Prepares health metrics for API submission
 */
export const prepareHealthMetricsForAPI = (metrics: HealthMetrics): any => {
  return {
    physically_feeling: metrics.physicallyFeeling,
    mentally_feeling: metrics.mentallyFeeling,
    sleep_quality: metrics.sleep,
    weight: metrics.weight ? parseFloat(metrics.weight) : null,
    illness_status: metrics.illness,
    injury_status: metrics.injury,
    date: getCurrentDateString(),
    timestamp: Date.now()
  };
};

/**
 * Transforms API health metrics response
 */
export const transformHealthMetricsResponse = (response: any): HealthMetrics => {
  return {
    physicallyFeeling: response.physically_feeling || DEFAULT_HEALTH_METRICS.physicallyFeeling,
    mentallyFeeling: response.mentally_feeling || DEFAULT_HEALTH_METRICS.mentallyFeeling,
    sleep: response.sleep_quality || DEFAULT_HEALTH_METRICS.sleep,
    weight: response.weight ? response.weight.toString() : DEFAULT_HEALTH_METRICS.weight,
    illness: response.illness_status || DEFAULT_HEALTH_METRICS.illness,
    injury: response.injury_status || DEFAULT_HEALTH_METRICS.injury,
  };
};

// ============================================================================
// UI HELPER UTILITIES
// ============================================================================

/**
 * Gets appropriate icon for sport type
 */
export const getSportIcon = (sport: string): string => {
  const sportLower = sport.toLowerCase();
  
  if (sportLower.includes('swim')) return 'water';
  if (sportLower.includes('bike') || sportLower.includes('cycl')) return 'bicycle';
  if (sportLower.includes('run')) return 'walk';
  if (sportLower.includes('yoga')) return 'leaf';
  if (sportLower.includes('strength') || sportLower.includes('weight')) return 'barbell';
  if (sportLower.includes('recovery') || sportLower.includes('rest')) return 'bed';
  
  return 'fitness';
};

/**
 * Gets completion percentage for training sessions
 */
export const getCompletionPercentage = (sessions: TrainingSession[]): number => {
  if (sessions.length === 0) return 0;
  
  const completedCount = sessions.filter(session => session.completed).length;
  return Math.round((completedCount / sessions.length) * 100);
};

/**
 * Debounces function calls to prevent excessive API requests
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
