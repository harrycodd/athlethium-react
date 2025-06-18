/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                               ANALYSIS CONSTANTS                                     ║
 * ║                                                                                      ║
 * ║ Constants, configuration, and default values for the Analysis screen.               ║
 * ║ Includes chart dimensions, colors, sample data, and display settings.               ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

import { Dimensions } from 'react-native';
import type { 
  ChartConfig, 
  DataTypeOption, 
  SampleWorkoutDatabase, 
  WorkoutMetrics, 
  ChartSelection 
} from '../types/analysisTypes';

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

const screenWidth = Dimensions.get('window').width;

export const CHART_CONFIG: ChartConfig = {
  width: screenWidth - 64,  // Account for px-6 (24px) padding on each side
  height: 220,
  strokeWidth: 2,
  selectionColor: 'rgba(59, 130, 246, 0.2)',
  gridColor: '#E5E7EB',
};

// ============================================================================
// DATA TYPE OPTIONS
// ============================================================================

export const DATA_TYPE_OPTIONS: DataTypeOption[] = [
  {
    key: 'speed',
    label: 'Speed',
    unit: 'km/h',
    color: '#3B82F6',
  },
  {
    key: 'heartRate',
    label: 'Heart Rate',
    unit: 'bpm',
    color: '#EF4444',
  },
  {
    key: 'power',
    label: 'Power',
    unit: 'W',
    color: '#F59E0B',
  },
  {
    key: 'cadence',
    label: 'Cadence',
    unit: 'rpm',
    color: '#10B981',
  },
  {
    key: 'elevation',
    label: 'Elevation',
    unit: 'm',
    color: '#8B5CF6',
  },
];

// ============================================================================
// SAMPLE WORKOUT DATA
// ============================================================================

export const SAMPLE_WORKOUT_DATA: SampleWorkoutDatabase = {
  '123': [200, 220, 210, 250, 260, 280, 270, 300, 310, 330, 340, 320],
  '456': [180, 190, 210, 220, 240, 230, 250, 260, 280, 290, 300, 280],
  'default': [200, 220, 210, 250, 260, 280, 270, 300, 310, 330, 340, 320],
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_METRICS: WorkoutMetrics = {
  average: 0,
  min: 0,
  max: 0,
  distance: 0,
  duration: 0,
  totalCalories: 0,
  averageHR: 0,
  maxHR: 0,
  minHR: 0,
};

export const DEFAULT_SELECTION: ChartSelection = {
  start: null,
  end: null,
};

// ============================================================================
// CHART STYLING
// ============================================================================

export const CHART_STYLES = {
  line: {
    strokeWidth: 2,
    contentInset: { top: 20, bottom: 20 },
  },
  grid: {
    stroke: '#D1D5DB',
    strokeWidth: 1,
  },
  yAxis: {
    fill: '#64748B',
    fontSize: 12,
  },
  xAxis: {
    fill: '#64748B',
    fontSize: 12,
  },
};

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const ANIMATION_DURATIONS = {
  LOADING: 500,
  REFRESH: 1000,
  SELECTION: 150,
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  WORKOUT_NOT_FOUND: 'Workout data not found',
  NETWORK_ERROR: 'Unable to load workout data',
  INVALID_WORKOUT_ID: 'Invalid workout ID provided',
  DATA_PARSING_ERROR: 'Error processing workout data',
};
