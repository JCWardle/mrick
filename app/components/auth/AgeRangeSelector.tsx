import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';
import { AgeRange } from '../../lib/profiles';

const AGE_RANGES: AgeRange[] = ['18-24', '25-34', '35-44', '45-54', '55+'];

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
            {selected || 'Select age range'}
          </Button>
        }
      >
        {AGE_RANGES.map((range) => (
          <Menu.Item
            key={range}
            onPress={() => handleSelect(range)}
            title={range}
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
