import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '../../components/auth/OnboardingStep';
import { RadioOption } from '../../components/ui/RadioOption';
import { updateProfile, getProfile, SexualPreference } from '../../lib/profiles';

const SEXUAL_PREFERENCES: { value: SexualPreference; label: string }[] = [
  { value: 'straight', label: 'Straight' },
  { value: 'gay', label: 'Gay' },
  { value: 'lesbian', label: 'Lesbian' },
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'pansexual', label: 'Pansexual' },
  { value: 'asexual', label: 'Asexual' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export default function SexualPreferenceScreen() {
  const router = useRouter();
  const [selectedPreference, setSelectedPreference] = useState<SexualPreference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Load existing profile data
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile?.sexual_preference) {
          setSelectedPreference(profile.sexual_preference);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleContinue = async () => {
    if (!selectedPreference) return;

    setIsLoading(true);
    try {
      await updateProfile({ sexual_preference: selectedPreference });
      router.push('/(auth)/age-range');
    } catch (error: any) {
      console.error('Error saving sexual preference:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoadingProfile) {
    return null; // Or show loading spinner
  }

  return (
    <OnboardingStep
      step={2}
      totalSteps={4}
      question="What is your sexual preference?"
      instruction="Please select one option:"
      onContinue={handleContinue}
      onBack={handleBack}
      canContinue={!!selectedPreference}
      isLoading={isLoading}
    >
      {SEXUAL_PREFERENCES.map((pref) => (
        <RadioOption
          key={pref.value}
          label={pref.label}
          value={pref.value}
          selected={selectedPreference === pref.value}
          onSelect={() => setSelectedPreference(pref.value)}
        />
      ))}
    </OnboardingStep>
  );
}

