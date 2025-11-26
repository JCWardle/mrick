import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MatchedCardGrid } from './MatchedCardGrid';
import { MatchedCard } from '../../lib/swipes';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface CategorySectionProps {
  category: string;
  cards: MatchedCard[];
  onCardPress: (card: MatchedCard) => void;
}

export function CategorySection({ category, cards, onCardPress }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text variant="titleMedium" style={styles.categoryName}>
            {categoryDisplayName}
          </Text>
          <Text variant="bodyMedium" style={styles.cardCount}>
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </Text>
        </View>
        <IconButton
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          iconColor={Colors.backgroundWhite}
          style={styles.expandIcon}
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          <MatchedCardGrid cards={cards} onCardPress={onCardPress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryName: {
    color: Colors.backgroundWhite,
    fontWeight: '600',
  },
  cardCount: {
    color: Colors.backgroundWhite,
    opacity: 0.8,
  },
  expandIcon: {
    margin: 0,
  },
  content: {
    paddingTop: Spacing.xs,
  },
});

