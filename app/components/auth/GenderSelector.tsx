import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';
import { Gender } from '../../lib/profiles';

const GENDERS: Gender[] = ['male', 'female', 'non-binary', 'prefer-not-to-say'];

const formatGender = (gender: Gender): string => {
  return gender.charAt(0).toUpperCase() + gender.slice(1).replace(/-/g, ' ');
};

interface GenderSelectorProps {
  selected?: Gender | null;
  onSelect: (gender: Gender) => void;
}

export function GenderSelector({ selected, onSelect }: GenderSelectorProps) {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (gender: Gender) => {
    onSelect(gender);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        Gender
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
            {selected ? formatGender(selected) : 'Select gender'}
          </Button>
        }
      >
        {GENDERS.map((gender) => (
          <Menu.Item
            key={gender}
            onPress={() => handleSelect(gender)}
            title={formatGender(gender)}
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

