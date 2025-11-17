import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

interface AgeRangeSelectorProps {
  onSelect: (range: string) => void;
}

export function AgeRangeSelector({ onSelect }: AgeRangeSelectorProps) {
  return (
    <View style={styles.container}>
      {AGE_RANGES.map((range) => (
        <Button key={range} mode="outlined" onPress={() => onSelect(range)}>
          {range}
        </Button>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
});

