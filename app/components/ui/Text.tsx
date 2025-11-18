import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export type TextVariant = 'brandName' | 'tagline' | 'legal' | 'link';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

const variantStyles = StyleSheet.create({
  brandName: {
    fontSize: 36,
    fontWeight: Platform.select({ ios: '700', android: '700' }) as '700',
    lineHeight: 44,
    letterSpacing: Platform.select({ ios: -0.5, android: 0 }),
    color: Colors.backgroundWhite,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
    letterSpacing: 0,
    color: Colors.backgroundWhite,
  },
  legal: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.lavenderLight,
  },
  link: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
    color: Colors.backgroundWhite,
    textDecorationLine: 'underline',
  },
});

export function Text({ variant = 'tagline', style, ...props }: TextProps) {
  const variantStyle = variantStyles[variant];
  
  return (
    <RNText style={[variantStyle, style]} {...props} />
  );
}

