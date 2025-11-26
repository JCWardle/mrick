import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Modal, Portal, Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardIllustration } from './CardIllustration';
import { MatchedCard } from '../../lib/swipes';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface MatchedCardModalProps {
  visible: boolean;
  card: MatchedCard | null;
  onDismiss: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
// Calculate image height to maintain 4:3 aspect ratio (width:height = 4:3)
// Use screen width minus some padding, then calculate height
const MODAL_IMAGE_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width with some padding
const IMAGE_HEIGHT = MODAL_IMAGE_WIDTH * (3 / 4); // 4:3 aspect ratio

export function MatchedCardModal({ visible, card, onDismiss }: MatchedCardModalProps) {
  if (!card) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
        dismissable
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {/* Card Image */}
          <View style={styles.imageContainer}>
            <CardIllustration
              cardText={card.card_title}
              category={card.category}
              imagePath={card.image_path}
            />
          </View>

          {/* Card Title and Description */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text variant="headlineSmall" style={styles.title}>
              {card.card_title}
            </Text>
            {card.description && (
              <Text variant="bodyLarge" style={styles.description}>
                {card.description}
              </Text>
            )}
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <IconButton
              icon="close"
              size={32}
              onPress={onDismiss}
              iconColor={Colors.backgroundWhite}
              style={styles.closeButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  imageContainer: {
    width: MODAL_IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    alignSelf: 'center',
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
  },
  closeButton: {
    backgroundColor: Colors.primary,
  },
});

