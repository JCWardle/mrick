import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import 'react-native-reanimated';
import { theme } from '../constants/theme';
import { GradientBackground } from '../components/ui/GradientBackground';
import { handleDeepLink } from '../lib/deepLinkHandler';

export default function RootLayout() {
  useEffect(() => {
    // Handle initial URL (when app is opened via deep link)
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
              <Stack.Screen name="(swipe)/index" />
              <Stack.Screen name="(swipe)/invite" />
              <Stack.Screen name="(swipe)/matching" />
              <Stack.Screen name="(swipe)/profile" />
              <Stack.Screen name="(tabs)" />
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
