// Common styling utility functions and centralized theme

// Centralized color palette
const getColors = (isDarkMode: boolean) => ({
  // Backgrounds
  container: isDarkMode ? 'bg-slate-900' : 'bg-slate-100',
  containerAlt: isDarkMode ? 'bg-slate-900' : 'bg-slate-50',
  input: isDarkMode ? 'bg-slate-800' : 'bg-slate-100',
  inputAlt: isDarkMode ? 'bg-gray-800' : 'bg-white',
  card: isDarkMode ? 'bg-slate-800' : 'bg-white',
  cardAlt: isDarkMode ? 'bg-gray-800' : 'bg-white',
  modal: isDarkMode ? 'bg-slate-800' : 'bg-white',
  header: isDarkMode ? '#121212' : '#fff',
  
  // Button backgrounds
  buttonPrimary: isDarkMode ? 'bg-blue-600' : 'bg-blue-500',
  buttonSecondary: isDarkMode ? 'bg-gray-800' : 'bg-gray-200',
  buttonDanger: isDarkMode ? 'bg-red-600' : 'bg-red-500',
  buttonSuccess: isDarkMode ? 'bg-green-600' : 'bg-green-500',
  
  // Text colors
  textPrimary: isDarkMode ? 'text-gray-200' : 'text-slate-800',
  textSecondary: isDarkMode ? 'text-gray-300' : 'text-slate-700',
  textMuted: isDarkMode ? 'text-gray-400' : 'text-slate-600',
  textHeader: isDarkMode ? '#FFFFFF' : '#1E293B',
  textInverse: isDarkMode ? 'text-slate-800' : 'text-gray-200',
  
  // Border colors
  border: isDarkMode ? 'border-gray-600' : 'border-gray-300',
  borderLight: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  borderStrong: isDarkMode ? 'border-gray-500' : 'border-gray-400',
  
  // Icon colors
  iconPrimary: isDarkMode ? '#60A5FA' : '#2563EB',
  iconSecondary: isDarkMode ? '#9CA3AF' : '#64748B',
  iconMuted: isDarkMode ? '#6B7280' : '#94A3B8',
  
  // Status colors
  success: isDarkMode ? '#10B981' : '#059669',
  warning: isDarkMode ? '#F59E0B' : '#D97706',
  error: isDarkMode ? '#EF4444' : '#DC2626',
  info: isDarkMode ? '#3B82F6' : '#2563EB',
  
  // Placeholder
  placeholder: '#9CA3AF'
});

// Theme-aware hex colors for non-Tailwind usage
export const getThemeColors = (isDarkMode: boolean) => ({
  primary: isDarkMode ? '#60A5FA' : '#2563EB',
  secondary: isDarkMode ? '#9CA3AF' : '#64748B',
  background: isDarkMode ? '#121212' : '#ffffff',
  surface: isDarkMode ? '#1E293B' : '#ffffff',
  text: isDarkMode ? '#E5E7EB' : '#1E293B',
  textMuted: isDarkMode ? '#9CA3AF' : '#64748B',
  border: isDarkMode ? '#374151' : '#E5E7EB',
});

// Base style constants
const BASE_STYLES = {
  rounded: 'rounded-xl',
  roundedLg: 'rounded-lg',
  roundedFull: 'rounded-full',
  shadow: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  
  // Layout
  flex1: 'flex-1',
  flexRow: 'flex-row',
  flexCol: 'flex-col',
  itemsCenter: 'items-center',
  justifyCenter: 'justify-center',
  justifyBetween: 'justify-between',
  
  // Spacing
  p4: 'p-4',
  px4: 'px-4',
  py4: 'py-4',
  m4: 'm-4',
  mb4: 'mb-4',
  mt4: 'mt-4',
  
  // Components
  button: 'py-4 items-center justify-center w-full',
  buttonCompact: 'py-2 px-4 items-center justify-center',
  input: 'h-12 w-full px-4 mb-6 border',
  inputCompact: 'h-10 w-full px-3 border',
  card: 'rounded-xl p-4 border shadow-sm',
  modal: 'rounded-2xl p-4 border shadow-2xl',
  fab: 'w-15 h-15 rounded-full justify-center items-center',
} as const;

// Extended utility functions for comprehensive styling
export const getContainerStyle = (isDarkMode: boolean) => 
  `flex-1 ${getColors(isDarkMode).container}`;

export const getContainerAltStyle = (isDarkMode: boolean) => 
  `flex-1 ${getColors(isDarkMode).containerAlt}`;

export const getTextStyle = (isDarkMode: boolean, variant: 'primary' | 'secondary' | 'muted' | 'header' | 'inverse' = 'primary') => {
  const colors = getColors(isDarkMode);
  const textColors = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    header: colors.textHeader,
    inverse: colors.textInverse
  };
  return textColors[variant];
};

export const getInputStyle = (isDarkMode: boolean, variant: 'default' | 'alt' | 'compact' = 'default') => {
  const colors = getColors(isDarkMode);
  const baseInput = variant === 'compact' ? BASE_STYLES.inputCompact : BASE_STYLES.input;
  const bg = variant === 'alt' ? colors.inputAlt : colors.input;
  return `${baseInput} ${BASE_STYLES.rounded} ${bg} ${colors.textPrimary} ${colors.border}`;
};

export const getButtonStyle = (isDarkMode: boolean, variant: 'primary' | 'secondary' | 'danger' | 'success' | 'compact' = 'primary') => {
  const colors = getColors(isDarkMode);
  const baseButton = variant === 'compact' ? BASE_STYLES.buttonCompact : BASE_STYLES.button;
  
  const variants = {
    primary: `${baseButton} ${BASE_STYLES.rounded} ${colors.buttonPrimary}`,
    secondary: `${baseButton} ${BASE_STYLES.rounded} ${colors.buttonSecondary}`,
    danger: `${baseButton} ${BASE_STYLES.rounded} ${colors.buttonDanger}`,
    success: `${baseButton} ${BASE_STYLES.rounded} ${colors.buttonSuccess}`,
    compact: `${baseButton} ${BASE_STYLES.roundedLg} ${colors.buttonPrimary}`
  };
  return variants[variant];
};

export const getCardStyle = (isDarkMode: boolean, variant: 'default' | 'alt' = 'default') => {
  const colors = getColors(isDarkMode);
  const bg = variant === 'alt' ? colors.cardAlt : colors.card;
  return `${BASE_STYLES.card} ${bg} ${colors.border}`;
};

export const getModalStyle = (isDarkMode: boolean) => {
  const colors = getColors(isDarkMode);
  return `${BASE_STYLES.modal} ${colors.modal} ${colors.border}`;
};

export const getFabStyle = (isDarkMode: boolean) => {
  const colors = getColors(isDarkMode);
  return `${BASE_STYLES.fab} ${colors.buttonPrimary} ${BASE_STYLES.shadowLg}`;
};

export const getHeaderStyle = (isDarkMode: boolean) => ({
  backgroundColor: getColors(isDarkMode).header,
  headerTintColor: getThemeColors(isDarkMode).primary,
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: getColors(isDarkMode).textHeader,
  },
});

export const getTabBarStyle = (isDarkMode: boolean) => ({
  backgroundColor: getColors(isDarkMode).header,
  borderTopColor: isDarkMode ? '#1F2937' : '#E5E5EA',
  tabBarActiveTintColor: getThemeColors(isDarkMode).primary,
  tabBarInactiveTintColor: getThemeColors(isDarkMode).secondary,
});

export const getRefreshIconColor = (isDarkMode: boolean, refreshing: boolean) => 
  refreshing ? getThemeColors(isDarkMode).textMuted : getThemeColors(isDarkMode).primary;

export const getPlaceholderColor = (isDarkMode: boolean) => 
  getColors(isDarkMode).placeholder;

export const getStatusColor = (isDarkMode: boolean, status: 'success' | 'warning' | 'error' | 'info') => {
  const colors = getColors(isDarkMode);
  return colors[status];
};

// Picker/dropdown styles
export const getPickerStyle = (isDarkMode: boolean) => {
  const colors = getColors(isDarkMode);
  return `mt-1 p-3 ${BASE_STYLES.roundedLg} ${colors.border} justify-center ${colors.inputAlt}`;
};

// Loading screen style
export const getLoadingScreenStyle = (isDarkMode: boolean) => ({
  backgroundColor: getColors(isDarkMode).header,
});

// Common class combinations
export const getClassNames = (isDarkMode: boolean) => ({
  container: `${BASE_STYLES.flex1} ${getColors(isDarkMode).container}`,
  containerAlt: `${BASE_STYLES.flex1} ${getColors(isDarkMode).containerAlt}`,
  card: getCardStyle(isDarkMode),
  cardAlt: getCardStyle(isDarkMode, 'alt'),
  textPrimary: getTextStyle(isDarkMode, 'primary'),
  textSecondary: getTextStyle(isDarkMode, 'secondary'),
  textMuted: getTextStyle(isDarkMode, 'muted'),
  input: getInputStyle(isDarkMode),
  inputAlt: getInputStyle(isDarkMode, 'alt'),
  buttonPrimary: getButtonStyle(isDarkMode, 'primary'),
  buttonSecondary: getButtonStyle(isDarkMode, 'secondary'),
  fab: getFabStyle(isDarkMode),
});

// Export the internal functions for advanced usage
export { getColors, BASE_STYLES };
