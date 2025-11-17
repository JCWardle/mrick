// Color Palette for Mr. Ick
// Based on STYLES.md - Deep Purple Theme

export const Colors = {
  // Primary
  primary: '#6B46C1',
  primaryDark: '#553C9A',
  primaryLight: '#8B5CF6',
  
  // Secondary
  lavender: '#C4B5FD',
  lavenderLight: '#E9D5FF',
  coral: '#FF6B6B',
  coralLight: '#FFB3BA',
  
  // Actions
  yummy: '#10B981',
  yummyLight: '#6EE7B7',
  ick: '#EF4444',
  ickLight: '#FCA5A5',
  maybe: '#F59E0B',
  maybeLight: '#FCD34D',
  
  // Neutrals
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  background: '#F9FAFB',
  backgroundWhite: '#FFFFFF',
  backgroundGray: '#F3F4F6',
  border: '#E5E7EB',
  
  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// Type for TypeScript autocomplete
export type ColorKey = keyof typeof Colors;

