import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/borderRadius';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';

export interface AppleLoginButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function AppleLoginButton({
  onPress,
  disabled = false,
  loading = false,
  style,
}: AppleLoginButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.backgroundWhite} size="small" />
      ) : (
        <View style={styles.content}>
          <MaterialIcons name="apple" size={20} color={Colors.backgroundWhite} style={styles.icon} />
          <Text style={styles.text}>Sign in with Apple</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    ...Typography.button,
    color: Colors.backgroundWhite,
    fontSize: 16,
    fontWeight: '400',
  },
  disabled: {
    opacity: 0.5,
  },
});

