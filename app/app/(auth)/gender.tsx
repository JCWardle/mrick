import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '../../components/auth/OnboardingStep';
import { RadioOption } from '../../components/ui/RadioOption';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, getProfile, Gender } from '../../lib/profiles';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export default function GenderScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Load existing profile data
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile?.gender) {
          setSelectedGender(profile.gender);
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
    if (!selectedGender) return;

    setIsLoading(true);
    try {
      await updateProfile({ gender: selectedGender });
      router.push('/(auth)/sexual-preference');
    } catch (error: any) {
      console.error('Error saving gender:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return null; // Or show loading spinner
  }

  return (
    <OnboardingStep
      step={1}
      totalSteps={4}
      question="How can we refer to you?"
      instruction="Please select one option:"
      onContinue={handleContinue}
      canContinue={!!selectedGender}
      isLoading={isLoading}
    >
      {GENDERS.map((gender) => (
        <RadioOption
          key={gender.value}
          label={gender.label}
          value={gender.value}
          selected={selectedGender === gender.value}
          onSelect={() => setSelectedGender(gender.value)}
        />
      ))}
    </OnboardingStep>
  );
}

