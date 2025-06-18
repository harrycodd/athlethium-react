/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                   HOME TYPES                                         ║
 * ║                                                                                      ║
 * ║ TypeScript interfaces and types for the Home screen functionality.                  ║
 * ║ Defines data structures for training sessions, health metrics,                       ║
 * ║ training metrics, and UI state management.                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// TRAINING METRICS TYPES
// ============================================================================

export interface TrainingMetrics {
  ctl: number;     // Chronic Training Load (Fitness)
  atl: number;     // Acute Training Load (Fatigue)
  form: number;    // Training Stress Balance (Freshness)
}

export interface TrainingMetricsExtended extends TrainingMetrics {
  eftp?: number;   // Estimated Functional Threshold Power
  tss?: number;    // Training Stress Score
  loadRatio?: number; // ATL/CTL ratio
}

// ============================================================================
// TRAINING SESSION TYPES
// ============================================================================

export interface TrainingSession {
  event_type: string;
  name: string;
  sport: string;
  time: string;
  description: string;
  completed: boolean;
  duration?: string;
  session_focus?: string;
  id?: string;
  workoutId?: string;
  timeStamp?: number;
  intensity?: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
  zone?: string;
  equipment?: string[];
}

export interface NormalizedTrainingSession {
  id: string;
  name: string;
  sport: string;
  duration: string;
  description: string;
  completed: boolean;
  intensity?: string;
  focus?: string;
  scheduledTime?: string;
}

// ============================================================================
// HEALTH METRICS TYPES
// ============================================================================

export interface HealthMetrics {
  physicallyFeeling: number;  // 1-5 scale
  mentallyFeeling: number;    // 1-5 scale
  sleep: number;              // 1-5 scale
  weight: string;             // Weight in user's preferred units
  illness: string;            // Illness status
  injury: string;             // Injury status
}

export interface HealthMetricsExtended extends HealthMetrics {
  restingHeartRate?: number;
  hrv?: number;               // Heart Rate Variability
  bodyComposition?: number;   // Body fat percentage
  hydration?: number;         // 1-5 scale
  stress?: number;            // 1-5 scale
  motivation?: number;        // 1-5 scale
  notes?: string;            // Additional notes
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface HomeScreenState {
  // Data state
  metrics: HealthMetrics;
  trainingMetrics: TrainingMetrics;
  todayTraining: TrainingSession[];
  
  // Loading states
  loading: boolean;
  loadingMetrics: boolean;
  loadingTraining: boolean;
  refreshing: boolean;
  
  // Error states
  error: string | null;
  metricsError: string | null;
  trainingError: string | null;
  
  // UI state
  isConnected: boolean;
  showMetricsModal: boolean;
  selectedSession: TrainingSession | null;
}

// ============================================================================
// DROPDOWN AND COMPONENT TYPES
// ============================================================================

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface CustomDropdownProps {
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  isDarkMode: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface SimpleSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  isDarkMode: boolean;
  min?: number;
  max?: number;
  step?: number;
  showLabels?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface TrainingDataResponse {
  sessions: TrainingSession[];
  metrics: TrainingMetrics;
  healthData?: HealthMetrics;
  lastUpdated: string;
}

export interface HealthMetricsResponse {
  data: HealthMetrics;
  timestamp: string;
  success: boolean;
}

export interface SessionCompletionRequest {
  sessionId: string;
  completed: boolean;
  actualDuration?: string;
  notes?: string;
  perceivedExertion?: number;
}

// ============================================================================
// FORM AND VALIDATION TYPES
// ============================================================================

export interface HealthMetricsFormData {
  physicallyFeeling: number;
  mentallyFeeling: number;
  sleep: number;
  weight: string;
  illness: string;
  injury: string;
}

export interface ValidationError {
  field: keyof HealthMetricsFormData;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// CONSTANTS AND ENUMS
// ============================================================================

export type FeelingLevel = 1 | 2 | 3 | 4 | 5;

export type IllnessStatus = 'None' | 'Mild Cold' | 'Severe Cold' | 'Flu' | 'Other';

export type InjuryStatus = 'None' | 'Minor' | 'Major' | 'Not Affecting Training';

export type SportType = 'Swimming' | 'Cycling' | 'Running' | 'Yoga' | 'Strength' | 'Recovery';

export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'skipped' | 'postponed';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface MetricsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  icon?: string;
  isDarkMode: boolean;
  onPress?: () => void;
}

export interface SessionCardProps {
  session: TrainingSession;
  onToggleComplete: (sessionId: string) => void;
  onViewDetails: (session: TrainingSession) => void;
  isDarkMode: boolean;
}

export interface HealthInputCardProps {
  metrics: HealthMetrics;
  onMetricsChange: (metrics: Partial<HealthMetrics>) => void;
  onSave: () => void;
  saving: boolean;
  isDarkMode: boolean;
}
