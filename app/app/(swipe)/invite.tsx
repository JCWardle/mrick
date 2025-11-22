import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { setStringAsync } from 'expo-clipboard';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { createInvitation, PartnerInvitation, InvitationError } from '../../lib/partnerInvitations';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BorderRadius } from '../../constants/borderRadius';
import { Button } from '../../components/ui/Button';

export default function InviteScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [invitation, setInvitation] = useState<PartnerInvitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    generateInvitation();
  }, []);

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
      Alert.alert('Error', message, [{ text: 'OK', onPress: () => router.back() }]);
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <GradientBackground gradientId="inviteGradient" />
      
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text variant="bodyMedium" style={styles.loadingText}>
              Generating invitation...
            </Text>
          </View>
        ) : invitation ? (
          <View style={styles.inviteContent}>
            <Text variant="headlineSmall" style={styles.title}>
              Invite your playmate
            </Text>
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
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        Link copied!
      </Snackbar>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(swipe)/index' as any)}
        >
          <IconButton
            icon="heart-outline"
            size={24}
            iconColor={Colors.textTertiary}
            style={styles.navButton}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            // Already on invite screen, no action needed
          }}
        >
          <IconButton
            icon="account-multiple"
            size={24}
            iconColor={Colors.primary}
            style={styles.navButton}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(swipe)/profile' as any)}
        >
          <IconButton
            icon="account-outline"
            size={24}
            iconColor={Colors.textTertiary}
            style={styles.navButton}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  inviteContent: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: Colors.backgroundWhite,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontWeight: '600',
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
    color: Colors.backgroundWhite,
  },
  snackbar: {
    marginBottom: Spacing.xl,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: Spacing.xs,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    margin: 0,
  },
});

