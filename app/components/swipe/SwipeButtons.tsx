import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SwipeAction } from '../../hooks/useSwipeGesture';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface SwipeButtonsProps {
  onSwipe: (action: SwipeAction) => void;
  onInfo?: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  backgroundColor: string;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  iconSize?: number;
}

function SwipeButton({ 
  icon, 
  backgroundColor, 
  onPress, 
  disabled = false,
  size = 60,
  iconSize = 26,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.95, { duration: 100 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withTiming(1, { duration: 100 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const buttonStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[buttonStyle, { backgroundColor }, animatedStyle, disabled && styles.disabled]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={Colors.backgroundWhite} />
    </AnimatedPressable>
  );
}

export function SwipeButtons({
  onSwipe,
  onInfo,
  disabled = false,
}: SwipeButtonsProps) {
  const handleSwipe = (action: SwipeAction) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipe(action);
  };

  const handleInfo = () => {
    if (disabled || !onInfo) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onInfo();
  };

  // Cross and heart buttons are 30% larger: 60 * 1.3 = 78px
  const largeButtonSize = 78;
  const largeIconSize = 34; // 26 * 1.3 = 33.8, rounded to 34
  const standardButtonSize = 60;
  const standardIconSize = 26;

  return (
    <View style={styles.container}>
      {/* Cross/Ick Button - Left */}
      <SwipeButton
        icon="close"
        backgroundColor={Colors.ick}
        onPress={() => handleSwipe('ick')}
        disabled={disabled}
        size={largeButtonSize}
        iconSize={largeIconSize}
      />

      {/* Info Button - Center */}
      <SwipeButton
        icon="information-outline"
        backgroundColor={Colors.primary}
        onPress={handleInfo}
        disabled={disabled}
        size={standardButtonSize}
        iconSize={standardIconSize}
      />

      {/* Heart/Yum Button - Right */}
      <SwipeButton
        icon="heart"
        backgroundColor={Colors.yummy}
        onPress={() => handleSwipe('yum')}
        disabled={disabled}
        size={largeButtonSize}
        iconSize={largeIconSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg, // 24px
    paddingHorizontal: Spacing.md, // 16px
    backgroundColor: 'transparent',
    gap: 40, // 40px spacing between buttons (doubled from 20px)
  },
  disabled: {
    opacity: 0.5,
  },
});
