import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle, TextInputProps, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/borderRadius';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { MaterialIcons } from '@expo/vector-icons';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  success?: boolean;
  type?: 'text' | 'password';
  containerStyle?: ViewStyle;
  labelStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  success,
  type = 'text',
  containerStyle,
  labelStyle,
  value,
  onChangeText,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const showClearButton = isPassword && value && value.length > 0;

  const borderColor = error
    ? Colors.error
    : isFocused
    ? Colors.primary
    : success
    ? Colors.success
    : Colors.border;

  const handleClear = () => {
    onChangeText?.('');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
        {isPassword && (
          <View style={styles.iconContainer}>
            {showClearButton && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={isPasswordVisible ? 'visibility' : 'visibility-off'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}
        {success && !isPassword && (
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={20} color={Colors.success} />
          </View>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 2,
    paddingBottom: Spacing.md,
    minHeight: 52,
  },
  input: {
    ...Typography.body,
    flex: 1,
    color: Colors.textPrimary,
    padding: 0,
    lineHeight: 26,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
    ...(Platform.OS === 'android' && {
      textAlignVertical: 'center',
      includeFontPadding: false,
    }),
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

