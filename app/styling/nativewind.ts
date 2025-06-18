/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                              NATIVEWIND STYLES                                      ║
 * ║                                                                                      ║
 * ║ Centralized styling system using NativeWind/Tailwind CSS classes.                  ║
 * ║ Provides consistent theming and reusable component styles.                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// LAYOUT STYLES
// ============================================================================

export const layoutStyles = {
  // Container styles
  container: {
    light: 'flex-1 bg-gray-50',
    dark: 'flex-1 bg-slate-900',
    get: (isDarkMode: boolean) => isDarkMode ? layoutStyles.container.dark : layoutStyles.container.light
  },
  
  // Screen containers
  screenContainer: {
    light: 'flex-1 justify-center items-center px-6 bg-gray-50',
    dark: 'flex-1 justify-center items-center px-6 bg-slate-900',
    get: (isDarkMode: boolean) => isDarkMode ? layoutStyles.screenContainer.dark : layoutStyles.screenContainer.light
  },
  
  // Content wrappers
  contentWrapper: 'w-full max-w-sm items-center justify-center',
  formContainer: 'w-full items-center mb-8',
  
  // Common layout utilities
  centerContent: 'justify-center items-center',
  fullWidth: 'w-full',
  flexRow: 'flex-row',
  flexCol: 'flex-col',
};

// ============================================================================
// TEXT STYLES
// ============================================================================

export const textStyles = {
  // Headings
  heading1: {
    light: 'text-4xl font-extrabold mb-4 text-center text-slate-800',
    dark: 'text-4xl font-extrabold mb-4 text-center text-slate-100',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.heading1.dark : textStyles.heading1.light
  },
  
  heading2: {
    light: 'text-3xl font-bold text-gray-900',
    dark: 'text-3xl font-bold text-white',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.heading2.dark : textStyles.heading2.light
  },
  
  heading3: {
    light: 'text-xl font-bold text-gray-900',
    dark: 'text-xl font-bold text-white',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.heading3.dark : textStyles.heading3.light
  },
  
  // Title text for modals and sections
  title: {
    light: 'text-lg font-semibold text-gray-900',
    dark: 'text-lg font-semibold text-white',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.title.dark : textStyles.title.light
  },
  
  // Body text
  body: {
    light: 'text-base text-gray-600',
    dark: 'text-base text-gray-300',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.body.dark : textStyles.body.light
  },
  
  bodyCenter: {
    light: 'text-base mb-3 text-center text-gray-600',
    dark: 'text-base mb-3 text-center text-gray-300',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.bodyCenter.dark : textStyles.bodyCenter.light
  },
  
  // Small text
  small: {
    light: 'text-sm text-gray-600',
    dark: 'text-sm text-gray-300',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.small.dark : textStyles.small.light
  },
  
  // Extra small text (legal, captions)
  caption: {
    light: 'text-xs text-center mt-4 mb-2 text-gray-500',
    dark: 'text-xs text-center mt-4 mb-2 text-gray-400',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.caption.dark : textStyles.caption.light
  },
  
  // Utility text styles
  textCenter: 'text-center',
  fontBold: 'font-bold',
  fontSemibold: 'font-semibold',
  fontMedium: 'font-medium',
  
  // Interactive text
  link: {
    light: 'underline text-blue-600',
    dark: 'underline text-blue-400',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.link.dark : textStyles.link.light
  },
  
  backButton: {
    light: 'font-semibold text-base text-slate-800',
    dark: 'font-semibold text-base text-slate-100',
    get: (isDarkMode: boolean) => isDarkMode ? textStyles.backButton.dark : textStyles.backButton.light
  },
};

// ============================================================================
// INPUT STYLES
// ============================================================================

export const inputStyles = {
  // Standard text input
  textInput: {
    light: 'w-full px-4 py-4 rounded-lg border mb-6 bg-gray-50 border-gray-300 text-slate-800',
    dark: 'w-full px-4 py-4 rounded-lg border mb-6 bg-slate-800 border-gray-600 text-gray-200',
    get: (isDarkMode: boolean) => isDarkMode ? inputStyles.textInput.dark : inputStyles.textInput.light
  },
  
  // Centered text input (for codes)
  textInputCenter: {
    light: 'w-full px-4 py-4 rounded-lg border mb-6 text-center bg-gray-50 border-gray-300 text-slate-800',
    dark: 'w-full px-4 py-4 rounded-lg border mb-6 text-center bg-slate-800 border-gray-600 text-gray-200',
    get: (isDarkMode: boolean) => isDarkMode ? inputStyles.textInputCenter.dark : inputStyles.textInputCenter.light
  },
  
  // Search input
  searchInput: {
    light: 'w-full px-4 py-3 rounded-lg border bg-white border-gray-200 text-gray-900',
    dark: 'w-full px-4 py-3 rounded-lg border bg-gray-800 border-gray-600 text-white',
    get: (isDarkMode: boolean) => isDarkMode ? inputStyles.searchInput.dark : inputStyles.searchInput.light
  },
};

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttonStyles = {
  // Primary buttons
  primary: {
    enabled: 'w-full py-4 rounded-lg items-center bg-blue-600 mb-4',
    disabled: {
      light: 'w-full py-4 rounded-lg items-center bg-gray-400 mb-4',
      dark: 'w-full py-4 rounded-lg items-center bg-gray-600 mb-4',
      get: (isDarkMode: boolean) => isDarkMode ? buttonStyles.primary.disabled.dark : buttonStyles.primary.disabled.light
    },
    get: (isDarkMode: boolean, isDisabled: boolean) => 
      isDisabled ? buttonStyles.primary.disabled.get(isDarkMode) : buttonStyles.primary.enabled
  },
  
  // Primary buttons (verify variant with less bottom margin)
  primaryVerify: {
    enabled: 'w-full py-4 rounded-lg items-center bg-blue-600 mb-3',
    disabled: {
      light: 'w-full py-4 rounded-lg items-center bg-gray-400 mb-3',
      dark: 'w-full py-4 rounded-lg items-center bg-gray-600 mb-3',
      get: (isDarkMode: boolean) => isDarkMode ? buttonStyles.primaryVerify.disabled.dark : buttonStyles.primaryVerify.disabled.light
    },
    get: (isDarkMode: boolean, isDisabled: boolean) => 
      isDisabled ? buttonStyles.primaryVerify.disabled.get(isDarkMode) : buttonStyles.primaryVerify.enabled
  },
  
  // Secondary buttons
  secondary: {
    light: 'w-full py-4 rounded-lg items-center border border-gray-300 bg-white',
    dark: 'w-full py-4 rounded-lg items-center border border-gray-600 bg-gray-800',
    get: (isDarkMode: boolean) => isDarkMode ? buttonStyles.secondary.dark : buttonStyles.secondary.light
  },
  
  // Text buttons
  textButton: 'mt-1',
  
  // Button text styles
  primaryText: 'font-bold text-lg text-white',
  secondaryText: {
    light: 'font-bold text-lg text-gray-900',
    dark: 'font-bold text-lg text-white',
    get: (isDarkMode: boolean) => isDarkMode ? buttonStyles.secondaryText.dark : buttonStyles.secondaryText.light
  },
  
  // Floating Action Button
  fab: {
    light: 'absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 justify-center items-center shadow-lg',
    dark: 'absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg',
    get: (isDarkMode: boolean) => isDarkMode ? buttonStyles.fab.dark : buttonStyles.fab.light
  },
};

// ============================================================================
// CARD STYLES
// ============================================================================

export const cardStyles = {
  // Standard card
  card: {
    light: 'bg-white rounded-xl p-4 border border-gray-200 shadow-sm',
    dark: 'bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-sm',
    get: (isDarkMode: boolean) => isDarkMode ? cardStyles.card.dark : cardStyles.card.light
  },
  
  // Large card with more padding
  cardLarge: {
    light: 'bg-white rounded-xl p-6 border border-gray-200 shadow-sm',
    dark: 'bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm',
    get: (isDarkMode: boolean) => isDarkMode ? cardStyles.cardLarge.dark : cardStyles.cardLarge.light
  },
  
  // Compact card
  cardCompact: {
    light: 'bg-white rounded-lg p-3 border border-gray-200',
    dark: 'bg-gray-800 rounded-lg p-3 border border-gray-700',
    get: (isDarkMode: boolean) => isDarkMode ? cardStyles.cardCompact.dark : cardStyles.cardCompact.light
  },
  
  // List item card
  listItem: {
    light: 'bg-white rounded-lg p-4 mb-3 border border-gray-200',
    dark: 'bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700',
    get: (isDarkMode: boolean) => isDarkMode ? cardStyles.listItem.dark : cardStyles.listItem.light
  },
  
  // Modal background
  modal: {
    light: 'bg-white',
    dark: 'bg-gray-800',
    get: (isDarkMode: boolean) => isDarkMode ? cardStyles.modal.dark : cardStyles.modal.light
  },
};

// ============================================================================
// UTILITY STYLES
// ============================================================================

export const utilityStyles = {
  // Spacing
  spacing: {
    xs: 'mb-1',
    sm: 'mb-2',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
  },
  
  // Padding
  padding: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
  
  // Margin
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },
  
  // Borders
  border: {
    light: 'border border-gray-200',
    dark: 'border border-gray-700',
    get: (isDarkMode: boolean) => isDarkMode ? utilityStyles.border.dark : utilityStyles.border.light
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
  
  // Error states
  error: 'text-red-500 mb-3 text-center text-sm',
  
  // Success states
  success: {
    light: 'text-green-600',
    dark: 'text-green-400',
    get: (isDarkMode: boolean) => isDarkMode ? utilityStyles.success.dark : utilityStyles.success.light
  },
  
  // Warning states
  warning: {
    light: 'text-yellow-600',
    dark: 'text-yellow-400',
    get: (isDarkMode: boolean) => isDarkMode ? utilityStyles.warning.dark : utilityStyles.warning.light
  },
};

// ============================================================================
// NAVIGATION STYLES
// ============================================================================

export const navigationStyles = {
  // Tab bar
  tabBar: {
    light: 'bg-white border-t border-gray-200',
    dark: 'bg-slate-900 border-t border-gray-800',
    get: (isDarkMode: boolean) => isDarkMode ? navigationStyles.tabBar.dark : navigationStyles.tabBar.light
  },
  
  // Header
  header: {
    light: 'bg-white border-b border-gray-200',
    dark: 'bg-slate-900 border-b border-gray-800',
    get: (isDarkMode: boolean) => isDarkMode ? navigationStyles.header.dark : navigationStyles.header.light
  },
};

// ============================================================================
// COMBINED STYLE GETTER FUNCTION
// ============================================================================

/**
 * Utility function to get themed styles easily
 * @param isDarkMode - Current dark mode state
 * @returns Object with all themed styles
 */
export const getThemedStyles = (isDarkMode: boolean) => ({
  layout: {
    container: layoutStyles.container.get(isDarkMode),
    screenContainer: layoutStyles.screenContainer.get(isDarkMode),
    contentWrapper: layoutStyles.contentWrapper,
    formContainer: layoutStyles.formContainer,
  },
  
  text: {
    heading1: textStyles.heading1.get(isDarkMode),
    heading2: textStyles.heading2.get(isDarkMode),
    heading3: textStyles.heading3.get(isDarkMode),
    title: textStyles.title.get(isDarkMode),
    body: textStyles.body.get(isDarkMode),
    bodyCenter: textStyles.bodyCenter.get(isDarkMode),
    small: textStyles.small.get(isDarkMode),
    caption: textStyles.caption.get(isDarkMode),
    link: textStyles.link.get(isDarkMode),
    backButton: textStyles.backButton.get(isDarkMode),
  },
  
  input: {
    textInput: inputStyles.textInput.get(isDarkMode),
    textInputCenter: inputStyles.textInputCenter.get(isDarkMode),
    searchInput: inputStyles.searchInput.get(isDarkMode),
  },
  
  button: {
    primary: (isDisabled: boolean) => buttonStyles.primary.get(isDarkMode, isDisabled),
    primaryVerify: (isDisabled: boolean) => buttonStyles.primaryVerify.get(isDarkMode, isDisabled),
    secondary: buttonStyles.secondary.get(isDarkMode),
    fab: buttonStyles.fab.get(isDarkMode),
  },
  
  card: {
    card: cardStyles.card.get(isDarkMode),
    cardLarge: cardStyles.cardLarge.get(isDarkMode),
    cardCompact: cardStyles.cardCompact.get(isDarkMode),
    modal: cardStyles.modal.get(isDarkMode),
    listItem: cardStyles.listItem.get(isDarkMode),
  },
  
  utility: {
    border: utilityStyles.border.get(isDarkMode),
    success: utilityStyles.success.get(isDarkMode),
    warning: utilityStyles.warning.get(isDarkMode),
  },
  
  navigation: {
    tabBar: navigationStyles.tabBar.get(isDarkMode),
    header: navigationStyles.header.get(isDarkMode),
  },
});

export default {
  layoutStyles,
  textStyles,
  inputStyles,
  buttonStyles,
  cardStyles,
  utilityStyles,
  navigationStyles,
  getThemedStyles,
};
