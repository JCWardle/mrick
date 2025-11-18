import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';
import { SexualPreference } from '../../lib/profiles';

const SEXUAL_PREFERENCES: SexualPreference[] = [
  'straight',
  'gay',
  'lesbian',
  'bisexual',
  'pansexual',
  'asexual',
  'prefer-not-to-say',
];

const formatPreference = (pref: SexualPreference): string => {
  return pref.charAt(0).toUpperCase() + pref.slice(1).replace(/-/g, ' ');
};

interface SexualPreferenceSelectorProps {
  selected?: SexualPreference | null;
  onSelect: (preference: SexualPreference) => void;
}

export function SexualPreferenceSelector({
  selected,
  onSelect,
}: SexualPreferenceSelectorProps) {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (preference: SexualPreference) => {
    onSelect(preference);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        Sexual preference
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
            {selected ? formatPreference(selected) : 'Select sexual preference'}
          </Button>
        }
      >
        {SEXUAL_PREFERENCES.map((pref) => (
          <Menu.Item
            key={pref}
            onPress={() => handleSelect(pref)}
            title={formatPreference(pref)}
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

