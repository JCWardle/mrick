// React Native Paper Theme Configuration
// Based on STYLES.md - Deep Purple Theme

import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Colors } from './colors';

// Configure font family (uses system fonts by default)
const fontConfig = {
  ...MD3LightTheme.fonts,
  // Customize if needed, but system fonts work well
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.lavenderLight,
    secondary: Colors.coral,
    secondaryContainer: Colors.coralLight,
    tertiary: Colors.lavender,
    error: Colors.error,
    errorContainer: Colors.ickLight,
    surface: Colors.backgroundWhite,
    surfaceVariant: Colors.backgroundGray,
    background: Colors.background,
    onPrimary: Colors.backgroundWhite,
    onSecondary: Colors.backgroundWhite,
    onSurface: Colors.textPrimary,
    onSurfaceVariant: Colors.textSecondary,
    outline: Colors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
};

