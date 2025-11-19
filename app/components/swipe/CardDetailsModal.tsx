import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, IconButton } from 'react-native-paper';
import { Card } from '../../hooks/useCards';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface CardDetailsModalProps {
  visible: boolean;
  card: Card | null;
  onDismiss: () => void;
}

export function CardDetailsModal({ visible, card, onDismiss }: CardDetailsModalProps) {
  if (!card) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {card.text}
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {card.description && (
          <View style={styles.section}>
            <Text variant="bodyLarge" style={styles.description}>
              {card.description}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <IconButton
          icon="close"
          size={24}
          onPress={onDismiss}
          iconColor={Colors.textPrimary}
        />
      </View>
    </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.backgroundWhite,
    margin: Spacing.lg,
    borderRadius: 16,
    paddingBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: Spacing.lg,
  },
  contentContainer: {
    paddingBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  description: {
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
});

