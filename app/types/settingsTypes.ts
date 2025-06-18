/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                SETTINGS TYPES                                        ║
 * ║                                                                                      ║
 * ║ TypeScript interfaces and types for the Settings screen functionality.              ║
 * ║ Defines all data structures used for user preferences, profile data,                ║
 * ║ training settings, and API integrations.                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// MAIN FOCUS AND ACTIVITY TYPES
// ============================================================================

export type MainFocusKey = 'swimming' | 'cycling' | 'running';

export interface ActivitySettings extends Record<string, boolean> {
  running: boolean;
  swimming: boolean;
  cycling: boolean;
  yoga: boolean;
  strength: boolean;
}

export interface MainFocusSettings extends Record<MainFocusKey, boolean> {
  swimming: boolean;
  cycling: boolean;
  running: boolean;
}

// ============================================================================
// SCHEDULE AND TRAINING TYPES
// ============================================================================

export interface ScheduleDay {
  hours: string;
}

export type UnitsType = 'Metric' | 'Imperial';

export interface IntervalTypeOption {
  type: string;
  label: string;
}

// ============================================================================
// USER PROFILE AND SETTINGS TYPES
// ============================================================================

export interface UserProfileDetails {
  name: string;
  email: string;
  units: UnitsType;
  targetHours: string;
  scheduleDaysAhead: number;
  weight?: string;
  ftp?: string;
  [key: string]: any;
}

export interface NotificationSettings {
  uploadNotif: boolean;
  dailyTrainingNotif: boolean;
}

export interface ChatSettings {
  chatHistoryEnabled: boolean;
  chatMemoryEnabled: boolean;
}

// ============================================================================
// API INTEGRATION TYPES
// ============================================================================

export interface ApiIntegrationSettings {
  stravaWorkoutUpload: boolean;
  garminWorkoutUpload: boolean;
  garminScheduledWorkouts: boolean;
  wahooWorkoutUpload: boolean;
  wahooScheduledWorkouts: boolean;
}

// ============================================================================
// MODAL AND UI STATE TYPES
// ============================================================================

export interface ModalStates {
  isModalVisible: boolean;
  selectedDay: number | null;
  isDeleteModalVisible: boolean;
  isChangeEmailModalVisible: boolean;
}

export interface EmailChangeState {
  newEmail: string;
  emailVerificationCode: string;
  emailStep: number;
}

export interface AccountDeletionState {
  email: string;
  verificationCode: string;
}

// ============================================================================
// SECTION COLLAPSE STATE TYPES
// ============================================================================

export interface SectionCollapseState {
  isGeneralCollapsed: boolean;
  isProfileCollapsed: boolean;
  isSubscriptionCollapsed: boolean;
  isTrainingCollapsed: boolean;
  isTrainingScheduleCollapsed: boolean;
  isTrainingActionsCollapsed: boolean;
  isApiIntegrationsCollapsed: boolean;
  isAccountSettingsCollapsed: boolean;
}

// ============================================================================
// SAVE STATE AND ERROR HANDLING TYPES
// ============================================================================

export interface SaveState {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  initialSettings: any;
  prevDetails: any;
}

export interface LoadingState {
  detailsLoading: boolean;
  detailsError: string | null;
  refreshing: boolean;
}

// ============================================================================
// COMBINED SETTINGS STATE TYPE
// ============================================================================

export interface SettingsState {
  // User identification
  userId: string | null;
  
  // Settings data
  activities: ActivitySettings;
  mainFocus: MainFocusSettings;
  schedule: ScheduleDay[];
  targetHours: string;
  intervalType: string;
  name: string;
  units: UnitsType;
  scheduleDaysAhead: number;
  
  // Notifications and chat
  notifications: NotificationSettings;
  chatSettings: ChatSettings;
  
  // API integrations
  apiIntegrations: ApiIntegrationSettings;
  
  // UI state
  modals: ModalStates;
  emailChange: EmailChangeState;
  accountDeletion: AccountDeletionState;
  sectionCollapse: SectionCollapseState;
  
  // Save and loading state
  saveState: SaveState;
  loadingState: LoadingState;
}
