import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton, Snackbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { useAuth } from '../../hooks/useAuth';
import { checkInvitationAccepted } from '../../lib/deepLinkHandler';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function MatchingScreen() {
  const router = useRouter();
  const { profile, isLoading, refreshProfile } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const previousPartnerId = useRef<string | null>(null);

  // Check if user has no partner when screen loads or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkInvitation = async () => {
        if (!isLoading && profile) {
          // Check if an invitation was just accepted (from deep link)
          const invitationAccepted = await checkInvitationAccepted();
          if (invitationAccepted) {
            // Refresh profile to get updated partner_id
            await refreshProfile();
            setSnackbarMessage("You're now linked with your partner!");
            setSnackbarVisible(true);
          }

          // Check if partner_id was just set (user just linked with partner)
          if (previousPartnerId.current === null && profile.partner_id) {
            // Partner was just linked, show success message
            setSnackbarMessage("You're now linked with your partner!");
            setSnackbarVisible(true);
          }
          previousPartnerId.current = profile.partner_id || null;

          // Navigate to invite screen if no partner
          if (!profile.partner_id) {
            router.replace('/(swipe)/invite' as any);
          }
        }
      };

      checkInvitation();
    }, [profile, isLoading, refreshProfile])
  );

  // Refresh profile when screen comes into focus to catch any updates
  useFocusEffect(
    React.useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <GradientBackground gradientId="matchingGradient" />
      
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={Colors.backgroundWhite}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineSmall" style={styles.title}>
          Matching
        </Text>
      </View>
      
      <View style={styles.content}>
        {profile?.partner_id ? (
          <Text variant="bodyLarge" style={styles.placeholderText}>
            Matching screen coming soon
          </Text>
        ) : (
          <Text variant="bodyLarge" style={styles.placeholderText}>
            Invite your partner to compare preferences
          </Text>
        )}
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
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
            // Already on matching screen, no action needed
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  placeholderText: {
    color: Colors.backgroundWhite,
    textAlign: 'center',
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
  snackbar: {
    marginBottom: Spacing.xl,
  },
});

