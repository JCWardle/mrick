import { View, StyleSheet, Image } from 'react-native';

interface CardIllustrationProps {
  cardText: string;
  category?: string | null;
}

const cardPlaceholderImage = require('../../assets/images/card.png');

export function CardIllustration({ cardText, category }: CardIllustrationProps) {
  return (
    <View style={styles.container}>
      <Image
        source={cardPlaceholderImage}
        style={styles.image}
        resizeMode="contain"
      />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    alignSelf: 'center',
  },
});

