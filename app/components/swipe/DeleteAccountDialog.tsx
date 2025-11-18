import React from 'react';
import { Dialog, Portal, Text, Button } from 'react-native-paper';
import { Colors } from '../../constants/colors';

type DeleteAccountDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function DeleteAccountDialog({
  visible,
  onDismiss,
  onConfirm,
  isLoading = false,
}: DeleteAccountDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Delete Account</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.warningText}>
            Are you sure you want to delete your account? This action cannot be undone and will
            permanently delete all your data, including your profile, swipes, and partner
            connections.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onPress={onConfirm}
            textColor={Colors.error}
            loading={isLoading}
            disabled={isLoading}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = {
  warningText: {
    color: Colors.textPrimary,
    lineHeight: 20,
  },
};

