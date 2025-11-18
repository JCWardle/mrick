import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { ActivityIndicator } from 'react-native-paper';
import { Button } from '../../components/ui/Button';
import { SafeScreen } from '../../components/ui/SafeScreen';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Image } from 'expo-image';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isProfileComplete) {
        router.replace('/(swipe)');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isAuthenticated, isProfileComplete, isLoading, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.backgroundWhite} />
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <SafeScreen showBackButton contentContainerStyle={styles.scrollContent}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <LoginForm
          onSuccess={() => {
            // Navigation handled by useEffect
          }}
        />
      </View>

      {/* Secondary Button - Create new account */}
      <View style={styles.secondaryButtonContainer}>
        <Button
          variant="secondary"
          onPress={() => router.push('/(auth)/signup')}
          style={styles.secondaryButton}
        >
          Create new account
        </Button>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingTop: Spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    width: '100%',
  },
  secondaryButtonContainer: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  secondaryButton: {
    // Variant styles are handled by Button component
  },
});
