import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { BorderRadius } from '../../constants/borderRadius';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RadioOption } from '../../components/ui/RadioOption';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, getProfile, Gender, SexualPreference, AgeRange, RelationshipStatus } from '../../lib/profiles';

const TOTAL_STEPS = 4;

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const SEXUAL_PREFERENCES: { value: SexualPreference; label: string }[] = [
  { value: 'straight', label: 'Straight' },
  { value: 'gay', label: 'Gay' },
  { value: 'lesbian', label: 'Lesbian' },
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'pansexual', label: 'Pansexual' },
  { value: 'asexual', label: 'Asexual' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const RELATIONSHIP_STATUSES: { value: RelationshipStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'in-a-relationship', label: 'In a relationship' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

interface StepConfig {
  question: string;
  instruction: string;
  canContinue: (formData: FormData) => boolean;
  getOptions: () => { value: any; label: string }[];
  getSelectedValue: (formData: FormData) => any;
  onSelect: (formData: FormData, value: any) => FormData;
  getUpdateData: (formData: FormData) => any;
}

interface FormData {
  gender: Gender | null;
  sexualPreference: SexualPreference | null;
  ageRange: AgeRange | null;
  relationshipStatus: RelationshipStatus | null;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    gender: null,
    sexualPreference: null,
    ageRange: null,
    relationshipStatus: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Animation values
  const contentOpacity = useSharedValue(1);
  const contentTranslateX = useSharedValue(0);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setFormData({
            gender: profile.gender,
            sexualPreference: profile.sexual_preference,
            ageRange: profile.age_range,
            relationshipStatus: profile.relationship_status,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const stepConfigs: StepConfig[] = [
    {
      question: 'How can we refer to you?',
      instruction: 'Please select one option:',
      canContinue: (data) => !!data.gender,
      getOptions: () => GENDERS,
      getSelectedValue: (data) => data.gender,
      onSelect: (data, value) => ({ ...data, gender: value as Gender }),
      getUpdateData: (data) => ({ gender: data.gender }),
    },
    {
      question: 'What is your sexual preference?',
      instruction: 'Please select one option:',
      canContinue: (data) => !!data.sexualPreference,
      getOptions: () => SEXUAL_PREFERENCES,
      getSelectedValue: (data) => data.sexualPreference,
      onSelect: (data, value) => ({ ...data, sexualPreference: value as SexualPreference }),
      getUpdateData: (data) => ({ sexual_preference: data.sexualPreference }),
    },
    {
      question: 'Select your age range',
      instruction: 'Please select one option:',
      canContinue: (data) => !!data.ageRange,
      getOptions: () => AGE_RANGES,
      getSelectedValue: (data) => data.ageRange,
      onSelect: (data, value) => ({ ...data, ageRange: value as AgeRange }),
      getUpdateData: (data) => ({ age_range: data.ageRange }),
    },
    {
      question: 'What is your relationship status?',
      instruction: 'Please select one option:',
      canContinue: (data) => !!data.relationshipStatus,
      getOptions: () => RELATIONSHIP_STATUSES,
      getSelectedValue: (data) => data.relationshipStatus,
      onSelect: (data, value) => ({ ...data, relationshipStatus: value as RelationshipStatus }),
      getUpdateData: (data) => ({ relationship_status: data.relationshipStatus }),
    },
  ];

  const currentStepConfig = stepConfigs[currentStep - 1];
  const canContinue = currentStepConfig.canContinue(formData);

  const animateStepTransition = (direction: 'forward' | 'backward', callback: () => void) => {
    // Animate out
    contentOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    contentTranslateX.value = withTiming(direction === 'forward' ? -30 : 30, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    }, () => {
      // Change step
      callback();
      
      // Reset position for opposite direction
      contentTranslateX.value = direction === 'forward' ? 30 : -30;
      
      // Animate in
      contentOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      contentTranslateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    });
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsLoading(true);
    try {
      const updateData = currentStepConfig.getUpdateData(formData);
      await updateProfile(updateData);

      if (currentStep < TOTAL_STEPS) {
        // Move to next step
        animateStepTransition('forward', () => {
          setCurrentStep(currentStep + 1);
        });
      } else {
        // Final step - complete onboarding
        await refreshProfile();
        router.replace('/(swipe)');
      }
    } catch (error: any) {
      console.error('Error saving step:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateStepTransition('backward', () => {
        setCurrentStep(currentStep - 1);
      });
    } else {
      router.back();
    }
  };

  const handleSelect = (value: any) => {
    const newFormData = currentStepConfig.onSelect(formData, value);
    setFormData(newFormData);
  };

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateX: contentTranslateX.value }],
    };
  });

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.backgroundWhite} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {currentStep > 1 && (
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              top: insets.top + Spacing.sm,
              left: insets.left + Spacing.md,
            },
          ]}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.backgroundWhite} />
        </TouchableOpacity>
      )}
      
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
          <Text style={[Typography.h1, styles.question]}>{currentStepConfig.question}</Text>
          <Text style={[Typography.caption, styles.instruction]}>{currentStepConfig.instruction}</Text>
        </Animated.View>

        <Animated.View style={[styles.optionsContainer, contentAnimatedStyle]}>
          {currentStepConfig.getOptions().map((option) => (
            <RadioOption
              key={option.value}
              label={option.label}
              value={option.value}
              selected={currentStepConfig.getSelectedValue(formData) === option.value}
              onSelect={() => handleSelect(option.value)}
            />
          ))}
        </Animated.View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!canContinue || isLoading) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.backgroundWhite} size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  question: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: Colors.backgroundWhite,
  },
  instruction: {
    textAlign: 'center',
    color: Colors.lavenderLight,
  },
  optionsContainer: {
    marginBottom: Spacing.xxl,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: 'transparent',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    minHeight: 56,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...Typography.button,
    color: Colors.backgroundWhite,
  },
  backButton: {
    position: 'absolute',
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

