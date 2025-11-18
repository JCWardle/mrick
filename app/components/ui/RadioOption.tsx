import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/borderRadius';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

export interface RadioOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  value: string;
}

export function RadioOption({ label, selected, onSelect }: RadioOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.radioIndicator, selected && styles.radioIndicatorSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[Typography.body, styles.label]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    marginBottom: Spacing.md,
  },
  containerSelected: {
    backgroundColor: 'rgba(107, 70, 193, 0.2)', // primary with ~20% opacity
    borderColor: Colors.primary,
  },
  radioIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIndicatorSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  label: {
    flex: 1,
    color: Colors.backgroundWhite,
  },
});

