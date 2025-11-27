/**
 * Theme constants extracted from mobile app (app/constants/colors.ts)
 * Deep Purple Theme
 */

export const colors = {
  // Primary Colors
  primary: '#6B46C1',
  primaryDark: '#553C9A',
  primaryLight: '#8B5CF6',
  
  // Secondary Colors
  lavender: '#C4B5FD',
  lavenderLight: '#E9D5FF',
  coral: '#FF6B6B',
  coralLight: '#FFB3BA',
  
  // Action Colors
  yummy: '#10B981',
  yummyLight: '#6EE7B7',
  ick: '#EF4444',
  ickLight: '#FCA5A5',
  maybe: '#F59E0B',
  maybeLight: '#FCD34D',
  
  // Neutral Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  background: '#F9FAFB',
  backgroundWhite: '#FFFFFF',
  backgroundGray: '#F3F4F6',
  border: '#E5E7EB',
  
  // Semantic Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

export const typography = {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
  },
  fontSize: {
    h1: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
    h2: ['24px', { lineHeight: '1.3', fontWeight: '500' }],
    body: ['18px', { lineHeight: '1.6', fontWeight: '400' }],
    small: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
    button: ['18px', { lineHeight: '1.5', fontWeight: '600' }],
  },
} as const;

export const spacing = {
  // Custom spacing values if needed
} as const;

export const borderRadius = {
  // Soft, rounded shapes (no sharp edges)
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;


