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

  const currentCard = cards[currentIndex] || null;
  const isComplete = currentIndex >= cards.length;
  const remainingCards = cards.length - currentIndex;

  return {
    currentIndex,
    currentCard,
    isComplete,
    remainingCards,
    handleSwipe,
    isSaving,
    swipeCount,
  };
}
