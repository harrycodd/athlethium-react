/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                 ANALYSIS TYPES                                       ║
 * ║                                                                                      ║
 * ║ TypeScript interfaces and types for the Analysis screen functionality.              ║
 * ║ Defines data structures for workout analysis, metrics, and chart interactions.      ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// WORKOUT DATA TYPES
// ============================================================================

export interface WorkoutDataPoint {
  timestamp: number;
  value: number;
  unit: string;
}

export interface WorkoutData {
  id: string;
  name: string;
  sport: string;
  date: string;
  duration: number;
  distance?: number;
  heartRate?: WorkoutDataPoint[];
  speed?: WorkoutDataPoint[];
  power?: WorkoutDataPoint[];
  cadence?: WorkoutDataPoint[];
  elevation?: WorkoutDataPoint[];
}

export interface WorkoutMetrics {
  average: number;
  min: number;
  max: number;
  distance: number;
  duration?: number;
  totalCalories?: number;
  averageHR?: number;
  maxHR?: number;
  minHR?: number;
}

// ============================================================================
// CHART INTERACTION TYPES
// ============================================================================

export interface ChartSelection {
  start: number | null;
  end: number | null;
}

export interface ChartConfig {
  width: number;
  height: number;
  strokeWidth: number;
  selectionColor: string;
  gridColor: string;
}

// ============================================================================
// ANALYSIS STATE TYPES
// ============================================================================

export interface AnalysisState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  data: number[];
  selection: ChartSelection;
  metrics: WorkoutMetrics;
}

export type DataType = 'speed' | 'heartRate' | 'power' | 'cadence' | 'elevation';

export interface DataTypeOption {
  key: DataType;
  label: string;
  unit: string;
  color: string;
}

// ============================================================================
// SAMPLE DATA TYPES
// ============================================================================

export interface SampleWorkoutDatabase {
  [workoutId: string]: number[];
}

export interface ChartPoint {
  x: number;
  y: number;
}
