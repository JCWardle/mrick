import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GoogleLoginButton } from '../ui/GoogleLoginButton';
import { AppleLoginButton } from '../ui/AppleLoginButton';
import { Separator } from '../ui/Separator';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { loginWithEmail, loginWithGoogle, loginWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginWithEmail(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setShowError(true);
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
      setShowError(true);
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
      setShowError(true);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        type="text"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        disabled={isLoading}
        containerStyle={styles.emailInput}
        labelStyle={styles.inputLabel}
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="password"
        disabled={isLoading}
        containerStyle={styles.input}
        labelStyle={styles.inputLabel}
      />

      <Button
        variant="contained"
        onPress={handleLogin}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        Log in
      </Button>

      {/* Forgot password link */}
      <TouchableOpacity 
        style={styles.forgotPasswordContainer}
        onPress={() => {
          // TODO: Navigate to forgot password screen
        }}
        disabled={isLoading}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <Separator />

      <GoogleLoginButton
        onPress={handleGoogleAuth}
        disabled={isLoading}
        loading={isLoading}
        style={styles.oauthButton}
      />

      <AppleLoginButton
        onPress={handleAppleAuth}
        disabled={isLoading}
        loading={isLoading}
        style={styles.oauthButton}
      />

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setShowError(false),
        }}
        style={styles.snackbar}
      >
        {error || 'An error occurred'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  button: {
    marginTop: Spacing.lg,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    ...Typography.body,
    color: Colors.backgroundWhite,
    opacity: 0.9,
  },
  oauthButton: {
    marginTop: Spacing.md,
  },
  snackbar: {
    marginBottom: Spacing.xl,
  },
});
