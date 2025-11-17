import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

export function LoginForm() {
  return (
    <View style={styles.container}>
      <TextInput label="Username" mode="outlined" />
      <TextInput label="Password" mode="outlined" secureTextEntry />
      <Button mode="contained">Login</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
});

