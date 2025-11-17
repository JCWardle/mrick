import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function SwipeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Swipe</Text>
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

