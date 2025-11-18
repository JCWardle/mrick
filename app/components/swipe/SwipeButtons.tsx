import { View, StyleSheet } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { SwipeAction } from '../../hooks/useSwipeGesture';
import { Colors } from '../../constants/colors';

interface SwipeButtonsProps {
  onSwipe: (action: SwipeAction) => void;
  disabled?: boolean;
}

export function SwipeButtons({ onSwipe, disabled = false }: SwipeButtonsProps) {
  const handleSwipe = (action: SwipeAction) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipe(action);
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="close"
        iconColor={Colors.ick}
        size={40}
        onPress={() => handleSwipe('ick')}
        disabled={disabled}
        style={[styles.button, styles.ickButton]}
        containerColor={Colors.ickLight}
      />
      
      <IconButton
        icon="help"
        iconColor={Colors.maybe}
        size={40}
        onPress={() => handleSwipe('maybe')}
        disabled={disabled}
        style={[styles.button, styles.maybeButton]}
        containerColor={Colors.maybeLight}
      />
      
      <IconButton
        icon="heart"
        iconColor={Colors.yummy}
        size={40}
        onPress={() => handleSwipe('yum')}
        disabled={disabled}
        style={[styles.button, styles.yumButton]}
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
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
  },
  button: {
    margin: 0,
  },
  ickButton: {
    // Red/Ick button on left
  },
  maybeButton: {
    // Yellow/Maybe button in center
  },
  yumButton: {
    // Green/Yum button on right
  },
});
