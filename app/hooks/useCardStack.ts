import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from './useCards';
import { SwipeAction } from './useSwipeGesture';
import { saveSwipe } from '../lib/swipes';

interface UseCardStackProps {
  cards: Card[];
  onSwipeComplete?: (swipeCount: number) => void;
}

export function useCardStack({ cards, onSwipeComplete }: UseCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ cardId: string; action: SwipeAction }>>([]);
  const [swipeError, setSwipeError] = useState<string | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track in-flight swipe to prevent race conditions
  const inFlightSwipeRef = useRef<{ cardId: string; action: SwipeAction } | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset currentIndex when cards array changes (e.g., after refresh)
  // This prevents "all caught up" from showing incorrectly when cards are refreshed
  // The cards array already filters out swiped cards, so when it refreshes,
  // we need to ensure currentIndex is within bounds
  const prevCardsLengthRef = useRef(cards.length);
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // If currentIndex is out of bounds, reset it
    // This can happen when cards refresh and the array changes
    if (currentIndex >= cards.length && cards.length > 0) {
      // Reset to 0 since cards array already contains only unswiped cards
      setCurrentIndex(0);
    }
    
    // Update the ref to track cards length for next comparison
    prevCardsLengthRef.current = cards.length;
  }, [cards.length, currentIndex]);

  const handleSwipe = useCallback(
    async (cardId: string, action: SwipeAction) => {
      // Prevent concurrent swipes - check both isSaving state and in-flight ref
      if (isSaving || inFlightSwipeRef.current !== null) {
        return;
      }

      // Mark swipe as in-flight
      inFlightSwipeRef.current = { cardId, action };
      setSwipeError(null);
      const newSwipeCount = swipeCount + 1;

      // OPTIMISTIC UPDATE: Immediately update UI state before server request
      // This makes the card disappear right away for instant feedback
      setSwipeCount(newSwipeCount);
      setSwipeHistory((prev) => [...prev, { cardId, action }]);
      setCurrentIndex((prev) => prev + 1);

      // Notify parent of swipe completion (optimistic)
      if (onSwipeComplete) {
        onSwipeComplete(newSwipeCount);
      }

      // Now save to server in the background (non-blocking)
      setIsSaving(true);
      try {
        console.log('[useCardStack] Starting swipe save (background):', {
          cardId,
          action,
          currentIndex,
          swipeCount: newSwipeCount,
          timestamp: new Date().toISOString(),
        });

        // Save swipe to Supabase
        await saveSwipe(cardId, action);

        console.log('[useCardStack] Swipe save successful:', {
          cardId,
          action,
          isMounted: isMountedRef.current,
        });
      } catch (error: any) {
        console.error('[useCardStack] Error saving swipe:', {
          error,
          errorType: error?.constructor?.name,
          errorMessage: error?.message,
          errorStack: error?.stack,
          cardId,
          action,
          isMounted: isMountedRef.current,
          timestamp: new Date().toISOString(),
        });
        
        // Only update state if component is still mounted
        if (!isMountedRef.current) {
          console.warn('[useCardStack] Component unmounted during error, skipping state update');
          return;
        }

        // Set user-friendly error message
        // Note: We don't revert the UI state since the card has already moved
        // This is the optimistic update pattern - show error but keep the UI state
        let errorMessage = 'Failed to save swipe. Please try again.';
        if (error?.message) {
          if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (error.message.includes('auth') || error.message.includes('authenticated')) {
            errorMessage = 'Authentication error. Please sign in again.';
          } else {
            errorMessage = error.message;
          }
        }
        setSwipeError(errorMessage);
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsSaving(false);
        }
        // Clear in-flight swipe
        inFlightSwipeRef.current = null;
      }
    },
    [isSaving, swipeCount, onSwipeComplete, currentIndex]
  );

  const handleUndo = useCallback(async () => {
    if (swipeHistory.length === 0 || currentIndex === 0 || isSaving || !isMountedRef.current) return;

    setIsSaving(true);
    try {
      const lastSwipe = swipeHistory[swipeHistory.length - 1];
      // TODO: Implement undo in API (delete or mark swipe as undone)
      // For now, just revert the UI state
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setSwipeHistory((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => Math.max(0, prev - 1));
        setSwipeCount((prev) => Math.max(0, prev - 1));
        setSwipeError(null);
      }
    } catch (error) {
      console.error('Error undoing swipe:', error);
      if (isMountedRef.current) {
        setSwipeError('Failed to undo swipe. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [swipeHistory, currentIndex, isSaving]);

  const currentCard = cards[currentIndex] || null;
  const isComplete = currentIndex >= cards.length;
  const remainingCards = cards.length - currentIndex;
  const canUndo = swipeHistory.length > 0 && currentIndex > 0;

  return {
    currentIndex,
    currentCard,
    isComplete,
    remainingCards,
    handleSwipe,
    handleUndo,
    canUndo,
    isSaving,
    swipeCount,
    swipeError,
    clearSwipeError: () => {
      if (isMountedRef.current) {
        setSwipeError(null);
      }
    },
  };
}
