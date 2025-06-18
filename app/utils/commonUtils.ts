/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                COMMON UTILITIES                                      ║
 * ║                                                                                      ║
 * ║ Consolidated utility functions for the entire application.                          ║
 * ║ Contains date, string, training, and style utilities.                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get the current date as a string in YYYY-MM-DD format
 */
export const getCurrentDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date string for display purposes
 */
export const formatDateString = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Parse a date string to Date object with error handling
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (error) {
    console.warn('Error parsing date:', error);
    return null;
  }
};

/**
 * Calculate difference between two dates in days
 */
export const getDaysDifference = (date1: string | Date, date2: string | Date): number => {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  } catch (error) {
    console.warn('Error calculating date difference:', error);
    return 0;
  }
};

/**
 * Check if a date is today
 */
export const isToday = (dateString: string): boolean => {
  const today = getCurrentDateString();
  return dateString === today;
};

/**
 * Get a date string for days ago
 */
export const getDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirst = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format a string to title case
 */
export const toTitleCase = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

/**
 * Remove extra whitespace and normalize spacing
 */
export const normalizeSpacing = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Truncate string to specified length with ellipsis
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Generate a random password with specified length
 */
export const generateRandomPassword = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.details) return error.details;
  return 'An unexpected error occurred';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Clean and format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// ============================================================================
// TRAINING UTILITIES
// ============================================================================

/**
 * Training session interface for normalization
 */
interface TrainingSession {
  id?: string;
  date?: string;
  type?: string;
  duration?: number;
  intensity?: number;
  tss?: number;
  notes?: string;
  completed?: boolean;
}

/**
 * Normalized training session interface
 */
interface NormalizedTrainingSession {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: number;
  tss: number;
  notes: string;
  completed: boolean;
}

/**
 * Normalize a training session object with default values
 */
export const normalizeTrainingSession = (session: TrainingSession): NormalizedTrainingSession => {
  return {
    id: session.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: session.date || getCurrentDateString(),
    type: session.type || 'General',
    duration: Math.max(0, session.duration || 0),
    intensity: Math.max(1, Math.min(10, session.intensity || 5)),
    tss: Math.max(0, session.tss || 0),
    notes: session.notes || '',
    completed: Boolean(session.completed)
  };
};

/**
 * Calculate Training Stress Score based on duration and intensity
 */
export const calculateTSS = (duration: number, intensity: number): number => {
  if (duration <= 0 || intensity <= 0) return 0;
  
  // Basic TSS calculation: (Duration in hours × Intensity Factor² × 100)
  // Simplified for this example
  const hours = duration / 60;
  const intensityFactor = intensity / 10; // Normalize to 0-1 scale
  return Math.round(hours * Math.pow(intensityFactor, 2) * 100);
};

/**
 * Get fitness level text based on numeric value
 */
export const getFitnessLevelText = (level: number): string => {
  if (level >= 90) return 'Excellent';
  if (level >= 80) return 'Very Good';
  if (level >= 70) return 'Good';
  if (level >= 60) return 'Fair';
  if (level >= 50) return 'Poor';
  return 'Very Poor';
};

/**
 * Get fatigue level text based on numeric value
 */
export const getFatigueLevelText = (level: number): string => {
  if (level >= 90) return 'Very High';
  if (level >= 70) return 'High';
  if (level >= 50) return 'Moderate';
  if (level >= 30) return 'Low';
  return 'Very Low';
};

/**
 * Convert fitness level to Chronic Training Load (CTL)
 */
export const getLevelToCTL = (level: number): number => {
  // Simple conversion - in reality this would be more complex
  return Math.max(0, Math.min(150, level * 1.5));
};

/**
 * Calculate weekly training load
 */
export const calculateWeeklyLoad = (sessions: TrainingSession[]): number => {
  if (!Array.isArray(sessions)) return 0;
  
  return sessions.reduce((total, session) => {
    const normalizedSession = normalizeTrainingSession(session);
    return total + normalizedSession.tss;
  }, 0);
};

/**
 * Get training zone based on intensity
 */
export const getTrainingZone = (intensity: number): string => {
  if (intensity >= 9) return 'Zone 5 (Neuromuscular Power)';
  if (intensity >= 8) return 'Zone 4 (Lactate Threshold)';
  if (intensity >= 7) return 'Zone 3 (Tempo)';
  if (intensity >= 5) return 'Zone 2 (Endurance)';
  return 'Zone 1 (Recovery)';
};

// ============================================================================
// STYLE UTILITIES
// ============================================================================

/**
 * Get container style based on dark mode
 */
export const getContainerStyle = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  flex: 1,
});

/**
 * Get text style based on dark mode
 */
export const getTextStyle = (isDarkMode: boolean) => ({
  color: isDarkMode ? '#ffffff' : '#000000',
});

/**
 * Get input style based on dark mode
 */
export const getInputStyle = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
  color: isDarkMode ? '#ffffff' : '#000000',
  borderColor: isDarkMode ? '#404040' : '#e0e0e0',
  borderWidth: 1,
  borderRadius: 8,
  padding: 12,
  marginVertical: 8,
});

/**
 * Get button style based on dark mode
 */
export const getButtonStyle = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#007acc' : '#0066cc',
  borderRadius: 8,
  padding: 12,
  alignItems: 'center' as const,
  marginVertical: 8,
});

/**
 * Get card style based on dark mode
 */
export const getCardStyle = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
  borderRadius: 12,
  padding: 16,
  marginVertical: 8,
  shadowColor: isDarkMode ? '#000000' : '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: isDarkMode ? 0.3 : 0.1,
  shadowRadius: 4,
  elevation: 3,
});

/**
 * Get picker style based on dark mode
 */
export const getPickerStyle = (isDarkMode: boolean) => ({
  backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
  color: isDarkMode ? '#ffffff' : '#000000',
  borderColor: isDarkMode ? '#404040' : '#e0e0e0',
  borderWidth: 1,
  borderRadius: 8,
  padding: 12,
  marginVertical: 8,
});

/**
 * Get FAB (Floating Action Button) style based on dark mode
 */
export const getFabStyle = (isDarkMode: boolean) => ({
  position: 'absolute' as const,
  bottom: 20,
  right: 20,
  backgroundColor: isDarkMode ? '#007acc' : '#0066cc',
  borderRadius: 30,
  width: 60,
  height: 60,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
});

/**
 * Get refresh icon color based on dark mode
 */
export const getRefreshIconColor = (isDarkMode: boolean): string => {
  return isDarkMode ? '#ffffff' : '#000000';
};

/**
 * Get placeholder color based on dark mode
 */
export const getPlaceholderColor = (isDarkMode: boolean): string => {
  return isDarkMode ? '#888888' : '#666666';
};

/**
 * Get status bar style based on dark mode
 */
export const getStatusBarStyle = (isDarkMode: boolean): 'light-content' | 'dark-content' => {
  return isDarkMode ? 'light-content' : 'dark-content';
};

/**
 * Theme-aware hex colors for non-Tailwind usage (charts, native components)
 */
export const getThemeColors = (isDarkMode: boolean) => ({
  primary: isDarkMode ? '#60A5FA' : '#2563EB',
  secondary: isDarkMode ? '#9CA3AF' : '#64748B',
  background: isDarkMode ? '#121212' : '#ffffff',
  surface: isDarkMode ? '#1E293B' : '#ffffff',
  text: isDarkMode ? '#E5E7EB' : '#1E293B',
  textMuted: isDarkMode ? '#9CA3AF' : '#64748B',
  border: isDarkMode ? '#374151' : '#E5E7EB',
});

/**
 * Collection of common class combinations for easy access
 */
export const getClassNames = (isDarkMode: boolean) => ({
  container: getContainerStyle(isDarkMode),
  card: getCardStyle(isDarkMode),
  textPrimary: getTextStyle(isDarkMode),
  textSecondary: getTextStyle(isDarkMode),
  textMuted: getTextStyle(isDarkMode),
  input: getInputStyle(isDarkMode),
  buttonPrimary: getButtonStyle(isDarkMode),
  buttonSecondary: getButtonStyle(isDarkMode),
  fab: getFabStyle(isDarkMode),
});

/**
 * Get button class name for Tailwind CSS based on dark mode and type
 */
export const getButtonClassName = (isDarkMode: boolean, type: 'primary' | 'secondary' = 'primary'): string => {
  const baseClasses = 'w-full p-4 rounded-lg font-bold text-center';
  
  if (type === 'primary') {
    return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white`;
  } else {
    return `${baseClasses} ${
      isDarkMode 
        ? 'bg-slate-700 border border-slate-600 text-slate-100' 
        : 'bg-gray-100 border border-gray-300 text-slate-800'
    }`;
  }
};

/**
 * Format seconds to HH:MM:SS format
 */
export const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Validate function parameters
 */
export const validateParams = (params: Record<string, any>, required: string[]): boolean => {
  for (const param of required) {
    if (!params[param] || (typeof params[param] === 'string' && params[param].trim() === '')) {
      return false;
    }
  }
  return true;
};
