import { withSpring, withTiming, Easing } from 'react-native-reanimated';

export const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.5,
};

export const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
};

/**
 * Animate card back to center with spring
 */
export function animateToCenter(value: any) {
  'worklet';
  return withSpring(0, SPRING_CONFIG);
}

/**
 * Animate card off screen
 */
export function animateOffScreen(value: any, direction: 'left' | 'right' | 'up') {
  'worklet';
  const screenWidth = 400; // Approximate, will be set dynamically
  const screenHeight = 800; // Approximate, will be set dynamically
  
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
  
  return {
    x: withTiming(targetX, TIMING_CONFIG),
    y: withTiming(targetY, TIMING_CONFIG),
    opacity: withTiming(0, { duration: 200 }),
  };
}

/**
 * Calculate rotation based on horizontal translation
 */
export function calculateRotation(translateX: number, maxRotation = 15): number {
  'worklet';
  const rotationFactor = 0.1;
  const rotation = (translateX / 100) * rotationFactor * maxRotation;
  return Math.max(-maxRotation, Math.min(maxRotation, rotation));
}

/**
 * Calculate opacity based on distance from center
 */
export function calculateOpacity(translateX: number, translateY: number, threshold: number): number {
  'worklet';
  const distance = Math.sqrt(translateX * translateX + translateY * translateY);
  const normalized = Math.min(distance / threshold, 1);
  return 0.5 + (0.5 * (1 - normalized));
}
