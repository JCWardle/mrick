import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AgeRangeSelector } from '../../components/auth/AgeRangeSelector';
import { SexualPreferenceSelector } from '../../components/auth/SexualPreferenceSelector';
import { GenderSelector } from '../../components/auth/GenderSelector';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, AgeRange, SexualPreference, Gender } from '../../lib/profiles';

export default function AgeRangeScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
  const [sexualPreference, setSexualPreference] = useState<SexualPreference | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleContinue = async () => {
    if (!ageRange || !sexualPreference || !gender) {
      setError('Please select age range, sexual preference, and gender');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateProfile({
        age_range: ageRange,
        sexual_preference: sexualPreference,
        gender: gender,
      });
      await refreshProfile();
      router.replace('/(swipe)');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Tell us about yourself
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          This helps us personalize your experience
        </Text>

        <AgeRangeSelector selected={ageRange} onSelect={setAgeRange} />

        <SexualPreferenceSelector
          selected={sexualPreference}
          onSelect={setSexualPreference}
        />

        <GenderSelector selected={gender} onSelect={setGender} />

        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!ageRange || !sexualPreference || !gender || isLoading}
          loading={isLoading}
          style={styles.continueButton}
        >
          Start Swiping
        </Button>

        <Snackbar
          visible={showError}
          onDismiss={() => setShowError(false)}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: () => setShowError(false),
          }}
        >
          {error || 'An error occurred'}
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 32,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  continueButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
