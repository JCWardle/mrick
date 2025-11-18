import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSwipeGroup = segments[0] === '(swipe)';

    if (!isAuthenticated) {
      // User is not authenticated, redirect to auth welcome screen
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    } else if (!isProfileComplete) {
      // User is authenticated but profile incomplete, redirect to onboarding
      if (!inAuthGroup) {
        router.replace('/(auth)/age-range');
      }
    } else {
      // User is authenticated and profile complete, redirect to swipe
      if (inAuthGroup || segments.length === 0) {
        router.replace('/(swipe)');
      }
    }
  }, [isAuthenticated, isProfileComplete, isLoading, segments, router]);

  // Show loading while checking auth state
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
  },
});

