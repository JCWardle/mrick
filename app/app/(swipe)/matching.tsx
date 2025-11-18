import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function MatchingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <GradientBackground gradientId="matchingGradient" />
      
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={Colors.backgroundWhite}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineSmall" style={styles.title}>
          Matching
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text variant="bodyLarge" style={styles.placeholderText}>
          Matching screen coming soon
        </Text>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(swipe)/index' as any)}
        >
          <IconButton
            icon="heart-outline"
            size={24}
            iconColor={Colors.textTertiary}
            style={styles.navButton}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            // Already on matching screen, no action needed
          }}
        >
          <IconButton
            icon="account-multiple"
            size={24}
            iconColor={Colors.primary}
            style={styles.navButton}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(swipe)/profile' as any)}
        >
          <IconButton
            icon="account-outline"
            size={24}
            iconColor={Colors.textTertiary}
            style={styles.navButton}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    margin: 0,
  },
  title: {
    color: Colors.backgroundWhite,
    marginLeft: Spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  placeholderText: {
    color: Colors.backgroundWhite,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: Spacing.xs,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    margin: 0,
  },
});

