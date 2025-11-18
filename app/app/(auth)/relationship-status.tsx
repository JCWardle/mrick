import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingStep } from '../../components/auth/OnboardingStep';
import { RadioOption } from '../../components/ui/RadioOption';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, getProfile, RelationshipStatus } from '../../lib/profiles';

const RELATIONSHIP_STATUSES: { value: RelationshipStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'in-a-relationship', label: 'In a relationship' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export default function RelationshipStatusScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<RelationshipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Load existing profile data
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile?.relationship_status) {
          setSelectedStatus(profile.relationship_status);
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
    if (!selectedStatus) return;

    setIsLoading(true);
    try {
      await updateProfile({ relationship_status: selectedStatus });
      await refreshProfile();
      router.replace('/(swipe)');
    } catch (error: any) {
      console.error('Error saving relationship status:', error);
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
      step={4}
      totalSteps={4}
      question="What is your relationship status?"
      instruction="Please select one option:"
      onContinue={handleContinue}
      onBack={handleBack}
      canContinue={!!selectedStatus}
      isLoading={isLoading}
    >
      {RELATIONSHIP_STATUSES.map((status) => (
        <RadioOption
          key={status.value}
          label={status.label}
          value={status.value}
          selected={selectedStatus === status.value}
          onSelect={() => setSelectedStatus(status.value)}
        />
      ))}
    </OnboardingStep>
  );
}

