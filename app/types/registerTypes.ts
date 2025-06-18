/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                               REGISTER TYPES                                         ║
 * ║                                                                                      ║
 * ║ TypeScript interfaces and types for the Registration screen functionality.          ║
 * ║ Defines data structures for user registration, forms, and multi-step flow.          ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export type UnitsType = 'Metric' | 'Imperial';
export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type FitnessMode = 'level' | 'ctl';

export interface UserProfile {
  name: string;
  email: string;
  units: UnitsType;
  intervalType: string;
  uploadNotif: boolean;
  dailyTrainingNotif: boolean;
  weeklyHours: number;
  fitnessLevel: FitnessLevel;
  fitnessMode: FitnessMode;
  ctl: string;
}

// ============================================================================
// SPORT AND ACTIVITY TYPES
// ============================================================================

export interface SportFocus {
  swimming: boolean;
  cycling: boolean;
  running: boolean;
}

export interface Activities {
  swimming: boolean;
  cycling: boolean;
  running: boolean;
  yoga: boolean;
  strength: boolean;
}

export interface ScheduleDay {
  hours: string;
}

export type WeeklySchedule = ScheduleDay[];

// ============================================================================
// REGISTRATION FLOW TYPES
// ============================================================================

export interface RegistrationState {
  step: number;
  email: string;
  verificationCode: string;
  loading: boolean;
  error: string;
  profile: UserProfile;
  sportFocus: SportFocus;
  activities: Activities;
  schedule: WeeklySchedule;
}

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  component: string;
  validationRequired: boolean;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// REGISTRATION STEP PROPS
// ============================================================================

export interface BaseStepProps {
  isDarkMode: boolean;
  onNext: () => void;
  onPrevious: () => void;
  loading: boolean;
}

export interface EmailStepProps extends BaseStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  error: string;
}

export interface VerificationStepProps extends BaseStepProps {
  email: string;
  verificationCode: string;
  onCodeChange: (code: string) => void;
  onResendCode: () => void;
  onVerify: () => void;
  error: string;
}

export interface ProfileStepProps extends BaseStepProps {
  profile: UserProfile;
  onProfileChange: (updates: Partial<UserProfile>) => void;
}

export interface SportsStepProps extends BaseStepProps {
  sportFocus: SportFocus;
  activities: Activities;
  onSportFocusChange: (updates: Partial<SportFocus>) => void;
  onActivitiesChange: (updates: Partial<Activities>) => void;
}

export interface ScheduleStepProps extends BaseStepProps {
  schedule: WeeklySchedule;
  onScheduleChange: (schedule: WeeklySchedule) => void;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface RegistrationRequest {
  email: string;
  verificationCode: string;
  profile: UserProfile;
  sportFocus: SportFocus;
  activities: Activities;
  schedule: WeeklySchedule;
}

export interface VerificationRequest {
  email: string;
  code: string;
}

// ============================================================================
// REGISTRATION COMPLETION TYPES
// ============================================================================

export interface UserDetails {
  signUpCompleted: boolean;
  name: string;
  units: UnitsType;
  focusedSports: string[];
  sports: string[];
  intervalType: string;
  uploadNotif: boolean;
  dailyTrainingNotif: boolean;
  weeklyHours: number;
  defaultSchedule: number[];
  daysAhead: number;
}
