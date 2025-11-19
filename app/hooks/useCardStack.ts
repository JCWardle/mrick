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

  const handleSwipe = useCallback(
    async (cardId: string, action: SwipeAction) => {
      // Prevent concurrent swipes - check both isSaving state and in-flight ref
      if (isSaving || inFlightSwipeRef.current !== null) {
        return;
      }

      // Mark swipe as in-flight
      inFlightSwipeRef.current = { cardId, action };
      setIsSaving(true);
      setSwipeError(null);
      const newSwipeCount = swipeCount + 1;

      try {
        console.log('[useCardStack] Starting swipe save:', {
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

        // Only update state if component is still mounted
        if (!isMountedRef.current) {
          console.warn('[useCardStack] Component unmounted, skipping state update');
          return;
        }

        // Update state
        setSwipeCount(newSwipeCount);
        setSwipeHistory((prev) => [...prev, { cardId, action }]);
        setCurrentIndex((prev) => prev + 1);

        // Notify parent of swipe completion
        if (onSwipeComplete) {
          onSwipeComplete(newSwipeCount);
        }
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
        
        // Don't advance if save failed - card should remain visible
      } finally {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsSaving(false);
        }
        // Clear in-flight swipe
        inFlightSwipeRef.current = null;
      }
    },
    [isSaving, swipeCount, onSwipeComplete]
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
