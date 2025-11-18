import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { CardStack } from '../../components/swipe/CardStack';
import { SwipeButtons } from '../../components/swipe/SwipeButtons';
import { useCards } from '../../hooks/useCards';
import { useCardStack } from '../../hooks/useCardStack';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

export default function SwipeScreen() {
  const router = useRouter();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();
  const { cards, isLoading: cardsLoading, error, refreshCards } = useCards();
  const [showError, setShowError] = useState(false);

  const handleSwipeComplete = (swipeCount: number) => {
    // Trigger partner invitation modal after 3rd swipe
    // This will be implemented in Phase 7
    if (swipeCount === 3) {
      // TODO: Show partner invitation modal
      console.log('Show partner invitation modal');
    }
  };

  const { currentIndex, currentCard, isComplete, handleSwipe, isSaving, swipeCount } =
    useCardStack({
      cards,
      onSwipeComplete: handleSwipeComplete,
    });

  // Refresh cards after swipe
  useEffect(() => {
    if (swipeCount > 0 && swipeCount % 5 === 0) {
      refreshCards();
    }
  }, [swipeCount, refreshCards]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Redirect handled by root index.tsx, but show loading if not ready
  if (!isAuthenticated || !isProfileComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (cardsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading cards...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Error loading cards
          </Text>
          <Text variant="bodyMedium" style={styles.errorText}>
            {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete || cards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium" style={styles.emptyTitle}>
            You're all caught up!
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Check back later for more cards.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CardStack
          cards={cards}
          onSwipe={handleSwipe}
          currentIndex={currentIndex}
        />
        
        <View style={styles.footer}>
          <SwipeButtons
            onSwipe={(action) => {
              if (currentCard) {
                handleSwipe(currentCard.id, action);
              }
            }}
            disabled={isSaving || !currentCard}
          />
        </View>
      </View>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={4000}
      >
        {error?.message || 'An error occurred'}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginBottom: 8,
    color: Colors.error,
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
