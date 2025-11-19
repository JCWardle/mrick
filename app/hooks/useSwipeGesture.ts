import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { SWIPE_THRESHOLD_X, SWIPE_THRESHOLD_Y } from '../constants/swipeThresholds';
import { calculateRotation } from '../utils/animations';

export type SwipeAction = 'yum' | 'ick' | 'maybe';

interface UseSwipeGestureProps {
  onSwipe: (action: SwipeAction) => void;
  onThresholdCross?: () => void;
  enabled?: boolean;
}

export function useSwipeGesture({
  onSwipe,
  onThresholdCross,
  enabled = true,
}: UseSwipeGestureProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const thresholdCrossed = useSharedValue(false);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      console.log('[useSwipeGesture] triggerHaptic called', { type });
      if (type === 'light') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch((err) => {
          console.warn('[useSwipeGesture] Haptic error (light):', err);
        });
      } else if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((err) => {
          console.warn('[useSwipeGesture] Haptic error (medium):', err);
        });
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch((err) => {
          console.warn('[useSwipeGesture] Haptic error (heavy):', err);
        });
      }
    } catch (error) {
      console.error('[useSwipeGesture] Error in triggerHaptic:', error);
      // Don't throw - haptics failure shouldn't crash the app
    }
  };

  const handleThresholdCross = () => {
    'worklet';
    if (!thresholdCrossed.value) {
      thresholdCrossed.value = true;
      // Temporarily disable haptics to test if it's causing the crash
      const ENABLE_HAPTICS = false;
      if (ENABLE_HAPTICS) {
        runOnJS(triggerHaptic)('medium');
      }
      if (onThresholdCross) {
        runOnJS(onThresholdCross)();
      }
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      'worklet';
      thresholdCrossed.value = false;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = calculateRotation(event.translationX);
      
      // Check if threshold is crossed
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);
      
      if (absX > SWIPE_THRESHOLD_X || absY > SWIPE_THRESHOLD_Y) {
        if (!thresholdCrossed.value) {
          handleThresholdCross();
        }
      }
    })
    .onEnd((event) => {
      'worklet';
      const translationX = event.translationX;
      const translationY = event.translationY;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      
      // Determine swipe action
      if (absX > SWIPE_THRESHOLD_X) {
        // Horizontal swipe
        const action: SwipeAction = translationX > 0 ? 'yum' : 'ick';
        
        // Animate off screen
        const screenWidth = 400;
        const targetX = translationX > 0 ? screenWidth * 1.5 : -screenWidth * 1.5;
        translateX.value = withSpring(targetX, { damping: 20, stiffness: 300 });
        translateY.value = withSpring(translationY, { damping: 20, stiffness: 300 });
        opacity.value = withSpring(0, { damping: 20, stiffness: 300 });
        
        // Call onSwipe
        runOnJS(onSwipe)(action);
      } else if (absY > SWIPE_THRESHOLD_Y && translationY < 0) {
        // Upward swipe (maybe)
        const screenHeight = 800;
        translateX.value = withSpring(translationX, { damping: 20, stiffness: 300 });
        translateY.value = withSpring(-screenHeight * 1.5, { damping: 20, stiffness: 300 });
        opacity.value = withSpring(0, { damping: 20, stiffness: 300 });
        
        runOnJS(onSwipe)('maybe');
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
        thresholdCrossed.value = false;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translateX.value);
    const absY = Math.abs(translateY.value);
    const isThresholdCrossed = absX > SWIPE_THRESHOLD_X || absY > SWIPE_THRESHOLD_Y;
    
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: isThresholdCrossed ? 1.05 : scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const reset = () => {
    translateX.value = 0;
    translateY.value = 0;
    rotation.value = 0;
    opacity.value = 1;
    scale.value = 1;
    thresholdCrossed.value = false;
  };

  const animateOffScreen = (direction: 'left' | 'right' | 'up') => {
    const screenWidth = 400;
    const screenHeight = 800;
    
    let targetX = 0;
    let targetY = 0;
    
    switch (direction) {
      case 'left':
        targetX = -screenWidth * 1.5;
        break;
      case 'right':
        targetX = screenWidth * 1.5;
        break;
      case 'up':
        targetY = -screenHeight * 1.5;
        break;
    }
    
    translateX.value = withSpring(targetX, { damping: 20, stiffness: 300 });
    translateY.value = withSpring(targetY, { damping: 20, stiffness: 300 });
    opacity.value = withSpring(0, { damping: 20, stiffness: 300 });
  };

  return {
    gesture: panGesture,
    animatedStyle,
    reset,
    animateOffScreen,
    translateX,
    translateY,
    rotation,
  };
}
