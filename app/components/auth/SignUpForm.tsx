import { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GoogleLoginButton } from '../ui/GoogleLoginButton';
import { AppleLoginButton } from '../ui/AppleLoginButton';
import { Separator } from '../ui/Separator';
import { Text } from '../ui/Text';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

type SignUpFormProps = {
  onSuccess?: () => void;
  hasInvite?: boolean;
};

export function SignUpForm({ onSuccess, hasInvite = false }: SignUpFormProps) {
  const router = useRouter();
  const { signUpWithEmail, loginWithGoogle, loginWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpWithEmail(email, password);
      
      // If signup succeeded but user needs email confirmation, show message
      if (result.user && !result.session) {
        Alert.alert(
          'Account Created',
          'Please check your email to verify your account. You can sign in after verification.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.();
              },
            },
          ]
        );
      } else {
        // User is automatically signed in (email confirmation disabled or already verified)
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Sign up failed';
      
      // Provide more specific error messages
      if (err.message) {
        if (err.message.includes('already registered') || err.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (err.message.includes('email')) {
          errorMessage = 'Invalid email address. Please check and try again.';
        } else if (err.message.includes('password')) {
          errorMessage = 'Password does not meet requirements.';
        } else if (err.message.includes('Database error') || err.message.includes('profile')) {
          errorMessage = 'Account created but profile setup failed. Please try signing in.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      // Note: OAuth flow will redirect, so onSuccess may not be called immediately
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await loginWithApple();
      // Note: OAuth flow will redirect, so onSuccess may not be called immediately
    } catch (err: any) {
      setError(err.message || 'Apple sign-in failed');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create an Account</Text>
        {hasInvite && (
          <View style={styles.inviteMessageContainer}>
            <Text style={styles.inviteMessage}>
              You've been invited! Sign up to peek at your partner's yums
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginLinkContainer}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLink}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Input
        label="Email"
        type="text"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={emailError || undefined}
        disabled={isLoading}
        containerStyle={styles.emailInput}
        labelStyle={styles.inputLabel}
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(null);
        }}
        autoCapitalize="none"
        autoComplete="password-new"
        error={passwordError || undefined}
        disabled={isLoading}
        containerStyle={styles.input}
        labelStyle={styles.inputLabel}
      />

      <Text style={styles.passwordRequirement}>
        Passwords must contain at least 8 characters
      </Text>

      <Text style={styles.termsText}>
        By signing up you are agreeing to our{' '}
        <Text
          style={styles.link}
          onPress={() => {
            // TODO: Navigate to terms of service
          }}
        >
          Terms of Service
        </Text>
        . View our{' '}
        <Text
          style={styles.link}
          onPress={() => {
            // TODO: Navigate to privacy policy
          }}
        >
          Privacy Policy
        </Text>
        .
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        variant="contained"
        onPress={handleSignUp}
        loading={isLoading}
        disabled={isLoading}
        style={styles.signupButton}
      >
        Sign Up
      </Button>

      <Separator />

      <GoogleLoginButton
        onPress={handleGoogleAuth}
        disabled={isLoading}
        loading={isLoading}
        style={styles.socialButton}
      />

      <AppleLoginButton
        onPress={handleAppleAuth}
        disabled={isLoading}
        loading={isLoading}
        style={styles.socialButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.backgroundWhite,
    textAlign: 'center',
  },
  inviteMessageContainer: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  inviteMessage: {
    ...Typography.body,
    color: Colors.backgroundWhite,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  loginLinkContainer: {
    marginTop: Spacing.xs,
  },
  loginLinkText: {
    ...Typography.body,
    color: Colors.lavenderLight,
    textAlign: 'center',
    fontSize: 14,
  },
  loginLink: {
    ...Typography.body,
    color: Colors.backgroundWhite,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  input: {
    marginBottom: 0,
  },
  emailInput: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    color: Colors.lavenderLight,
  },
  passwordRequirement: {
    ...Typography.caption,
    color: Colors.lavenderLight,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.lavenderLight,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  link: {
    ...Typography.caption,
    color: Colors.backgroundWhite,
    textDecorationLine: 'underline',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.ickLight,
    marginBottom: Spacing.md,
  },
  signupButton: {
    marginTop: Spacing.lg,
    marginBottom: 0,
  },
  socialButton: {
    marginBottom: Spacing.md,
  },
});
