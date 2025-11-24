import { Stack, useSegments } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../../components/ui/BottomNavigation';

export default function SwipeLayout() {
  const segments = useSegments();
  
  // Determine active screen from segments
  // segments will be like ['(swipe)', 'index'] or ['(swipe)', 'invite'], etc.
  const getActiveScreen = (): 'swipe' | 'invite' | 'matching' | 'profile' => {
    const lastSegment = segments[segments.length - 1] as string;
    if (lastSegment === 'index' || lastSegment === '(swipe)') return 'swipe';
    if (lastSegment === 'invite') return 'invite';
    if (lastSegment === 'matching') return 'matching';
    if (lastSegment === 'profile') return 'profile';
    return 'swipe'; // default
  };

  const activeScreen = getActiveScreen();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.stackContainer}>
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
      </View>
      <BottomNavigation activeScreen={activeScreen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
});

