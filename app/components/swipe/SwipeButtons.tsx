import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { SwipeAction } from '../../hooks/useSwipeGesture';
import { Colors } from '../../constants/colors';

interface SwipeButtonsProps {
  onSwipe: (action: SwipeAction) => void;
  onInfo?: () => void;
  disabled?: boolean;
}

export function SwipeButtons({
  onSwipe,
  onInfo,
  disabled = false,
}: SwipeButtonsProps) {
  const handleSwipe = (action: SwipeAction) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipe(action);
  };

  const handleInfo = () => {
    if (disabled || !onInfo) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onInfo();
  };

  return (
    <View style={styles.container}>
      {/* Pass/Ick Button - Red, left */}
      <IconButton
        icon="close"
        iconColor={Colors.ick}
        size={40}
        onPress={() => handleSwipe('ick')}
        disabled={disabled}
        style={styles.button}
        containerColor={Colors.ickLight}
      />

      {/* Info Button - Purple, center */}
      <IconButton
        icon="information-outline"
        iconColor={Colors.primary}
        size={40}
        onPress={handleInfo}
        disabled={disabled}
        style={styles.button}
        containerColor={Colors.lavenderLight}
      />

      {/* Like/Yum Button - Green, right */}
      <IconButton
        icon="heart"
        iconColor={Colors.yummy}
        size={40}
        onPress={() => handleSwipe('yum')}
        disabled={disabled}
        style={styles.button}
        containerColor={Colors.yummyLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  button: {
    margin: 0,
  },
});
