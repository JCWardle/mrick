import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignUpForm } from '../../components/auth/SignUpForm';
import { useAuth } from '../../hooks/useAuth';
import { ActivityIndicator } from 'react-native-paper';
import { SafeScreen } from '../../components/ui/SafeScreen';
import { Colors } from '../../constants/colors';

export default function SignUpScreen() {
  const router = useRouter();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isProfileComplete) {
        router.replace('/(swipe)');
      } else {
        router.replace('/(auth)/gender');
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
    <SafeScreen showBackButton gradientId="signupGradient">
      <SignUpForm
        onSuccess={() => {
          // Navigation handled by useEffect
        }}
      />
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
});
