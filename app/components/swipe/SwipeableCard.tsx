import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { Card } from '../../hooks/useCards';
import { useSwipeGesture, SwipeAction } from '../../hooks/useSwipeGesture';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SWIPE_THRESHOLD_X } from '../../constants/swipeThresholds';
import { CardIllustration } from './CardIllustration';

interface SwipeableCardProps {
  card: Card;
  onSwipe: (action: SwipeAction) => void;
  index: number;
  totalCards: number;
  enabled?: boolean;
  onShowDetails?: () => void;
}

export function SwipeableCard({
  card,
  onSwipe,
  index,
  totalCards,
  enabled = true,
  onShowDetails,
}: SwipeableCardProps) {
  // Safety check: if card is invalid, don't render
  if (!card || !card.id || !card.text) {
    return null;
  }

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
    
    // Hide cards behind the top card completely to prevent bleed-through
    return {
      opacity: 0,
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
          // Ensure top card has solid background to prevent bleed-through
          isTopCard && { backgroundColor: Colors.backgroundWhite },
        ]}
      >        
        <View style={styles.cardContent}>
          {/* Card Illustration Background */}
          {card.text && (
            <CardIllustration cardText={card.text} category={card.category} />
          )}
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    borderColor: 'purple',
    borderWidth: 5,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.sm * 2, // 2 spacing units
  },
  stackedCard: {
    marginHorizontal: 8,
  },
});
