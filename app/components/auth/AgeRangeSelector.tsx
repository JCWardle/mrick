import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';
import { AgeRange } from '../../lib/profiles';

const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const getAgeRangeLabel = (value: AgeRange | null): string => {
  if (!value) return 'Select age range';
  const range = AGE_RANGES.find((r) => r.value === value);
  return range?.label || value;
};

interface AgeRangeSelectorProps {
  selected?: AgeRange | null;
  onSelect: (range: AgeRange) => void;
}

export function AgeRangeSelector({ selected, onSelect }: AgeRangeSelectorProps) {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (range: AgeRange) => {
    onSelect(range);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        Select your age range
      </Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {getAgeRangeLabel(selected)}
          </Button>
        }
      >
        {AGE_RANGES.map((range) => (
          <Menu.Item
            key={range.value}
            onPress={() => handleSelect(range.value)}
            title={range.label}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  label: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 4,
  },
  buttonContent: {
    justifyContent: 'flex-start',
  },
});
