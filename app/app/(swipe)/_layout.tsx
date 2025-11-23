import { Stack, useSegments } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation } from '../../components/ui/BottomNavigation';

export default function SwipeLayout() {
  const segments = useSegments();
  
  // Determine active screen from segments
  // segments will be like ['(swipe)', 'index'] or ['(swipe)', 'invite'], etc.
  const getActiveScreen = (): 'swipe' | 'invite' | 'matching' | 'profile' => {
    const lastSegment = segments[segments.length - 1];
    if (lastSegment === 'index') return 'swipe';
    if (lastSegment === 'invite') return 'invite';
    if (lastSegment === 'matching') return 'matching';
    if (lastSegment === 'profile') return 'profile';
    return 'swipe'; // default
  };

  const activeScreen = getActiveScreen();

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="matching" />
        <Stack.Screen name="profile" />
      </Stack>
      <BottomNavigation activeScreen={activeScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

