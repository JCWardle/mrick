import { StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';

interface PartnerInviteModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function PartnerInviteModal({ visible, onDismiss }: PartnerInviteModalProps) {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Text variant="headlineSmall">Invite Your Partner</Text>
        <Button onPress={onDismiss}>Not Now</Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});

