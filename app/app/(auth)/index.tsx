import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Spacing } from '../../constants/spacing';
import { Image } from 'expo-image';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  
  // Animation for pulsing logo
  const scale = useSharedValue(1);

  useEffect(() => {
    // Start pulsing animation - scale from 1.0 to 1.2 (20% bigger) and back
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true // Reverse animation (ping-pong)
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <GradientBackground />

      <View style={styles.content}>
        {/* Main Visual Area */}
        <View style={styles.visualArea}>
          <Animated.View style={logoAnimatedStyle}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </View>

        {/* Brand Name */}
        <Text variant="brandName" style={styles.brandName}>
          Peek
        </Text>

        {/* Tagline */}
        <Text variant="tagline" style={styles.tagline}>
          Discover what you both enjoy — without the awkwardness
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.button}
          >
            Get Started
          </Button>

          <Button
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            style={styles.button}
          >
            I already have an account
          </Button>
        </View>

        {/* Legal Text */}
        <View style={styles.legalContainer}>
          <Text variant="legal" style={styles.legalText}>
            By continuing, you agree to{' '}
            <Text variant="link" onPress={() => {}}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text variant="link" onPress={() => {}}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  visualArea: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandName: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  tagline: {
    marginBottom: Spacing.xxl,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  button: {
    marginHorizontal: 0,
  },
  legalContainer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  legalText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
