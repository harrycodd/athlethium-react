/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                ANALYSIS UTILITIES                                   ║
 * ║                                                                                      ║
 * ║ Business logic and utility functions for the Analysis screen.                       ║
 * ║ Handles data processing, metrics calculation, and chart interactions.               ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import type { 
  WorkoutMetrics, 
  ChartSelection, 
  WorkoutData,
  WorkoutDataPoint 
} from '../types/analysisTypes';
import { 
  SAMPLE_WORKOUT_DATA, 
  DEFAULT_METRICS, 
  ANIMATION_DURATIONS 
} from '../constants/analysisConstants';

// ============================================================================
// DATA FETCHING UTILITIES
// ============================================================================

/**
 * Simulates fetching workout data by ID
 */
export const fetchWorkoutData = async (workoutId: string): Promise<number[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATIONS.LOADING));
  
  // Return sample data or default if not found
  return SAMPLE_WORKOUT_DATA[workoutId] || SAMPLE_WORKOUT_DATA.default;
};

/**
 * Validates workout ID format
 */
export const isValidWorkoutId = (workoutId: string): boolean => {
  return Boolean(workoutId && workoutId.trim().length > 0);
};

// ============================================================================
// METRICS CALCULATION UTILITIES
// ============================================================================

/**
 * Calculates workout metrics from data array
 */
export const calculateMetrics = (
  data: number[], 
  selection?: ChartSelection
): WorkoutMetrics => {
  if (!data || data.length === 0) {
    return DEFAULT_METRICS;
  }

  // Determine which data points to analyze
  const selectedData = getSelectedData(data, selection);
  
  // Calculate basic metrics
  const average = selectedData.reduce((sum, val) => sum + val, 0) / selectedData.length;
  const min = Math.min(...selectedData);
  const max = Math.max(...selectedData);
  const distance = selectedData.length * 0.2; // Assuming each point represents 0.2 km
  const duration = selectedData.length; // Assuming each point represents 1 minute

  return {
    average: Math.round(average * 10) / 10, // Round to 1 decimal place
    min,
    max,
    distance: Math.round(distance * 10) / 10,
    duration,
    totalCalories: Math.round(average * duration * 0.8), // Simple calorie estimation
    averageHR: Math.round(average),
    maxHR: max,
    minHR: min,
  };
};

/**
 * Gets selected data points based on chart selection
 */
export const getSelectedData = (data: number[], selection?: ChartSelection): number[] => {
  if (!selection || selection.start === null || selection.end === null) {
    return data;
  }

  const startIdx = Math.min(selection.start, selection.end);
  const endIdx = Math.max(selection.start, selection.end);
  
  return data.slice(startIdx, endIdx + 1);
};

/**
 * Calculates selection indices from chart gesture position
 */
export const calculateSelectionIndex = (
  gestureX: number, 
  chartWidth: number, 
  dataLength: number
): number => {
  const normalizedX = Math.max(0, Math.min(1, gestureX / chartWidth));
  return Math.floor(normalizedX * (dataLength - 1));
};

// ============================================================================
// CHART INTERACTION UTILITIES
// ============================================================================

/**
 * Validates and normalizes chart selection
 */
export const normalizeSelection = (
  selection: ChartSelection, 
  dataLength: number
): ChartSelection => {
  if (selection.start === null || selection.end === null) {
    return { start: null, end: null };
  }

  const start = Math.max(0, Math.min(dataLength - 1, selection.start));
  const end = Math.max(0, Math.min(dataLength - 1, selection.end));

  return { start, end };
};

/**
 * Calculates selection width for chart rendering
 */
export const calculateSelectionWidth = (
  selection: ChartSelection,
  chartWidth: number,
  dataLength: number
): { x: number; width: number } | null => {
  if (selection.start === null || selection.end === null || dataLength === 0) {
    return null;
  }

  const startIdx = Math.min(selection.start, selection.end);
  const endIdx = Math.max(selection.start, selection.end);
  
  const xStart = (startIdx / (dataLength - 1)) * chartWidth;
  const xEnd = (endIdx / (dataLength - 1)) * chartWidth;
  
  return {
    x: xStart,
    width: xEnd - xStart,
  };
};

// ============================================================================
// DATA FORMATTING UTILITIES
// ============================================================================

/**
 * Formats metric values for display
 */
export const formatMetricValue = (value: number, unit: string): string => {
  const roundedValue = Math.round(value * 10) / 10;
  return `${roundedValue} ${unit}`;
};

/**
 * Formats time duration for display
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

/**
 * Formats distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance >= 1) {
    return `${distance.toFixed(1)} km`;
  }
  return `${(distance * 1000).toFixed(0)} m`;
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Handles and formats errors for user display
 */
export const handleAnalysisError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred while loading workout data';
};

/**
 * Creates error state for analysis
 */
export const createErrorState = (message: string) => ({
  loading: false,
  refreshing: false,
  error: message,
  data: [],
  selection: { start: null, end: null },
  metrics: DEFAULT_METRICS,
});
