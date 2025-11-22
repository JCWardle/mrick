import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Modal, Portal, Text, IconButton, Snackbar } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { setStringAsync } from 'expo-clipboard';
import { createInvitation, PartnerInvitation, InvitationError } from '../../lib/partnerInvitations';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BorderRadius } from '../../constants/borderRadius';
import { Button } from '../ui/Button';

interface PartnerInviteModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function PartnerInviteModal({ visible, onDismiss }: PartnerInviteModalProps) {
  const [invitation, setInvitation] = useState<PartnerInvitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    if (visible && !invitation) {
      generateInvitation();
    }
  }, [visible]);

  const generateInvitation = async () => {
    setLoading(true);
    try {
      const newInvitation = await createInvitation();
      setInvitation(newInvitation);
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      let message = 'Failed to create invitation. Please try again.';
      if (error instanceof InvitationError) {
        switch (error.code) {
          case 'ALREADY_LINKED':
            message = 'You are already linked with a partner';
            break;
          case 'NETWORK_ERROR':
            message = 'Network error. Please check your connection and try again.';
            break;
          default:
            message = error.message || message;
        }
      } else {
        message = error.message || message;
      }
      Alert.alert('Error', message, [{ text: 'OK', onPress: onDismiss }]);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!invitation) return;

    const deepLink = `mrick://partner/invite/${invitation.code}`;
    try {
      await setStringAsync(deepLink);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link to clipboard');
    }
  };

  const deepLink = invitation ? `mrick://partner/invite/${invitation.code}` : '';

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.container}
          dismissable
        >
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Invite your playmate
            </Text>
            <IconButton
              icon="close"
              size={24}
              iconColor={Colors.textSecondary}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text variant="bodyMedium" style={styles.loadingText}>
                Generating invitation...
              </Text>
            </View>
          ) : invitation ? (
            <View style={styles.content}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={deepLink}
                  size={250}
                  backgroundColor={Colors.backgroundWhite}
                  color={Colors.textPrimary}
                />
              </View>

              <Button
                variant="contained"
                onPress={copyLink}
                style={styles.copyButton}
              >
                Copy Link
              </Button>
            </View>
          ) : null}
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        Link copied!
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundWhite,
    padding: Spacing.xl,
    margin: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  closeButton: {
    margin: 0,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  qrContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButton: {
    width: '100%',
    maxWidth: 300,
  },
  loadingContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  snackbar: {
    marginBottom: Spacing.xl,
  },
});

