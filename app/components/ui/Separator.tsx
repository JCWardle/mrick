import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

export function Separator() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>or</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'transparent',
  },
  text: {
    ...Typography.caption,
    color: Colors.lavenderLight,
  },
});

