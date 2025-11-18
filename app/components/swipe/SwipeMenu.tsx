import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SideDrawer } from '../ui/SideDrawer';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type SwipeMenuProps = {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

export function SwipeMenu({ visible, onClose, onSignOut, onDeleteAccount }: SwipeMenuProps) {
  return (
    <SideDrawer visible={visible} onClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'left']}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Menu
          </Text>
        </View>
        
        <Divider />
        
        <View style={styles.menuItems}>
          <TouchableMenuItem
            label="Sign Out"
            onPress={() => {
              onClose();
              onSignOut();
            }}
            textColor={Colors.textPrimary}
          />
          
          <Divider style={styles.divider} />
          
          <TouchableMenuItem
            label="Delete Account"
            onPress={() => {
              onClose();
              onDeleteAccount();
            }}
            textColor={Colors.error}
          />
        </View>
      </SafeAreaView>
    </SideDrawer>
  );
}

type TouchableMenuItemProps = {
  label: string;
  onPress: () => void;
  textColor: string;
};

function TouchableMenuItem({ label, onPress, textColor }: TouchableMenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text variant="bodyLarge" style={[styles.menuItemText, { color: textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
  },
  menuItems: {
    paddingTop: Spacing.sm,
  },
  menuItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
  },
  divider: {
    marginVertical: Spacing.xs,
  },
});

