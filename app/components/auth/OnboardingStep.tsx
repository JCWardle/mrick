import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { BorderRadius } from '../../constants/borderRadius';
import { ProgressBar } from '../ui/ProgressBar';

export interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  question: string;
  instruction: string;
  children: React.ReactNode;
  onContinue: () => void;
  onBack?: () => void;
  canContinue: boolean;
  isLoading?: boolean;
}

export function OnboardingStep({
  step,
  totalSteps,
  question,
  instruction,
  children,
  onContinue,
  onBack,
  canContinue,
  isLoading = false,
}: OnboardingStepProps) {
  const insets = useSafeAreaInsets();
  
  // Animation values - start hidden
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    // Reset animation values when step changes
    opacity.value = 0;
    translateY.value = 30;

    // Delay animation start to coordinate with navigation transition
    // This allows the screen to slide in first, then content animates
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }, 150); // Small delay to let navigation transition start

    return () => clearTimeout(timer);
  }, [step]); // Re-run when step changes

  // Animated styles for content
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {onBack && (
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              top: insets.top + Spacing.sm,
              left: insets.left + Spacing.md,
            },
          ]}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.backgroundWhite} />
        </TouchableOpacity>
      )}
      <ProgressBar currentStep={step} totalSteps={totalSteps} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
          <Text style={[Typography.h1, styles.question]}>{question}</Text>
          <Text style={[Typography.caption, styles.instruction]}>{instruction}</Text>
        </Animated.View>

        <Animated.View style={[styles.optionsContainer, contentAnimatedStyle]}>
          {children}
        </Animated.View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!canContinue || isLoading) && styles.continueButtonDisabled,
          ]}
          onPress={onContinue}
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

