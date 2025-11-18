import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { getIntensityColor } from '../../utils/intensityColors';

interface IntensityBadgeProps {
  intensity: number;
  showLabel?: boolean;
}

export function IntensityBadge({ intensity, showLabel = false }: IntensityBadgeProps) {
  const colorScheme = getIntensityColor(intensity);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorScheme.backgroundColor },
      ]}
    >
      <Text
        variant="labelSmall"
        style={[styles.badgeText, { color: colorScheme.textColor }]}
      >
        {showLabel ? colorScheme.label : intensity}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
});

