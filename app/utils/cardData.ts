import { Card } from '../hooks/useCards';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleCards<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get cards that haven't been swiped
 */
export function getUnswipedCards(
  allCards: Card[],
  swipedCardIds: Set<string>
): Card[] {
  return allCards.filter((card) => !swipedCardIds.has(card.id));
}

/**
 * Sort cards by display_order if available, otherwise maintain original order
 */
export function sortCardsByOrder(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (a.display_order !== null && b.display_order !== null) {
      return a.display_order - b.display_order;
    }
    if (a.display_order !== null) return -1;
    if (b.display_order !== null) return 1;
    return 0;
  });
}
