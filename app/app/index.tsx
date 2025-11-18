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

    // Only handle navigation if we're at the root index route (segments empty or just 'index')
    // Let other screens (like login) handle their own navigation
    const isAtRoot = segments.length === 0 || (segments.length === 1 && segments[0] === 'index');
    if (!isAtRoot) {
      return;
    }

    if (!isAuthenticated) {
      // User is not authenticated, redirect to auth welcome screen
      router.replace('/(auth)');
    } else if (!isProfileComplete) {
      // User is authenticated but profile incomplete, redirect to onboarding
      router.replace('/(auth)/gender');
    } else {
      // User is authenticated and profile complete, redirect to swipe
      router.replace('/(swipe)');
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

