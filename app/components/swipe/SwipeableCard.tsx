import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface Card {
  id: string;
  text: string;
}

interface SwipeableCardProps {
  card: Card;
}

export function SwipeableCard({ card }: SwipeableCardProps) {
  return (
    <View style={styles.container}>
      <Text variant="bodyLarge">{card.text}</Text>
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

