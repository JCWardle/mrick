import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface Card {
  id: string;
  text: string;
}

type SwipeAction = 'yum' | 'ick' | 'maybe';

interface CardStackProps {
  cards: Card[];
  onSwipe: (action: SwipeAction) => void;
}

export function CardStack({ cards, onSwipe }: CardStackProps) {
  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">Card Stack</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

