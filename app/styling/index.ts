/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                              STYLING INDEX                                          ║
 * ║                                                                                      ║
 * ║ Central export point for all styling utilities and constants.                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════╝
 */

// Export all NativeWind styles
export * from './nativewind';

// Re-export the main utilities for convenience
export { 
  getThemedStyles,
  layoutStyles,
  textStyles,
  inputStyles,
  buttonStyles,
  cardStyles,
  utilityStyles,
  navigationStyles
} from './nativewind';
