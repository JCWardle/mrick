import { View, StyleSheet } from 'react-native';
import { SwipeableCard } from './SwipeableCard';
import { Card } from '../../hooks/useCards';
import { SwipeAction } from '../../hooks/useSwipeGesture';

interface CardStackProps {
  cards: Card[];
  onSwipe: (cardId: string, action: SwipeAction) => void;
  currentIndex: number;
  onShowDetails?: () => void;
}

export function CardStack({ cards, onSwipe, currentIndex, onShowDetails }: CardStackProps) {
  // Show up to 3 cards in the stack
  const visibleCards = cards.slice(currentIndex, currentIndex + 3);

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
      {visibleCards.map((card, index) => (
        <SwipeableCard
          key={card.id}
          card={card}
          onSwipe={handleSwipe}
          index={index}
          totalCards={visibleCards.length}
          enabled={index === 0}
          onShowDetails={index === 0 ? onShowDetails : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
});
