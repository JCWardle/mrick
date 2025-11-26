import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { Card } from '../../hooks/useCards';
import { useSwipeGesture, SwipeAction } from '../../hooks/useSwipeGesture';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SWIPE_THRESHOLD_X } from '../../constants/swipeThresholds';
import { CardIllustration } from './CardIllustration';
import { useImperativeHandle, forwardRef, useState, useEffect } from 'react';

interface SwipeableCardProps {
  card: Card;
  onSwipe: (action: SwipeAction) => void;
  index: number;
  totalCards: number;
  enabled?: boolean;
  onShowDetails?: () => void;
  topCardTranslateX?: SharedValue<number>;
  isTopCardMoving?: SharedValue<number>;
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface SwipeableCardRef {
  animateOffScreen: (direction: 'left' | 'right' | 'up') => void;
}

export const SwipeableCard = forwardRef<SwipeableCardRef, SwipeableCardProps>(({
  card,
  onSwipe,
  index,
  totalCards,
  enabled = true,
  onShowDetails,
  topCardTranslateX,
  isTopCardMoving,
  onLoadingChange,
}, ref) => {
  // Safety check: if card is invalid, don't render
  if (!card || !card.id || !card.text) {
    return null;
  }

  const [isImageLoading, setIsImageLoading] = useState(true);

  const isTopCard = index === 0;
  const isSecondCard = index === 1;
  
  // Reset loading state when card changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [card.id]);
  
  // Disable gesture when image is loading (only for top card)
  const gestureEnabled = isTopCard && enabled && !isImageLoading;
  
  const { gesture, animatedStyle, translateX, animateOffScreen } = useSwipeGesture({
    onSwipe,
    enabled: gestureEnabled,
  });

  // Notify parent of loading state changes (only for top card)
  useEffect(() => {
    if (isTopCard) {
      onLoadingChange?.(isImageLoading);
    }
  }, [isImageLoading, isTopCard, onLoadingChange]);

  // Expose animateOffScreen function via ref so parent can trigger animation
  useImperativeHandle(ref, () => ({
    animateOffScreen: (direction: 'left' | 'right' | 'up') => {
      if (isTopCard) {
        animateOffScreen(direction);
      }
    },
  }), [isTopCard, animateOffScreen]);

  // Calculate depth styling for stacked cards
  const depthStyle = useAnimatedStyle(() => {
    if (isTopCard) {
      // Update shared value to track top card movement
      if (topCardTranslateX) {
        topCardTranslateX.value = translateX.value;
      }
      return {};
    }
    
    // Only show the card directly behind (index 1) when top card is being swiped
    const topCardX = isTopCardMoving?.value ?? 0;
    const isTopCardSwiping = Math.abs(topCardX) > 5; // Show when moved more than 5px
    
    if (isSecondCard) {
      // Second card: show with full opacity when top card is swiping, hide otherwise
      // Lower z-index and elevation than top card to ensure it stays behind
      return {
        opacity: isTopCardSwiping ? 1 : 0,
        zIndex: 1, // Lower than top card's z-index
        elevation: 1, // Lower elevation for Android
      };
    } else {
      // Third card and beyond: always hidden
      return {
        opacity: 0,
        zIndex: 0, // Lowest z-index
        elevation: 0, // Lowest elevation
      };
    }
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
  // Top card always has highest z-index and full opacity
  const topCardZIndexStyle = useAnimatedStyle(() => ({
    zIndex: 999, // Very high z-index to ensure top card always stays on top
    elevation: 999, // High elevation for Android
  }));

  const cardStyle = isTopCard
    ? [animatedStyle, backgroundStyle, topCardZIndexStyle]
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
            <CardIllustration 
              cardText={card.text} 
              category={card.category}
              imagePath={card.image_path}
              onLoadingChange={setIsImageLoading}
            />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

SwipeableCard.displayName = 'SwipeableCard';

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
  },
  cardContent: {
    flex: 1,
    padding: Spacing.sm * 2, // 2 spacing units
  },
  stackedCard: {
    marginHorizontal: 8,
  },
});
