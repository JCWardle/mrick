interface Card {
  id: string;
  text: string;
}

export function useCardStack(initialCards: Card[]) {
  // Card stack logic will be implemented here
  return {
    cards: initialCards,
    currentIndex: 0,
  };
}

