// Typography System
// React Native StyleSheet for text styles

import { StyleSheet, Platform } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: Platform.select({ ios: '700', android: '700' }) as '700',
    lineHeight: 40,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: Platform.select({ ios: '600', android: '600' }) as '600',
    lineHeight: 32,
    letterSpacing: Platform.select({ ios: -0.3, android: 0 }),
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: Platform.select({ ios: '600', android: '600' }) as '600',
    lineHeight: 28,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0,
    color: Colors.textPrimary,
  },
  
  // UI Elements
  button: {
    fontSize: 16,
    fontWeight: Platform.select({ ios: '600', android: '600' }) as '600',
    lineHeight: 24,
    letterSpacing: 0.2,
    color: Colors.backgroundWhite,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.textSecondary,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: Colors.textTertiary,
  },
});

// Text color variants (use with style prop)
export const TextColors = {
  primary: { color: Colors.textPrimary },
  secondary: { color: Colors.textSecondary },
  tertiary: { color: Colors.textTertiary },
  inverse: { color: Colors.backgroundWhite },
  link: { color: Colors.primary },
  yummy: { color: Colors.yummy },
  ick: { color: Colors.ick },
} as const;

