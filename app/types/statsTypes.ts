/**
 * ================================================================================================
 * STATS TYPES
 * ================================================================================================
 * TypeScript interfaces and types for the stats screen functionality
 */

// ================================================================================================
// CORE TRAINING INTERFACES
// ================================================================================================

export interface TrainingMetrics {
  ctl: number;                  // Fitness (Chronic Training Load)
  eftp: number;                 // eFTP (estimated Functional Threshold Power)
  form: number;                 // Training Stress Balance (freshness)
  physicalFeeling?: number;     // Physical feeling on a scale of 1-5
  mentalFeeling?: number;       // Mental feeling on a scale of 1-5
  sleep?: number;               // Sleep quality on a scale of 1-5
  weight?: number;              // Weight in kg
  illness?: number;             // Illness as numeric value (0=None, 1=Mild, 2=Severe)
  injury?: number;              // Injury as numeric value (0=None, 1=Minor, 2=Major, 3=Not Affecting)
}

export interface MetricsDataPoint {
  date: string;
  metrics: TrainingMetrics;
}

export interface ChartData {
  ctl: number[];
  eftp: number[];
  form: number[];
  physicalFeeling: number[];
  mentalFeeling: number[];
  sleep: number[];
  weight: number[];
  illness: number[];
  injury: number[];
  dates: string[];
  [key: string]: number[] | string[]; // Index signature for dynamic access
}

// ================================================================================================
// UI STATE INTERFACES
// ================================================================================================

export interface VisibleMetrics {
  ctl: boolean;
  eftp: boolean;
  form: boolean;
  physicalFeeling: boolean;
  mentalFeeling: boolean;
  sleep: boolean;
  weight: boolean;
  illness: boolean;
  injury: boolean;
}

export type TimeRange = '7d' | '30d' | '90d';
export type DateRange = '7d' | '14d' | '28d';

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

export interface AxisData {
  data: number[];
  min: number;
  max: number;
}
