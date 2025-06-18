/**
 * ================================================================================================
 * COLORS CONSTANTS
 * ================================================================================================
 * Theme-aware color definitions for light and dark modes.
 * These colors are used by the useThemeColor hook and themed components.
 */

// ================================================================================================
// LIGHT THEME COLORS
// ================================================================================================
const lightColors = {
  text: '#11181C',
  background: '#FFFFFF',
  tint: '#2563EB',
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: '#2563EB',
  border: '#E5E7EB',
  card: '#FFFFFF',
  primary: '#2563EB',
  secondary: '#64748B',
  accent: '#3B82F6',
  surface: '#F8FAFC',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#06B6D4',
  muted: '#64748B',
  placeholder: '#9CA3AF',
};

// ================================================================================================
// DARK THEME COLORS
// ================================================================================================
const darkColors = {
  text: '#ECEDEE',
  background: '#151718',
  tint: '#60A5FA',
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: '#60A5FA',
  border: '#374151',
  card: '#1F2937',
  primary: '#60A5FA',
  secondary: '#9CA3AF',
  accent: '#3B82F6',
  surface: '#111827',
  error: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
  info: '#22D3EE',
  muted: '#9CA3AF',
  placeholder: '#6B7280',
};

// ================================================================================================
// COLORS EXPORT
// ================================================================================================
export const Colors = {
  light: lightColors,
  dark: darkColors,
};

export default Colors;
