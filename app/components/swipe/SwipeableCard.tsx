import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { Card } from '../../hooks/useCards';
import { useSwipeGesture, SwipeAction } from '../../hooks/useSwipeGesture';
import { Colors } from '../../constants/colors';
import { SWIPE_THRESHOLD_X } from '../../constants/swipeThresholds';

interface SwipeableCardProps {
  card: Card;
  onSwipe: (action: SwipeAction) => void;
  index: number;
  totalCards: number;
  enabled?: boolean;
}

export function SwipeableCard({
  card,
  onSwipe,
  index,
  totalCards,
  enabled = true,
}: SwipeableCardProps) {
  const isTopCard = index === 0;
  const { gesture, animatedStyle, translateX } = useSwipeGesture({
    onSwipe,
    enabled: isTopCard && enabled,
  });

  // Calculate depth styling for stacked cards
  const depthStyle = useAnimatedStyle(() => {
    if (isTopCard) {
      return {};
    }
    
    const depth = index;
    const scale = 1 - depth * 0.05;
    const opacity = 1 - depth * 0.3;
    const translateY = depth * 8;
    
    return {
      transform: [{ scale }, { translateY }],
      opacity: Math.max(0.4, opacity),
      zIndex: totalCards - index,
    };
  });

  // Background color hint based on swipe direction (only for top card)
  const backgroundStyle = useAnimatedStyle(() => {
    if (!isTopCard) {
      return {};
    }
    
    const x = translateX.value;
    const absX = Math.abs(x);
    
    if (absX < SWIPE_THRESHOLD_X) {
      return { backgroundColor: Colors.backgroundWhite };
    }
    
    if (x > 0) {
      // Swiping right (Yum) - green tint
      const intensity = Math.min(absX / SWIPE_THRESHOLD_X, 1);
      return {
        backgroundColor: `rgba(16, 185, 129, ${intensity * 0.1})`,
      };
    } else {
      // Swiping left (Ick) - red tint
      const intensity = Math.min(absX / SWIPE_THRESHOLD_X, 1);
      return {
        backgroundColor: `rgba(239, 68, 68, ${intensity * 0.1})`,
      };
    }
  });

  // Combine styles - use depth for stacked cards, animated + background for top card
  const cardStyle = isTopCard
    ? [animatedStyle, backgroundStyle]
    : depthStyle;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.card,
          cardStyle,
          !isTopCard && styles.stackedCard,
        ]}
      >
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.cardText}>
            {card.text}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stackedCard: {
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  cardText: {
    textAlign: 'center',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
});
