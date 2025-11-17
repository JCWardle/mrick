import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

type SwipeAction = 'yum' | 'ick' | 'maybe';

interface SwipeButtonsProps {
  onSwipe: (action: SwipeAction) => void;
}

export function SwipeButtons({ onSwipe }: SwipeButtonsProps) {
  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => onSwipe('ick')}>
        Ick
      </Button>
      <Button mode="contained" onPress={() => onSwipe('yum')}>
        Yum
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
});

