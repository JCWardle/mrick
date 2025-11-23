import { View, StyleSheet } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SwipeableCard, SwipeableCardRef } from './SwipeableCard';
import { Card } from '../../hooks/useCards';
import { SwipeAction } from '../../hooks/useSwipeGesture';
import { useRef, useImperativeHandle, forwardRef } from 'react';

interface CardStackProps {
  cards: Card[];
  onSwipe: (cardId: string, action: SwipeAction) => void;
  currentIndex: number;
  onShowDetails?: () => void;
}

export interface CardStackRef {
  animateTopCard: (direction: 'left' | 'right' | 'up') => void;
}

export const CardStack = forwardRef<CardStackRef, CardStackProps>(({ cards, onSwipe, currentIndex, onShowDetails }, ref) => {
  // Show up to 3 cards in the stack
  const visibleCards = cards.slice(currentIndex, currentIndex + 3);
  
  // Shared value to track top card's translateX for showing cards behind
  const topCardTranslateX = useSharedValue(0);
  
  // Ref to the top card (index 0 in visibleCards)
  const topCardRef = useRef<SwipeableCardRef>(null);

  // Expose animation function via ref
  useImperativeHandle(ref, () => ({
    animateTopCard: (direction: 'left' | 'right' | 'up') => {
      topCardRef.current?.animateOffScreen(direction);
    },
  }), []);

  const handleSwipe = (action: SwipeAction) => {
    // Ensure we have cards, currentIndex is valid, and the card exists
    if (cards.length === 0 || currentIndex < 0 || currentIndex >= cards.length) {
      return;
    }
    
    const currentCard = cards[currentIndex];
    if (!currentCard) {
      return;
    }
    
    onSwipe(currentCard.id, action);
  };

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Render cards in reverse order so top card (index 0) renders last and stays on top */}
      {visibleCards.slice().reverse().map((card, reverseIndex) => {
        const index = visibleCards.length - 1 - reverseIndex;
        const isTopCard = index === 0;
        return (
          <SwipeableCard
            key={card.id}
            ref={isTopCard ? topCardRef : null}
            card={card}
            onSwipe={handleSwipe}
            index={index}
            totalCards={visibleCards.length}
            enabled={isTopCard}
            onShowDetails={isTopCard ? onShowDetails : undefined}
            topCardTranslateX={isTopCard ? topCardTranslateX : undefined}
            isTopCardMoving={topCardTranslateX}
          />
        );
      })}
    </View>
  );
});

CardStack.displayName = 'CardStack';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
});
