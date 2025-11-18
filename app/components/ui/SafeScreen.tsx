import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientBackground } from './GradientBackground';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface SafeScreenProps {
  children: ReactNode;
  showBackButton?: boolean;
  gradientId?: string;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
}

export function SafeScreen({
  children,
  showBackButton = false,
  gradientId = 'gradient',
  contentContainerStyle,
  scrollable = true,
}: SafeScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <GradientBackground gradientId={gradientId} />
      
      {showBackButton && (
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              top: insets.top,
              left: insets.left,
            },
          ]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.backgroundWhite} />
        </TouchableOpacity>
      )}

      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
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

