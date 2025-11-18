import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../../hooks/useCards';
import { IntensityBadge } from './IntensityBadge';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface CardInfoProps {
  card: Card | null;
}

export function CardInfo({ card }: CardInfoProps) {
  if (!card) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IntensityBadge intensity={card.intensity} />
        {card.category && (
          <View style={styles.categoryBadge}>
            <Text variant="labelSmall" style={styles.categoryText}>
              {card.category}
            </Text>
          </View>
        )}
      </View>

      <Text variant="headlineMedium" style={styles.cardTitle}>
        {card.text}
      </Text>

      {card.labels && card.labels.length > 0 && (
        <View style={styles.labelsContainer}>
          {card.labels.slice(0, 5).map((label) => (
            <View key={label.id} style={styles.labelTag}>
              <Text variant="labelSmall" style={styles.labelText}>
                {label.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
  },
  categoryText: {
    color: Colors.primaryDark,
    fontWeight: '600',
    fontSize: 11,
  },
  cardTitle: {
    color: Colors.backgroundWhite,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: Spacing.xs,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  labelTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
  },
  labelText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
});

