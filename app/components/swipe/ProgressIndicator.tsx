import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalCards: number;
  maxDots?: number;
}

export function ProgressIndicator({
  currentIndex,
  totalCards,
  maxDots = 10,
}: ProgressIndicatorProps) {
  // Calculate how many dots to show (don't exceed maxDots)
  const dotsToShow = Math.min(totalCards, maxDots);
  
  // Calculate which dot should be active
  // Map currentIndex to a position in the visible dots
  const activeDotIndex = totalCards > maxDots
    ? Math.floor((currentIndex / totalCards) * dotsToShow)
    : currentIndex;

  return (
    <View style={styles.container}>
      {Array.from({ length: dotsToShow }).map((_, index) => {
        const isActive = index === activeDotIndex;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  dotInactive: {
    backgroundColor: Colors.border,
  },
});

