import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors } from '../../constants/colors';

const DRAWER_WIDTH = 280;
const ANIMATION_DURATION = 300;

type SideDrawerProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function SideDrawer({ visible, onClose, children }: SideDrawerProps) {
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: ANIMATION_DURATION });
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: ANIMATION_DURATION });
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    }
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(-DRAWER_WIDTH, event.translationX);
        opacity.value = Math.max(0, 1 + event.translationX / DRAWER_WIDTH);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -DRAWER_WIDTH / 3 || event.velocityX < -500) {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: ANIMATION_DURATION });
        opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
        runOnJS(onClose)();
      } else {
        translateX.value = withTiming(0, { duration: ANIMATION_DURATION });
        opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      }
    });

  if (!visible && translateX.value === -DRAWER_WIDTH) {
    return null;
  }

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.drawer, drawerStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents={visible ? 'auto' : 'none'}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.backgroundWhite,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
});

