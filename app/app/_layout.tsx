import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';
import { theme } from '../constants/theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { handleDeepLink } from '../lib/deepLinkHandler';
import { setupNotificationHandlers, initializeNotifications } from '../lib/notifications';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Handle initial URL (when app is opened via deep link)
    // Note: Expo Router will also handle routing, and we have a route file
    // at app/partner/invite/[code].tsx that will match partner invite links
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Set up notification handlers
  useEffect(() => {
    const cleanup = setupNotificationHandlers(
      // Notification received handler
      (notification) => {
        console.log('Notification received in foreground:', notification);
      },
      // Notification opened/tapped handler
      (response) => {
        console.log('Notification opened:', response);
        const data = response.notification.request.content.data;
        
        // Navigate to matching screen if it's a swipe completion notification
        if (data?.type === 'swipe_completion' || data?.screen === 'matching') {
          router.push('/(swipe)/matching' as any);
        }
      }
    );

    return cleanup;
  }, [router]);

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications();
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <View style={styles.container}>
            <GradientBackground gradientId="onboardingGradient" />
            <Stack 
              screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/index" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/signup" />
              <Stack.Screen name="(auth)/onboarding" />
              <Stack.Screen name="(swipe)" />
            </Stack>
          </View>
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
