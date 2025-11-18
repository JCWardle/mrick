import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/borderRadius';
import { Spacing } from '../../constants/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'contained';

export interface ButtonProps {
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

const buttonStyles = StyleSheet.create({
  base: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: Colors.backgroundWhite,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.backgroundWhite,
  },
  contained: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  secondary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.backgroundWhite,
  },
  contained: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.backgroundWhite,
  },
});

export function Button({
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  children,
  style,
}: ButtonProps) {
  const buttonStyle = [
    buttonStyles.base,
    buttonStyles[variant],
    disabled && buttonStyles.disabled,
    style,
  ];

  const textStyle = textStyles[variant];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.primary : Colors.backgroundWhite}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

