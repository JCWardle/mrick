import { Card, Label } from '../hooks/useCards';

/**
 * Get intensity display label (e.g., "medium" for intensity 2-3)
 */
export function getIntensityLabel(intensity: number): string {
  switch (intensity) {
    case 0:
      return 'very mild';
    case 1:
      return 'mild';
    case 2:
      return 'medium';
    case 3:
      return 'moderate';
    case 4:
      return 'intense';
    case 5:
      return 'very intense';
    default:
      return 'unknown';
  }
}

/**
 * Get intensity color for UI display
 * Returns hex color code based on intensity level
 */
export function getIntensityColor(intensity: number): string {
  switch (intensity) {
    case 0:
      return '#E8F5E9'; // Light green
    case 1:
      return '#C8E6C9'; // Light green
    case 2:
      return '#FFD700'; // Amber/yellow (medium)
    case 3:
      return '#FFA726'; // Orange
    case 4:
      return '#FF6B6B'; // Red
    case 5:
      return '#8B0000'; // Dark red
    default:
      return '#9E9E9E'; // Gray
  }
}

/**
 * Check if card has a specific label
 */
export function cardHasLabel(card: Card, labelName: string): boolean {
  return card.labels.some((label) => label.name === labelName);
}

/**
 * Get all label names from a card
 */
export function getCardLabelNames(card: Card): string[] {
  return card.labels.map((label) => label.name);
}

/**
 * Filter cards by label name
 */
export function filterCardsByLabel(cards: Card[], labelName: string): Card[] {
  return cards.filter((card) => cardHasLabel(card, labelName));
}

/**
 * Filter cards by intensity range
 */
export function filterCardsByIntensity(
  cards: Card[],
  minIntensity: number,
  maxIntensity: number
): Card[] {
  return cards.filter(
    (card) => card.intensity >= minIntensity && card.intensity <= maxIntensity
  );
}

/**
 * Group cards by intensity
 */
export function groupCardsByIntensity(cards: Card[]): Record<number, Card[]> {
  return cards.reduce((acc, card) => {
    if (!acc[card.intensity]) {
      acc[card.intensity] = [];
    }
    acc[card.intensity].push(card);
    return acc;
  }, {} as Record<number, Card[]>);
}

/**
 * Group cards by label
 */
export function groupCardsByLabel(cards: Card[]): Record<string, Card[]> {
  const grouped: Record<string, Card[]> = {};
  
  cards.forEach((card) => {
    card.labels.forEach((label) => {
      if (!grouped[label.name]) {
        grouped[label.name] = [];
      }
      grouped[label.name].push(card);
    });
  });
  
  return grouped;
}

/**
 * Get unique labels from an array of cards
 */
export function getUniqueLabels(cards: Card[]): Label[] {
  const labelMap = new Map<string, Label>();
  
  cards.forEach((card) => {
    card.labels.forEach((label) => {
      if (!labelMap.has(label.id)) {
        labelMap.set(label.id, label);
      }
    });
  });
  
  return Array.from(labelMap.values());
}

/**
 * Sort cards by intensity (ascending or descending)
 */
export function sortCardsByIntensity(
  cards: Card[],
  ascending: boolean = true
): Card[] {
  return [...cards].sort((a, b) => {
    return ascending ? a.intensity - b.intensity : b.intensity - a.intensity;
  });
}

