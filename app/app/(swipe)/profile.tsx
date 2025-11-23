import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Divider, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { DeleteAccountDialog } from '../../components/swipe/DeleteAccountDialog';
import { Snackbar } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, deleteAccount } = useAuth();
  const [showError, setShowError] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to sign out');
      setShowError(true);
    }
  };

  const handleDeleteAccountPress = () => {
    setDeleteDialogVisible(true);
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      router.replace('/(auth)/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setShowError(true);
      setIsDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <GradientBackground gradientId="profileGradient" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={Colors.backgroundWhite}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Profile
          </Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.menuItems}>
          <TouchableMenuItem
            label="Sign Out"
            onPress={handleSignOut}
            textColor={Colors.backgroundWhite}
          />
          
          <Divider style={styles.itemDivider} />
          
          <TouchableMenuItem
            label="Delete Account"
            onPress={handleDeleteAccountPress}
            textColor={Colors.error}
          />
        </View>
      </View>

      <DeleteAccountDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteAccountConfirm}
        isLoading={isDeleting}
      />

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={4000}
      >
        {deleteError || 'An error occurred'}
      </Snackbar>
    </SafeAreaView>
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
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    margin: 0,
  },
  title: {
    color: Colors.backgroundWhite,
    marginLeft: Spacing.xs,
  },
  divider: {
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  itemDivider: {
    marginVertical: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

