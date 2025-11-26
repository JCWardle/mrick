import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { CardIllustration } from './CardIllustration';
import { MatchedCard } from '../../lib/swipes';
import { Spacing } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

interface MatchedCardGridProps {
  cards: MatchedCard[];
  onCardPress: (card: MatchedCard) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 2;
const GRID_PADDING = 0; // No padding on sides
const GAP = Spacing.xs; // Smaller gap between cards
// Calculate item width accounting for gaps between items
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING - (GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * (4 / 3); // 4:3 aspect ratio (width:height = 4:3)

export function MatchedCardGrid({ cards, onCardPress }: MatchedCardGridProps) {
  const renderCard = ({ item }: { item: MatchedCard }) => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => onCardPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardImageContainer}>
          <CardIllustration
            cardText={item.card_title}
            category={item.category}
            imagePath={item.image_path}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={cards}
      renderItem={renderCard}
      keyExtractor={(item) => item.card_id}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.gridContainer}
      columnWrapperStyle={styles.row}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: 0,
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    marginBottom: GAP,
    marginHorizontal: -GAP / 2, // Offset outer margins
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundGray,
    marginHorizontal: GAP / 2, // Creates GAP spacing between items
  },
  cardImageContainer: {
    width: '100%',
    height: '100%',
  },
});

