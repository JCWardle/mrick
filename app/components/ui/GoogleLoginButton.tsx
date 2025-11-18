import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/borderRadius';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';

export interface GoogleLoginButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function GoogleLoginButton({
  onPress,
  disabled = false,
  loading = false,
  style,
}: GoogleLoginButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <MaterialIcons name="google" size={20} color={Colors.textPrimary} style={styles.icon} />
      {loading ? (
        <ActivityIndicator color={Colors.textPrimary} size="small" />
      ) : (
        <Text style={styles.text}>Continue with Google</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    width: '100%',
  },
  icon: {
    position: 'absolute',
    left: Spacing.md,
  },
  text: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
  disabled: {
    opacity: 0.5,
  },
});

