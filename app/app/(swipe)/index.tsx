import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Snackbar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { CardStack, CardStackRef } from '../../components/swipe/CardStack';
import { SwipeButtons } from '../../components/swipe/SwipeButtons';
import { DeleteAccountDialog } from '../../components/swipe/DeleteAccountDialog';
import { CardDetailsModal } from '../../components/swipe/CardDetailsModal';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { useCards } from '../../hooks/useCards';
import { useCardStack } from '../../hooks/useCardStack';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SwipeAction } from '../../hooks/useSwipeGesture';

export default function SwipeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isProfileComplete, isLoading, logout, deleteAccount, profile } = useAuth();
  const { cards, isLoading: cardsLoading, error, refreshCards } = useCards();
  const [showError, setShowError] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSwipeComplete = (swipeCount: number) => {
    // Trigger partner invitation modal after 3rd swipe
    // This will be implemented in Phase 7
    if (swipeCount === 3) {
      // TODO: Show partner invitation modal
      console.log('Show partner invitation modal');
    }
  };

  console.log('[SwipeScreen] Render', {
    cardsLength: cards.length,
    cardsLoading,
    hasError: !!error,
    timestamp: new Date().toISOString(),
  });

  const { currentIndex, currentCard, isComplete, handleSwipe, handleUndo, canUndo, isSaving, swipeCount, swipeError, clearSwipeError } =
    useCardStack({
      cards,
      onSwipeComplete: handleSwipeComplete,
    });

  // Ref to CardStack to trigger animations programmatically
  const cardStackRef = useRef<CardStackRef>(null);

  console.log('[SwipeScreen] useCardStack result', {
    currentIndex,
    hasCurrentCard: !!currentCard,
    isComplete,
    isSaving,
    swipeCount,
    hasSwipeError: !!swipeError,
  });

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [showSwipeError, setShowSwipeError] = useState(false);
  const [isCardLoading, setIsCardLoading] = useState(true);

  // Stable callback for loading state changes
  const handleCardLoadingChange = useCallback((isLoading: boolean) => {
    setIsCardLoading(isLoading);
  }, []);

  // Show swipe error when it occurs
  useEffect(() => {
    if (swipeError) {
      setShowSwipeError(true);
    }
  }, [swipeError]);

  // Refresh cards after swipe (every 5 swipes) - do it in the background without showing loading
  const lastRefreshSwipeCount = useRef(0);
  useEffect(() => {
    if (swipeCount > 0 && swipeCount % 5 === 0 && swipeCount !== lastRefreshSwipeCount.current) {
      lastRefreshSwipeCount.current = swipeCount;
      refreshCards(false); // Pass false to refresh in background without showing loading
    }
  }, [swipeCount, refreshCards]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to sign out');
      setShowError(true);
    }
  };

  const handleDeleteAccountPress = () => {
    setDeleteDialogVisible(true);
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      router.replace('/(auth)/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setShowError(true);
      setIsDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

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
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <GradientBackground gradientId="swipeGradient" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading cards...
          </Text>
        </View>
        <DeleteAccountDialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          onConfirm={handleDeleteAccountConfirm}
          isLoading={isDeleting}
        />
        <Snackbar
          visible={showError}
          onDismiss={() => setShowError(false)}
          duration={4000}
        >
          {deleteError || 'An error occurred'}
        </Snackbar>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <GradientBackground gradientId="swipeGradient" />
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Error loading cards
          </Text>
          <Text variant="bodyMedium" style={styles.errorText}>
            {error instanceof Error ? error.message : String(error)}
          </Text>
        </View>
        <DeleteAccountDialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          onConfirm={handleDeleteAccountConfirm}
          isLoading={isDeleting}
        />
        <Snackbar
          visible={showError}
          onDismiss={() => setShowError(false)}
          duration={4000}
        >
          {deleteError || 'An error occurred'}
        </Snackbar>
      </SafeAreaView>
    );
  }

  if (isComplete || cards.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <GradientBackground gradientId="swipeGradient" />
        <View style={styles.emptyContainer}>
          <Text variant="headlineMedium" style={styles.emptyTitle}>
            You're all caught up!
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Check back later for more cards.
          </Text>
        </View>
        <DeleteAccountDialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          onConfirm={handleDeleteAccountConfirm}
          isLoading={isDeleting}
        />
        <Snackbar
          visible={showError}
          onDismiss={() => setShowError(false)}
          duration={4000}
        >
          {deleteError || 'An error occurred'}
        </Snackbar>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <GradientBackground gradientId="swipeGradient" />
      
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <CardStack
          ref={cardStackRef}
          cards={cards}
          onSwipe={handleSwipe}
          currentIndex={currentIndex}
          onShowDetails={() => setDetailsModalVisible(true)}
          onTopCardLoadingChange={handleCardLoadingChange}
        />
      </View>

      <View style={styles.footer}>
        <SwipeButtons
          onSwipe={(action) => {
            if (currentCard && cardStackRef.current) {
              // Trigger animation immediately for optimistic UI
              const direction = action === 'yum' ? 'right' : action === 'ick' ? 'left' : 'up';
              cardStackRef.current.animateTopCard(direction);
              
              // Then handle the swipe (which will do optimistic state update)
              handleSwipe(currentCard.id, action);
            }
          }}
          onInfo={() => setDetailsModalVisible(true)}
          disabled={isSaving || !currentCard || isCardLoading}
        />
      </View>


      <CardDetailsModal
        visible={detailsModalVisible}
        card={currentCard}
        onDismiss={() => setDetailsModalVisible(false)}
      />

      <DeleteAccountDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteAccountConfirm}
        isLoading={isDeleting}
      />

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={4000}
      >
        {deleteError || 'An error occurred'}
      </Snackbar>

      <Snackbar
        visible={showSwipeError}
        onDismiss={() => {
          setShowSwipeError(false);
          clearSwipeError();
        }}
        duration={5000}
        action={{
          label: 'Dismiss',
          onPress: () => {
            setShowSwipeError(false);
            clearSwipeError();
          },
        }}
      >
        {swipeError || 'Failed to save swipe'}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20, // Reduced padding since info is now in footer
    paddingHorizontal: '2%', // 2% margin on each side
  },
  footer: {
    backgroundColor: 'transparent',
    paddingBottom: Spacing.xs,
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
    color: Colors.backgroundWhite,
  },
  emptyText: {
    color: Colors.backgroundWhite,
    textAlign: 'center',
  },
});
