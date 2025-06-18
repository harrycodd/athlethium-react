/**
 * ================================================================================================
 * STATS CONSTANTS
 * ================================================================================================
 * Constants and configuration for the stats screen including colors,
 * dimensions, and chart settings.
 */

import { Dimensions } from 'react-native';

// ================================================================================================
// CHART DIMENSIONS
// ================================================================================================

const screenWidth = Dimensions.get('window').width;

export const CHART_CONFIG = {
  WIDTH: screenWidth - 64,           // Account for px-6 (24px) on each side = 48px total
  HEIGHT: 200,                       // Optimal chart height
  LEFT_YAXIS_WIDTH: 35,             // Left Y-axis width for better text visibility
  RIGHT_YAXIS_WIDTH: 35,            // Right Y-axis width for better text visibility
  get GRAPH_WIDTH() {
    return this.WIDTH - this.LEFT_YAXIS_WIDTH - this.RIGHT_YAXIS_WIDTH;
  }
};

// ================================================================================================
// METRIC COLORS (ORGANIZED BY SCALE GROUPS)
// ================================================================================================

export const METRIC_COLORS = {
  // Weight Scale (Blue - distinct from others)
  weight: '#3B82F6',
  
  // Training Load Scale (Green family)
  ctl: '#10B981',              // Emerald Green - Fitness (Chronic Training Load)
  form: '#059669',             // Darker Green - Form (freshness)
  
  // Power Scale (Orange - warm but distinct)
  eftp: '#F97316',             // Orange - eFTP (estimated Functional Threshold Power)
  
  // Feelings/Status Scale (Purple/Pink family)
  physicalFeeling: '#8B5CF6',  // Purple - Physical feeling
  mentalFeeling: '#A855F7',    // Light Purple - Mental feeling
  sleep: '#6366F1',            // Indigo - Sleep quality
  injury: '#EC4899',           // Pink - Injury status
  illness: '#F43F5E',          // Rose - Illness status
};

// ================================================================================================
// THEME COLORS
// ================================================================================================

export const MODERN_THEME = {
  BG: '#101014',
  CARD: '#181A20',
  SHADOW: '#0008',
  BORDER: '#23242b',
  TEXT: '#F3F4F6',
  MUTED: '#6B7280',
  ACCENT: '#2563EB',
};

// ================================================================================================
// METRIC CONFIGURATIONS
// ================================================================================================

export const METRIC_CONFIGS = [
  { key: 'weight', label: 'Weight', color: METRIC_COLORS.weight, lineStyle: 'solid' },
  { key: 'ctl', label: 'Fitness', color: METRIC_COLORS.ctl, lineStyle: 'solid' },
  { key: 'eftp', label: 'eFTP', color: METRIC_COLORS.eftp, lineStyle: 'solid' },
  { key: 'physicalFeeling', label: 'Physical', color: METRIC_COLORS.physicalFeeling, lineStyle: 'solid' },
  { key: 'mentalFeeling', label: 'Mental', color: METRIC_COLORS.mentalFeeling, lineStyle: 'dashed' },
  { key: 'sleep', label: 'Sleep', color: METRIC_COLORS.sleep, lineStyle: 'solid' },
  { key: 'form', label: 'Form', color: METRIC_COLORS.form, lineStyle: 'dashed' },
  { key: 'injury', label: 'Injury', color: METRIC_COLORS.injury, lineStyle: 'dotted' },
  { key: 'illness', label: 'Illness', color: METRIC_COLORS.illness, lineStyle: 'dotted' },
];

// ================================================================================================
// DATE RANGE OPTIONS
// ================================================================================================

export const TIME_RANGES = [
  { value: '7d' as const, label: '7 Days' },
  { value: '30d' as const, label: '30 Days' },
  { value: '90d' as const, label: '90 Days' },
];

export const DATE_RANGE_OPTIONS = [
  { key: '7d' as const, label: '7 Days', days: 7 },
  { key: '14d' as const, label: '14 Days', days: 14 },
  { key: '28d' as const, label: '28 Days', days: 28 },
];

// ================================================================================================
// DEFAULT VISIBILITY SETTINGS
// ================================================================================================

export const DEFAULT_VISIBLE_METRICS = {
  ctl: true,
  eftp: true,
  form: true,
  physicalFeeling: false,
  mentalFeeling: false,
  sleep: false,
  weight: false,
  illness: false,
  injury: false,
};

// ================================================================================================
// CHART STYLES
// ================================================================================================

export const CHART_STYLES = {
  strokeWidth: 2,
  contentInset: { top: 20, bottom: 20, left: 20, right: 20 },
  gridProps: {
    stroke: '#e0e0e0',
    strokeOpacity: 0.3,
  },
};
