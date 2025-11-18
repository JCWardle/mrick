import { useState, useCallback } from 'react';
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

  const handleSwipe = useCallback(
    async (cardId: string, action: SwipeAction) => {
      if (isSaving) return;

      setIsSaving(true);
      const newSwipeCount = swipeCount + 1;

      try {
        // Save swipe to Supabase
        await saveSwipe(cardId, action);

        // Update state
        setSwipeCount(newSwipeCount);
        setSwipeHistory((prev) => [...prev, { cardId, action }]);
        setCurrentIndex((prev) => prev + 1);

        // Notify parent of swipe completion
        if (onSwipeComplete) {
          onSwipeComplete(newSwipeCount);
        }
      } catch (error) {
        console.error('Error saving swipe:', error);
        // Don't advance if save failed
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, swipeCount, onSwipeComplete]
  );

  const handleUndo = useCallback(async () => {
    if (swipeHistory.length === 0 || currentIndex === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const lastSwipe = swipeHistory[swipeHistory.length - 1];
      // TODO: Implement undo in API (delete or mark swipe as undone)
      // For now, just revert the UI state
      setSwipeHistory((prev) => prev.slice(0, -1));
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setSwipeCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error undoing swipe:', error);
    } finally {
      setIsSaving(false);
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
  };
}
