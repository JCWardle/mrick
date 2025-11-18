import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardIllustrationProps {
  cardText: string;
  category?: string | null;
}

export function CardIllustration({ cardText, category }: CardIllustrationProps) {
  // Generate a simple hash from card text for consistent colors
  const hash = cardText.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use warm coral and mint tones based on hash
  const colorIndex = Math.abs(hash) % 4;
  const backgroundColors = [
    Colors.coralLight, // Light coral
    '#E0F7FA', // Light mint
    Colors.lavenderLight, // Light lavender
    '#FFF9C4', // Warm yellow
  ];

  const backgroundColor = backgroundColors[colorIndex];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Placeholder for future illustration - can be replaced with SVG or images */}
      <View style={styles.illustrationPlaceholder}>
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  illustrationPlaceholder: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.3,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: Colors.coral,
    top: '20%',
    left: '10%',
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: Colors.primaryLight,
    bottom: '30%',
    right: '15%',
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: Colors.lavender,
    top: '50%',
    left: '50%',
  },
});

