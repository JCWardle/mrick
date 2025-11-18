import { View, StyleSheet, Dimensions } from 'react-native';
import { SwipeableCard } from './SwipeableCard';
import { Card } from '../../hooks/useCards';
import { SwipeAction } from '../../hooks/useSwipeGesture';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CardStackProps {
  cards: Card[];
  onSwipe: (cardId: string, action: SwipeAction) => void;
  currentIndex: number;
}

export function CardStack({ cards, onSwipe, currentIndex }: CardStackProps) {
  // Show up to 3 cards in the stack
  const visibleCards = cards.slice(currentIndex, currentIndex + 3);

  const handleSwipe = (action: SwipeAction) => {
    if (visibleCards.length > 0 && currentIndex < cards.length) {
      onSwipe(cards[currentIndex].id, action);
    }
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
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    position: 'relative',
    marginHorizontal: 16,
  },
});
