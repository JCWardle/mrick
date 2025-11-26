import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { handleDeepLink, hasPendingInvitation } from '../../../lib/deepLinkHandler';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Route handler for partner invitation deep links
 * This route matches mrick://partner/invite/{code} to prevent "Unmatched Route" errors
 * The actual deep link handling is done by handleDeepLink()
 */
export default function PartnerInviteRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { isAuthenticated, isProfileComplete } = useAuth();

  useEffect(() => {
    // Handle case where code might be an array from useLocalSearchParams
    const invitationCode = Array.isArray(code) ? code[0] : code;
    
    if (!invitationCode) {
      // No code provided, redirect to home
      router.replace('/');
      return;
    }

    // Normalize code to uppercase and construct the deep link URL
    const normalizedCode = invitationCode.toUpperCase();
    const deepLink = `mrick://partner/invite/${normalizedCode}`;
    
    // Handle the deep link (this will accept the invitation if user is authenticated)
    handleDeepLink(deepLink).then(async () => {
      // After handling, redirect to appropriate screen
      if (!isAuthenticated) {
        // If there's a pending invitation, redirect directly to signup
        const hasInvite = await hasPendingInvitation();
        if (hasInvite) {
          router.replace('/(auth)/signup');
        } else {
          router.replace('/(auth)');
        }
      } else if (!isProfileComplete) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(swipe)');
      }
    }).catch((error) => {
      console.error('Error handling deep link:', error);
      // On error, redirect to home
      router.replace('/');
    });
  }, [code, router, isAuthenticated, isProfileComplete]);

  // Show loading state while processing
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

