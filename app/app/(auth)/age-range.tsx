import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function AgeRangeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Age Range</Text>
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

