import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { handleDeepLink } from '../../../lib/deepLinkHandler';
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
    if (!code) {
      // No code provided, redirect to home
      router.replace('/');
      return;
    }

    // Construct the deep link URL
    const deepLink = `mrick://partner/invite/${code}`;
    
    // Handle the deep link (this will accept the invitation if user is authenticated)
    handleDeepLink(deepLink).then(() => {
      // After handling, redirect to appropriate screen
      if (!isAuthenticated) {
        router.replace('/(auth)');
      } else if (!isProfileComplete) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(swipe)');
      }
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

